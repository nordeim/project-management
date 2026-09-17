import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, requireSession } from "@/lib/api";
import type { TaskDTO } from "@/lib/orbital";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const session = await requireSession();
  if (!session) return fail("UNAUTHORIZED", "Not signed in", 401);
  const { id } = await params;

  const goal = await db.goal.findUnique({
    where: { id },
    include: {
      tasks: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        include: {
          assignee: true,
          updates: { orderBy: { createdAt: "desc" } },
        },
      },
    },
  });
  if (!goal) return fail("NOT_FOUND", "Goal not found", 404);

  const tasks: TaskDTO[] = goal.tasks.map((t) => ({
    id: t.id,
    goalId: t.goalId,
    goalTitle: goal.title,
    title: t.title,
    description: t.description,
    status: t.status as TaskDTO["status"],
    deadline: t.deadline?.toISOString() ?? null,
    assignee: t.assignee
      ? { id: t.assignee.id, name: t.assignee.name, avatarColor: t.assignee.avatarColor, userId: t.assignee.userId }
      : null,
    estimatedHours: t.estimatedHours,
    createdByAi: t.createdByAi,
    sortOrder: t.sortOrder,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    updates: t.updates.map((u) => ({
      id: u.id,
      status: u.status as TaskDTO["updates"][number]["status"],
      note: u.note,
      createdAt: u.createdAt.toISOString(),
    })),
  }));

  const doneCount = tasks.filter((t) => t.status === "done").length;
  const blockedCount = tasks.filter((t) => t.status === "blocked").length;

  return ok({
    goal: {
      id: goal.id,
      title: goal.title,
      description: goal.description,
      status: goal.status,
      targetDate: goal.targetDate?.toISOString() ?? null,
      createdAt: goal.createdAt.toISOString(),
      updatedAt: goal.updatedAt.toISOString(),
      taskCount: tasks.length,
      doneCount,
      blockedCount,
    },
    tasks,
  });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await requireSession();
  if (!session) return fail("UNAUTHORIZED", "Not signed in", 401);
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("BAD_REQUEST", "Invalid JSON body", 400);
  }
  const { title, description, status, targetDate } = (body ?? {}) as {
    title?: string;
    description?: string;
    status?: string;
    targetDate?: string | null;
  };

  const existing = await db.goal.findUnique({ where: { id } });
  if (!existing) return fail("NOT_FOUND", "Goal not found", 404);

  const data: Record<string, unknown> = {};
  if (title !== undefined) {
    const trimmed = title.trim();
    if (!trimmed) return fail("BAD_REQUEST", "Goal title cannot be empty", 400);
    data.title = trimmed;
  }
  if (description !== undefined) data.description = description?.trim() || null;
  if (status !== undefined) {
    if (!["active", "done", "draft", "paused"].includes(status)) {
      return fail("BAD_REQUEST", "Invalid goal status", 400);
    }
    data.status = status;
  }
  if (targetDate !== undefined) {
    data.targetDate = targetDate ? new Date(targetDate) : null;
  }

  const goal = await db.goal.update({ where: { id }, data });

  if (status === "done" && existing.status !== "done") {
    await db.activityLog.create({
      data: {
        type: "goal_completed",
        message: `${goal.title} completed`,
        detail: `All work on "${goal.title}" is wrapped up — goal marked as completed.`,
        goalId: goal.id,
      },
    });
  }

  return ok({ id: goal.id });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const session = await requireSession();
  if (!session) return fail("UNAUTHORIZED", "Not signed in", 401);
  const { id } = await params;

  const existing = await db.goal.findUnique({ where: { id }, include: { tasks: { select: { id: true } } } });
  if (!existing) return fail("NOT_FOUND", "Goal not found", 404);

  await db.goal.delete({ where: { id } });
  await db.activityLog.create({
    data: {
      type: "goal_deleted",
      message: `${existing.title} deleted`,
      detail: `The goal "${existing.title}" and its ${existing.tasks.length} tasks were deleted.`,
    },
  });

  return ok({ deleted: true });
}
