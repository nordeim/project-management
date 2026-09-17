// Dashboard's NEXT PLANNED ACTION line: when a task is blocked, surface it as
// "Resolve blocker on "<task title>""; otherwise nudge for check-ins. Pure seam
// so the derivation (and the v1.3 name-prefix regression it fixed) is unit-tested.

export interface NextActionEntry {
  type: string;
  message: string;
  detail?: string | null;
}

export const NEXT_ACTION_FALLBACK = "Ping the team for a status check-in on active goals.";

export function nextPlannedAction(activity: NextActionEntry[]): string {
  const blocked = activity.find((a) => a.type === "status_update" && a.detail?.includes("Blocked"));
  // Extract ONLY the quoted task title. (A String.replace with the capture
  // group leaves the person prefix in place — the v1.3 bug.)
  const match = blocked?.message.match(/checked in on "(.+?)"/);
  if (match?.[1]) return `Resolve blocker on "${match[1]}"`;
  return NEXT_ACTION_FALLBACK;
}
