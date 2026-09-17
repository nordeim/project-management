// Single-route application shell. The reference app is a browser SPA; this
// clone keeps the same architecture — one route, client-side view switching
// driven by URL search params (deep-linkable: ?view=goals&goal=<id>).
// The page is a server component that resolves the session once and hands
// the user to the client app (or the login screen when signed out).

import { getSessionUser } from "@/lib/auth";
import { OrbitalApp } from "@/components/orbital/orbital-app";
import { LoginScreen } from "@/components/orbital/login-screen";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getSessionUser();
  if (!user) {
    return <LoginScreen />;
  }
  return <OrbitalApp user={user} />;
}
