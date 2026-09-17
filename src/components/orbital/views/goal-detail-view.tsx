"use client";

// Goal detail: header (status, title, description, target, delete), progress
// stats row, ADD TASK, and the full task list.

import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, Plus, Trash2 } from "lucide-react";
import { useOrbital } from "@/components/orbital/store";
import { TaskCard } from "@/components/orbital/task-card";
import { AddTaskDialog } from "@/components/orbital/dialogs/add-task-dialog";
import { TaskDetailDialog } from "@/components/orbital/dialogs/task-detail-dialog";
import { TaskEditDialog } from "@/components/orbital/dialogs/task-edit-dialog";
import { GoalEditDialog } from "@/components/orbital/dialogs/goal-edit-dialog";
import { EmptyState } from "@/components/orbital/empty-state";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  const [editGoal, setEditGoal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<TaskDTO | null>(null);
  const [deleting, setDeleting] = useState(false);

  const goal: GoalDTO | undefined = goals.find((g) => g.id === goalId);
  const tasks = goalId ? (goalTasks[goalId] ?? []) : [];
  const deleteTask = useOrbital((s) => s.deleteTask);

  useEffect(() => {
    if (goalId) void refreshGoalDetail(goalId);
  }, [goalId, refreshGoalDetail]);

  if (!goal) {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState
          icon={<ArrowLeft size={22} />}
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
    <div className="mx-auto max-w-4xl">
      <button
        type="button"
        onClick={() => navigate("goals")}
        className="flex items-center gap-2 text-[13.5px] font-medium text-orb-muted hover:text-orb-heading"
      >
        <ArrowLeft size={15} /> Back to Goals
      </button>

      <header className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <span
            className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em]"
            style={{ color: meta.color }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.color }} aria-hidden="true" />
            {meta.label}
          </span>
          <h1 className="mt-2 text-[28px] font-normal leading-tight tracking-tight text-orb-heading">{goal.title}</h1>
          {goal.description ? <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-orb-muted">{goal.description}</p> : null}
          {goal.targetDate ? (
            <p className="mt-3 flex items-center gap-1.5 text-[13.5px] text-orb-muted">
              <CalendarDays size={14} aria-hidden="true" />
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
          <button
            type="button"
            onClick={() => setEditGoal(true)}
            className="orb-ghost-pill h-9"
            aria-label={`Edit goal ${goal.title}`}
          >
            <PencilGlyph />
            Edit
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-orb-coral/40 bg-orb-coral/10 px-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-orb-coral-deep transition-colors hover:bg-orb-coral/20"
          >
            <Trash2 size={13} aria-hidden="true" />
            Delete
          </button>
        </div>
      </header>

      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-[1.4fr_0.8fr_0.8fr]" aria-label="Goal statistics">
        <div className="orb-card p-5">
          <div className="flex items-baseline justify-between">
            <p className="orb-label">Progress</p>
            <p className="text-[12.5px] text-orb-muted">
              {goal.doneCount}/{goal.taskCount} tasks done
            </p>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-orb-inset" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <div
              className="h-full rounded-full bg-orb-green transition-[width] duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-3 text-[30px] font-normal leading-none text-orb-heading">{pct}%</p>
        </div>
        <div className="orb-card flex flex-col justify-between p-5">
          <p className="orb-label">Blocked</p>
          <p className="text-[30px] font-normal leading-none" style={{ color: goal.blockedCount > 0 ? "#C9574E" : "#3A3A3A" }}>
            {goal.blockedCount}
          </p>
          <p className="text-[12px] text-orb-muted">tasks need attention</p>
        </div>
        <div className="orb-card flex flex-col justify-between p-5">
          <p className="orb-label">Tasks</p>
          <p className="text-[30px] font-normal leading-none text-orb-heading">{goal.taskCount}</p>
          <p className="text-[12px] text-orb-muted">total</p>
        </div>
      </section>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="orb-label">Tasks · {goal.taskCount} total</h2>
        <button type="button" className="orb-ghost-pill h-9" onClick={() => setAddOpen(true)}>
          <Plus size={13} aria-hidden="true" />
          Add Task
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {tasks.length === 0 ? (
          <EmptyState
            icon={<Plus size={22} />}
            title="No tasks yet"
            description="Add tasks manually or let the AI assistant draft a plan when you create a goal."
            action={
              <button type="button" className="orb-pill" onClick={() => setAddOpen(true)}>
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
              onDelete={(t) => setTaskToDelete(t)}
            />
          ))
        )}
      </div>

      <AddTaskDialog goalId={goal.id} open={addOpen} onOpenChange={setAddOpen} />
      {detailTask ? <TaskDetailDialog task={detailTask} onClose={() => setDetailTask(null)} /> : null}
      {editTask ? <TaskEditDialog task={editTask} onClose={() => setEditTask(null)} /> : null}
      {editGoal ? <GoalEditDialog goal={goal} onClose={() => setEditGoal(false)} /> : null}

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this goal?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{goal.title}&quot; and its {goal.taskCount} tasks will be permanently removed. This cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full bg-destructive text-white hover:bg-destructive/90"
              disabled={deleting}
              onClick={async (event) => {
                event.preventDefault();
                setDeleting(true);
                const done = await deleteGoal(goal.id);
                setDeleting(false);
                if (done) setConfirmDelete(false);
              }}
            >
              {deleting ? "Deleting…" : "Delete goal"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={taskToDelete !== null} onOpenChange={(open) => !open && setTaskToDelete(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{taskToDelete?.title}&quot; will be permanently removed from this goal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full bg-destructive text-white hover:bg-destructive/90"
              disabled={deleting}
              onClick={async (event) => {
                event.preventDefault();
                if (!taskToDelete || !goalId) return;
                setDeleting(true);
                const done = await deleteTask(taskToDelete.id, goalId);
                setDeleting(false);
                if (done) setTaskToDelete(null);
              }}
            >
              {deleting ? "Deleting…" : "Delete task"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function PencilGlyph() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M9.9 1.7l2.4 2.4L4.6 11.8l-3 .6.6-3L9.9 1.7z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
