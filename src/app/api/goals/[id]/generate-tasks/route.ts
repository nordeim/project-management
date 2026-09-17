// POST /api/goals/[id]/generate-tasks — the "AI agent" that drafts a task
// plan for a goal. Uses z-ai-web-dev-sdk (server-side only) to generate a
// JSON task list; falls back to a deterministic template plan when the SDK
// is unavailable or returns malformed output, so the feature never hard-fails.

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, requireSession } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

interface GeneratedTask {
  title: string;
  description?: string;
  estimatedHours?: number;
}

function sanitizeTasks(raw: unknown, goalTitle: string): GeneratedTask[] {
  if (!Array.isArray(raw)) return [];
  const out: GeneratedTask[] = [];
  for (const item of raw.slice(0, 10)) {
    if (typeof item !== "object" || item === null) continue;
    const t = item as Record<string, unknown>;
    if (typeof t.title !== "string" || !t.title.trim()) continue;
    const title = t.title.trim().slice(0, 160);
    const description = typeof t.description === "string" ? t.description.trim().slice(0, 500) : undefined;
    const hours =
      typeof t.estimatedHours === "number" && Number.isFinite(t.estimatedHours)
        ? Math.min(40, Math.max(1, Math.round(t.estimatedHours)))
        : undefined;
    out.push({ title, description, estimatedHours: hours });
    if (out.length >= 10) break;
  }
  void goalTitle;
  return out;
}

function templatePlan(goalTitle: string): GeneratedTask[] {
  return [
    { title: `Research and gather requirements for ${goalTitle}`, description: "Collect context, constraints and prior art before execution.", estimatedHours: 4 },
    { title: `Define success metrics for ${goalTitle}`, description: "Agree on 2-3 measurable outcomes and how they will be tracked.", estimatedHours: 3 },
    { title: `Draft the execution plan`, description: "Break the goal into workstreams, owners and a realistic timeline.", estimatedHours: 5 },
    { title: `Review plan with stakeholders`, description: "Walk the plan past the team and incorporate feedback.", estimatedHours: 2 },
    { title: `Execute first milestone`, description: "Deliver the first meaningful slice of work end-to-end.", estimatedHours: 12 },
    { title: `Execute second milestone`, description: "Deliver the remaining core scope.", estimatedHours: 12 },
    { title: `QA and edge-case pass`, description: "Test outcomes against the success metrics; log and fix issues.", estimatedHours: 6 },
    { title: `Wrap-up and learnings review`, description: "Summarize outcomes, learnings and follow-ups for the team.", estimatedHours: 3 },
  ];
}

function extractJson(text: string): unknown {
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

async function generateWithSdk(goalTitle: string, goalDescription: string | null): Promise<GeneratedTask[] | null> {
  try {
    const { default: ZAI } = await import("z-ai-web-dev-sdk");
    const zai = await ZAI.create();
    const prompt = [
      "You are a project planning assistant. Break the following goal into 6-9 concrete tasks.",
      `Goal title: ${goalTitle}`,
      goalDescription ? `Goal description: ${goalDescription}` : "",
      "Return ONLY a JSON array. Each element: {\"title\": string (max 12 words), \"description\": string (one sentence, max 20 words), \"estimatedHours\": number (1-24)}.",
      "Order tasks chronologically. No prose, no markdown fences.",
    ]
      .filter(Boolean)
      .join("\n");
    const response = await zai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
    });
    const content = response.choices[0]?.message?.content;
    if (!content) return null;
    const parsed = sanitizeTasks(extractJson(content), goalTitle);
    return parsed.length >= 4 ? parsed : null;
  } catch (error) {
    console.error("[generate-tasks] SDK generation failed, using template plan:", error);
    return null;
  }
}

export async function POST(_request: NextRequest, { params }: Params) {
  const session = await requireSession();
  if (!session) return fail("UNAUTHORIZED", "Not signed in", 401);
  const { id } = await params;

  const goal = await db.goal.findUnique({ where: { id }, include: { tasks: { select: { id: true } } } });
  if (!goal) return fail("NOT_FOUND", "Goal not found", 404);
  if (goal.tasks.length > 0) {
    return fail("ALREADY_PLANNED", "This goal already has tasks", 409);
  }

  const generated = (await generateWithSdk(goal.title, goal.description)) ?? templatePlan(goal.title);

  const people = await db.person.findMany({ orderBy: { createdAt: "asc" } });
  const startMs = Date.now();
  const endMs = goal.targetDate ? Math.max(goal.targetDate.getTime(), startMs + 7 * 86400000) : startMs + 45 * 86400000;
  const span = endMs - startMs;

  const maxOrder = await db.task.aggregate({ _max: { sortOrder: true } });
  let order = maxOrder._max.sortOrder ?? 0;

  const createdIds: string[] = [];
  for (let i = 0; i < generated.length; i += 1) {
    const t = generated[i]!;
    order += 1;
    const assignee = people.length > 0 ? people[i % people.length]! : null;
    const deadline = new Date(startMs + Math.round((span * (i + 1)) / (generated.length + 1)));
    const task = await db.task.create({
      data: {
        goalId: goal.id,
        title: t.title,
        description: t.description ?? null,
        status: "pending",
        deadline,
        assigneeId: assignee?.id ?? null,
        estimatedHours: t.estimatedHours ?? null,
        createdByAi: true,
        sortOrder: order,
      },
    });
    createdIds.push(task.id);
    if (assignee) {
      await db.activityLog.create({
        data: {
          type: "task_assigned",
          message: `${assignee.name} assigned to "${t.title}"`,
          detail: `AI assigned "${t.title}" to ${assignee.name}.`,
          taskId: task.id,
          goalId: goal.id,
        },
      });
    }
  }

  await db.activityLog.create({
    data: {
      type: "tasks_generated",
      message: `Generated ${createdIds.length} tasks for "${goal.title}"`,
      detail: `AI generated ${createdIds.length} tasks for the goal "${goal.title}".`,
      goalId: goal.id,
    },
  });

  return ok({ created: createdIds.length }, 201);
}
