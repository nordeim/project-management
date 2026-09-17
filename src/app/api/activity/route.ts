import { db } from "@/lib/db";
import { ok, fail, requireSession } from "@/lib/api";
import type { ActivityDTO } from "@/lib/orbital";

export async function GET() {
  const session = await requireSession();
  if (!session) return fail("UNAUTHORIZED", "Not signed in", 401);

  const entries = await db.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 200 });

  const data: ActivityDTO[] = entries.map((e) => ({
    id: e.id,
    type: e.type,
    message: e.message,
    detail: e.detail,
    createdAt: e.createdAt.toISOString(),
  }));

  return ok(data);
}
