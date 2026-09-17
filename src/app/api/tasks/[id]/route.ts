import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, requireSession } from "@/lib/api";
import type { TaskDTO, TaskStatus } from "@/lib/orbital";

type Params = { params: Promise<{ id: string }> };

const TASK_STATUSES = new Set(["pending", "in_progress", "blocked", "need_help", "done"]);

// GET /api/tasks/:id — full task payload (goal title, assignee, update history).
export async function GET(_request: NextRequest, { params }: Params) {
  const session = await requireSession();
  if (!session) return fail("UNAUTHORIZED", "Not signed in", 401);
  const { id } = await params;

  const t = await db.task.findUnique({
    where: { id },
    include: {
      goal: { select: { title: true } },
      assignee: true,
      updates: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!t) return fail("NOT_FOUND", "Task not found", 404);

  const dto: TaskDTO = {
    id: t.id,
    goalId: t.goalId,
    goalTitle: t.goal.title,
    title: t.title,
    description: t.description,
    status: t.status as TaskStatus,
    deadline: t.deadline?.toISOString() ?? null,
    assignee: t.assignee,
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
  };
  return ok(dto);
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
  const { title, description, status, deadline, assigneeId, estimatedHours } = (body ?? {}) as {
    title?: string;
    description?: string;
    status?: string;
    deadline?: string | null;
    assigneeId?: string | null;
    estimatedHours?: number | null;
  };

  const existing = await db.task.findUnique({ where: { id }, include: { goal: true, assignee: true } });
  if (!existing) return fail("NOT_FOUND", "Task not found", 404);

  const data: Record<string, unknown> = {};
  if (title !== undefined) {
    const trimmed = title.trim();
    if (!trimmed) return fail("BAD_REQUEST", "Task title cannot be empty", 400);
    data.title = trimmed;
  }
  if (description !== undefined) data.description = description?.trim() || null;
  if (status !== undefined) {
    if (!TASK_STATUSES.has(status)) return fail("BAD_REQUEST", "Invalid task status", 400);
    data.status = status;
  }
  if (deadline !== undefined) {
    if (deadline === null || deadline === "") {
      data.deadline = null;
    } else {
      const parsed = new Date(deadline);
      if (Number.isNaN(parsed.getTime())) return fail("BAD_REQUEST", "Invalid deadline", 400);
      data.deadline = parsed;
    }
  }
  if (assigneeId !== undefined) {
    if (assigneeId === null || assigneeId === "") {
      data.assigneeId = null;
    } else {
      const person = await db.person.findUnique({ where: { id: assigneeId } });
      if (!person) return fail("BAD_REQUEST", "Unknown assignee", 400);
      data.assigneeId = assigneeId;
    }
  }
  if (estimatedHours !== undefined) {
    if (estimatedHours === null) {
      data.estimatedHours = null;
    } else if (typeof estimatedHours !== "number" || !Number.isFinite(estimatedHours) || estimatedHours < 0 || estimatedHours > 200) {
      return fail("BAD_REQUEST", "Estimated hours must be between 0 and 200", 400);
    } else {
      data.estimatedHours = estimatedHours;
    }
  }

  const task = await db.task.update({ where: { id }, data });

  if (status !== undefined && status !== existing.status) {
    await db.activityLog.create({
      data: {
        type: "status_update",
        message: `${session.name} set "${task.title}" to ${status.replace("_", " ")}`,
        detail: `${session.name} changed the status of "${task.title}" from ${existing.status.replace("_", " ")} to ${status.replace("_", " ")}.`,
        taskId: task.id,
        goalId: task.goalId,
      },
    });
  }

  if (assigneeId !== undefined && assigneeId !== existing.assigneeId) {
    const person = assigneeId ? await db.person.findUnique({ where: { id: assigneeId } }) : null;
    await db.activityLog.create({
      data: {
        type: "task_assigned",
        message: person ? `${person.name} assigned to "${task.title}"` : `"${task.title}" unassigned`,
        detail: person
          ? `AI assigned "${task.title}" to ${person.name}.`
          : `"${task.title}" was left unassigned.`,
        taskId: task.id,
        goalId: task.goalId,
      },
    });
  }

  return ok({ id: task.id });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const session = await requireSession();
  if (!session) return fail("UNAUTHORIZED", "Not signed in", 401);
  const { id } = await params;

  const existing = await db.task.findUnique({ where: { id } });
  if (!existing) return fail("NOT_FOUND", "Task not found", 404);

  await db.task.delete({ where: { id } });
  await db.activityLog.create({
    data: {
      type: "task_deleted",
      message: `"${existing.title}" deleted`,
      detail: `${session.name} deleted the task "${existing.title}".`,
      goalId: existing.goalId,
    },
  });

  return ok({ deleted: true });
}
