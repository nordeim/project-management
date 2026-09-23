"use client";

// Tasks (v2.7): the live's all-tasks view at /tasks — every task in the
// workspace (NOT just the signed-in user's; that stays /my-tasks). The
// only entry point is the mobile MORE sheet's "Tasks" row. Reference
// (measured 2026-09-23): h1 "Tasks" 28px/400 + the "{n} total tasks
// across all goals" sub-line, the SAME five-chip filter row as My Tasks
// (12px/600, ls 0.72px, pad 7px 14px, active #EBE7E2 inset well) but with
// whole-workspace counts, and TaskCard rows WITHOUT the edit/delete
// action squares. The rows are plain div.cursor-pointer whose click is
// INERT on the reference (a WIP seam — no dialog, no navigation),
// faithfully replicated here. No navigation surface lights up while on
// /tasks: neither a bottom tab nor a sidebar item carries its active
// state (measured on the live).

import { useMemo, useState } from "react";
import { Calendar, Clock, User } from "lucide-react";
import { useOrbital } from "@/components/orbital/store";
import { AiBadge } from "@/components/orbital/widgets";
import { isOverdue, TASK_STATUS_META, type TaskDTO, type TaskStatus } from "@/lib/orbital";
import { cn } from "@/lib/utils";

const FILTERS: Array<{ id: "all" | TaskStatus; label: string }> = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "in_progress", label: "In Progress" },
  { id: "blocked", label: "Blocked" },
  { id: "done", label: "Done" },
];

export function TasksView() {
  const allTasks = useOrbital((s) => s.allTasks);
  const [filter, setFilter] = useState<"all" | TaskStatus>("all");

  const counts = useMemo(() => {
    const map = new Map<string, number>([["all", allTasks.length]]);
    for (const t of allTasks) map.set(t.status, (map.get(t.status) ?? 0) + 1);
    return map;
  }, [allTasks]);

  const visible = useMemo(
    () => (filter === "all" ? allTasks : allTasks.filter((t) => t.status === filter)),
    [allTasks, filter],
  );

  return (
    <div className="w-full px-3 pt-6 md:px-7 lg:px-0 lg:pt-0">
      <header>
        <h1 className="text-[28px] font-normal leading-[1.2] tracking-[-0.01em] text-orb-heading">Tasks</h1>
        <p className="mt-1 text-[14px] text-orb-muted">
          {allTasks.length} total task{allTasks.length === 1 ? "" : "s"} across all goals
        </p>
      </header>

      <div className="mt-6 flex gap-2" role="group" aria-label="Filter all tasks by status">
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
                // Same chip spec as My Tasks (measured live): ls 0.72px,
                // 600 weight on every state, py 7px px 14px; the active
                // chip keeps the inset well.
                "rounded-full px-[14px] py-[7px] text-[12px] font-semibold tracking-[0.06em] whitespace-nowrap shrink-0 transition-colors",
                active
                  ? "bg-orb-well text-orb-heading shadow-[inset_-3px_-3px_6px_rgba(255,252,248,0.68),inset_3px_3px_6px_rgba(160,143,126,0.24)]"
                  : "text-orb-muted hover:text-orb-heading",
              )}
            >
              {f.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="mt-5 space-y-3">
        {visible.map((task) => (
          <TaskRow key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}

/** The inert row (v2.7, measured live): the TaskCard content stack —
 *  status dot + label, AI chip, title, one-line description, meta row —
 *  inside a plain cursor-pointer div. NO action squares, NO open-on-click
 *  (the reference's row click does nothing — their WIP seam). */
function TaskRow({ task }: { task: TaskDTO }) {
  const meta = TASK_STATUS_META[task.status];
  const overdue = isOverdue(task.deadline, task.status);

  return (
    <div className="orb-row-card w-full cursor-pointer p-[14px_18px]">
      <div className="mb-[6px] flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.08em] text-orb-muted">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.dot }} aria-hidden="true" />
          {meta.label}
        </span>
        {task.createdByAi ? <AiBadge /> : null}
      </div>
      <h4
        className={cn(
          "mb-[4px] text-[14px] font-medium leading-[1.3]",
          task.status === "blocked" ? "text-orb-coral-deep" : "text-orb-heading",
        )}
      >
        {task.title}
      </h4>
      {task.description ? (
        <p className="mb-2.5 line-clamp-1 text-[12px] leading-[1.5] text-[#6B6B72]">{task.description}</p>
      ) : (
        <div className="mb-2.5" aria-hidden="true" />
      )}
      <div className="flex flex-wrap items-center gap-4 text-[11px] text-orb-muted">
        {task.assignee ? (
          <span className="flex items-center gap-1">
            <User size={11} strokeWidth={2} aria-hidden="true" />
            {task.assignee.name}
          </span>
        ) : null}
        {task.deadline ? (
          <span className={cn("flex items-center gap-1", overdue && "font-medium text-orb-coral-deep")}>
            <Calendar size={11} strokeWidth={2} aria-hidden="true" />
            {overdue ? "Overdue · " : ""}
            {new Date(task.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        ) : null}
        {task.estimatedHours != null ? (
          <span className="flex items-center gap-1">
            <Clock size={11} strokeWidth={2} aria-hidden="true" />
            {task.estimatedHours}h
          </span>
        ) : null}
      </div>
    </div>
  );
}
