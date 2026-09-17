import { describe, expect, it } from "vitest";
import { nextPlannedAction } from "@/lib/next-action";
import type { ActivityDTO } from "@/lib/orbital";

// v1.3 WS-1: the dashboard's NEXT PLANNED ACTION used String.replace with a
// capture group, which left the person prefix in place —
// `Resolve blocker on "Shelly GenosarReview Q3 project milestones"`.
// The seam must extract ONLY the task title.

function entry(overrides: Partial<ActivityDTO>): ActivityDTO {
  return {
    id: "a1",
    type: "status_update",
    message: "",
    detail: null,
    createdAt: new Date().toISOString(),
    taskId: null,
    goalId: null,
    ...overrides,
  } as ActivityDTO;
}

describe("nextPlannedAction", () => {
  it("extracts only the task title from a blocked check-in (no person prefix)", () => {
    const activity = [
      entry({
        message: 'Shelly Genosar checked in on "Review Q3 project milestones"',
        detail: "Shelly Genosar posted a status update: Blocked.",
      }),
    ];
    expect(nextPlannedAction(activity)).toBe('Resolve blocker on "Review Q3 project milestones"');
  });

  it("uses the first blocked status update in feed order", () => {
    const activity = [
      entry({
        message: 'Ran Ezra checked in on "Audit current onboarding drop-off points"',
        detail: "Ran Ezra posted a status update: Blocked.",
      }),
      entry({
        message: 'Shelly Genosar checked in on "Review Q3 project milestones"',
        detail: "Shelly Genosar posted a status update: Blocked.",
      }),
    ];
    expect(nextPlannedAction(activity)).toBe(
      'Resolve blocker on "Audit current onboarding drop-off points"',
    );
  });

  it("ignores status updates that are not blocked", () => {
    const activity = [
      entry({
        message: 'Demo User checked in on "Ship the release"',
        detail: "Demo User posted a status update: On track.",
      }),
    ];
    expect(nextPlannedAction(activity)).toBe(
      "Ping the team for a status check-in on active goals.",
    );
  });

  it("ignores non-status-update entries even with Blocked in the detail", () => {
    const activity = [
      entry({ type: "task_created", message: 'Blocked-path task added', detail: "mentions Blocked" }),
    ];
    expect(nextPlannedAction(activity)).toBe(
      "Ping the team for a status check-in on active goals.",
    );
  });

  it("falls back when the blocked message does not match the check-in pattern", () => {
    const activity = [
      entry({ message: "Something else entirely", detail: "posted a status update: Blocked." }),
    ];
    expect(nextPlannedAction(activity)).toBe(
      "Ping the team for a status check-in on active goals.",
    );
  });

  it("falls back on an empty feed", () => {
    expect(nextPlannedAction([])).toBe(
      "Ping the team for a status check-in on active goals.",
    );
  });
});
