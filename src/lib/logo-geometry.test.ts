import { describe, expect, it } from "vitest";
import { PYRAMID_DOT_R, pyramidDotPositions, ringDotPositions } from "@/components/orbital/logo";

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
    // v1.8: the ring radius is 24.8/40 (measured 6.82px on the live app's
    // 11px mark — the dots sit OUTSIDE the box, overflowing like the live).
    for (const d of dots) {
      const dist = Math.hypot(d.cx - 20, d.cy - 20);
      expect(dist).toBeCloseTo(24.8, 1);
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

  // v1.8: the live app's actual logo SVG (media.base44.com Frame24.svg,
  // fetched 2026-09-18) pins the exact pyramid geometry — row 1 at
  // y≈10.09 (of 40), rows ~9.27 apart, row-2 dots ±5.53 from the axis,
  // row-3 outer dots ±11.01, dot radius 2.7552 (all scaled 1:30 from the
  // 1200-unit source).
  it("matches the measured live SVG geometry", () => {
    const dots = pyramidDotPositions();
    expect(dots[0].cy).toBeCloseTo(10.09, 1);
    expect(dots[1].cy).toBeCloseTo(19.36, 1);
    expect(dots[3].cy).toBeCloseTo(28.33, 1);
    expect(dots[1].cx).toBeCloseTo(20 - 5.53, 1);
    expect(dots[2].cx).toBeCloseTo(20 + 5.53, 1);
    expect(dots[3].cx).toBeCloseTo(20 - 11.01, 1);
    expect(dots[5].cx).toBeCloseTo(20 + 11.01, 1);
  });

  it("exposes the measured dot radius", () => {
    expect(PYRAMID_DOT_R).toBeCloseTo(2.7552, 3);
  });
});
