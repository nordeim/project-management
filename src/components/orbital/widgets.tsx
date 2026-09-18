"use client";

// Small shared visual primitives for the ORBITAL UI.

import { Sparkles } from "lucide-react";
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
      className={cn("inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold text-white", className)}
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
    // v1.8 (re-measured — corrects v1.6): the chip carries a 9px sparkles
    // glyph beside the "AI" text, both in #996CE4, plus a hairline border
    // (1px rgba(160,143,126,0.2)) on the solid #EEEAE6 pill — radius 6,
    // p 1px 5px, gap 2px, 10px/500.
    <span
      className={cn(
        "inline-flex items-center gap-[2px] rounded-[6px] border border-[rgba(160,143,126,0.2)] bg-orb-raised px-[5px] py-px text-[10px] font-medium text-orb-purple",
        className,
      )}
    >
      <Sparkles size={9} strokeWidth={2} aria-hidden="true" />
      AI
    </span>
  );
}
