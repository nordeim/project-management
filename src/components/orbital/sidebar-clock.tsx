"use client";

// Sidebar clock: the reference app's neumorphic analog clock — white face,
// soft inner shadow, thin dark hands, no numerals. Reads the wall clock
// through useSyncExternalStore (15s buckets) so there is no setState-in-
// effect and no hydration mismatch: the server snapshot renders 00:00 and
// the client corrects on the first paint after hydration.

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

export function SidebarClock() {
  const bucket = useSyncExternalStore(subscribe, getBucket, getServerBucket);
  const now = bucket === 0 ? null : new Date(bucket * BUCKET_MS);

  const hours = now ? now.getHours() % 12 : 0;
  const minutes = now ? now.getMinutes() : 0;
  const hourAngle = (hours + minutes / 60) * 30; // 30° per hour
  const minuteAngle = minutes * 6; // 6° per minute

  return (
    <div
      className="flex h-[84px] w-[84px] shrink-0 items-center justify-center rounded-full bg-white shadow-[inset_2px_2px_5px_rgba(47,40,35,0.10),inset_-2px_-2px_5px_rgba(255,255,255,0.9),0_1px_2px_rgba(47,40,35,0.06)]"
      role="img"
      aria-label={now ? `Current time ${now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : "Clock"}
    >
      <svg width="58" height="58" viewBox="0 0 52 52" fill="none" aria-hidden="true">
        {/* face */}
        <circle cx="26" cy="26" r="24" fill="#FFFFFF" stroke="rgba(47,40,35,0.06)" strokeWidth="1" />
        {/* hands (no numerals, no ticks — reference style) */}
        <line
          x1="26"
          y1="26"
          x2="26"
          y2="15"
          stroke="#2F2823"
          strokeWidth="2.6"
          strokeLinecap="round"
          transform={`rotate(${hourAngle} 26 26)`}
        />
        <line
          x1="26"
          y1="26"
          x2="26"
          y2="10"
          stroke="#2F2823"
          strokeWidth="1.8"
          strokeLinecap="round"
          transform={`rotate(${minuteAngle} 26 26)`}
        />
        <circle cx="26" cy="26" r="1.9" fill="#2F2823" />
      </svg>
    </div>
  );
}
