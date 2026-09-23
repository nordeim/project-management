"use client";

// Small shared visual primitives for the ORBITAL UI.

import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/orbital";

export function AvatarBubble({
  name,
  color,
  size = 28,
  className,
}: {
  name: string;
  color: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold text-[#5A5350]", className)}
      style={{
        backgroundColor: color,
        width: size,
        height: size,
        fontSize: Math.max(10, Math.round(size * 0.38)),
      }}
    >
      {initials(name)}
    </span>
  );
}

export function AiBadge({ className }: { className?: string }) {
  return (
    // v1.8 (re-measured — corrects v1.6; icon re-measured v2.4): the chip
    // carries a 9px ZAP glyph beside the "AI" text, both in #996CE4, plus
    // a hairline border (1px rgba(160,143,126,0.2)) on the solid #EEEAE6
    // pill — radius 6, p 1px 5px, gap 2px, 10px/500, letter-spacing 0.5px.
    // (The live swapped the sparkles glyph for a lightning bolt at the
    // 1.5 chrome stroke in its 2026-09-22 re-deploy.)
    <span
      className={cn(
        "inline-flex items-center gap-[2px] rounded-[6px] border border-[rgba(160,143,126,0.2)] bg-orb-raised px-[5px] py-px text-[10px] font-medium tracking-[0.05em] text-orb-purple",
        className,
      )}
    >
      <Zap size={9} strokeWidth={2} aria-hidden="true" />
      AI
    </span>
  );
}
