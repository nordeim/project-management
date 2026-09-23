"use client";

// Shared activity icon circle (v1.8, measured on the live app): 30px in
// feed rows, 36px for the activity hero. The glyph + tone come from the
// tested activity-icons seam — square-check in light purple (default),
// square-check in green for task generation, target in purple for goal
// analysis. The feed hero uses a FIXED search glyph instead and is styled
// at its call site, not through this component.

import { SquareCheckBig, Target } from "lucide-react";
import { activityIconFor } from "@/lib/activity-icons";

export function ActivityIcon({ type, size = 30 }: { type: string; size?: number }) {
  const spec = activityIconFor(type);
  const glyph = size >= 36 ? 16 : 13;
  const Icon = spec.icon === "target" ? Target : SquareCheckBig;
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full text-[#2A2A2A]"
      style={{ backgroundColor: spec.tone === "green" ? "#2ECC8A" : "#C9B3F5", width: size, height: size }}
      aria-hidden="true"
    >
      <Icon size={glyph} strokeWidth={2} />
    </span>
  );
}
