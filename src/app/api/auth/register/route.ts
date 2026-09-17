import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { ok, fail, isEmail } from "@/lib/api";

const MIN_PASSWORD_LENGTH = 8;

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("BAD_REQUEST", "Invalid JSON body", 400);
  }
  const { name, email, password } = (body ?? {}) as {
    name?: string;
    email?: string;
    password?: string;
  };
  if (!name?.trim() || !email || !password) {
    return fail("BAD_REQUEST", "Name, email and password are required", 400);
  }
  if (!isEmail(email)) {
    return fail("BAD_REQUEST", "Enter a valid email address", 400);
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return fail("WEAK_PASSWORD", `Password must be at least ${MIN_PASSWORD_LENGTH} characters`, 400);
  }

  const normalized = email.toLowerCase();
  const existing = await db.user.findUnique({ where: { email: normalized } });
  if (existing) {
    return fail("EMAIL_TAKEN", "An account with this email already exists", 409);
  }

  const palette = ["#996CE4", "#2ECC8A", "#FF8077", "#C4996A", "#FFCBDE", "#C9B3F5"];
  const avatarColor = palette[Math.floor(Math.random() * palette.length)]!;

  const user = await db.user.create({
    data: {
      email: normalized,
      name: name.trim(),
      passwordHash: hashPassword(password),
      avatarColor,
    },
  });

  // Every login user gets a linked Person so tasks can be assigned to them
  // and "My Tasks" resolves.
  await db.person.create({
    data: { name: user.name, avatarColor, userId: user.id },
  });

  await db.activityLog.create({
    data: {
      type: "member_invited",
      message: `${user.name} joined the workspace`,
      detail: `${user.name} (${user.email}) created an account.`,
    },
  });

  await setSessionCookie(user.id);
  return ok({ id: user.id, email: user.email, name: user.name, avatarColor: user.avatarColor }, 201);
}
