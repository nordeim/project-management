"use client";

// Sidebar clock: the reference app's neumorphic analog clock (v1.8,
// re-measured) — the SVG fills the full 80px well and carries THREE hands
// in graded grays: hour 2.5px×19px #5A5A5A, minute 1.8px×26px #8A8A8A and
// a thin 1px×30px #B8B4B0 second hand, around a #2F2823 center dot. Reads
// the wall clock through useSyncExternalStore (15s buckets) so there is no
// setState-in-effect and no hydration mismatch: the server snapshot renders
// 00:00 and the client corrects on the first paint after hydration.

import { useSyncExternalStore } from "react";

const BUCKET_MS = 15_000;

function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, BUCKET_MS);
  return () => window.clearInterval(id);
}

function getBucket(): number {
  return Math.floor(Date.now() / BUCKET_MS);
}

function getServerBucket(): number {
  return 0;
}

export function SidebarClock({ size = 80 }: { size?: number }) {
  const bucket = useSyncExternalStore(subscribe, getBucket, getServerBucket);
  const now = bucket === 0 ? null : new Date(bucket * BUCKET_MS);

  const hours = now ? now.getHours() % 12 : 0;
  const minutes = now ? now.getMinutes() : 0;
  const seconds = now ? now.getSeconds() : 0;
  const hourAngle = (hours + minutes / 60) * 30; // 30° per hour
  const minuteAngle = (minutes + seconds / 60) * 6; // 6° per minute
  const secondAngle = seconds * 6; // 6° per second

  // Hand geometry scales with the face (80px reference: center 40, hour 19,
  // minute 26, second 30 — measured on the live app).
  const c = size / 2;
  const hourLen = size * (19 / 80);
  const minuteLen = size * (26 / 80);
  const secondLen = size * (30 / 80);

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-orb-well shadow-[inset_-4px_-4px_8px_rgba(255,250,244,0.8),inset_4px_4px_8px_rgba(160,143,126,0.28)]"
      style={{ width: size, height: size }}
      role="img"
      aria-label={now ? `Current time ${now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : "Clock"}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" aria-hidden="true">
        {/* Three graded hands (v1.8, measured) — no numerals, no ticks. */}
        <line
          x1={c}
          y1={c}
          x2={c}
          y2={c - hourLen}
          stroke="#5A5A5A"
          strokeWidth={size * (2.5 / 80)}
          strokeLinecap="round"
          transform={`rotate(${hourAngle} ${c} ${c})`}
        />
        <line
          x1={c}
          y1={c}
          x2={c}
          y2={c - minuteLen}
          stroke="#8A8A8A"
          strokeWidth={size * (1.8 / 80)}
          strokeLinecap="round"
          transform={`rotate(${minuteAngle} ${c} ${c})`}
        />
        <line
          x1={c}
          y1={c}
          x2={c}
          y2={c - secondLen}
          stroke="#B8B4B0"
          strokeWidth={size * (1 / 80)}
          strokeLinecap="round"
          transform={`rotate(${secondAngle} ${c} ${c})`}
        />
        <circle cx={c} cy={c} r={size * (2.2 / 80)} fill="#2F2823" />
      </svg>
    </div>
  );
}
