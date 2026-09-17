"use client";

// Task card used in goal detail and My Tasks lists: status dot + label,
// AI badge, title, description, assignee, deadline (overdue aware),
// estimated hours, and an actions menu (edit / delete).

import { CalendarDays, Clock, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { AvatarBubble, AiBadge } from "@/components/orbital/widgets";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  onDelete: (task: TaskDTO) => void;
}) {
  const meta = TASK_STATUS_META[task.status];
  const overdue = isOverdue(task.deadline, task.status);

  return (
    <div className="orb-card group p-4 transition-transform hover:-translate-y-0.5 sm:p-5">
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
          <h4 className="mt-1.5 text-[15px] font-semibold leading-snug text-orb-heading">{task.title}</h4>
          {task.description ? (
            <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-orb-muted">{task.description}</p>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] text-orb-muted">
            {task.assignee ? (
              <span className="flex items-center gap-1.5">
                <AvatarBubble name={task.assignee.name} color={task.assignee.avatarColor} size={20} />
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-orb-muted opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100 hover:bg-black/[0.06] hover:text-orb-heading"
              aria-label={`Actions for ${task.title}`}
            >
              <MoreHorizontal size={17} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl">
            <DropdownMenuItem onSelect={() => onEdit(task)}>
              <Pencil size={14} /> Edit task
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onSelect={() => onDelete(task)}>
              <Trash2 size={14} /> Delete task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
