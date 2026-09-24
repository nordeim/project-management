// /login — the reference app's real auth route (v1.4). Renders the login
// card for EVERY visitor (v2.11, F13 — measured on the live 2026-09-24:
// authenticated visitors get the full card, NOT a redirect; signing in
// from that state lands on the workspace via the client flow in
// login-screen.tsx). `?from_url=` is still honored after sign-in.

import { LoginCard } from "@/components/orbital/login-screen";

export const dynamic = "force-dynamic";

function safeFromUrl(raw: string | undefined): string {
  // Only same-origin absolute paths are honored — never an external URL.
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from_url?: string }>;
}) {
  const { from_url } = await searchParams;
  return <LoginCard fromUrl={safeFromUrl(from_url)} />;
}
