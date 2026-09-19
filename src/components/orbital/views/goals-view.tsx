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
    // Reference (v1.6, measured): deeper-tier card (radius 16) with NO outer
    // padding — the content splits into a left column (p 18px 20px) and a
    // 120px right column (p 18px 16px) holding the 42px percentage.
    <div className="orb-goal-card flex w-full items-stretch text-left transition-transform hover:-translate-y-0.5">
      <button
        type="button"
        onClick={() => navigate("goal-detail", goal.id)}
        className="min-w-0 flex-1 p-[18px_20px] text-left"
        aria-label={`Open goal ${goal.title}, ${goal.doneCount} of ${goal.taskCount} tasks done, ${pct}% complete`}
      >
        {/* Status chip (reference, v1.5; inset pair re-measured v1.7):
            inset well pill — gray label, a light-purple pip for EVERY
            status, an inline red blocked count, and a trailing chevron.
            v1.7: pip 7px, softer inset pair (-2px/-2px/5px 0.8/0.24). */}
        <div className="mb-[12px]">
          <span className="inline-flex items-center gap-[5px] rounded-full bg-orb-well px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-orb-muted shadow-[inset_-2px_-2px_5px_rgba(255,250,244,0.8),inset_2px_2px_5px_rgba(160,143,126,0.24)]">
            <span className="h-[7px] w-[7px] rounded-full bg-[#C9B3F5]" aria-hidden="true" />
            {meta.label}
            {goal.blockedCount > 0 && goal.status === "active" ? (
              <span className="font-medium text-orb-coral-deep">· {goal.blockedCount} blocked</span>
            ) : null}
            <span className="text-[11px] text-[#767676]" aria-hidden="true">
              ›
            </span>
          </span>
        </div>
        <p className="mb-3.5 truncate text-[20px] font-medium leading-[1.2] text-orb-heading">{goal.title}</p>

        {/* Horizontal progress bar on the inset track (reference pattern;
            track reads as pressed-in — 6px with the standard inset pair) */}
        <div
          className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-orb-track shadow-[inset_-3px_-3px_6px_rgba(255,250,244,0.68),inset_3px_3px_6px_rgba(160,143,126,0.24)]"
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

        {/* Meta (reference, v1.5): task fraction on line 1, date on line 2. */}
        <p className="mb-1 text-[12px] text-orb-muted">
          {goal.doneCount}/{goal.taskCount} tasks · {pct}%
          {goal.blockedCount > 0 && goal.status === "active" ? (
            <span className="sm:hidden"> · {goal.blockedCount} blocked</span>
          ) : null}
        </p>
        {goal.targetDate ? <p className="text-[12px] text-[#767676]">{formatDate(goal.targetDate)}</p> : null}
      </button>

      {/* Right column (reference, v1.6/v1.7): a fixed 120px stats strip —
          the big 42px percentage over the 12px task fraction with the
          edit/delete actions (flat gray squares) beneath; v1.7: content
          vertically CENTERED as a group (8px gaps, centered fraction). */}
      <div className="flex w-[120px] shrink-0 flex-col items-center justify-center gap-2 p-[18px_16px]">
        <span className="text-[42px] font-medium leading-none tracking-[-0.02em] text-orb-heading">{pct}%</span>
        <span className="text-[12px] text-orb-muted">
          {goal.doneCount}/{goal.taskCount}
        </span>
        {confirming ? (
          <div className="flex items-center gap-2" role="group" aria-label={`Confirm delete ${goal.title}`}>
            <button
              type="button"
              onClick={() => void confirmDelete()}
              disabled={deleting}
              className="h-7 rounded-full bg-orb-coral-deep px-3 text-[12px] font-semibold text-white transition-colors hover:bg-orb-coral-deep/90 disabled:opacity-50"
            >
              {deleting ? "…" : "Delete"}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={deleting}
              className="h-7 px-1 text-[12px] font-medium text-orb-muted transition-colors hover:text-orb-heading disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(goal)}
              className="flex h-[23px] items-center rounded-[8px] px-2 text-[#B3B3B3] transition-colors hover:text-orb-heading"
              aria-label={`Edit goal ${goal.title}`}
            >
              <Pencil size={13} strokeWidth={1.8} />
            </button>
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="flex h-[23px] items-center rounded-[8px] px-2 text-[#B3B3B3] transition-colors hover:text-orb-coral-deep"
              aria-label={`Delete goal ${goal.title}`}
            >
              <Trash2 size={13} strokeWidth={1.8} />
            </button>
          </div>
        )}
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
          <h1 className="text-[28px] font-normal leading-[1.2] tracking-[-0.01em] text-orb-heading">Goals</h1>
          <p className="mt-1 text-[14px] text-orb-muted">Manage your team objectives</p>
        </div>
        {/* v1.7 (measured): on mobile the label shortens to "New" and the
            pill drops to 35px (40px on desktop). */}
        <button
          type="button"
          className="orb-pill-outline orb-pill-outline-sm"
          onClick={() => setNewGoalOpen(true)}
        >
          <Plus size={14} aria-hidden="true" />
          <span className="hidden sm:inline">New Goal</span>
          <span className="sm:hidden">New</span>
        </button>
      </header>

      <div className="mt-[22px] flex flex-wrap items-center gap-2" role="group" aria-label="Filter goals by status">
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

      {/* v2.0 (measured): the live's chip wrapper (invisible pad-2 box) ends
          at 163 and the first card starts at 187 — a 24px gap. */}
      <div className="mt-[24px] space-y-3">
        {visible.length === 0 ? (
          <EmptyState
            icon={<Plus size={22} color="#B3B3B3" />}
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
