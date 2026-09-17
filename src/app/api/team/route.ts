import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, requireSession, isEmail } from "@/lib/api";
import { deriveDisplayName, normalizeAgentInput } from "@/lib/team";
import type { PersonDTO, TeamMemberDTO } from "@/lib/orbital";

export async function GET() {
  const session = await requireSession();
  if (!session) return fail("UNAUTHORIZED", "Not signed in", 401);

  const [people, members] = await Promise.all([
    db.person.findMany({ orderBy: { createdAt: "asc" } }),
    db.teamMember.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

  const peopleDTO: PersonDTO[] = people.map((p) => ({
    id: p.id,
    name: p.name,
    avatarColor: p.avatarColor,
    userId: p.userId,
  }));

  const memberDTO: TeamMemberDTO[] = members.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    role: m.role,
    avatarColor: m.avatarColor,
    kind: m.kind === "agent" ? "agent" : "human",
    agentRole: m.agentRole,
    description: m.description,
    instructions: m.instructions,
  }));

  return ok({ people: peopleDTO, members: memberDTO });
}

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session) return fail("UNAUTHORIZED", "Not signed in", 401);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("BAD_REQUEST", "Invalid JSON body", 400);
  }
  const { name, email, role, kind, agentRole, description, instructions } = (body ?? {}) as {
    name?: string;
    email?: string;
    role?: string;
    kind?: string;
    agentRole?: string;
    description?: string;
    instructions?: string;
  };

  if (kind && !["human", "agent"].includes(kind)) return fail("BAD_REQUEST", "kind must be human or agent", 400);
  const memberKind = kind === "agent" ? "agent" : "human";

  const palette = ["#996CE4", "#2ECC8A", "#FF8077", "#C4996A", "#FFCBDE", "#C9B3F5"];

  let memberName: string;
  let memberEmail: string | null = null;
  let memberRole: string | null = null;
  let agentDescription: string | null = null;
  let agentInstructions: string | null = null;

  if (memberKind === "agent") {
    // New Agent form: NAME + DESCRIPTION + INSTRUCTIONS (pure-seam bounds).
    const normalized = normalizeAgentInput({
      name: name ?? "",
      description: description ?? "",
      instructions: instructions ?? "",
    });
    if (!normalized) return fail("BAD_REQUEST", "A name (max 100), description (max 200) and instructions (max 1000) are required bounds", 400);
    memberName = normalized.name;
    agentDescription = normalized.description || null;
    agentInstructions = normalized.instructions || null;
    memberRole = role?.trim() || agentRole?.trim() || null;
  } else {
    // Invite Member form: Email + Member/Lead toggle; name derives from email.
    const trimmedEmail = email?.trim() ?? "";
    if (!trimmedEmail) return fail("BAD_REQUEST", "Email is required", 400);
    if (!isEmail(trimmedEmail)) return fail("BAD_REQUEST", "Enter a valid email address", 400);
    const derived = deriveDisplayName(trimmedEmail);
    if (!derived) return fail("BAD_REQUEST", "Could not derive a name from that email", 400);
    memberName = derived;
    memberEmail = trimmedEmail.toLowerCase();
    if (role && !["member", "lead"].includes(role)) {
      return fail("BAD_REQUEST", "Role must be member or lead", 400);
    }
    memberRole = role === "lead" ? "Lead" : "Member";
  }

  const avatarColor = palette[Math.floor(Math.random() * palette.length)]!;

  const member = await db.teamMember.create({
    data: {
      name: memberName,
      email: memberEmail,
      role: memberRole,
      kind: memberKind,
      agentRole: memberKind === "agent" ? memberRole : null,
      description: agentDescription,
      instructions: agentInstructions,
      avatarColor,
    },
  });

  // Invited humans also become assignable persons.
  if (memberKind === "human") {
    const existingPerson = await db.person.findFirst({ where: { name: memberName } });
    if (!existingPerson) {
      await db.person.create({ data: { name: memberName, avatarColor } });
    }
  }

  await db.activityLog.create({
    data: {
      type: memberKind === "agent" ? "agent_created" : "member_invited",
      message:
        memberKind === "agent"
          ? `AI agent "${memberName}" created`
          : `${memberName} invited to the workspace`,
      detail:
        memberKind === "agent"
          ? `The AI agent "${memberName}"${agentDescription ? ` — ${agentDescription}` : ""} joined the workspace.`
          : `${session.name} invited ${memberName}${memberEmail ? ` (${memberEmail})` : ""} to the workspace as ${memberRole ?? "Member"}.`,
    },
  });

  return ok({ id: member.id }, 201);
}
