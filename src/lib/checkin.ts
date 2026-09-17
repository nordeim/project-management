// Check-in semantics: how a posted TaskUpdate status (on_track | blocked |
// need_help | done) syncs the task's live workflow status. Pure so it can
// be pinned by unit tests — the route handler stays a thin DB wrapper.
//
// Rules (PAD §4.2):
//   - done / blocked / need_help map identity onto the task.
//   - on_track keeps the current status (a check-in is not work starting,
//     so `pending` stays `pending`) and only un-blocks: blocked /
//     need_help return to in_progress.

export type CheckinStatus = "on_track" | "blocked" | "need_help" | "done";
export type TaskWorkflowStatus = "pending" | "in_progress" | "blocked" | "need_help" | "done";

export function mapCheckinToTaskStatus(
  checkin: CheckinStatus,
  current: TaskWorkflowStatus,
): TaskWorkflowStatus {
  if (checkin === "done") return "done";
  if (checkin === "blocked") return "blocked";
  if (checkin === "need_help") return "need_help";
  // on_track
  if (current === "blocked" || current === "need_help") return "in_progress";
  return current;
}
