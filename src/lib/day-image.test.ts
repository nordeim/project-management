// Day-image seam (v1.9, measured on the live bundle): the dashboard
// date-card photo ROTATES BY TIME OF DAY. The live app's XF() maps hours
// to four variants of the same rolling-hills artwork:
//   05:00–10:59 → morning  (dba8cc82e_Day_A.png)
//   11:00–16:59 → noon     (90666cf4c_Day_B.jpg)
//   17:00–20:59 → dusk     (724625b99_Day_C.png)
//   else        → night    (c5956c00e_Day_D.png)
// The clone ships the same artwork as local assets with the same
// boundaries.

import { describe, expect, it } from "vitest";
import { dayImageFor } from "./day-image";

describe("dayImageFor (date-card photo rotation)", () => {
  it("rotates through all four lighting variants", () => {
    expect(dayImageFor(new Date(2026, 8, 18, 9, 0))).toBe("/day-hills-morning.jpg");
    expect(dayImageFor(new Date(2026, 8, 18, 14, 0))).toBe("/day-hills-noon.jpg");
    expect(dayImageFor(new Date(2026, 8, 18, 19, 0))).toBe("/day-hills-dusk.jpg");
    expect(dayImageFor(new Date(2026, 8, 18, 23, 0))).toBe("/day-hills-night.jpg");
  });

  it("switches at the 5/11/17/21 hour boundaries", () => {
    expect(dayImageFor(new Date(2026, 8, 18, 4, 59))).toBe("/day-hills-night.jpg");
    expect(dayImageFor(new Date(2026, 8, 18, 5, 0))).toBe("/day-hills-morning.jpg");
    expect(dayImageFor(new Date(2026, 8, 18, 10, 59))).toBe("/day-hills-morning.jpg");
    expect(dayImageFor(new Date(2026, 8, 18, 11, 0))).toBe("/day-hills-noon.jpg");
    expect(dayImageFor(new Date(2026, 8, 18, 16, 59))).toBe("/day-hills-noon.jpg");
    expect(dayImageFor(new Date(2026, 8, 18, 17, 0))).toBe("/day-hills-dusk.jpg");
    expect(dayImageFor(new Date(2026, 8, 18, 20, 59))).toBe("/day-hills-dusk.jpg");
    expect(dayImageFor(new Date(2026, 8, 18, 21, 0))).toBe("/day-hills-night.jpg");
  });

  it("treats the small hours (00:00–04:59) as night", () => {
    expect(dayImageFor(new Date(2026, 8, 18, 0, 0))).toBe("/day-hills-night.jpg");
    expect(dayImageFor(new Date(2026, 8, 18, 3, 30))).toBe("/day-hills-night.jpg");
  });
});
