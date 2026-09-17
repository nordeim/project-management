// POST /api/tasks/[id]/updates — the check-in flow ("POST STATUS UPDATE"):
// records a TaskUpdate, syncs the task's workflow status, and logs agent
// activity. on_track keeps pending tasks pending (a check-in is not work
// starting); it only unblocks blocked/need_help tasks back to in_progress.

import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, requireSession } from "@/lib/api";
import { mapCheckinToTaskStatus, type CheckinStatus, type TaskWorkflowStatus } from "@/lib/checkin";

type Params = { params: Promise<{ id: string }> };

const UPDATE_STATUSES = new Set(["on_track", "blocked", "need_help", "done"]);

export async function POST(request: NextRequest, { params }: Params) {
  const session = await requireSession();
  if (!session) return fail("UNAUTHORIZED", "Not signed in", 401);
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("BAD_REQUEST", "Invalid JSON body", 400);
  }
  const { status, note } = (body ?? {}) as { status?: string; note?: string };

  if (!status || !UPDATE_STATUSES.has(status)) {
    return fail("BAD_REQUEST", "Status must be on_track, blocked, need_help or done", 400);
  }
  const trimmedNote = note?.trim();
  if (trimmedNote && trimmedNote.length > 1000) {
    return fail("BAD_REQUEST", "Note is too long (max 1000 characters)", 400);
  }

  const task = await db.task.findUnique({ where: { id }, include: { goal: true, assignee: true } });
  if (!task) return fail("NOT_FOUND", "Task not found", 404);

  const nextTaskStatus: TaskWorkflowStatus = mapCheckinToTaskStatus(
    status as CheckinStatus,
    task.status as TaskWorkflowStatus,
  );

  const update = await db.taskUpdate.create({
    data: { taskId: id, status, note: trimmedNote || null },
  });
  if (nextTaskStatus !== task.status) {
    await db.task.update({ where: { id }, data: { status: nextTaskStatus } });
  }

  const label =
    status === "on_track" ? "On Track" : status === "need_help" ? "Need Help" : status.charAt(0).toUpperCase() + status.slice(1);

  await db.activityLog.create({
    data: {
      type: "status_update",
      message: `${session.name} checked in on "${task.title}"`,
      detail: trimmedNote
        ? `${session.name} posted a status update: ${label}. "${trimmedNote}"`
        : `${session.name} posted a status update: ${label}.`,
      taskId: task.id,
      goalId: task.goalId,
    },
  });

  // Completing the last open task completes the goal.
  if (nextTaskStatus === "done") {
    const remaining = await db.task.count({ where: { goalId: task.goalId, status: { not: "done" } } });
    if (remaining === 0 && task.goal.status === "active") {
      await db.goal.update({ where: { id: task.goalId }, data: { status: "done" } });
      await db.activityLog.create({
        data: {
          type: "goal_completed",
          message: `${task.goal.title} completed`,
          detail: `Every task in "${task.goal.title}" is done — goal marked as completed.`,
          goalId: task.goalId,
        },
      });
    }
  }

  return ok({ id: update.id, taskStatus: nextTaskStatus }, 201);
}
