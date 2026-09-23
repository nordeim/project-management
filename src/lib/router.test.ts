import { describe, expect, it } from "vitest";
import { parseUrl, toPath, type ViewId } from "./router";

// The path router mirrors the reference app's URL contract:
//   /            -> dashboard
//   /goals       -> goals
//   /goals/<id>  -> goal-detail (goalId)
//   /my-tasks    -> my-tasks
//   /tasks       -> tasks (v2.7: the live's all-tasks view)
//   /activity    -> activity
//   /team        -> team
//   /settings    -> settings
// Legacy ?view=... links (pre-path-routing deep links) still resolve.

describe("parseUrl", () => {
  it("maps / to the dashboard", () => {
    expect(parseUrl("/")).toEqual({ view: "dashboard", goalId: null });
  });

  it("maps the bare section paths to their views", () => {
    expect(parseUrl("/goals")).toEqual({ view: "goals", goalId: null });
    expect(parseUrl("/my-tasks")).toEqual({ view: "my-tasks", goalId: null });
    expect(parseUrl("/tasks")).toEqual({ view: "tasks", goalId: null });
    expect(parseUrl("/activity")).toEqual({ view: "activity", goalId: null });
    expect(parseUrl("/team")).toEqual({ view: "team", goalId: null });
    expect(parseUrl("/settings")).toEqual({ view: "settings", goalId: null });
  });

  it("maps /goals/<id> to the goal detail with the id", () => {
    expect(parseUrl("/goals/6a46460a0b8b1f4fd1a3f60a")).toEqual({
      view: "goal-detail",
      goalId: "6a46460a0b8b1f4fd1a3f60a",
    });
  });

  it("falls back to the goals list when /goals/<id> has no id segment", () => {
    expect(parseUrl("/goals/")).toEqual({ view: "goals", goalId: null });
  });

  it("falls back to the dashboard for unknown paths", () => {
    expect(parseUrl("/not-a-view")).toEqual({ view: "dashboard", goalId: null });
    expect(parseUrl("/goals/abc/extra")).toEqual({ view: "dashboard", goalId: null });
  });

  it("still honors legacy ?view= query links for backward compatibility", () => {
    expect(parseUrl("/?view=goals")).toEqual({ view: "goals", goalId: null });
    expect(parseUrl("/?view=goal-detail&goal=abc123")).toEqual({
      view: "goal-detail",
      goalId: "abc123",
    });
  });

  it("treats a legacy goal-detail link without a goal id as the goals list", () => {
    expect(parseUrl("/?view=goal-detail")).toEqual({ view: "goals", goalId: null });
  });

  it("ignores a legacy query view when the path already carries the view", () => {
    expect(parseUrl("/team?view=goals")).toEqual({ view: "team", goalId: null });
  });

  it("rejects unknown legacy query views", () => {
    expect(parseUrl("/?view=nonsense")).toEqual({ view: "dashboard", goalId: null });
  });
});

describe("toPath", () => {
  const cases: Array<[ViewId, string | null | undefined, string]> = [
    ["dashboard", null, "/"],
    ["dashboard", "irrelevant", "/"],
    ["goals", null, "/goals"],
    ["goal-detail", "abc123", "/goals/abc123"],
    ["my-tasks", null, "/my-tasks"],
    ["tasks", null, "/tasks"],
    ["activity", null, "/activity"],
    ["team", null, "/team"],
    ["settings", null, "/settings"],
  ];

  it.each(cases)("toPath(%s, %s) -> %s", (view, goalId, expected) => {
    expect(toPath(view, goalId)).toBe(expected);
  });

  it("round-trips every view through parseUrl", () => {
    const views: ViewId[] = ["dashboard", "goals", "goal-detail", "my-tasks", "tasks", "activity", "team", "settings"];
    for (const view of views) {
      const goalId = view === "goal-detail" ? "rt-42" : null;
      expect(parseUrl(toPath(view, goalId))).toEqual({ view, goalId });
    }
  });
});
