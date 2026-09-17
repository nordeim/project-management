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
    <span
      className={cn(
        "inline-flex h-5 items-center gap-1 rounded-full bg-orb-purple/15 px-2 text-[10px] font-bold uppercase tracking-[0.08em] text-orb-purple-deep",
        className,
      )}
    >
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path
          d="M6 1v2M6 9v2M1 6h2M9 6h2M2.5 2.5l1.4 1.4M8.1 8.1l1.4 1.4M9.5 2.5L8.1 3.9M3.9 8.1L2.5 9.5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <circle cx="6" cy="6" r="1.6" fill="currentColor" />
      </svg>
      AI
    </span>
  );
}
