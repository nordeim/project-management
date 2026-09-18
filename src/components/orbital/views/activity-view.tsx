"use client";

// Agent Activity: full transparency feed (v1.8, re-measured): header with
// an inset-well online pill (dot + "Online · N" in 11px/600) aligned to the
// h1 top, the most recent entry as a standalone hero card (deeper tier,
// 36px FIXED search icon — the "last agent action" marker — with the
// "Last agent action" caption, no timestamp), then date-grouped PLAIN rows
// ("Thu Jul 16 2026" small labels) on the canvas — no card wrapper —
// separated by 1px rgba(160,143,126,0.15) hairlines. Every group row ends
// with a type tag (10px/600 #B3B3B3 uppercase) from the pure activity-tags
// seam; the icon mapping lives in the tested activity-icons seam. Grouping
// lives in src/lib/activity-groups.ts.

import { useMemo } from "react";
import { Search, SquareCheckBig } from "lucide-react";
import { useOrbital } from "@/components/orbital/store";
import { EmptyState } from "@/components/orbital/empty-state";
import { relativeTime, type ActivityDTO } from "@/lib/orbital";
import { groupActivityByDate } from "@/lib/activity-groups";
import { activityTypeTag } from "@/lib/activity-tags";
import { activityIconFor } from "@/lib/activity-icons";
import { ActivityIcon } from "@/components/orbital/views/activity-icon";

function FeedRow({ entry, divider }: { entry: ActivityDTO; divider: boolean }) {
  return (
    // v1.8 (measured): plain canvas rows — pad 14px 18px, icon gap 12px,
    // message lh 20 / detail lh 18, the timestamp INSIDE the message row,
    // a type tag closing the row, and a hairline divider between rows
    // (rgba(160,143,126,0.15) — no card wrapper on the group).
    <li className={`flex items-start gap-3 px-[18px] py-[14px] ${divider ? "border-b border-[rgba(160,143,126,0.15)]" : ""}`}>
      <ActivityIcon type={entry.type} />
      <div className="min-w-0 flex-1">
        <p className="flex items-baseline justify-between gap-3 leading-[20px]">
          <span className="truncate text-[13px] font-medium text-orb-heading">{entry.message}</span>
          <span className="shrink-0 text-[11px] font-normal leading-[16.5px] text-[#767676]">{relativeTime(entry.createdAt)}</span>
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
      {/* v1.8 (measured): the online pill aligns with the h1 top (y=48) —
          items-start on the header row. */}
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-normal leading-[1.2] tracking-[-0.01em] text-orb-heading">Agent Activity</h1>
          <p className="mt-1 text-[14px] text-orb-muted">Full transparency — every action the agent takes</p>
        </div>
        {/* v1.7 (measured): the online indicator is an inset well pill
            (h 31px) — dot + "Online · N" at 11px/600 in #3A3A3A. */}
        <p className="orb-well-pill mt-1 flex h-[31px] shrink-0 items-center gap-2 px-3 text-[11px] font-semibold text-orb-heading">
          <span className="orb-live-dot" aria-hidden="true" />
          Online <span aria-hidden="true">·</span> {activity.length}
        </p>
      </header>

      {hero ? (
        // v1.8 (measured): hero card — deeper tier (r14, pad 14/18), the
        // FIXED 16px search glyph in the 36px purple circle ("last agent
        // action" marker — not the entry-type icon), message, and the
        // caption "Last agent action" (12px/400 #767676); no timestamp;
        // mb 24px.
        <div className="orb-row-card mb-6 mt-5 p-[14px_18px]">
          <div className="flex items-start gap-3">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#2F2823]"
              style={{ backgroundColor: "#C9B3F5" }}
              aria-hidden="true"
            >
              <Search size={16} strokeWidth={1.5} />
            </span>
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
              {/* v1.8 (measured): NO card wrapper — plain rows with hairline
                  dividers, directly on the canvas. */}
              <ul>
                {group.entries.map((entry, index) => (
                  <FeedRow
                    key={entry.id}
                    entry={entry}
                    divider={index < group.entries.length - 1}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
