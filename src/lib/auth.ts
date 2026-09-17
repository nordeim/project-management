// Session + password primitives for ORBITAL.
// Stateless HMAC-signed cookie sessions + scrypt password hashing — Node
// built-ins only, no external crypto dependencies. Cookie payload is
// `userId.expiry.signature`; the signature covers userId+expiry with the
// AUTH_SECRET, so tokens cannot be forged or altered client-side.

import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

const SESSION_COOKIE = "orbital_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    // Deterministic dev fallback so the sandbox works without .env changes;
    // production deployments MUST set AUTH_SECRET (documented in README).
    return "orbital-dev-secret-do-not-use-in-production";
  }
  return secret;
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function createSessionToken(userId: string): string {
  const expiry = Date.now() + SESSION_TTL_MS;
  const payload = `${userId}.${expiry}`;
  return `${payload}.${sign(payload)}`;
}

export function parseSessionToken(token: string | undefined): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, expiry, signature] = parts;
  const payload = `${userId}.${expiry}`;
  const expected = sign(payload);
  // timingSafeEqual requires equal lengths; compare against a fixed-length digest.
  const a = Buffer.from(signature, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  if (Number.parseInt(expiry, 10) < Date.now()) return null;
  return userId;
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const userId = parseSessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!userId) return null;
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, avatarColor: true },
  });
  return user;
}

export async function setSessionCookie(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, createSessionToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export { SESSION_COOKIE };
