import { ok, fail, requireSession } from "@/lib/api";

export async function GET() {
  const user = await requireSession();
  if (!user) return fail("UNAUTHORIZED", "Not signed in", 401);
  return ok(user);
}
