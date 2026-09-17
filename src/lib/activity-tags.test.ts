// Activity type-tag seam (v1.7, measured on the live app): every non-hero
// activity row ends with a small uppercase tag derived from the entry's
// type — the ActivityLog type with underscores replaced by spaces
// ("task_assigned" → "task assigned", "tasks_generated" → "tasks generated",
// "goal_analyzed" → "goal analyzed"). The view renders it uppercase via CSS.

import { describe, expect, it } from "vitest";
import { activityTypeTag } from "./activity-tags";

describe("activityTypeTag (feed row tag)", () => {
  it("maps the seeded activity types to their live tag strings", () => {
    expect(activityTypeTag("task_assigned")).toBe("task assigned");
    expect(activityTypeTag("tasks_generated")).toBe("tasks generated");
    expect(activityTypeTag("goal_analyzed")).toBe("goal analyzed");
    expect(activityTypeTag("status_update")).toBe("status update");
    expect(activityTypeTag("goal_created")).toBe("goal created");
  });

  it("replaces every underscore, not just the first", () => {
    expect(activityTypeTag("a_b_c")).toBe("a b c");
  });

  it("passes unknown types through with the same underscore rule", () => {
    expect(activityTypeTag("goal_completed")).toBe("goal completed");
    expect(activityTypeTag("member_invited")).toBe("member invited");
    expect(activityTypeTag("custom")).toBe("custom");
  });

  it("keeps single-word types unchanged", () => {
    expect(activityTypeTag("deployed")).toBe("deployed");
  });
});
