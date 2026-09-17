// Single-route application shell. The reference app is a browser SPA; this
// clone keeps the same architecture — one page, client-side view switching
// at real paths (deep-linkable: /goals/<id>). The page is a server
// component that resolves the session once and hands the (nullable) user
// to the client app: signed-out visitors get the workspace shell with a
// LOG IN button (reference behavior, v1.4); the actual auth form lives at
// the real /login route.

import { getSessionUser } from "@/lib/auth";
import { OrbitalApp } from "@/components/orbital/orbital-app";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getSessionUser();
  return <OrbitalApp user={user} />;
}
