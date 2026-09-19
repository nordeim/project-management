"use client";

// My Tasks: tasks assigned to the signed-in user, filterable by status.
// Reference (v1.5): the filter row ships five tabs — All / Pending /
// In Progress / Blocked / Done (no "Need Help" tab, though the status
// itself stays in the vocabulary). Deletes confirm inline on the task
// card (reference pattern).

import { useMemo, useState } from "react";
import { CheckSquare } from "lucide-react";
import { useOrbital } from "@/components/orbital/store";
import { TaskCard } from "@/components/orbital/task-card";
import { EmptyState } from "@/components/orbital/empty-state";
import { TaskDetailDialog } from "@/components/orbital/dialogs/task-detail-dialog";
import { TaskEditDialog } from "@/components/orbital/dialogs/task-edit-dialog";
import type { TaskDTO, TaskStatus } from "@/lib/orbital";
import { cn } from "@/lib/utils";

const FILTERS: Array<{ id: "all" | TaskStatus; label: string }> = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "in_progress", label: "In Progress" },
  { id: "blocked", label: "Blocked" },
  { id: "done", label: "Done" },
];

export function MyTasksView() {
  const myTasks = useOrbital((s) => s.myTasks);
  const deleteTask = useOrbital((s) => s.deleteTask);
  const [filter, setFilter] = useState<"all" | TaskStatus>("all");
  const [detailTask, setDetailTask] = useState<TaskDTO | null>(null);
  const [editTask, setEditTask] = useState<TaskDTO | null>(null);

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
    <div className="w-full">
      <header>
        <h1 className="text-[28px] font-normal leading-[1.2] tracking-[-0.01em] text-orb-heading">My Tasks</h1>
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
                // v1.7 (measured): ls 0.72px, 600 weight on every state,
                // py 7px px 14px; the active chip keeps the inset well.
                "rounded-full px-[14px] py-[7px] text-[12px] font-semibold tracking-[0.06em] transition-colors",
                active
                  ? "bg-orb-well text-orb-heading shadow-[inset_-3px_-3px_6px_rgba(255,250,244,0.68),inset_3px_3px_6px_rgba(160,143,126,0.24)]"
                  : "text-orb-muted hover:text-orb-heading",
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
            icon={<CheckSquare size={28} color="#B3B3B3" />}
            title="No tasks assigned"
            description="Tasks will show up here once goals are created and assigned."
          />
        ) : (
          visible.map((task) => (
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

      {detailTask ? <TaskDetailDialog task={detailTask} onClose={() => setDetailTask(null)} /> : null}
      {editTask ? <TaskEditDialog task={editTask} onClose={() => setEditTask(null)} /> : null}
    </div>
  );
}
