"use client";

// Task card used in goal detail and My Tasks lists (v1.6, measured):
// a radius-14 deeper-tier card (p 14px 18px) holding ONLY the flat content —
// status chip (gray 11px/500 + status-colored dot), title (14px/500, coral
// when blocked), one-line 12px description, 11px meta row with 11px lucide
// icons. The edit/delete actions are 26px radius-7 raised squares that sit
// OUTSIDE the shadowed card, pinned to the row's top-right. Delete confirms
// INLINE (reference pattern): the icons swap for a "Delete? Yes No" row.

import { useState } from "react";
import { Calendar, Clock, Pencil, Trash2, User } from "lucide-react";
import { AiBadge } from "@/components/orbital/widgets";
import { isOverdue, TASK_STATUS_META, type TaskDTO } from "@/lib/orbital";
import { cn } from "@/lib/utils";

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
    <div className="relative">
      {/* The card (v1.6): flat content only — no nested action column. */}
      <button
        type="button"
        onClick={() => onOpen(task)}
        className={cn(
          "orb-row-card w-full p-[14px_18px] text-left transition-transform hover:-translate-y-0.5",
          task.status === "blocked" && "orb-task-blocked",
        )}
        aria-label={`Open task ${task.title}, status ${meta.label}`}
      >
        {/* v2.1 (measured): chip row → title gap 6px; title mb 4. */}
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
      </button>

      {/* Direct actions (v1.6, measured; v1.9 spacing): 26px radius-7
          raised squares with 11px icons, pinned to the row's top-right
          (10px below the card's top edge) — OUTSIDE the shadowed card,
          2px apart. While deleting, they swap for the inline confirmation. */}
      <div className="absolute right-0 top-0 flex translate-y-[10px] items-center gap-[2px] pr-[9px]">
        {confirming ? (
          <div
            className="flex items-center gap-2 rounded-[10px] bg-orb-raised px-2 py-1"
            role="group"
            aria-label={`Confirm delete ${task.title}`}
          >
            <span className="text-[12px] text-orb-muted">Delete?</span>
            <button
              type="button"
              onClick={() => void confirmDelete()}
              disabled={deleting}
              className="h-7 rounded-full bg-orb-coral-deep px-3 text-[12px] font-semibold text-white transition-colors hover:bg-orb-coral-deep/90 disabled:opacity-50"
            >
              {deleting ? "…" : "Yes"}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={deleting}
              className="h-7 px-1 text-[12px] font-medium text-orb-muted transition-colors hover:text-orb-heading disabled:opacity-50"
            >
              No
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onEdit(task)}
              className="flex h-[26px] w-[26px] items-center justify-center rounded-[7px] bg-orb-raised text-[#9A9A9A] shadow-[-2px_-2px_5px_rgba(255,250,244,0.78),2px_2px_5px_rgba(160,143,126,0.24)] transition-colors hover:text-orb-heading"
              aria-label={`Edit task ${task.title}`}
            >
              <Pencil size={11} strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="flex h-[26px] w-[26px] items-center justify-center rounded-[7px] bg-orb-raised text-[#9A9A9A] shadow-[-2px_-2px_5px_rgba(255,250,244,0.78),2px_2px_5px_rgba(160,143,126,0.24)] transition-colors hover:text-orb-coral-deep"
              aria-label={`Delete task ${task.title}`}
            >
              <Trash2 size={11} strokeWidth={2} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
