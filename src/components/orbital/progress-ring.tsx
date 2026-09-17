"use client";

// SVG progress ring used on the dashboard hero and goal cards.
// Size/weight are tunable; the stroke animates via CSS transition on the
// dash offset (respects prefers-reduced-motion through globals.css).

import { useEffect, useState } from "react";

export function ProgressRing({
  value,
  size = 120,
  thickness = 10,
  color = "#2ECC8A",
  trackColor = "rgba(47,40,35,0.08)",
  children,
  label,
}: {
  value: number; // 0-100
  size?: number;
  thickness?: number;
  color?: string;
  trackColor?: string;
  children?: React.ReactNode;
  label?: string;
}) {
  const clamped = Math.min(100, Math.max(0, value));
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    // Animate from empty on mount so progress is perceived, not static.
    const timer = requestAnimationFrame(() => {
      setOffset(circumference - (clamped / 100) * circumference);
    });
    return () => cancelAnimationFrame(timer);
  }, [clamped, circumference]);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={label ?? `${Math.round(clamped)}% complete`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={trackColor} strokeWidth={thickness} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={thickness}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.22, 1, 0.36, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}
