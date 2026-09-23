"use client";

// Goal detail: header (status, title, description, target, inline delete
// confirm — the reference pattern, no modal), progress stats row, ADD TASK,
// and the full task list (per-card inline delete confirms).

import { useEffect, useState } from "react";
import { ArrowLeft, Calendar, Plus, Trash2 } from "lucide-react";
import { useOrbital } from "@/components/orbital/store";
import { TaskCard } from "@/components/orbital/task-card";
import { AddTaskDialog } from "@/components/orbital/dialogs/add-task-dialog";
import { TaskDetailDialog } from "@/components/orbital/dialogs/task-detail-dialog";
import { TaskEditDialog } from "@/components/orbital/dialogs/task-edit-dialog";
import { EmptyState } from "@/components/orbital/empty-state";
import { GOAL_STATUS_META, type GoalDTO, type TaskDTO } from "@/lib/orbital";

export function GoalDetailView() {
  const goalId = useOrbital((s) => s.goalId);
  const goals = useOrbital((s) => s.goals);
  const goalTasks = useOrbital((s) => s.goalTasks);
  const navigate = useOrbital((s) => s.navigate);
  const refreshGoalDetail = useOrbital((s) => s.refreshGoalDetail);
  const deleteGoal = useOrbital((s) => s.deleteGoal);

  const [addOpen, setAddOpen] = useState(false);
  const [detailTask, setDetailTask] = useState<TaskDTO | null>(null);
  const [editTask, setEditTask] = useState<TaskDTO | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const goal: GoalDTO | undefined = goals.find((g) => g.id === goalId);
  const tasks = goalId ? (goalTasks[goalId] ?? []) : [];
  const deleteTask = useOrbital((s) => s.deleteTask);

  useEffect(() => {
    if (goalId) void refreshGoalDetail(goalId);
  }, [goalId, refreshGoalDetail]);

  if (!goal) {
    return (
      <div className="w-full px-7 pt-6 lg:px-0 lg:pt-0">
        <EmptyState
          icon={<ArrowLeft size={22} strokeWidth={1.5} color="#B3B3B3" />}
          title="Goal not found"
          description="This goal may have been deleted."
          action={
            <button type="button" className="orb-ghost-pill" onClick={() => navigate("goals")}>
              <ArrowLeft size={14} /> Back to Goals
            </button>
          }
        />
      </div>
    );
  }

  const meta = GOAL_STATUS_META[goal.status];
  const pct = goal.taskCount > 0 ? Math.round((goal.doneCount / goal.taskCount) * 100) : 0;

  return (
    <div className="w-full px-7 pt-6 lg:px-0 lg:pt-0">
      <button
        type="button"
        onClick={() => navigate("goals")}
        className="flex items-center gap-2 text-[13px] font-normal text-orb-muted hover:text-orb-heading"
      >
        <ArrowLeft size={14} /> Back to Goals
      </button>

      {/* v2.2 (measured): header sits 24px below the back row (mt-6) and
          has NO gap and NO wrap (live `flex items-start justify-between
          mb-6`, gap 0) — the title block takes every leftover px beside the
          Delete button (220 = 322 - 102 at 390). */}
      <header className="mt-6 flex items-start justify-between">
        {/* v2.2 (measured): the title block is flex-1 min-w-0 so the Delete
            button stays BESIDE it on mobile (title 220 = 322 - 102 at 390);
            the chip sits 5px below the title-block top (live y+5 at BOTH
            390 and 1440 — the old 10px reading double-counted chip air). */}
        <div className="min-w-0 flex-1 pt-[5px]">
          {/* v1.7 (measured): the status chip text is GRAY (the dot keeps the
              status color, 7px) — not painted in the status color. */}
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-orb-muted">
            <span className="h-[7px] w-[7px] rounded-full" style={{ backgroundColor: meta.color }} aria-hidden="true" />
            {meta.label}
          </span>
          <h1 className="mt-2 text-[28px] font-normal leading-[1.2] tracking-[-0.01em] text-orb-heading">{goal.title}</h1>
          {goal.description ? <p className="mt-[5px] max-w-xl text-[14px] leading-[21px] text-orb-muted">{goal.description}</p> : null}
          {goal.targetDate ? (
            // v1.8 (measured): 13px #767676 with a 13px calendar glyph.
            <p className="mt-[8px] flex items-center gap-1.5 text-[13px] text-[#767676]">
              <Calendar size={13} aria-hidden="true" />
              Target:{" "}
              {new Date(goal.targetDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {confirmDelete ? (
            <div className="flex items-center gap-2.5" role="group" aria-label="Confirm goal deletion">
              <span className="text-[13px] text-orb-muted">Delete goal &amp; all tasks?</span>
              <button
                type="button"
                disabled={deleting}
                onClick={async () => {
                  setDeleting(true);
                  const done = await deleteGoal(goal.id);
                  setDeleting(false);
                  if (done) navigate("goals");
                }}
                className="inline-flex h-9 items-center rounded-full bg-orb-coral-deep px-4 text-[13px] font-semibold text-white transition-colors hover:bg-orb-coral-deep/90 disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Yes, Delete"}
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => setConfirmDelete(false)}
                className="inline-flex h-9 items-center rounded-full px-4 text-[13px] font-medium text-orb-muted transition-colors hover:text-orb-heading disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="inline-flex items-center gap-2 rounded-[12px] bg-orb-raised px-4 py-[11px] text-[12px] font-semibold uppercase tracking-[0.08em] text-[#BD3228] shadow-[-5px_-5px_10px_rgba(255,250,244,0.78),5px_5px_12px_rgba(160,143,126,0.27)] transition-colors hover:text-orb-coral-deep"
            >
              <Trash2 size={13} aria-hidden="true" />
              Delete
            </button>
          )}
        </div>
      </header>

      {/* Two stat cards (reference, v1.6 measured; v1.9 ratio; v2.2): large
          panel tier, 709:347 ratio (2.04fr:1fr) at EVERY breakpoint — the
          live renders the pair side by side even at 390 (209+97) —
          Progress p 20/24 and Blocked p 20/16, pct at 24px/400 and the
          blocked count at 26px/400 in #FF7043. */}
      <section className="mt-6 grid grid-cols-[2.04fr_1fr] gap-4" aria-label="Goal statistics">
        <div className="orb-panel p-[20px_24px]">
          <div className="flex items-baseline justify-between">
            <p className="orb-label">Progress</p>
            <p className="text-[12.5px] text-orb-muted">
              {goal.doneCount}/{goal.taskCount} tasks done
            </p>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-orb-track shadow-[inset_-1px_-1px_2px_rgba(255,250,244,0.68),inset_1px_1px_2px_rgba(160,143,126,0.24)]" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <div
              className="h-full rounded-full bg-orb-green transition-[width] duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-3 text-[24px] font-normal leading-none tracking-[-0.02em] text-orb-heading">{pct}%</p>
        </div>
        <div className="orb-panel flex flex-col items-center justify-center p-[20px_16px]">
          {/* v1.9 (measured): the blocked count sits inside a 64px INSET
              WELL square (r12, flex-centered) below the label. The radius
              is styled explicitly — .orb-well would out-cascade a
              rounded-[12px] utility (the custom-class cascade rule). */}
          <div className="flex flex-col items-center">
            <p className="orb-label">Blocked</p>
            <div className="mt-[8px] flex h-[64px] w-[64px] items-center justify-center rounded-[12px] bg-orb-well shadow-[inset_-3px_-3px_6px_rgba(255,250,244,0.68),inset_3px_3px_6px_rgba(160,143,126,0.24)]">
              <p className="text-[26px] font-normal leading-[39px] tracking-[-0.02em]" style={{ color: goal.blockedCount > 0 ? "#FF7043" : "#3A3A3A" }}>
                {goal.blockedCount}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* v1.8 (measured): the tasks header row is 31px tall — the TASKS
          label on the left, "N total" + ADD TASK grouped on the RIGHT with
          a 12px gap. */}
      <div className="mt-[23px] flex items-center justify-between">
        <h2 className="orb-label">Tasks</h2>
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-normal text-orb-muted">{goal.taskCount} total</span>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-[12px] bg-orb-raised px-[14px] py-[7px] text-[11px] font-semibold uppercase tracking-[0.08em] text-orb-heading shadow-[-5px_-5px_10px_rgba(255,250,244,0.78),5px_5px_12px_rgba(160,143,126,0.27)] transition-colors hover:text-orb-body"
            onClick={() => setAddOpen(true)}
          >
            <Plus size={12} aria-hidden="true" />
            Add Task
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {tasks.length === 0 ? (
          <EmptyState
            icon={<Plus size={22} strokeWidth={1.5} color="#B3B3B3" />}
            title="No tasks yet"
            description="Add tasks manually or let the AI assistant draft a plan when you create a goal."
            action={
              <button type="button" className="orb-pill-outline orb-pill-compact" onClick={() => setAddOpen(true)}>
                <Plus size={14} /> Add Task
              </button>
            }
          />
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onOpen={setDetailTask}
              onEdit={setEditTask}
              onDelete={(t) => deleteTask(t.id, t.goalId)}
            />
          ))
        )}
      </div>

      <AddTaskDialog goalId={goal.id} open={addOpen} onOpenChange={setAddOpen} />
      {detailTask ? <TaskDetailDialog task={detailTask} onClose={() => setDetailTask(null)} /> : null}
      {editTask ? <TaskEditDialog task={editTask} onClose={() => setEditTask(null)} /> : null}
    </div>
  );
}
