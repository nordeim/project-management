"use client";

// Task card used in goal detail and My Tasks lists: status dot + label,
// AI badge, title (blocked tasks render their title in the alert coral,
// like the reference), description, assignee (person outline glyph),
// deadline (overdue aware), estimated hours, and direct edit / delete icon
// buttons — always visible, top-right of the card, on soft rounded squares.
// Delete confirms INLINE (reference pattern): the icons swap for a
// "Delete? Yes No" row; no modal.

import { useState } from "react";
import { CalendarDays, Clock, Pencil, Trash2 } from "lucide-react";
import { AiBadge } from "@/components/orbital/widgets";
import { isOverdue, TASK_STATUS_META, type TaskDTO } from "@/lib/orbital";
import { cn } from "@/lib/utils";

function PersonGlyph({ size = 15 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="shrink-0 text-orb-muted"
    >
      <circle cx="8" cy="5.2" r="2.6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.8 13.6c.8-2.5 2.8-3.8 5.2-3.8s4.4 1.3 5.2 3.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function TaskCard({
  task,
  onOpen,
  onEdit,
  onDelete,
}: {
  task: TaskDTO;
  onOpen: (task: TaskDTO) => void;
  onEdit: (task: TaskDTO) => void;
  /** Performs the deletion; return false (or a falsy value) to keep the confirm open. */
  onDelete: (task: TaskDTO) => Promise<boolean | void> | boolean | void;
}) {
  const meta = TASK_STATUS_META[task.status];
  const overdue = isOverdue(task.deadline, task.status);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    if (deleting) return;
    setDeleting(true);
    const done = await onDelete(task);
    setDeleting(false);
    if (done !== false) setConfirming(false);
  }

  return (
    <div className="orb-card p-4 transition-transform hover:-translate-y-0.5 sm:p-5">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => onOpen(task)}
          className="min-w-0 flex-1 text-left"
          aria-label={`Open task ${task.title}, status ${meta.label}`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em]"
              style={{ color: meta.text }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.dot }} aria-hidden="true" />
              {meta.label}
            </span>
            {task.createdByAi ? <AiBadge /> : null}
          </div>
          <h4
            className={cn(
              "mt-1.5 text-[15px] font-semibold leading-snug",
              task.status === "blocked" ? "text-orb-coral-deep" : "text-orb-heading",
            )}
          >
            {task.title}
          </h4>
          {task.description ? (
            <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-orb-muted">{task.description}</p>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] text-orb-muted">
            {task.assignee ? (
              <span className="flex items-center gap-1.5">
                <PersonGlyph />
                {task.assignee.name}
              </span>
            ) : null}
            {task.deadline ? (
              <span className={cn("flex items-center gap-1.5", overdue && "font-medium text-orb-coral-deep")}>
                <CalendarDays size={13} aria-hidden="true" />
                {overdue ? "Overdue · " : ""}
                {new Date(task.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            ) : null}
            {task.estimatedHours != null ? (
              <span className="flex items-center gap-1.5">
                <Clock size={13} aria-hidden="true" />
                {task.estimatedHours}h
              </span>
            ) : null}
          </div>
        </button>

        {/* Direct actions — always visible on soft rounded squares (reference
            pattern). While deleting, they swap for the inline confirmation. */}
        <div className="flex shrink-0 items-center gap-1.5">
          {confirming ? (
            <div className="flex items-center gap-2" role="group" aria-label={`Confirm delete ${task.title}`}>
              <span className="text-[13px] text-orb-muted">Delete?</span>
              <button
                type="button"
                onClick={() => void confirmDelete()}
                disabled={deleting}
                className="h-8 rounded-full bg-orb-coral-deep px-4 text-[13px] font-semibold text-white transition-colors hover:bg-orb-coral-deep/90 disabled:opacity-50"
              >
                {deleting ? "…" : "Yes"}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={deleting}
                className="h-8 px-1 text-[13px] font-medium text-orb-muted transition-colors hover:text-orb-heading disabled:opacity-50"
              >
                No
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onEdit(task)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/[0.045] text-orb-muted transition-colors hover:bg-black/[0.09] hover:text-orb-heading"
                aria-label={`Edit task ${task.title}`}
              >
                <Pencil size={16} />
              </button>
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/[0.045] text-orb-muted transition-colors hover:bg-orb-coral/15 hover:text-orb-coral-deep"
                aria-label={`Delete task ${task.title}`}
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
