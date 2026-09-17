import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, requireSession } from "@/lib/api";
import type { GoalDTO } from "@/lib/orbital";

export async function GET() {
  const session = await requireSession();
  if (!session) return fail("UNAUTHORIZED", "Not signed in", 401);

  const goals = await db.goal.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: { tasks: { select: { status: true } } },
  });

  const data: GoalDTO[] = goals.map((g) => ({
    id: g.id,
    title: g.title,
    description: g.description,
    status: g.status as GoalDTO["status"],
    targetDate: g.targetDate?.toISOString() ?? null,
    sortOrder: g.sortOrder,
    createdAt: g.createdAt.toISOString(),
    updatedAt: g.updatedAt.toISOString(),
    taskCount: g.tasks.length,
    doneCount: g.tasks.filter((t) => t.status === "done").length,
    blockedCount: g.tasks.filter((t) => t.status === "blocked").length,
  }));

  return ok(data);
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
  const { title, description, targetDate, status } = (body ?? {}) as {
    title?: string;
    description?: string;
    targetDate?: string;
    status?: string;
  };

  const trimmed = title?.trim();
  if (!trimmed) return fail("BAD_REQUEST", "Goal title is required", 400);
  if (trimmed.length > 200) return fail("BAD_REQUEST", "Goal title is too long (max 200)", 400);

  const allowedStatuses = new Set(["active", "done", "draft", "paused"]);
  const goalStatus = status && allowedStatuses.has(status) ? status : "active";

  let parsedDate: Date | null = null;
  if (targetDate) {
    parsedDate = new Date(targetDate);
    if (Number.isNaN(parsedDate.getTime())) {
      return fail("BAD_REQUEST", "Invalid target date", 400);
    }
  }

  const maxOrder = await db.goal.aggregate({ _max: { sortOrder: true } });

  const goal = await db.goal.create({
    data: {
      title: trimmed,
      description: description?.trim() || null,
      status: goalStatus,
      targetDate: parsedDate,
      sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
    },
  });

  await db.activityLog.create({
    data: {
      type: "goal_created",
      message: `${goal.title} created`,
      detail: `AI created the goal "${goal.title}".`,
      goalId: goal.id,
    },
  });

  return ok({ id: goal.id }, 201);
}
