// Dashboard's NEXT PLANNED ACTION line: when a task is blocked, surface it as
// "Resolve blocker on "<task title>""; otherwise nudge for check-ins. Pure seam
// so the derivation is unit-tested.
//
// v2.5: the input is the TASK list (plus the goals' display order), not the
// activity feed — the re-deployed live's regenerated workspace carries NO
// status-update rows, yet its NPA still reads `Resolve blocker on "Review Q3
// project milestones"` (the first blocked task in display order). The v1.3
// activity-based derivation (which read blocked check-ins off the feed)
// matched that app only because the old reference data happened to log a
// blocked check-in as the newest status update.

export interface NextActionTask {
  title: string;
  status: string;
  goalId: string;
  sortOrder: number;
}

export interface NextActionGoal {
  id: string;
  sortOrder: number;
}

export const NEXT_ACTION_FALLBACK = "Ping the team for a status check-in on active goals.";

export function nextPlannedAction(tasks: NextActionTask[], goals: NextActionGoal[]): string {
  // Display order: the goal list's order, then each goal's task order. The
  // /api/tasks response orders by task sortOrder GLOBALLY (interleaving
  // goals), so the seam re-sorts against the goals list. Tasks whose goal
  // is missing sort last (defensive — the UI never renders orphans).
  const goalRank = new Map(goals.map((g, index) => [g.id, index]));
  const blocked = tasks
    .filter((t) => t.status === "blocked")
    .sort((a, b) => {
      const ga = goalRank.get(a.goalId) ?? Number.MAX_SAFE_INTEGER;
      const gb = goalRank.get(b.goalId) ?? Number.MAX_SAFE_INTEGER;
      if (ga !== gb) return ga - gb;
      return a.sortOrder - b.sortOrder;
    })[0];
  if (blocked) return `Resolve blocker on "${blocked.title}"`;
  return NEXT_ACTION_FALLBACK;
}
