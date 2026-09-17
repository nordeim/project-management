import { describe, expect, it } from "vitest";
import { mapCheckinToTaskStatus } from "./checkin";
import { sanitizeTasks, templatePlan } from "./plan-sanitizer";

// The check-in mapping is the core workflow rule of the app: posting a
// TaskUpdate syncs the task's live status. These tests pin the exact
// semantics documented in the PAD (§4.2).

describe("mapCheckinToTaskStatus", () => {
  it("maps done, blocked and need_help identity onto the task status", () => {
    expect(mapCheckinToTaskStatus("done", "in_progress")).toBe("done");
    expect(mapCheckinToTaskStatus("blocked", "pending")).toBe("blocked");
    expect(mapCheckinToTaskStatus("need_help", "done")).toBe("need_help");
  });

  it("keeps a pending task pending on an on_track check-in", () => {
    expect(mapCheckinToTaskStatus("on_track", "pending")).toBe("pending");
  });

  it("keeps an in-progress task in progress on an on_track check-in", () => {
    expect(mapCheckinToTaskStatus("on_track", "in_progress")).toBe("in_progress");
  });

  it("unblocks blocked and need_help tasks back to in_progress on on_track", () => {
    expect(mapCheckinToTaskStatus("on_track", "blocked")).toBe("in_progress");
    expect(mapCheckinToTaskStatus("on_track", "need_help")).toBe("in_progress");
  });

  it("leaves a done task done on on_track (no regression to in_progress)", () => {
    expect(mapCheckinToTaskStatus("on_track", "done")).toBe("done");
  });
});

describe("sanitizeTasks (LLM output bounds)", () => {
  it("keeps a clean generated plan", () => {
    const raw = [{ title: "Draft the plan", description: "Write it.", estimatedHours: 3 }];
    expect(sanitizeTasks(raw)).toEqual(raw);
  });

  it("drops entries without a usable title", () => {
    const raw = [{ title: "   " }, { description: "no title" }, 42, null, { title: "Real" }];
    expect(sanitizeTasks(raw)).toEqual([{ title: "Real" }]);
  });

  it("caps the plan at 10 tasks", () => {
    const raw = Array.from({ length: 25 }, (_, i) => ({ title: `Task ${i}` }));
    expect(sanitizeTasks(raw)).toHaveLength(10);
  });

  it("clamps titles to 160 chars and descriptions to 500", () => {
    const out = sanitizeTasks([
      { title: "T".repeat(900), description: "D".repeat(900) },
    ])!;
    expect(out[0]!.title.length).toBe(160);
    expect(out[0]!.description!.length).toBe(500);
  });

  it("clamps estimated hours into 1..40 and rounds", () => {
    const out = sanitizeTasks([
      { title: "A", estimatedHours: 9999 },
      { title: "B", estimatedHours: 0.4 },
      { title: "C", estimatedHours: 2.6 },
      { title: "D", estimatedHours: "not a number" },
    ])!;
    expect(out[0]!.estimatedHours).toBe(40);
    expect(out[1]!.estimatedHours).toBe(1);
    expect(out[2]!.estimatedHours).toBe(3);
    expect(out[3]!.estimatedHours).toBeUndefined();
  });

  it("returns [] for non-array input", () => {
    expect(sanitizeTasks("nope")).toEqual([]);
    expect(sanitizeTasks(null)).toEqual([]);
  });
});

describe("templatePlan (deterministic fallback)", () => {
  it("always returns exactly 8 fully-formed tasks", () => {
    const plan = templatePlan("Launch new landing page");
    expect(plan).toHaveLength(8);
    for (const t of plan) {
      expect(t.title.trim().length).toBeGreaterThan(0);
      expect(t.description!.length).toBeGreaterThan(0);
      expect(t.estimatedHours).toBeGreaterThanOrEqual(1);
      expect(t.estimatedHours).toBeLessThanOrEqual(40);
    }
  });

  it("references the goal title in the first task", () => {
    expect(templatePlan("Launch new landing page")[0]!.title).toContain("Launch new landing page");
  });
});
