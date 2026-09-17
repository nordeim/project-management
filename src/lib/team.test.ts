import { describe, it, expect } from "vitest";
import { deriveDisplayName, normalizeAgentInput } from "./team";

// Team seams: the reference app's Invite Member form collects only an email
// (display name derives from it) and the New Agent form collects
// name / description / instructions. Both map through pure functions so the
// dialog and the route handler share one normalization.

describe("deriveDisplayName (email local part → display name)", () => {
  it("splits on dots and capitalizes", () => {
    expect(deriveDisplayName("jane.doe@company.com")).toBe("Jane Doe");
  });

  it("handles a bare local part", () => {
    expect(deriveDisplayName("priya@x.io")).toBe("Priya");
  });

  it("treats underscores and hyphens as separators", () => {
    expect(deriveDisplayName("john_smith@test.org")).toBe("John Smith");
    expect(deriveDisplayName("john-smith@test.org")).toBe("John Smith");
  });

  it("collapses multiple separators", () => {
    expect(deriveDisplayName("a..b@c.io")).toBe("A B");
  });

  it("lowercases uppercase input into Title Case", () => {
    expect(deriveDisplayName("JANE.DOE@X.COM")).toBe("Jane Doe");
  });

  it("caps the result length", () => {
    const out = deriveDisplayName("a".repeat(40) + "." + "b".repeat(40) + "@x.io");
    expect(out.length).toBeLessThanOrEqual(60);
  });

  it("returns empty string for unusable input", () => {
    expect(deriveDisplayName("")).toBe("");
    expect(deriveDisplayName("   ")).toBe("");
    expect(deriveDisplayName("no-at-sign")).toBe("");
  });
});

describe("normalizeAgentInput (New Agent form payload)", () => {
  it("trims and passes valid input through", () => {
    const out = normalizeAgentInput({
      name: "  Project Manager  ",
      description: " Keeps the plan on track ",
      instructions: "Ping blockers daily.",
    });
    expect(out).toEqual({
      name: "Project Manager",
      description: "Keeps the plan on track",
      instructions: "Ping blockers daily.",
    });
  });

  it("returns null when the name is missing", () => {
    expect(normalizeAgentInput({ name: "   ", description: "x", instructions: "y" })).toBeNull();
  });

  it("rejects over-long fields", () => {
    expect(
      normalizeAgentInput({ name: "x".repeat(101), description: "", instructions: "" }),
    ).toBeNull();
    expect(
      normalizeAgentInput({ name: "ok", description: "x".repeat(201), instructions: "" }),
    ).toBeNull();
    expect(
      normalizeAgentInput({ name: "ok", description: "", instructions: "x".repeat(1001) }),
    ).toBeNull();
  });

  it("keeps empty optional fields as empty strings", () => {
    const out = normalizeAgentInput({ name: "Bot", description: "", instructions: "" });
    expect(out).toEqual({ name: "Bot", description: "", instructions: "" });
  });
});
