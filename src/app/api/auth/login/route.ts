import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, setSessionCookie } from "@/lib/auth";
import { ok, fail, isEmail } from "@/lib/api";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("BAD_REQUEST", "Invalid JSON body", 400);
  }
  const { email, password } = (body ?? {}) as { email?: string; password?: string };
  if (!email || !password) {
    return fail("BAD_REQUEST", "Email and password are required", 400);
  }
  if (!isEmail(email)) {
    return fail("BAD_REQUEST", "Enter a valid email address", 400);
  }

  const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return fail("INVALID_CREDENTIALS", "Incorrect email or password", 401);
  }

  await setSessionCookie(user.id);
  return ok({ id: user.id, email: user.email, name: user.name, avatarColor: user.avatarColor });
}
