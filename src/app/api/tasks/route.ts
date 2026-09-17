import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, requireSession } from "@/lib/api";
import type { TaskDTO, TaskStatus } from "@/lib/orbital";

const TASK_STATUSES = new Set(["pending", "in_progress", "blocked", "need_help", "done"]);

function toDTO(
  t: {
    id: string;
    goalId: string;
    title: string;
    description: string | null;
    status: string;
    deadline: Date | null;
    estimatedHours: number | null;
    createdByAi: boolean;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
    goal: { title: string };
    assignee: { id: string; name: string; avatarColor: string; userId: string | null } | null;
    updates: { id: string; status: string; note: string | null; createdAt: Date }[];
  },
): TaskDTO {
  return {
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
}

// GET /api/tasks?assignee=me|<personId>&status=<status>&goal=<goalId>
export async function GET(request: NextRequest) {
  const session = await requireSession();
  if (!session) return fail("UNAUTHORIZED", "Not signed in", 401);

  const { searchParams } = new URL(request.url);
  const assignee = searchParams.get("assignee");
  const status = searchParams.get("status");
  const goalId = searchParams.get("goal");

  let assigneeId: string | undefined;
  if (assignee === "me") {
    const me = await db.person.findUnique({ where: { userId: session.id } });
    if (!me) return ok<TaskDTO[]>([]);
    assigneeId = me.id;
  } else if (assignee) {
    assigneeId = assignee;
  }

  if (status && !TASK_STATUSES.has(status)) {
    return fail("BAD_REQUEST", "Invalid status filter", 400);
  }

  const tasks = await db.task.findMany({
    where: {
      ...(assigneeId ? { assigneeId } : {}),
      ...(status ? { status } : {}),
      ...(goalId ? { goalId } : {}),
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      goal: { select: { title: true } },
      assignee: true,
      updates: { orderBy: { createdAt: "desc" } },
    },
  });

  return ok(tasks.map(toDTO));
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
  const { goalId, title, description, status, deadline, assigneeId, estimatedHours } = (body ?? {}) as {
    goalId?: string;
    title?: string;
    description?: string;
    status?: string;
    deadline?: string;
    assigneeId?: string;
    estimatedHours?: number;
  };

  if (!goalId) return fail("BAD_REQUEST", "goalId is required", 400);
  const trimmed = title?.trim();
  if (!trimmed) return fail("BAD_REQUEST", "Task title is required", 400);
  if (trimmed.length > 200) return fail("BAD_REQUEST", "Task title is too long (max 200)", 400);
  if (status && !TASK_STATUSES.has(status)) return fail("BAD_REQUEST", "Invalid task status", 400);

  const goal = await db.goal.findUnique({ where: { id: goalId } });
  if (!goal) return fail("NOT_FOUND", "Goal not found", 404);

  let assigneeName: string | null = null;
  if (assigneeId) {
    const person = await db.person.findUnique({ where: { id: assigneeId } });
    if (!person) return fail("BAD_REQUEST", "Unknown assignee", 400);
    assigneeName = person.name;
  }

  let parsedDeadline: Date | null = null;
  if (deadline) {
    parsedDeadline = new Date(deadline);
    if (Number.isNaN(parsedDeadline.getTime())) return fail("BAD_REQUEST", "Invalid deadline", 400);
  }

  let hours: number | null = null;
  if (estimatedHours !== undefined && estimatedHours !== null) {
    if (typeof estimatedHours !== "number" || !Number.isFinite(estimatedHours) || estimatedHours < 0 || estimatedHours > 200) {
      return fail("BAD_REQUEST", "Estimated hours must be between 0 and 200", 400);
    }
    hours = estimatedHours;
  }

  const maxOrder = await db.task.aggregate({ _max: { sortOrder: true }, where: { goalId } });

  const task = await db.task.create({
    data: {
      goalId,
      title: trimmed,
      description: description?.trim() || null,
      status: status ?? "pending",
      deadline: parsedDeadline,
      assigneeId: assigneeId ?? null,
      estimatedHours: hours,
      createdByAi: false,
      sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
    },
  });

  await db.activityLog.create({
    data: {
      type: "task_created",
      message: `${trimmed} added to "${goal.title}"`,
      detail: assigneeName
        ? `${session.name} created the task "${trimmed}" and assigned it to ${assigneeName}.`
        : `${session.name} created the task "${trimmed}" in "${goal.title}".`,
      taskId: task.id,
      goalId,
    },
  });

  return ok({ id: task.id }, 201);
}
