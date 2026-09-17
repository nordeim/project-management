"use client";

// Agent Activity: full transparency feed (v1.6, measured): header with the
// online indicator (count only), the most recent entry as a standalone hero
// card, then date-grouped rows ("Thu Jul 16 2026" uppercase labels) each
// wrapped in ONE big radius-14 deeper-tier card with dividers between rows.
// Grouping lives in the pure seam src/lib/activity-groups.ts (unit tested).

import { useMemo } from "react";
import { SquareCheckBig } from "lucide-react";
import { useOrbital } from "@/components/orbital/store";
import { EmptyState } from "@/components/orbital/empty-state";
import { relativeTime, type ActivityDTO } from "@/lib/orbital";
import { groupActivityByDate } from "@/lib/activity-groups";

/** Solid 30px icon circle (v1.6, measured): light purple default, green for
 *  task generation; a 13px dark square-check glyph sits inside. */
function ActivityIcon({ type }: { type: string }) {
  const green = type === "tasks_generated";
  return (
    <span
      className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full text-[#2F2823]"
      style={{ backgroundColor: green ? "#2ECC8A" : "#C9B3F5" }}
      aria-hidden="true"
    >
      <SquareCheckBig size={13} strokeWidth={1.5} />
    </span>
  );
}

function FeedRow({ entry }: { entry: ActivityDTO }) {
  return (
    <li className="flex items-start gap-[18px] px-[18px] py-[14px]">
      <ActivityIcon type={entry.type} />
      <div className="min-w-0 flex-1 leading-6">
        <p className="truncate text-[13px] font-medium text-orb-heading">{entry.message}</p>
        <p className="truncate text-[12px] text-orb-muted">{entry.detail}</p>
      </div>
      <span className="shrink-0 pt-0.5 text-[11px] text-orb-muted">{relativeTime(entry.createdAt)}</span>
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
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-normal tracking-tight text-orb-heading">Agent Activity</h1>
          <p className="mt-1 text-[14px] text-orb-muted">Full transparency — every action the agent takes</p>
        </div>
        {/* Reference (v1.6, measured): the online indicator shows the count
            only — "Online · 36" — with a small green live dot. */}
        <p className="flex items-center gap-2 pb-1 text-[13.5px] text-orb-body">
          <span className="orb-live-dot" aria-hidden="true" />
          Online <span aria-hidden="true">·</span> {activity.length}
        </p>
      </header>

      {hero ? (
        <div className="orb-row-card mt-6 p-[14px_18px]">
          <div className="flex items-start gap-[18px]">
            <ActivityIcon type={hero.type} />
            <div className="min-w-0 flex-1 leading-6">
              <p className="text-[13px] font-medium text-orb-heading">{hero.message}</p>
              <p className="truncate text-[12px] text-orb-muted">{hero.detail}</p>
            </div>
            <span className="shrink-0 pt-0.5 text-[11px] text-orb-muted">{relativeTime(hero.createdAt)}</span>
          </div>
        </div>
      ) : null}

      {activity.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<SquareCheckBig size={22} />}
            title="No agent activity yet"
            description="The AI assistant logs every action here — create a goal to see it draft a plan."
          />
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {groups.map((group) => (
            <section key={group.key} aria-label={group.label}>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#767676]">{group.label}</p>
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
