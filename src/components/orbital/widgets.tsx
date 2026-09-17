"use client";

// Small shared visual primitives for the ORBITAL UI.

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
    // Reference (v1.6, measured): a SOLID #EEEAE6 chip — radius 6,
    // p 1px 5px, 10px/500 #996CE4 text "AI", no sparkle icon.
    <span
      className={cn(
        "inline-flex items-center rounded-[6px] bg-orb-raised px-[5px] py-px text-[10px] font-medium text-orb-purple-deep",
        className,
      )}
    >
      AI
    </span>
  );
}
