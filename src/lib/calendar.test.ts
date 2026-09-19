import { describe, expect, it } from "vitest";
import { formatLongDate, isSameDay, monthGrid, type CalendarCell } from "./calendar";

describe("monthGrid", () => {
  it("renders only the weeks a month needs (v2.0, live-measured)", () => {
    // Sep 2026: starts Tuesday (offset 2) + 30 days = 32 => 5 weeks.
    const sept = monthGrid(2026, 8);
    expect(sept.length).toBe(5);
    expect(sept.flat()).toHaveLength(35);
    // Aug 2026: starts Saturday (offset 6) + 31 days = 37 => 6 weeks.
    const aug = monthGrid(2026, 7);
    expect(aug.length).toBe(6);
    expect(aug.flat()).toHaveLength(42);
    // Jan 2027: starts Friday (offset 5) + 31 = 36 => 6 weeks.
    expect(monthGrid(2027, 0).length).toBe(6);
    // Feb 2024 (leap): starts Thursday (offset 3) + 29 = 32 => 5 weeks.
    expect(monthGrid(2024, 1).length).toBe(5);
    // Every week is 7 cells.
    for (let month = 0; month < 12; month++) {
      for (const week of monthGrid(2026, month)) {
        expect(week.length).toBe(7);
      }
    }
  });

  it("starts on Sunday and ends on Saturday, filling adjacent months", () => {
    // September 2026 starts on a Tuesday => 30, 31 (Aug) lead the first week.
    const sept = monthGrid(2026, 8);
    expect(sept[0][0].day).toBe(30);
    expect(sept[0][0].inMonth).toBe(false);
    expect(sept[0][2].day).toBe(1);
    expect(sept[0][2].inMonth).toBe(true);
    // Last cell is a Saturday somewhere in October.
    const last = sept[sept.length - 1][6];
    expect(last.inMonth).toBe(false);
    expect(last.day).toBe(3);
  });

  it("maps February in leap years correctly", () => {
    // February 2028: the 29th exists; grid covers Jan 31 → Mar 4 (6 weeks).
    const feb = monthGrid(2028, 1);
    const flat = feb.flat();
    const febDays = flat.filter((c) => c.inMonth).map((c) => c.day);
    expect(febDays).toHaveLength(29);
    expect(febDays[febDays.length - 1]).toBe(29);
    // 2028-02-01 is a Tuesday; leading cells are Jan 30, 31.
    expect(feb[0][0].day).toBe(30);
    expect(feb[0][0].inMonth).toBe(false);
  });

  it("handles non-leap February", () => {
    const feb = monthGrid(2027, 1);
    expect(feb.flat().filter((c) => c.inMonth)).toHaveLength(28);
  });

  it("keeps weeks continuous (each day is previous + 1)", () => {
    const grid = monthGrid(2026, 10); // November 2026
    const flat = grid.flat();
    for (let i = 1; i < flat.length; i++) {
      const prev = flat[i - 1];
      const cur = flat[i];
      const prevDate = new Date(prev.year, prev.month, prev.day).getTime();
      const curDate = new Date(cur.year, cur.month, cur.day).getTime();
      expect(curDate - prevDate).toBe(86_400_000);
    }
  });

  it("labels every cell with its true year and month", () => {
    // January 2027 grid must include December 2026 cells labeled correctly.
    const jan = monthGrid(2027, 0);
    const first = jan[0][0];
    expect(first.month).toBe(11);
    expect(first.year).toBe(2026);
    const inMonth = jan.flat().filter((c) => c.inMonth);
    expect(inMonth.every((c) => c.month === 0 && c.year === 2027)).toBe(true);
  });
});

describe("isSameDay", () => {
  it("matches the same calendar day regardless of time", () => {
    const a = new Date(2026, 8, 17, 9, 30);
    const b = new Date(2026, 8, 17, 23, 59);
    expect(isSameDay(a, b)).toBe(true);
  });

  it("rejects different days", () => {
    const a: CalendarCell = { year: 2026, month: 8, day: 17, inMonth: true };
    const b: CalendarCell = { year: 2026, month: 8, day: 18, inMonth: true };
    expect(isSameDay(a, b)).toBe(false);
  });

  it("compares cells with dates", () => {
    const cell: CalendarCell = { year: 2026, month: 8, day: 17, inMonth: true };
    expect(isSameDay(cell, new Date(2026, 8, 17, 12, 0))).toBe(true);
    expect(isSameDay(cell, new Date(2026, 8, 18, 12, 0))).toBe(false);
  });
});

describe("formatLongDate", () => {
  it("formats with full month, ordinal day, comma year", () => {
    expect(formatLongDate(new Date(2026, 8, 20))).toBe("September 20th, 2026");
  });

  it("uses 1st / 2nd / 3rd ordinals", () => {
    expect(formatLongDate(new Date(2026, 0, 1))).toBe("January 1st, 2026");
    expect(formatLongDate(new Date(2026, 0, 2))).toBe("January 2nd, 2026");
    expect(formatLongDate(new Date(2026, 0, 3))).toBe("January 3rd, 2026");
  });

  it("uses 11th / 12th / 13th for the teens", () => {
    expect(formatLongDate(new Date(2026, 0, 11))).toBe("January 11th, 2026");
    expect(formatLongDate(new Date(2026, 0, 12))).toBe("January 12th, 2026");
    expect(formatLongDate(new Date(2026, 0, 13))).toBe("January 13th, 2026");
  });

  it("uses 21st / 22nd / 23rd / 31st for the tens", () => {
    expect(formatLongDate(new Date(2026, 0, 21))).toBe("January 21st, 2026");
    expect(formatLongDate(new Date(2026, 0, 22))).toBe("January 22nd, 2026");
    expect(formatLongDate(new Date(2026, 0, 23))).toBe("January 23rd, 2026");
    expect(formatLongDate(new Date(2026, 0, 31))).toBe("January 31st, 2026");
  });

  it("covers every month with its full name", () => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    months.forEach((m, i) => {
      expect(formatLongDate(new Date(2026, i, 15))).toBe(`${m} 15th, 2026`);
    });
  });
});
