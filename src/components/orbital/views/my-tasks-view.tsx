"use client";

// My Tasks: tasks assigned to the signed-in user, filterable by status.

import { useMemo, useState } from "react";
import { CheckSquare, Pencil, Trash2 } from "lucide-react";
import { useOrbital } from "@/components/orbital/store";
import { TaskCard } from "@/components/orbital/task-card";
import { EmptyState } from "@/components/orbital/empty-state";
import { TaskDetailDialog } from "@/components/orbital/dialogs/task-detail-dialog";
import { TaskEditDialog } from "@/components/orbital/dialogs/task-edit-dialog";
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
import type { TaskDTO, TaskStatus } from "@/lib/orbital";
import { cn } from "@/lib/utils";

const FILTERS: Array<{ id: "all" | TaskStatus; label: string }> = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "in_progress", label: "In Progress" },
  { id: "blocked", label: "Blocked" },
  { id: "need_help", label: "Need Help" },
  { id: "done", label: "Done" },
];

export function MyTasksView() {
  const myTasks = useOrbital((s) => s.myTasks);
  const deleteTask = useOrbital((s) => s.deleteTask);
  const [filter, setFilter] = useState<"all" | TaskStatus>("all");
  const [detailTask, setDetailTask] = useState<TaskDTO | null>(null);
  const [editTask, setEditTask] = useState<TaskDTO | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<TaskDTO | null>(null);
  const [deleting, setDeleting] = useState(false);

  const counts = useMemo(() => {
    const map = new Map<string, number>([["all", myTasks.length]]);
    for (const t of myTasks) map.set(t.status, (map.get(t.status) ?? 0) + 1);
    return map;
  }, [myTasks]);

  const visible = useMemo(
    () => (filter === "all" ? myTasks : myTasks.filter((t) => t.status === filter)),
    [myTasks, filter],
  );

  return (
    <div className="mx-auto max-w-4xl">
      <header>
        <h1 className="text-[28px] font-normal tracking-tight text-orb-heading">My Tasks</h1>
        <p className="mt-1 text-[14px] text-orb-muted">
          {myTasks.length} task{myTasks.length === 1 ? "" : "s"} assigned to you
        </p>
      </header>

      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter my tasks by status">
        {FILTERS.map((f) => {
          const count = counts.get(f.id) ?? 0;
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(f.id)}
              className={cn(
                "h-9 rounded-full px-4 text-[13px] font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-black/[0.045] text-orb-muted hover:bg-black/[0.07] hover:text-orb-heading",
              )}
            >
              {f.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="mt-5 space-y-3">
        {visible.length === 0 ? (
          <EmptyState
            icon={<CheckSquare size={22} />}
            title="No tasks assigned"
            description="Tasks will show up here once goals are created and assigned to you."
          />
        ) : (
          visible.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onOpen={setDetailTask}
              onEdit={setEditTask}
              onDelete={setTaskToDelete}
            />
          ))
        )}
      </div>

      {detailTask ? <TaskDetailDialog task={detailTask} onClose={() => setDetailTask(null)} /> : null}
      {editTask ? <TaskEditDialog task={editTask} onClose={() => setEditTask(null)} /> : null}

      <AlertDialog open={taskToDelete !== null} onOpenChange={(open) => !open && setTaskToDelete(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 size={16} /> Delete this task?
            </AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{taskToDelete?.title}&quot; will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full bg-destructive text-white hover:bg-destructive/90"
              disabled={deleting}
              onClick={async (event) => {
                event.preventDefault();
                if (!taskToDelete) return;
                setDeleting(true);
                const done = await deleteTask(taskToDelete.id, taskToDelete.goalId);
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
