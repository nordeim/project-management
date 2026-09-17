// /login — the reference app's real auth route (v1.4). Renders the login
// card for signed-out visitors and bounces already-authenticated ones back
// to the workspace they came from (from_url, default "/").

import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
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
  const user = await getSessionUser();
  const { from_url } = await searchParams;
  if (user) redirect(safeFromUrl(from_url));
  return <LoginCard fromUrl={safeFromUrl(from_url)} />;
}
