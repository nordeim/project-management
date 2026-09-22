import type { Metadata, Viewport } from "next";
import { Archivo, DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

// v1.8 (measured on the live app): the numerals render DM Sans weight 300 —
// without the 300 file the browser synthesizes light from 400 and the
// glyph advances drift ("18" measures 44px instead of the live 38px).
// The live app loads Google's DM Sans v17 VARIABLE font with the opsz
// (optical size) axis — at display sizes the HVAR table narrows the digits
// ("18" = 0.788em at opsz 40 vs 0.947em at opsz 9). Requesting the variable
// font (no static weights) plus the opsz axis reproduces it exactly.
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  axes: ["opsz"],
});

// v1.8: the sidebar brand wordmark "ORBITAL" is Archivo 600 on the live
// app (13px, ls 2.34px) — a wider face than DM Sans at the same size.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["600"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Project Management App",
  description:
    "ORBITAL is an AI-assisted project workspace: goals, tasks, agent activity and team check-ins in one calm dashboard.",
  // v2.3: canonical origin for metadata-resolved URLs (og images,
  // sitemap.ts). Falls back to the local default when the env var is unset.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  icons: {
    icon: "/orbital-logo.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#EBE7E2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} ${dmMono.variable} ${archivo.variable} antialiased bg-background text-foreground font-sans`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
