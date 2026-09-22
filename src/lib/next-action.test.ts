import { describe, expect, it } from "vitest";
import { nextPlannedAction, NEXT_ACTION_FALLBACK } from "@/lib/next-action";
import type { TaskDTO } from "@/lib/orbital";

// v2.5: the live derives the dashboard's NEXT PLANNED ACTION from the
// BLOCKED TASKS, not from status-update activity rows — its regenerated
// workspace has NO status updates in the feed, yet the NPA still reads
// `Resolve blocker on "Review Q3 project milestones"` (the first blocked
// task in display order: goal order, then task order). The v1.3-era
// activity-based derivation (and its name-prefix regression test) is
// retired with the old seed data.

function task(
  overrides: Partial<TaskDTO> & { goalId: string; title: string; sortOrder: number },
): TaskDTO {
  return {
    id: `t-${overrides.title}`,
    goalTitle: "Some goal",
    description: null,
    status: "pending",
    deadline: null,
    assignee: null,
    estimatedHours: null,
    createdByAi: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    updates: [],
    ...overrides,
  } as TaskDTO;
}

function goalOrder(...ids: string[]): { id: string; sortOrder: number }[] {
  return ids.map((id, i) => ({ id, sortOrder: i + 1 }));
}

describe("nextPlannedAction (v2.5 task-based derivation)", () => {
  it("surfaces the first blocked task in display order", () => {
    const tasks = [
      task({ goalId: "g1", title: "Review Q3 project milestones", status: "blocked", sortOrder: 1 }),
      task({ goalId: "g1", title: "Audit current onboarding drop-off points", status: "blocked", sortOrder: 12 }),
      task({ goalId: "g1", title: "User research interviews", status: "done", sortOrder: 2 }),
    ];
    expect(nextPlannedAction(tasks, goalOrder("g1"))).toBe('Resolve blocker on "Review Q3 project milestones"');
  });

  it("orders by GOAL order first — an earlier goal's blocked task wins over a later goal's", () => {
    const tasks = [
      // The API orders by task sortOrder globally, so a later goal's task 1
      // arrives BEFORE an earlier goal's task 12 — the seam must re-sort.
      task({ goalId: "g2", title: "Blog posts", status: "blocked", sortOrder: 1 }),
      task({ goalId: "g1", title: "Audit current onboarding drop-off points", status: "blocked", sortOrder: 12 }),
    ];
    expect(nextPlannedAction(tasks, goalOrder("g1", "g2"))).toBe(
      'Resolve blocker on "Audit current onboarding drop-off points"',
    );
  });

  it("ignores non-blocked tasks", () => {
    const tasks = [
      task({ goalId: "g1", title: "In progress thing", status: "in_progress", sortOrder: 1 }),
      task({ goalId: "g1", title: "Pending thing", status: "pending", sortOrder: 2 }),
      task({ goalId: "g1", title: "Need help thing", status: "need_help", sortOrder: 3 }),
      task({ goalId: "g1", title: "Done thing", status: "done", sortOrder: 4 }),
    ];
    expect(nextPlannedAction(tasks, goalOrder("g1"))).toBe(NEXT_ACTION_FALLBACK);
  });

  it("falls back when no tasks exist", () => {
    expect(nextPlannedAction([], [])).toBe(NEXT_ACTION_FALLBACK);
  });

  it("falls back when no task is blocked", () => {
    const tasks = [task({ goalId: "g1", title: "Only a done task", status: "done", sortOrder: 1 })];
    expect(nextPlannedAction(tasks, goalOrder("g1"))).toBe(NEXT_ACTION_FALLBACK);
  });

  it("handles tasks whose goal is missing from the goals list (unknown goals sort last)", () => {
    const tasks = [
      task({ goalId: "ghost", title: "Ghost blocked task", status: "blocked", sortOrder: 1 }),
      task({ goalId: "g1", title: "Known blocked task", status: "blocked", sortOrder: 5 }),
    ];
    expect(nextPlannedAction(tasks, goalOrder("g1"))).toBe('Resolve blocker on "Known blocked task"');
  });
});
