// Pure calendar math for the wizard's date picker (v1.4). Kept free of
// React/DOM concerns so the grid invariants — always 6 weeks, Sunday-first,
// adjacent-month fill labeled with true year/month — are unit-testable.

export interface CalendarCell {
  year: number;
  /** 0-indexed month (Date convention). */
  month: number;
  day: number;
  /** True when the cell belongs to the grid's own month. */
  inMonth: boolean;
}

/** Build a 6x7 Sunday-first grid covering `year`/`month` (0-indexed). */
export function monthGrid(year: number, month: number): CalendarCell[][] {
  // First day of the month; walk back to the Sunday that starts the week.
  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());

  const weeks: CalendarCell[][] = [];
  const cursor = new Date(start);
  for (let week = 0; week < 6; week++) {
    const row: CalendarCell[] = [];
    for (let day = 0; day < 7; day++) {
      row.push({
        year: cursor.getFullYear(),
        month: cursor.getMonth(),
        day: cursor.getDate(),
        inMonth: cursor.getMonth() === month,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(row);
  }
  return weeks;
}

/** Calendar-day equality for a cell vs a cell or a Date. */
export function isSameDay(
  a: CalendarCell | Date,
  b: CalendarCell | Date,
): boolean {
  const aY = a instanceof Date ? a.getFullYear() : a.year;
  const aM = a instanceof Date ? a.getMonth() : a.month;
  const aD = a instanceof Date ? a.getDate() : a.day;
  const bY = b instanceof Date ? b.getFullYear() : b.year;
  const bM = b instanceof Date ? b.getMonth() : b.month;
  const bD = b instanceof Date ? b.getDate() : b.day;
  return aY === bY && aM === bM && aD === bD;
}

/** English ordinal suffix for a day of the month (1st, 2nd, 3rd, 11th…). */
function dayOrdinal(day: number): string {
  if (day % 100 >= 11 && day % 100 <= 13) return "th";
  if (day % 10 === 1) return "st";
  if (day % 10 === 2) return "nd";
  if (day % 10 === 3) return "rd";
  return "th";
}

/**
 * Long date format used by the wizard's date-picker trigger
 * (measured from the reference: "September 20th, 2026" — full month,
 * ordinal day, comma year).
 */
export function formatLongDate(date: Date): string {
  const month = date.toLocaleDateString("en-US", { month: "long" });
  return `${month} ${date.getDate()}${dayOrdinal(date.getDate())}, ${date.getFullYear()}`;
}
