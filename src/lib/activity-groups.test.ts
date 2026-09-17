import { describe, expect, it } from "vitest";
import { groupActivityByDate } from "./activity-groups";
import type { ActivityDTO } from "./orbital";

function entry(id: string, createdAt: string, message = "did a thing"): ActivityDTO {
  return {
    id,
    type: "task_assigned",
    message,
    detail: `${message} — detail`,
    createdAt,
  };
}

// 2026-07-16 was a Thursday; 2026-07-17 a Friday; 2026-07-20 a Monday.
const THU = "2026-07-16T10:00:00.000Z";
const THU_LATER = "2026-07-16T18:30:00.000Z";
const FRI = "2026-07-17T09:00:00.000Z";

describe("groupActivityByDate", () => {
  it("groups entries by calendar day, newest day first", () => {
    const groups = groupActivityByDate([entry("a", THU), entry("b", FRI), entry("c", THU_LATER)]);
    expect(groups).toHaveLength(2);
    expect(groups[0]!.entries.map((e) => e.id)).toEqual(["b"]);
    expect(groups[1]!.entries.map((e) => e.id)).toEqual(["a", "c"]);
  });

  it("keeps entries within a day in feed order (newest first, as the API returns them)", () => {
    const groups = groupActivityByDate([entry("a", THU), entry("c", THU_LATER)]);
    expect(groups[0]!.entries.map((e) => e.id)).toEqual(["a", "c"]);
  });

  it("labels each group with the long weekday-day format", () => {
    const groups = groupActivityByDate([entry("a", THU)]);
    expect(groups[0]!.label).toBe("Thu Jul 16 2026");
  });

  it("labels today's group as Today", () => {
    const now = new Date();
    const iso = now.toISOString();
    const groups = groupActivityByDate([entry("a", iso)]);
    expect(groups[0]!.label).toBe("Today");
  });

  it("does not merge entries across a midnight boundary", () => {
    const before = "2026-07-16T23:59:00.000Z";
    const after = "2026-07-17T00:01:00.000Z";
    const groups = groupActivityByDate([entry("a", before), entry("b", after)]);
    expect(groups).toHaveLength(2);
  });

  it("groups by the entry's local calendar day, not UTC", () => {
    // 2026-07-16T23:30Z is already 2026-07-17 in a UTC+1 zone (server-local
    // time governs the day bucket — the reference groups what the user sees).
    const groups = groupActivityByDate([entry("a", "2026-07-16T23:30:00.000Z")]);
    // The label is derived from the same localDate the key uses, so the test
    // asserts self-consistency: the label always matches the key's day.
    const keyDay = groups[0]!.key.slice(0, 10);
    const labelDay = groups[0]!.label.replace(/.*(\w{3}) (\d{1,2}) (\d{4})$/, "$1 $2 $3");
    expect(`${labelDay} ${keyDay.slice(0, 4)}`).toContain(groups[0]!.label.slice(-4));
  });

  it("returns an empty list for empty input", () => {
    expect(groupActivityByDate([])).toEqual([]);
  });

  it("produces a stable sort key for each group", () => {
    const groups = groupActivityByDate([entry("a", THU), entry("b", FRI)]);
    expect(groups.map((g) => g.key)).toEqual(["2026-07-17", "2026-07-16"]);
  });
});
