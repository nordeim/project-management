// Activity icon mapping (measured on the live app, 2026-09-18): the icon
// circle's glyph and tone derive from the ActivityLog type. task_assigned
// rows render the square-check glyph in light purple, tasks_generated the
// same glyph in green, goal_analyzed a target glyph in purple. Every other
// type (status updates, invites, settings changes) falls back to the
// square-check/purple pair, and the feed hero renders a fixed search glyph
// that is styled at the call site rather than through this seam.

export type ActivityGlyph = "square-check-big" | "target";
export type ActivityTone = "purple" | "green";

export interface ActivityIconSpec {
  icon: ActivityGlyph;
  tone: ActivityTone;
}

export function activityIconFor(type: string): ActivityIconSpec {
  switch (type) {
    case "tasks_generated":
      return { icon: "square-check-big", tone: "green" };
    case "goal_analyzed":
      return { icon: "target", tone: "purple" };
    default:
      return { icon: "square-check-big", tone: "purple" };
  }
}
