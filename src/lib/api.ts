// Shared API helpers: typed JSON responses + a session guard for route
// handlers. Route handlers return `{ ok: true, data }` or
// `{ ok: false, error: { code, message } }` — the same ActionResult shape
// the frontend store understands.

import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  avatarColor: string;
}

export function ok<T>(data: T, init?: number) {
  return NextResponse.json({ ok: true as const, data }, { status: init ?? 200 });
}

export function fail(code: string, message: string, status: number) {
  return NextResponse.json({ ok: false as const, error: { code, message } }, { status });
}

export async function requireSession(): Promise<SessionUser | null> {
  return getSessionUser();
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
