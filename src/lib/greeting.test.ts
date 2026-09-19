// Greeting seam (v1.9, re-measured on the live bundle): the dashboard
// greeting is Title Case with a trailing period — "Good Morning." / "Good
// Afternoon." / "Good Evening." The live app's QF() switches at hour 5,
// 12 and 18: 05:00–11:59 morning, 12:00–17:59 afternoon, else evening —
// so the small hours (00:00–04:59) greet with "Good Evening."

import { describe, expect, it } from "vitest";
import { greetingFor } from "./orbital";

describe("greetingFor (dashboard greeting)", () => {
  it("returns Title Case greetings with a trailing period", () => {
    expect(greetingFor(new Date(2026, 8, 18, 9, 0))).toBe("Good Morning.");
    expect(greetingFor(new Date(2026, 8, 18, 14, 0))).toBe("Good Afternoon.");
    expect(greetingFor(new Date(2026, 8, 18, 21, 0))).toBe("Good Evening.");
  });

  it("switches to afternoon at exactly 12:00", () => {
    expect(greetingFor(new Date(2026, 8, 18, 11, 59))).toBe("Good Morning.");
    expect(greetingFor(new Date(2026, 8, 18, 12, 0))).toBe("Good Afternoon.");
  });

  it("switches to evening at exactly 18:00", () => {
    expect(greetingFor(new Date(2026, 8, 18, 17, 59))).toBe("Good Afternoon.");
    expect(greetingFor(new Date(2026, 8, 18, 18, 0))).toBe("Good Evening.");
  });

  it("starts the morning band at 05:00, not midnight", () => {
    expect(greetingFor(new Date(2026, 8, 18, 4, 59))).toBe("Good Evening.");
    expect(greetingFor(new Date(2026, 8, 18, 0, 30))).toBe("Good Evening.");
    expect(greetingFor(new Date(2026, 8, 18, 5, 0))).toBe("Good Morning.");
  });
});
