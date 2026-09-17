"use client";

// Goals: filter chips (All / Active / Done / Draft / Paused) + goal cards
// with status chip, task progress, target date and edit/delete actions.

import { useMemo, useState } from "react";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useOrbital } from "@/components/orbital/store";
import { ProgressRing } from "@/components/orbital/progress-ring";
import { EmptyState } from "@/components/orbital/empty-state";
import { NewGoalDialog } from "@/components/orbital/dialogs/new-goal-dialog";
import { GoalEditDialog } from "@/components/orbital/dialogs/goal-edit-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GOAL_STATUS_META, type GoalDTO, type GoalStatus } from "@/lib/orbital";
import { cn } from "@/lib/utils";

const FILTERS: Array<{ id: "all" | GoalStatus; label: string }> = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "done", label: "Done" },
  { id: "draft", label: "Draft" },
  { id: "paused", label: "Paused" },
];

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function GoalsView() {
  const goals = useOrbital((s) => s.goals);
  const navigate = useOrbital((s) => s.navigate);
  const [filter, setFilter] = useState<"all" | GoalStatus>("all");
  const [newGoalOpen, setNewGoalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalDTO | null>(null);

  const counts = useMemo(() => {
    const map = new Map<string, number>([["all", goals.length]]);
    for (const g of goals) map.set(g.status, (map.get(g.status) ?? 0) + 1);
    return map;
  }, [goals]);

  const visible = useMemo(
    () => (filter === "all" ? goals : goals.filter((g) => g.status === filter)),
    [goals, filter],
  );

  return (
    <div className="mx-auto max-w-4xl">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-normal tracking-tight text-orb-heading">Goals</h1>
          <p className="mt-1 text-[14px] text-orb-muted">Manage your team objectives</p>
        </div>
        <button type="button" className="orb-pill" onClick={() => setNewGoalOpen(true)}>
          <Plus size={14} aria-hidden="true" />
          New Goal
        </button>
      </header>

      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter goals by status">
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
            icon={<Plus size={22} />}
            title={filter === "all" ? "No goals yet" : `No ${FILTERS.find((f) => f.id === filter)?.label.toLowerCase()} goals`}
            description="Create your first goal and the AI assistant will draft a task plan for it."
            action={
              <button type="button" className="orb-pill" onClick={() => setNewGoalOpen(true)}>
                <Plus size={14} aria-hidden="true" /> New Goal
              </button>
            }
          />
        ) : (
          visible.map((goal) => {
            const pct = goal.taskCount > 0 ? Math.round((goal.doneCount / goal.taskCount) * 100) : 0;
            const meta = GOAL_STATUS_META[goal.status];
            return (
              <div key={goal.id} className="orb-card group relative p-5 transition-transform hover:-translate-y-0.5">
                <button
                  type="button"
                  onClick={() => navigate("goal-detail", goal.id)}
                  className="flex w-full items-center gap-4 text-left"
                  aria-label={`Open goal ${goal.title}, ${goal.doneCount} of ${goal.taskCount} tasks done, ${pct}% complete`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: meta.color }}>
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.color }} aria-hidden="true" />
                        {meta.label}
                      </span>
                      {goal.blockedCount > 0 && goal.status === "active" ? (
                        <span className="text-[11px] font-medium text-orb-coral-deep">· {goal.blockedCount} blocked</span>
                      ) : null}
                      <span className="text-[11px] text-orb-muted" aria-hidden="true">
                        ›
                      </span>
                    </div>
                    <p className="mt-1.5 truncate text-[16px] font-semibold text-orb-heading">{goal.title}</p>
                    <p className="mt-0.5 text-[13px] text-orb-muted">
                      {goal.doneCount}/{goal.taskCount} tasks · {pct}%
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2 self-center">
                    <span className="text-[12px] text-orb-muted">{formatDate(goal.targetDate)}</span>
                    <ProgressRing value={pct} size={52} thickness={4.5}>
                      <span className="text-[11.5px] font-semibold text-orb-heading">{pct}%</span>
                    </ProgressRing>
                  </div>
                </button>

                <div className="absolute right-4 top-4 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="flex h-9 w-9 items-center justify-center rounded-full text-orb-muted hover:bg-black/[0.06] hover:text-orb-heading"
                        aria-label={`Actions for ${goal.title}`}
                      >
                        <MoreHorizontal size={17} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem onSelect={() => setEditingGoal(goal)}>
                        <Pencil size={14} /> Edit goal
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })
        )}
      </div>

      <NewGoalDialog open={newGoalOpen} onOpenChange={setNewGoalOpen} />
      {editingGoal ? <GoalEditDialog goal={editingGoal} onClose={() => setEditingGoal(null)} /> : null}
    </div>
  );
}
