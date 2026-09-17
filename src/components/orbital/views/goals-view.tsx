"use client";

// Goals: filter chips (All / Active / Done / Draft / Paused) + goal cards
// matching the reference layout — status row + title + horizontal progress
// bar, big percentage with task fraction on the right, meta + date bottom
// left, always-visible edit / delete actions bottom right. Delete confirms
// INLINE on the card (reference pattern): the icons swap for a
// "Delete / Cancel" pair; no modal.

import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useOrbital } from "@/components/orbital/store";
import { EmptyState } from "@/components/orbital/empty-state";
import { NewGoalDialog } from "@/components/orbital/dialogs/new-goal-dialog";
import { GoalEditDialog } from "@/components/orbital/dialogs/goal-edit-dialog";
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

function GoalCard({
  goal,
  onEdit,
  onDelete,
}: {
  goal: GoalDTO;
  onEdit: (goal: GoalDTO) => void;
  onDelete: (goal: GoalDTO) => Promise<boolean | void> | boolean | void;
}) {
  const navigate = useOrbital((s) => s.navigate);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const pct = goal.taskCount > 0 ? Math.round((goal.doneCount / goal.taskCount) * 100) : 0;
  const meta = GOAL_STATUS_META[goal.status];

  async function confirmDelete() {
    if (deleting) return;
    setDeleting(true);
    const done = await onDelete(goal);
    setDeleting(false);
    if (done !== false) setConfirming(false);
  }

  return (
    <div className="orb-card p-5 transition-transform hover:-translate-y-0.5">
      <div className="flex w-full items-start justify-between gap-4 text-left">
        <button
          type="button"
          onClick={() => navigate("goal-detail", goal.id)}
          className="min-w-0 flex-1 text-left"
          aria-label={`Open goal ${goal.title}, ${goal.doneCount} of ${goal.taskCount} tasks done, ${pct}% complete`}
        >
          <div className="flex items-center gap-2">
            <span
              className="orb-well-pill flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]"
              style={{ color: meta.color }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.color }} aria-hidden="true" />
              {meta.label}
            </span>
            {goal.blockedCount > 0 && goal.status === "active" ? (
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-orb-coral-deep">
                · {goal.blockedCount} Blocked
              </span>
            ) : null}
            <span className="text-[11px] text-orb-muted" aria-hidden="true">
              ›
            </span>
          </div>
          <p className="mt-1.5 truncate text-[16px] font-semibold text-orb-heading">{goal.title}</p>

          {/* Horizontal progress bar on the inset track (reference pattern) */}
          <div
            className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-orb-track shadow-[inset_-1px_-1px_2px_rgba(255,250,244,0.68),inset_1px_1px_2px_rgba(160,143,126,0.24)]"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${goal.title} progress`}
          >
            <div
              className="h-full rounded-full bg-orb-green transition-[width] duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>

          <p className="mt-2.5 text-[13px] text-orb-muted">
            {goal.doneCount}/{goal.taskCount} tasks · {pct}%
            {goal.blockedCount > 0 && goal.status === "active" ? (
              <span className="sm:hidden"> · {goal.blockedCount} blocked</span>
            ) : null}
            {goal.targetDate ? <span className="ml-3">{formatDate(goal.targetDate)}</span> : null}
          </p>
        </button>

        {/* Right column: big percentage, fraction, then actions
            (reference: buttons sit under the fraction; deleting swaps them
            for the inline confirmation) */}
        <div className="flex shrink-0 flex-col items-end pt-4">
          <span className="text-[30px] font-normal leading-none text-orb-heading">{pct}%</span>
          <span className="mt-1.5 text-[13px] text-orb-muted">
            {goal.doneCount}/{goal.taskCount}
          </span>
          {confirming ? (
            <div className="mt-2.5 flex items-center gap-2" role="group" aria-label={`Confirm delete ${goal.title}`}>
              <button
                type="button"
                onClick={() => void confirmDelete()}
                disabled={deleting}
                className="h-8 rounded-full bg-orb-coral-deep px-4 text-[12.5px] font-semibold text-white transition-colors hover:bg-orb-coral-deep/90 disabled:opacity-50"
              >
                {deleting ? "…" : "Delete"}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={deleting}
                className="h-8 px-1 text-[12.5px] font-medium text-orb-muted transition-colors hover:text-orb-heading disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="mt-2.5 flex items-center gap-1">
              <button
                type="button"
                onClick={() => onEdit(goal)}
                className="orb-well flex h-9 w-9 items-center justify-center rounded-xl text-orb-muted transition-colors hover:text-orb-heading"
                aria-label={`Edit goal ${goal.title}`}
              >
                <Pencil size={15} />
              </button>
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="orb-well flex h-9 w-9 items-center justify-center rounded-xl text-orb-muted transition-colors hover:text-orb-coral-deep"
                aria-label={`Delete goal ${goal.title}`}
              >
                <Trash2 size={15} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function GoalsView() {
  const goals = useOrbital((s) => s.goals);
  const deleteGoal = useOrbital((s) => s.deleteGoal);
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
    <div className="w-full">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-normal tracking-tight text-orb-heading">Goals</h1>
          <p className="mt-1 text-[14px] text-orb-muted">Manage your team objectives</p>
        </div>
        <button type="button" className="orb-pill-outline" onClick={() => setNewGoalOpen(true)}>
          <Plus size={14} aria-hidden="true" />
          New Goal
        </button>
      </header>

      <div className="mt-6 flex flex-wrap items-center gap-2" role="group" aria-label="Filter goals by status">
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
                "h-8 rounded-full px-4 text-[12px] font-medium transition-colors",
                active
                  ? "orb-well-pill font-semibold text-orb-heading"
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
            icon={<Plus size={22} />}
            title={filter === "all" ? "No goals yet" : `No ${FILTERS.find((f) => f.id === filter)?.label.toLowerCase()} goals`}
            description="Create your first goal and the AI assistant will draft a task plan for it."
            action={
              <button type="button" className="orb-pill-outline" onClick={() => setNewGoalOpen(true)}>
                <Plus size={14} /> New Goal
              </button>
            }
          />
        ) : (
          visible.map((goal) => (
            <GoalCard key={goal.id} goal={goal} onEdit={setEditingGoal} onDelete={(g) => deleteGoal(g.id)} />
          ))
        )}
      </div>

      <NewGoalDialog open={newGoalOpen} onOpenChange={setNewGoalOpen} />
      {editingGoal ? <GoalEditDialog goal={editingGoal} onClose={() => setEditingGoal(null)} /> : null}
    </div>
  );
}
