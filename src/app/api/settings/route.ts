import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ok, fail, requireSession } from "@/lib/api";
import type { WorkspaceSettingsDTO } from "@/lib/orbital";

const FREQUENCIES = new Set(["once_daily", "twice_daily", "weekly"]);
const TONES = new Set(["friendly", "professional", "concise"]);
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

async function readSettings(): Promise<WorkspaceSettingsDTO> {
  const row = await db.workspaceSetting.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
  return {
    name: row.name,
    workStart: row.workStart,
    workEnd: row.workEnd,
    pingFrequency: row.pingFrequency as WorkspaceSettingsDTO["pingFrequency"],
    aiTone: row.aiTone as WorkspaceSettingsDTO["aiTone"],
  };
}

export async function GET() {
  const session = await requireSession();
  if (!session) return fail("UNAUTHORIZED", "Not signed in", 401);
  return ok(await readSettings());
}

export async function PATCH(request: NextRequest) {
  const session = await requireSession();
  if (!session) return fail("UNAUTHORIZED", "Not signed in", 401);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("BAD_REQUEST", "Invalid JSON body", 400);
  }
  const { name, workStart, workEnd, pingFrequency, aiTone } = (body ?? {}) as {
    name?: string;
    workStart?: string;
    workEnd?: string;
    pingFrequency?: string;
    aiTone?: string;
  };

  const data: Record<string, unknown> = {};
  if (name !== undefined) {
    const trimmed = name.trim();
    if (!trimmed) return fail("BAD_REQUEST", "Workspace name cannot be empty", 400);
    if (trimmed.length > 100) return fail("BAD_REQUEST", "Workspace name is too long (max 100)", 400);
    data.name = trimmed;
  }
  if (workStart !== undefined) {
    if (!TIME_RE.test(workStart)) return fail("BAD_REQUEST", "Start time must be HH:MM (24h)", 400);
    data.workStart = workStart;
  }
  if (workEnd !== undefined) {
    if (!TIME_RE.test(workEnd)) return fail("BAD_REQUEST", "End time must be HH:MM (24h)", 400);
    data.workEnd = workEnd;
  }
  if (workStart !== undefined || workEnd !== undefined) {
    const current = await readSettings();
    const start = (workStart ?? current.workStart).slice(0, 5);
    const end = (workEnd ?? current.workEnd).slice(0, 5);
    if (start >= end) return fail("BAD_REQUEST", "End time must be after start time", 400);
  }
  if (pingFrequency !== undefined) {
    if (!FREQUENCIES.has(pingFrequency)) return fail("BAD_REQUEST", "Invalid ping frequency", 400);
    data.pingFrequency = pingFrequency;
  }
  if (aiTone !== undefined) {
    if (!TONES.has(aiTone)) return fail("BAD_REQUEST", "Invalid AI tone", 400);
    data.aiTone = aiTone;
  }

  await db.workspaceSetting.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });

  await db.activityLog.create({
    data: {
      type: "settings_updated",
      message: "Workspace settings updated",
      detail: `${session.name} updated workspace settings.`,
    },
  });

  return ok(await readSettings());
}
