import { describe, expect, it } from "vitest";
import { isSameDay, monthGrid, type CalendarCell } from "./calendar";

describe("monthGrid", () => {
  it("returns a 6x7 grid (42 cells) for every month", () => {
    for (let month = 0; month < 12; month++) {
      const grid = monthGrid(2026, month);
      expect(grid.length).toBe(6);
      for (const week of grid) {
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
    const last = sept[5][6];
    expect(last.inMonth).toBe(false);
    expect(last.day).toBe(10);
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
