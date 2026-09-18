import { describe, expect, it } from "vitest";

import { activityIconFor } from "./activity-icons";

// The live app maps activity types to icon glyphs + circle tones (measured
// 2026-09-18 on the live feed): task_assigned rows render a square-check
// glyph in the light-purple circle, tasks_generated rows the same glyph in
// green, goal_analyzed rows a target glyph in purple. The feed hero always
// renders the search glyph, so it is not part of this seam.
describe("activityIconFor", () => {
  it("maps task_assigned to the square-check glyph in the purple tone", () => {
    expect(activityIconFor("task_assigned")).toEqual({ icon: "square-check-big", tone: "purple" });
  });

  it("maps tasks_generated to the square-check glyph in the green tone", () => {
    expect(activityIconFor("tasks_generated")).toEqual({ icon: "square-check-big", tone: "green" });
  });

  it("maps goal_analyzed to the target glyph in the purple tone", () => {
    expect(activityIconFor("goal_analyzed")).toEqual({ icon: "target", tone: "purple" });
  });

  it("falls back to the square-check purple pair for unknown types", () => {
    expect(activityIconFor("status_update")).toEqual({ icon: "square-check-big", tone: "purple" });
    expect(activityIconFor("member_invited")).toEqual({ icon: "square-check-big", tone: "purple" });
    expect(activityIconFor("")).toEqual({ icon: "square-check-big", tone: "purple" });
  });
});
