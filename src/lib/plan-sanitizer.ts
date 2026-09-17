// Plan sanitizer + deterministic fallback for the AI task planner.
// Extracted from the generate-tasks route so the LLM-output bounds are
// unit-testable and reusable (degrade-not-fail, ADR-005).

export interface GeneratedTask {
  title: string;
  description?: string;
  estimatedHours?: number;
}

export function sanitizeTasks(raw: unknown): GeneratedTask[] {
  if (!Array.isArray(raw)) return [];
  const out: GeneratedTask[] = [];
  for (const item of raw.slice(0, 10)) {
    if (typeof item !== "object" || item === null) continue;
    const t = item as Record<string, unknown>;
    if (typeof t.title !== "string" || !t.title.trim()) continue;
    const title = t.title.trim().slice(0, 160);
    const description = typeof t.description === "string" ? t.description.trim().slice(0, 500) : undefined;
    const hours =
      typeof t.estimatedHours === "number" && Number.isFinite(t.estimatedHours)
        ? Math.min(40, Math.max(1, Math.round(t.estimatedHours)))
        : undefined;
    out.push({ title, description, estimatedHours: hours });
    if (out.length >= 10) break;
  }
  return out;
}

export function templatePlan(goalTitle: string): GeneratedTask[] {
  return [
    { title: `Research and gather requirements for ${goalTitle}`, description: "Collect context, constraints and prior art before execution.", estimatedHours: 4 },
    { title: `Define success metrics for ${goalTitle}`, description: "Agree on 2-3 measurable outcomes and how they will be tracked.", estimatedHours: 3 },
    { title: `Draft the execution plan`, description: "Break the goal into workstreams, owners and a realistic timeline.", estimatedHours: 5 },
    { title: `Review plan with stakeholders`, description: "Walk the plan past the team and incorporate feedback.", estimatedHours: 2 },
    { title: `Execute first milestone`, description: "Deliver the first meaningful slice of work end-to-end.", estimatedHours: 12 },
    { title: `Execute second milestone`, description: "Deliver the remaining core scope.", estimatedHours: 12 },
    { title: `QA and edge-case pass`, description: "Test outcomes against the success metrics; log and fix issues.", estimatedHours: 6 },
    { title: `Wrap-up and learnings review`, description: "Summarize outcomes, learnings and follow-ups for the team.", estimatedHours: 3 },
  ];
}

export function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1]! : text;
  const start = candidate.indexOf("[");
  const end = candidate.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch {
    return null;
  }
}
