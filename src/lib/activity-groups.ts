// Activity feed date grouping (v1.6): the reference's full Activity view
// renders the most recent entry as a standalone hero card, then groups the
// remaining entries under long-form date labels ("Thu Jul 16 2026", shown
// uppercase via CSS). Pure functions — unit-tested in
// activity-groups.test.ts.

import type { ActivityDTO } from "./orbital";

export interface ActivityDayGroup {
  /** Sortable local date key, "YYYY-MM-DD" — groups are newest-first. */
  key: string;
  /** Display label; today's group renders as "Today". */
  label: string;
  entries: ActivityDTO[];
}

function localDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** "Thu Jul 16 2026" — the reference's long weekday-day format. */
function longDayLabel(date: Date): string {
  const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const day = date.getDate();
  const year = date.getFullYear();
  return `${weekday} ${month} ${day} ${year}`;
}

/**
 * Groups entries by LOCAL calendar day, newest day first, preserving feed
 * order within each day (the API already returns newest-first).
 */
export function groupActivityByDate(entries: ActivityDTO[]): ActivityDayGroup[] {
  const byKey = new Map<string, { date: Date; entries: ActivityDTO[] }>();
  const todayKey = localDateKey(new Date());

  for (const entry of entries) {
    const date = new Date(entry.createdAt);
    const key = localDateKey(date);
    const bucket = byKey.get(key) ?? { date, entries: [] };
    bucket.entries.push(entry);
    byKey.set(key, bucket);
  }

  return [...byKey.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : a[0] > b[0] ? -1 : 0))
    .map(([key, bucket]) => ({
      key,
      label: key === todayKey ? "Today" : longDayLabel(bucket.date),
      entries: bucket.entries,
    }));
}
