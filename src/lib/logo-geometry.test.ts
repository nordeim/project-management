import { describe, expect, it } from "vitest";
import { pyramidDotPositions, ringDotPositions } from "@/components/orbital/logo";

// v1.3 WS-2: pixel-level analysis of the live app measured the brand marks —
// sidebar = SIX dots in a hexagonal ring (12/2/4/6/8/10 o'clock); login card =
// SIX dots in a 1-2-3 pyramid. (v1.2 shipped 8 dots from a VLM miscount.)

describe("ringDotPositions (sidebar mark)", () => {
  it("places exactly six dots", () => {
    expect(ringDotPositions()).toHaveLength(6);
  });

  it("starts at 12 o'clock and spaces dots 60 degrees apart", () => {
    const dots = ringDotPositions();
    // first dot: straight up from center (20,20)
    expect(dots[0].cx).toBeCloseTo(20, 1);
    expect(dots[0].cy).toBeLessThan(20);
    // second dot: upper-right quadrant (2 o'clock)
    expect(dots[1].cx).toBeGreaterThan(20);
    expect(dots[1].cy).toBeLessThan(20);
    // all dots equidistant from the center
    for (const d of dots) {
      const dist = Math.hypot(d.cx - 20, d.cy - 20);
      expect(dist).toBeCloseTo(14, 1);
    }
    // consecutive angular steps of 60 degrees (wrap-safe)
    const angles = dots.map((d) => Math.atan2(d.cy - 20, d.cx - 20));
    const TAU = Math.PI * 2;
    for (let i = 1; i < angles.length; i++) {
      const step = (angles[i] - angles[i - 1] + TAU) % TAU;
      expect(step).toBeCloseTo(Math.PI / 3, 1);
    }
  });
});

describe("pyramidDotPositions (login mark)", () => {
  it("places exactly six dots in three rows of 1-2-3", () => {
    const dots = pyramidDotPositions();
    expect(dots).toHaveLength(6);
    const rows = new Map<number, number>();
    for (const d of dots) {
      rows.set(d.cy, (rows.get(d.cy) ?? 0) + 1);
    }
    expect([...rows.values()].sort()).toEqual([1, 2, 3]);
  });

  it("centers every row on the same axis", () => {
    const dots = pyramidDotPositions();
    const byRow = new Map<number, number[]>();
    for (const d of dots) byRow.set(d.cy, [...(byRow.get(d.cy) ?? []), d.cx]);
    for (const xs of byRow.values()) {
      const mid = (Math.min(...xs) + Math.max(...xs)) / 2;
      expect(mid).toBeCloseTo(20, 1);
    }
  });
});
