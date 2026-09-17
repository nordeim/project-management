// Activity type-tag seam (v1.7, measured on the live app): the feed rows end
// with a small uppercase tag derived from the ActivityLog type — underscores
// become spaces. Pure function — unit-tested in activity-tags.test.ts.

/** "task_assigned" → "task assigned" (rendered uppercase by the view). */
export function activityTypeTag(type: string): string {
  return type.replaceAll("_", " ");
}
