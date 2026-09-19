// Relative-time seam (v1.9, measured on the live app): the reference feeds
// render date-fns `formatDistanceToNow` long form — "3 minutes ago",
// "about 2 hours ago", "2 months ago", "over 2 years ago" — never the
// abbreviated "3m ago" style. The algorithm below was extracted from the
// live bundle (index-ByL25mP3.js): minutes x = round((seconds − DST
// shift)/60); x<2 → "less than a minute"/"1 minute"; x<45 → "X minutes";
// x<90 → "about 1 hour"; x<1440 → "about X hours"; x<2520 → "1 day";
// x<43200 → "X days"; x<86400 → "about X months"; then calendar months S
// (differenceInMonths with the Feb-27 rule): S<12 → "X months"; else
// k=S%12, b=floor(S/12): k<3 → "about b years", k<9 → "over b years",
// else "almost (b+1) years". These specs pin that contract with fixed
// clock dates so the calendar-months path is deterministic.

import { describe, expect, it } from "vitest";
import { formatDistance, relativeTime } from "./orbital";

// Fixed "now" for all pure-core specs: 2026-09-18T22:00:00 local.
const NOW = new Date(2026, 8, 18, 22, 0, 0);

function ago(ms: number): Date {
  return new Date(NOW.getTime() - ms);
}
const MIN = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;

describe("formatDistance (pure date-fns distance core)", () => {
  it("renders sub-minute as less than a minute", () => {
    // x = round(seconds/60): 20s → 0 → "less than a minute"; 30s already
    // rounds to 1 minute.
    expect(formatDistance(NOW, ago(20_000))).toBe("less than a minute");
  });

  it("renders the 1-minute singular and the 90-second rounding edge", () => {
    // x = round(seconds/60): 60s → 1 ("1 minute"), 90s → 2 ("2 minutes").
    expect(formatDistance(NOW, ago(MIN))).toBe("1 minute");
    expect(formatDistance(NOW, ago(90_000))).toBe("2 minutes");
  });

  it("renders plural minutes below 45", () => {
    expect(formatDistance(NOW, ago(5 * MIN))).toBe("5 minutes");
    expect(formatDistance(NOW, ago(44 * MIN))).toBe("44 minutes");
  });

  it("renders about-1-hour at 46 minutes and about-X-hours below a day", () => {
    expect(formatDistance(NOW, ago(46 * MIN))).toBe("about 1 hour");
    expect(formatDistance(NOW, ago(100 * MIN))).toBe("about 2 hours");
  });

  it("renders 1 day in the 24h–42h band and X days below 30", () => {
    expect(formatDistance(NOW, ago(26 * HOUR))).toBe("1 day");
    expect(formatDistance(NOW, ago(3 * DAY))).toBe("3 days");
  });

  it("renders about-X-months in the 30–60 day band", () => {
    // 45 days → 64800 min → round(64800/43200) = 2 → "about 2 months".
    expect(formatDistance(NOW, ago(45 * DAY))).toBe("about 2 months");
  });

  it("renders calendar X months past 60 days", () => {
    // 70 days before 2026-09-18 is 2026-07-10 → 2 full calendar months.
    expect(formatDistance(NOW, new Date(2026, 6, 10, 22, 0, 0))).toBe("2 months");
  });

  it("renders about-b years at a full year plus days", () => {
    // 2025-09-01 → 2026-09-18 is 12 full calendar months → k=0, b=1.
    expect(formatDistance(NOW, new Date(2025, 8, 1, 22, 0, 0))).toBe("about 1 year");
  });

  it("renders over-b years when the trailing months reach 3", () => {
    // 2024-03-01 → 2026-09-18 is 30 calendar months → k=6, b=2 → "over 2 years".
    expect(formatDistance(NOW, new Date(2024, 2, 1, 22, 0, 0))).toBe("over 2 years");
  });

  it("renders almost-(b+1) years in the final trailing band", () => {
    // 2014-12-01 → 2026-09-18 is 141 calendar months → k=9, b=11 → "almost 12 years".
    expect(formatDistance(NOW, new Date(2014, 11, 1, 22, 0, 0))).toBe("almost 12 years");
  });
});

describe("relativeTime (feed wrapper)", () => {
  it("appends the ' ago' suffix", () => {
    const fiveMinAgo = new Date(Date.now() - 5 * MIN).toISOString();
    expect(relativeTime(fiveMinAgo)).toBe("5 minutes ago");
  });

  it("renders the live feed's long form for months-old entries", () => {
    // The live app's seeded feed shows "2 months ago" for entries ~70 days old.
    const seventyDaysAgo = new Date(Date.now() - 70 * DAY).toISOString();
    expect(relativeTime(seventyDaysAgo)).toMatch(/^(2 months|about 2 months) ago$/);
  });
});
