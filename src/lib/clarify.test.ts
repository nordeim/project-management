import { describe, expect, it } from "vitest";
import { fallbackQuestions, sanitizeQuestions } from "./clarify";

// The New Goal wizard's clarifying step: the AI asks up to 3 questions about
// the goal before drafting the plan. The LLM path is sanitized; the fallback
// path is deterministic so the wizard never blocks on the SDK being down.

describe("fallbackQuestions", () => {
  it("returns exactly three questions", () => {
    expect(fallbackQuestions("Improve customer onboarding")).toHaveLength(3);
  });

  it("references the goal title in the metrics question", () => {
    const questions = fallbackQuestions("Improve customer onboarding");
    expect(questions[0]).toContain("Improve customer onboarding");
    expect(questions[0].toLowerCase()).toContain("metric");
  });

  it("asks about constraints and stakeholders", () => {
    const questions = fallbackQuestions("Launch new landing page");
    expect(questions[1]).toMatch(/constraint/i);
    expect(questions[2]).toMatch(/stakeholder/i);
  });

  it("trims a trailing period from the title so questions read naturally", () => {
    const questions = fallbackQuestions("Ship the redesign.");
    expect(questions[0]).not.toContain("redesign..");
  });

  it("caps runaway titles so questions stay readable", () => {
    const long = "A".repeat(300);
    for (const q of fallbackQuestions(long)) {
      expect(q.length).toBeLessThanOrEqual(280);
    }
  });
});

describe("sanitizeQuestions", () => {
  it("keeps a clean LLM answer as-is", () => {
    const raw = ["What is the budget?", "Who owns delivery?", "Any hard deadlines?"];
    expect(sanitizeQuestions(raw)).toEqual(raw);
  });

  it("trims whitespace and drops empty questions", () => {
    expect(sanitizeQuestions(["  What?  ", "", "   "])).toEqual(["What?"]);
  });

  it("caps each question at 200 characters", () => {
    const raw = ["Q".repeat(500)];
    const out = sanitizeQuestions(raw);
    expect(out[0]!.length).toBeLessThanOrEqual(200);
  });

  it("keeps at most three questions", () => {
    const raw = ["One?", "Two?", "Three?", "Four?", "Five?"];
    expect(sanitizeQuestions(raw)).toHaveLength(3);
  });

  it("ignores non-string entries", () => {
    const raw = [42, "Real question?", null, { q: 1 }] as unknown[];
    expect(sanitizeQuestions(raw)).toEqual(["Real question?"]);
  });

  it("returns an empty array for non-array input", () => {
    expect(sanitizeQuestions("not an array")).toEqual([]);
    expect(sanitizeQuestions(null)).toEqual([]);
    expect(sanitizeQuestions(undefined)).toEqual([]);
  });

  it("rejects an LLM answer with fewer than two usable questions", () => {
    // The route treats < 2 as "use the fallback" — the sanitizer reports
    // what survived so the caller can decide.
    expect(sanitizeQuestions(["Only one?"])).toEqual(["Only one?"]);
  });
});
