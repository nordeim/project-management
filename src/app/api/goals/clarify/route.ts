// POST /api/goals/clarify — the wizard's clarifying step. Before a goal is
// created, the AI agent analyzes the draft (title + description) and asks
// up to three questions that sharpen the eventual task plan. LLM-backed
// with a deterministic fallback (see src/lib/clarify.ts), so the step
// never hard-fails. Logs a "goal_analyzed" activity entry — the reference
// app's feed shows "Analyzed goal: …" at this point in the flow.

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, requireSession } from "@/lib/api";
import { fallbackQuestions, sanitizeQuestions } from "@/lib/clarify";

function extractJsonArray(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1]! : text;
  const start = candidate.indexOf("[");
  const end = candidate.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch {
    return null;
  }
}

async function questionsWithSdk(title: string, description: string | null): Promise<string[] | null> {
  try {
    const { default: ZAI } = await import("z-ai-web-dev-sdk");
    const zai = await ZAI.create();
    const prompt = [
      "You are a project planning assistant. The user described a goal.",
      `Goal title: ${title}`,
      description ? `Goal description: ${description}` : "",
      "Ask exactly 3 short clarifying questions that would most improve a task plan for this goal:",
      "one about success metrics, one about constraints, one about people/stakeholders.",
      'Return ONLY a JSON array of 3 strings. Each string is one question, max 25 words. No prose, no markdown fences.',
    ]
      .filter(Boolean)
      .join("\n");
    const response = await zai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
    });
    const content = response.choices[0]?.message?.content;
    if (!content) return null;
    const questions = sanitizeQuestions(extractJsonArray(content));
    return questions.length >= 2 ? questions : null;
  } catch (error) {
    console.error("[clarify] SDK generation failed, using fallback questions:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session) return fail("UNAUTHORIZED", "Not signed in", 401);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("BAD_REQUEST", "Invalid JSON body", 400);
  }
  const { title, description } = (body ?? {}) as { title?: string; description?: string };

  const trimmed = title?.trim();
  if (!trimmed) return fail("BAD_REQUEST", "Goal title is required", 400);
  if (trimmed.length > 200) return fail("BAD_REQUEST", "Goal title is too long (max 200)", 400);

  const questions =
    (await questionsWithSdk(trimmed, description?.trim() || null)) ?? fallbackQuestions(trimmed);

  await db.activityLog.create({
    data: {
      type: "goal_analyzed",
      message: `Analyzed goal: ${trimmed}`,
      detail: `AI analyzed the goal "${trimmed}" and prepared clarifying questions.`,
    },
  });

  return ok({ questions });
}
