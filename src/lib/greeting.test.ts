// Greeting seam (v1.7, measured on the live app): the dashboard greeting is
// Title Case with a trailing period — "Good Morning." / "Good Afternoon." /
// "Good Evening." The boundary hours were read off the shared helper's
// contract (<12 morning, <18 afternoon, else evening).

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

  it("stays in the morning band just after midnight", () => {
    expect(greetingFor(new Date(2026, 8, 18, 0, 30))).toBe("Good Morning.");
  });
});
