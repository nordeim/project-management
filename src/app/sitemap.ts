import type { MetadataRoute } from "next";

// v2.3: public route map for sitemap.xml — driven by NEXT_PUBLIC_SITE_URL
// (metadataBase shares the same origin). The workspace views themselves are
// session-gated, so only the public entry surfaces are listed.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];
}
