import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, requireSession } from "@/lib/api";
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
  const { name, email, role, kind, agentRole } = (body ?? {}) as {
    name?: string;
    email?: string;
    role?: string;
    kind?: string;
    agentRole?: string;
  };

  const trimmed = name?.trim();
  if (!trimmed) return fail("BAD_REQUEST", "Name is required", 400);
  if (trimmed.length > 100) return fail("BAD_REQUEST", "Name is too long (max 100)", 400);
  if (kind && !["human", "agent"].includes(kind)) return fail("BAD_REQUEST", "kind must be human or agent", 400);

  const memberKind = kind === "agent" ? "agent" : "human";
  if (memberKind === "agent" && !agentRole?.trim()) {
    return fail("BAD_REQUEST", "Agent role is required for AI agents", 400);
  }

  const palette = ["#996CE4", "#2ECC8A", "#FF8077", "#C4996A", "#FFCBDE", "#C9B3F5"];
  const avatarColor = palette[Math.floor(Math.random() * palette.length)]!;

  const member = await db.teamMember.create({
    data: {
      name: trimmed,
      email: email?.trim() || null,
      role: role?.trim() || null,
      kind: memberKind,
      agentRole: memberKind === "agent" ? agentRole!.trim() : null,
      avatarColor,
    },
  });

  // Invited humans also become assignable persons.
  if (memberKind === "human") {
    const existingPerson = await db.person.findFirst({ where: { name: trimmed } });
    if (!existingPerson) {
      await db.person.create({ data: { name: trimmed, avatarColor } });
    }
  }

  await db.activityLog.create({
    data: {
      type: memberKind === "agent" ? "agent_created" : "member_invited",
      message:
        memberKind === "agent"
          ? `AI agent "${trimmed}" created`
          : `${trimmed} invited to the workspace`,
      detail:
        memberKind === "agent"
          ? `The AI agent "${trimmed}" (${agentRole!.trim()}) joined the workspace.`
          : `${session.name} invited ${trimmed}${email ? ` (${email.trim()})` : ""} to the workspace.`,
    },
  });

  return ok({ id: member.id }, 201);
}
