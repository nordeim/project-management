// Clarifying questions for the New Goal wizard: before drafting a task
// plan, the AI agent asks up to three questions about the goal. The LLM
// path is sanitized here; the fallback is deterministic so the wizard
// works in every environment (degrade-not-fail, like the task planner).

const MAX_QUESTIONS = 3;
const MAX_QUESTION_LENGTH = 200;
const MAX_TITLE_LENGTH = 120;

/** Deterministic questions used when the SDK is unavailable or unusable. */
export function fallbackQuestions(title: string, _description?: string | null): string[] {
  const subject = title.trim().replace(/\.$/, "").slice(0, MAX_TITLE_LENGTH);
  return [
    `What specific metrics will be used to measure the success of ${subject}?`,
    `Are there any technical or resource constraints that limit potential changes to ${subject}?`,
    `Who are the key stakeholders or team members that need to be involved to implement ${subject}?`,
  ];
}

/**
 * Bound what an LLM can put in front of the user: strings only, trimmed,
 * non-empty, at most 200 chars each, at most 3 questions. Returns whatever
 * survived — the caller falls back to `fallbackQuestions` when fewer than
 * 2 remain.
 */
export function sanitizeQuestions(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const item of raw.slice(0, MAX_QUESTIONS)) {
    if (typeof item !== "string") continue;
    const q = item.trim().slice(0, MAX_QUESTION_LENGTH);
    if (!q) continue;
    out.push(q);
  }
  return out;
}
