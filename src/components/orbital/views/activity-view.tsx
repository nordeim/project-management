"use client";

// Agent Activity: full transparency feed (v1.8, re-measured; grouping
// semantics corrected v2.5, card wrapper added v2.6): header with an
// inset-well online pill (dot + "Online · N" in 11px/600) aligned to the
// h1 top, the most recent entry as a standalone hero card (deeper tier,
// 36px FIXED search icon — the "last agent action" marker — with the
// "Last agent action" caption, no timestamp), then date-grouped rows
// ("Thu Jul 16 2026" small labels) WRAPPED IN ONE BIG RADIUS-14 CARD
// carrying the deeper pair (v2.6, measured on the live — the v1.9
// "plain rows, no card wrapper" reading retired), separated by 1px
// rgba(160,143,126,0.15) hairlines. v2.5: the hero entry ALSO renders as
// the first row of its date group — "Online · N" equals the count of
// timestamped rows. Every group row ends with a type tag (10px/600
// #B3B3B3 uppercase) from the pure activity-tags seam; the icon mapping
// lives in the tested activity-icons seam. Grouping lives in
// src/lib/activity-groups.ts.

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
    // v1.9 (measured): plain canvas rows — pad 14px 18px, icon gap 14px,
    // message lh 19.5 / detail lh 18, the timestamp INSIDE the message row,
    // a type tag closing the row, and a hairline divider between rows
    // (rgba(160,143,126,0.15) — no card wrapper on the group).
    <li className={`flex items-start gap-[14px] px-[18px] py-[14px] ${divider ? "border-b border-[rgba(160,143,126,0.15)]" : ""}`}>
      <ActivityIcon type={entry.type} />
      <div className="min-w-0 flex-1">
        <p className="flex items-baseline justify-between gap-3 leading-[19.5px]">
          <span className="truncate text-[13px] font-medium text-orb-heading">{entry.message}</span>
          <span className="shrink-0 text-[11px] font-normal leading-[16.5px] text-[#767676]">{relativeTime(entry.createdAt)}</span>
        </p>
        {entry.detail ? <p className="mt-[3px] truncate text-[12px] leading-[18px] text-orb-muted">{entry.detail}</p> : null}
        <p className="mt-[4px] text-[10px] font-semibold uppercase tracking-[0.1em] text-[#B3B3B3]">
          {activityTypeTag(entry.type)}
        </p>
      </div>
    </li>
  );
}

export function ActivityView() {
  const activity = useOrbital((s) => s.activity);

  // The most recent entry renders as the hero card above the date groups
  // AND repeats as the first row of its group (v2.5, measured on the live:
  // "Online · 36" with 36 timestamped rows).
  const hero = activity[0] ?? null;
  const groups = useMemo(() => groupActivityByDate(activity), [activity]);

  return (
    <div className="w-full px-3 pt-6 md:px-7 lg:px-0 lg:pt-0">
      {/* v1.8 (measured): the online pill aligns with the h1 top (y=48) —
          items-start on the header row. */}
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-normal leading-[1.2] tracking-[-0.01em] text-orb-heading">Agent Activity</h1>
          <p className="mt-1 text-[14px] text-orb-muted">Full transparency — every action the agent takes</p>
        </div>
        {/* v1.9 (measured): the online pill aligns with the h1 top (y=48) —
            items-start on the header row. pad 7px 12px (h ≈ 30.5), gap 6px,
            radius 9999, inset well pair. "Online" is 11px/600 #3A3A3A and
            the "· N" count is 11px/400 #767676. v2.10 (re-measured): the
            live restructured the pill into three flex children — [7px dot
            span][Online span][· N span] — so the text runs "Online· 36"
            (no space before the separator; the old text-node layout read
            "Online · 36" at 96 wide), and the live's "Online" span carries
            ls 0.66px (the count span stays ls-normal). v2.10 (re-probed):
            the pill is a DIV (not a <p>), and the live computes 101×30.5 —
            its width delta vs the clone's 103 is the FONT: the live serves
            no DM Sans file (font-family falls back to system-ui — a Base44
            platform artifact); the clone's self-hosted DM Sans advances
            ~2px wider at identical fs/fw/ls (verified on both). */}
        <div className="orb-well-pill flex shrink-0 items-center gap-[6px] px-3 py-[7px]">
          <span className="orb-live-dot" aria-hidden="true" />
          <span className="text-[11px] font-semibold tracking-[0.66px] text-orb-heading">Online</span>
          <span className="text-[11px] font-normal tracking-normal text-[#767676]" aria-hidden="true">· {activity.length}</span>
        </div>
      </header>

      {hero ? (
        // v1.9 (measured): hero card — deeper tier (r14, pad 14/18), the
        // row aligns CENTER with a 14px gap, the FIXED 16px search glyph
        // in the 36px purple circle (#2A2A2A), message 13px/500 lh 19.5,
        // and the caption "Last agent action" (12px/400 #767676); no
        // timestamp; mb 24px.
        <div className="orb-row-card mb-6 mt-5 p-[14px_18px]">
          <div className="flex items-center gap-[14px]">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#2A2A2A]"
              style={{ backgroundColor: "#C9B3F5" }}
              aria-hidden="true"
            >
              <Search size={16} strokeWidth={1.5} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="mb-[2px] text-[13px] font-medium leading-[19.5px] text-orb-heading">{hero.message}</p>
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
              {/* v2.6 (measured live): the label renders as an inline span
                  inside a 24px LINE BOX whose margin-bottom is 10px.
                  v2.10 (re-probed): the live keeps the 24px parent line box
                  but the SPAN itself computes lh 15px — pin both exactly. */}
              <div className="mb-[10px] leading-6">
                <span className="orb-label-sm leading-[15px]">{group.label}</span>
              </div>
              {/* v2.6 (measured live): the group's rows are wrapped in ONE
                  big radius-14 card carrying the DEEPER pair (like the
                  hero) — the v1.9 "no card wrapper" reading retired. */}
              <div className="orb-row-card overflow-hidden">
                <ul>
                  {group.entries.map((entry, index) => (
                    <FeedRow
                      key={entry.id}
                      entry={entry}
                      divider={index < group.entries.length - 1}
                    />
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
