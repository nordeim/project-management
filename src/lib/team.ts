// Team-domain pure seams shared by the dialogs and /api/team.
// deriveDisplayName: the reference Invite Member form collects only an email
// plus a role toggle; the member's display name derives from the local part.
// normalizeAgentInput: bounds for the New Agent form (name / description /
// instructions) mirrored server-side by the route handler.

export function deriveDisplayName(email: string): string {
  const trimmed = email.trim();
  const at = trimmed.indexOf("@");
  if (!trimmed || at <= 0) return "";
  const local = trimmed.slice(0, at);
  const words = local
    .split(/[._\-+]+/)
    .map((w) => w.trim())
    .filter(Boolean)
    .map((w) => w[0]!.toUpperCase() + w.slice(1).toLowerCase());
  if (words.length === 0) return "";
  return words.join(" ").slice(0, 60);
}

export interface AgentInput {
  name: string;
  description: string;
  instructions: string;
}

export function normalizeAgentInput(input: AgentInput): AgentInput | null {
  const name = input.name.trim();
  const description = input.description.trim();
  const instructions = input.instructions.trim();
  if (!name || name.length > 100) return null;
  if (description.length > 200) return null;
  if (instructions.length > 1000) return null;
  return { name, description, instructions };
}
