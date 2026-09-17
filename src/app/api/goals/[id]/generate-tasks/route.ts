// POST /api/goals/[id]/generate-tasks — the "AI agent" that drafts a task
// plan for a goal. Uses z-ai-web-dev-sdk (server-side only) to generate a
// JSON task list; falls back to a deterministic template plan when the SDK
// is unavailable or returns malformed output, so the feature never hard-fails.

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, requireSession } from "@/lib/api";
import { extractJson, sanitizeTasks, templatePlan, type GeneratedTask } from "@/lib/plan-sanitizer";

type Params = { params: Promise<{ id: string }> };

async function generateWithSdk(
  goalTitle: string,
  goalDescription: string | null,
  answers: string[],
): Promise<GeneratedTask[] | null> {
  try {
    const { default: ZAI } = await import("z-ai-web-dev-sdk");
    const zai = await ZAI.create();
    const prompt = [
      "You are a project planning assistant. Break the following goal into 6-9 concrete tasks.",
      `Goal title: ${goalTitle}`,
      goalDescription ? `Goal description: ${goalDescription}` : "",
      answers.length > 0
        ? `The team answered clarifying questions — respect these answers:\n${answers
            .map((a, i) => `${i + 1}. ${a}`)
            .join("\n")}`
        : "",
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
    const parsed = sanitizeTasks(extractJson(content));
    return parsed.length >= 4 ? parsed : null;
  } catch (error) {
    console.error("[generate-tasks] SDK generation failed, using template plan:", error);
    return null;
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  const session = await requireSession();
  if (!session) return fail("UNAUTHORIZED", "Not signed in", 401);
  const { id } = await params;

  // Optional body: { answers?: string[] } — the wizard's clarifying-step
  // answers, used to sharpen the LLM prompt. Absent body is fine (the
  // smoke suite and older callers POST without one).
  let answers: string[] = [];
  try {
    const body = (await request.json()) as { answers?: unknown } | null;
    if (Array.isArray(body?.answers)) {
      answers = body.answers
        .filter((a): a is string => typeof a === "string")
        .map((a) => a.trim().slice(0, 500))
        .filter(Boolean)
        .slice(0, 5);
    }
  } catch {
    // No body or invalid JSON — proceed without answers.
  }

  const goal = await db.goal.findUnique({ where: { id }, include: { tasks: { select: { id: true } } } });
  if (!goal) return fail("NOT_FOUND", "Goal not found", 404);
  if (goal.tasks.length > 0) {
    return fail("ALREADY_PLANNED", "This goal already has tasks", 409);
  }

  const generated =
    (await generateWithSdk(goal.title, goal.description, answers)) ?? templatePlan(goal.title);

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
