"use client";

// Agent Activity: full transparency feed (v1.6/v1.7, measured): header with
// an inset-well online pill (dot + "Online · N" in 11px/600), the most
// recent entry as a standalone hero card (36px icon, "Last agent action"
// caption, no timestamp), then date-grouped rows ("Thu Jul 16 2026" small
// labels) each wrapped in ONE big radius-14 deeper-tier card with dividers.
// v1.7: every group row ends with a type tag (10px/600 #B3B3B3 uppercase)
// derived from the entry type via the pure activity-tags seam. Grouping
// lives in src/lib/activity-groups.ts; both seams are unit-tested.

import { useMemo } from "react";
import { SquareCheckBig } from "lucide-react";
import { useOrbital } from "@/components/orbital/store";
import { EmptyState } from "@/components/orbital/empty-state";
import { relativeTime, type ActivityDTO } from "@/lib/orbital";
import { groupActivityByDate } from "@/lib/activity-groups";
import { activityTypeTag } from "@/lib/activity-tags";

/** Solid icon circle: 30px in feed rows (v1.6), 36px for the hero (v1.7,
 *  measured); light purple default, green for task generation; a dark
 *  square-check glyph sits inside. */
function ActivityIcon({ type, size = 30 }: { type: string; size?: number }) {
  const green = type === "tasks_generated";
  const glyph = size >= 36 ? 16 : 13;
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full text-[#2F2823]"
      style={{ backgroundColor: green ? "#2ECC8A" : "#C9B3F5", width: size, height: size }}
      aria-hidden="true"
    >
      <SquareCheckBig size={glyph} strokeWidth={1.5} />
    </span>
  );
}

function FeedRow({ entry }: { entry: ActivityDTO }) {
  return (
    // v1.7 (measured): icon gap 12px; message lh 20 / detail lh 18; the
    // timestamp sits INSIDE the message flex row; a type tag closes the row.
    <li className="flex items-start gap-3 px-[18px] py-[14px]">
      <ActivityIcon type={entry.type} />
      <div className="min-w-0 flex-1">
        <p className="flex items-baseline justify-between gap-3 leading-[20px]">
          <span className="truncate text-[13px] font-medium text-orb-heading">{entry.message}</span>
          <span className="shrink-0 text-[11px] font-normal text-[#767676]">{relativeTime(entry.createdAt)}</span>
        </p>
        {entry.detail ? <p className="truncate text-[12px] leading-[18px] text-orb-muted">{entry.detail}</p> : null}
        <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#B3B3B3]">
          {activityTypeTag(entry.type)}
        </p>
      </div>
    </li>
  );
}

export function ActivityView() {
  const activity = useOrbital((s) => s.activity);

  // The most recent entry renders as the hero card above the date groups;
  // the rest group under date labels (newest day first).
  const hero = activity[0] ?? null;
  const groups = useMemo(() => groupActivityByDate(activity.slice(1)), [activity]);

  return (
    <div className="w-full">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-normal leading-[1.2] tracking-tight text-orb-heading">Agent Activity</h1>
          <p className="mt-1 text-[14px] text-orb-muted">Full transparency — every action the agent takes</p>
        </div>
        {/* v1.7 (measured): the online indicator is an inset well pill
            (h 31px) — dot + "Online · N" at 11px/600 in #3A3A3A. */}
        <p className="orb-well-pill flex h-[31px] items-center gap-2 px-3 text-[11px] font-semibold text-orb-heading">
          <span className="orb-live-dot" aria-hidden="true" />
          Online <span aria-hidden="true">·</span> {activity.length}
        </p>
      </header>

      {hero ? (
        // v1.7 (measured): hero card — 36px icon, message, and the caption
        // "Last agent action" (12px/400 #767676); no timestamp; mb 24px.
        <div className="orb-row-card mb-6 mt-5 p-[14px_18px]">
          <div className="flex items-start gap-3">
            <ActivityIcon type={hero.type} size={36} />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium leading-[20px] text-orb-heading">{hero.message}</p>
              <p className="text-[12px] font-normal leading-[18px] text-[#767676]">Last agent action</p>
            </div>
          </div>
        </div>
      ) : null}

      {activity.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<SquareCheckBig size={22} color="#B3B3B3" />}
            title="No agent activity yet"
            description="The AI assistant logs every action here — create a goal to see it draft a plan."
          />
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <section key={group.key} aria-label={group.label}>
              <p className="orb-label-sm mb-2">{group.label}</p>
              <ul className="orb-row-card divide-y divide-black/[0.04]">
                {group.entries.map((entry) => (
                  <FeedRow key={entry.id} entry={entry} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
