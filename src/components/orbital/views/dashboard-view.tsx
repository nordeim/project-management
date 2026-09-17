"use client";

// Dashboard: greeting + user pill + NEW GOAL (desktop; mobile carries the
// app bar from the shell instead — the greeting header hides below lg),
// the 2×2 panel grid (date card + ring | stats; activity + goals).
// v1.7 re-measure: stats columns are CENTER-aligned with 50.4px/300
// numerals and 12px #665F57 subs; the ring "done" caption is 10px/400;
// the date square stacks day + month flush; activity header pt 20 + mb 14;
// NPA label is the 10px small-label tier with a 13px value; activity rows
// carry the timestamp inside the message row (gap 12, lh 20/18) and the
// goals rows are 13px/500 titles with 11px meta and 14px ring pct.

import { useMemo, useState } from "react";
import { ArrowRight, SquareCheckBig } from "lucide-react";
import { useOrbital } from "@/components/orbital/store";
import { ProgressRing } from "@/components/orbital/progress-ring";
import { UserMenuOrLogin } from "@/components/orbital/user-menu";
import { greetingFor, relativeTime, type ActivityDTO } from "@/lib/orbital";
import { nextPlannedAction } from "@/lib/next-action";
import { NewGoalDialog } from "@/components/orbital/dialogs/new-goal-dialog";

/** Solid icon circle: 30px in feed rows (v1.6), 36px for the activity hero
 *  (v1.7 measured); light purple default, green for task generation; a dark
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

function DateCard() {
  const now = new Date();
  const day = now.getDate();
  const month = now.toLocaleDateString("en-US", { month: "long" });
  const year = now.getFullYear();
  return (
    <div
      className="orb-panel relative h-[150px] flex-1 overflow-hidden lg:h-[180px]"
      role="img"
      aria-label={`Today is ${month} ${day}, ${year}`}
    >
      {/* Bright day landscape — the reference's date-card photo (v1.5,
          extracted from the live app as day-hills.jpg, shown at 0.8 opacity). */}
      <img
        src="/day-hills.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-80"
      />
      {/* Date square: raised panel pinned bottom-left (reference spec:
          radius 12, flush day+month stack — v1.7: no gap between them,
          square measures 80px tall like the live app). */}
      <div className="absolute bottom-2.5 left-3 flex flex-col items-center rounded-[12px] bg-orb-raised px-3 py-2 shadow-[-5px_-5px_10px_rgba(255,250,244,0.78),5px_5px_12px_rgba(160,143,126,0.27)]">
        <p className="text-[clamp(28px,3.5vw,52px)] font-light leading-none tracking-[-0.02em] text-[#2E2A26]">{day}</p>
        <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#7A7470]">
          {month} {year}
        </p>
      </div>
    </div>
  );
}

function StatColumn({
  label,
  labelShort,
  value,
  sub,
  subShort,
  onClick,
}: {
  label: string;
  /** Compact label shown below sm (reference: "BLOCKED" / "COMPLETED"). */
  labelShort: string;
  value: number;
  sub: string;
  /** Compact sub shown below sm (reference: "26 done", "84% total"). */
  subShort: string;
  onClick: () => void;
}) {
  return (
    // v1.7 (measured): live columns are center-aligned with no outer
    // padding — an inner block pads 10px vertically and centers content:
    // 11px/600 label, 50.4px/300 numeral (the date-card clamp face),
    // 12px #665F57 sub.
    <button
      type="button"
      onClick={onClick}
      className="flex min-w-0 flex-1 flex-col items-center self-stretch text-center transition-colors hover:bg-black/[0.02]"
    >
      <div className="flex w-full flex-col items-center px-2 py-[10px]">
        <p className="orb-label">
          <span className="sm:hidden">{labelShort}</span>
          <span className="hidden sm:inline">{label}</span>
        </p>
        <p className="mt-[10px] text-[clamp(28px,3.5vw,52px)] font-light leading-none tracking-[-0.03em] text-orb-heading">
          {value}
        </p>
        <p className="mt-[4px] text-[12px] font-normal text-[#665F57]">
          <span className="sm:hidden">{subShort}</span>
          <span className="hidden sm:inline">{sub}</span>
        </p>
      </div>
    </button>
  );
}

function ActivityRow({ entry }: { entry: ActivityDTO }) {
  return (
    // v1.7 (measured): icon gap 12px; message lh 20 / detail lh 18; the
    // timestamp sits INSIDE the message flex row (right-aligned).
    <li className="flex items-start gap-3 px-[18px] py-[14px]">
      <ActivityIcon type={entry.type} />
      <div className="min-w-0 flex-1">
        <p className="flex items-baseline justify-between gap-3 leading-[20px]">
          <span className="truncate text-[13px] font-medium text-orb-heading">{entry.message}</span>
          <span className="shrink-0 text-[11px] font-normal text-[#767676]">{relativeTime(entry.createdAt)}</span>
        </p>
        {entry.detail ? <p className="truncate text-[12px] leading-[18px] text-orb-muted">{entry.detail}</p> : null}
      </div>
    </li>
  );
}

export function DashboardView() {
  const stats = useOrbital((s) => s.stats);
  const goals = useOrbital((s) => s.goals);
  const activity = useOrbital((s) => s.activity);
  const navigate = useOrbital((s) => s.navigate);
  const [newGoalOpen, setNewGoalOpen] = useState(false);

  const greeting = useMemo(() => greetingFor(new Date()), []);

  const nextPlanned = useMemo(() => nextPlannedAction(activity), [activity]);

  return (
    <div className="w-full">
      {/* Desktop header (reference, v1.6 mobile measurement: the greeting
          header is replaced by the shell's mobile app bar below lg). */}
      <header className="hidden flex-wrap items-start justify-between gap-4 lg:flex">
        <div>
          {/* Reference (v1.5): the greeting is 28px at every breakpoint;
              v1.7: Title Case with a period ("Good Evening."). */}
          <h1 className="text-[28px] font-normal leading-[1.2] tracking-[-0.01em] text-orb-heading">{greeting}</h1>
          <p className="mt-1.5 text-[14px] text-orb-muted">Here&apos;s what&apos;s happening across your projects today.</p>
        </div>
        <div className="flex items-center gap-3">
          <UserMenuOrLogin />
          <button type="button" className="orb-pill-outline" onClick={() => setNewGoalOpen(true)}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            New Goal
          </button>
        </div>
      </header>

      {/* Hero row (reference, v1.5/v1.6/v1.7): a 2×2 grid — top-left cell
          holds the date card + ring card side by side (150px tall on desktop,
          180px on mobile where they stay side by side too), top-right holds
          the stats panel; bottom row = Agent Activity + Goals. Gap 20px. */}
      <section className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2" aria-label="Overview">
        <div className="flex flex-row gap-4">
          <DateCard />
          <button
            type="button"
            onClick={() => navigate("goals")}
            className="orb-panel flex h-[150px] w-[48%] shrink-0 items-center justify-center p-[6px] sm:w-[180px] lg:h-[180px]"
            aria-label={`${stats?.completionRate ?? 0}% of all tasks done. Open goals.`}
          >
            {/* Inset neumorphic circle (reference, v1.5): a plain CSS well —
                no SVG progress ring; big light numerals inside. p-6 on the
                card makes the circle measure 156px (v1.6 measurement). */}
            <div className="flex h-[calc(100%-12px)] w-[calc(100%-12px)] flex-col items-center justify-center rounded-full bg-orb-well shadow-[inset_-4px_-4px_8px_rgba(255,250,244,0.8),inset_4px_4px_8px_rgba(160,143,126,0.28)]">
              <span className="text-[clamp(28px,3.5vw,52px)] font-light leading-none tracking-[-0.03em] text-orb-heading">
                {stats?.completionRate ?? 0}%
              </span>
              {/* v1.7 (measured): 10px/400, ls 0.6px, #767676. */}
              <span className="mt-[2px] text-[10px] font-normal uppercase tracking-[0.06em] text-[#767676]">done</span>
            </div>
          </button>
        </div>
        {/* One unified stats panel with three columns (reference layout:
            whitespace between columns, no divider lines; v1.7: centered
            columns, 16px gap, panel padding 20/24). */}
        <div className="orb-panel flex min-h-[150px] flex-1 items-center gap-4 px-6 py-5 lg:min-h-[180px]" aria-label="Statistics">
          <StatColumn
            label="Active Goals"
            labelShort="Active Goals"
            value={stats?.activeGoals ?? 0}
            sub={`${stats?.totalTasks ?? 0} total tasks`}
            subShort={`${stats?.totalTasks ?? 0} tasks`}
            onClick={() => navigate("goals")}
          />
          <StatColumn
            label="Blocked Tasks"
            labelShort="Blocked"
            value={stats?.blockedTasks ?? 0}
            sub={`${stats?.doneTasks ?? 0} completed`}
            subShort={`${stats?.doneTasks ?? 0} done`}
            onClick={() => navigate("my-tasks")}
          />
          <StatColumn
            label="Completed Tasks"
            labelShort="Completed"
            value={stats?.doneTasks ?? 0}
            sub={`${stats?.completionRate ?? 0}% of total`}
            subShort={`${stats?.completionRate ?? 0}% total`}
            onClick={() => navigate("goals")}
          />
        </div>
      </section>

      {/* Bottom row: Agent Activity (card p-0, full-width rows) + Goals
          (p 20/18/0, inset-well rows) — v1.6 measurements, v1.7 text specs. */}
      <section className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2" aria-label="Activity and goals">
        <div className="orb-panel flex flex-col">
          {/* v1.7 (measured): header pt 20px with mb 14px below. */}
          <div className="flex items-center justify-between px-[18px] pt-5 pb-[14px]">
            <h2 className="flex items-center gap-2">
              {/* Reference (v1.5): a single 7px green dot with a gentle
                  pulse — not Tailwind's expanding ping ring. */}
              <span className="orb-live-dot" aria-hidden="true" />
              <span className="orb-label">Agent Activity</span>
            </h2>
            <button
              type="button"
              className="flex items-center gap-1 text-[13px] font-medium text-orb-muted hover:text-orb-heading"
              onClick={() => navigate("activity")}
            >
              Full log <ArrowRight size={14} />
            </button>
          </div>

          <div className="orb-well mx-[14px] p-[12px_14px]">
            {/* v1.7 (measured): "Next Planned Action" — the 10px small-label
                tier (ls 1px); value 13px/400 #3A3A3A. */}
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#767676]">Next Planned Action</p>
            <p className="mt-1.5 text-[13px] font-normal leading-relaxed text-orb-heading">{nextPlanned}</p>
          </div>

          <ul className="mt-2 divide-y divide-black/[0.04]">
            {activity.slice(0, 5).map((entry) => (
              <ActivityRow key={entry.id} entry={entry} />
            ))}
          </ul>
        </div>

        <div className="orb-panel pb-0 pl-[18px] pr-[18px] pt-5">
          {/* v1.7 (measured): header margin-bottom 20px. */}
          <div className="mb-5 flex items-center justify-between">
            <h2 className="orb-label">Goals</h2>
            <button
              type="button"
              className="flex items-center gap-1 text-[13px] font-medium text-orb-muted hover:text-orb-heading"
              onClick={() => navigate("goals")}
            >
              Full log <ArrowRight size={14} />
            </button>
          </div>
          <ul className="space-y-[10px] pb-[18px]">
            {goals.slice(0, 5).map((goal) => {
              const pct = goal.taskCount > 0 ? Math.round((goal.doneCount / goal.taskCount) * 100) : 0;
              return (
                <li key={goal.id}>
                  <button
                    type="button"
                    onClick={() => navigate("goal-detail", goal.id)}
                    className="orb-well flex w-full items-center gap-[10px] p-[12px_14px] text-left transition-transform hover:-translate-y-0.5"
                  >
                    <div className="min-w-0 flex-1">
                      {/* v1.7 (measured): 13px/500 titles, 11px meta. */}
                      <p className="truncate text-[13px] font-medium text-orb-heading">{goal.title}</p>
                      <p className="mt-0.5 text-[11px] font-normal text-[#767676]">
                        {goal.doneCount}/{goal.taskCount} tasks · {goal.blockedCount > 0 ? `${goal.blockedCount} blocked` : "on track"}
                      </p>
                    </div>
                    <ProgressRing value={pct} size={60} thickness={5.5}>
                      <span className="text-[14px] font-medium text-orb-heading">{pct}%</span>
                    </ProgressRing>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <NewGoalDialog open={newGoalOpen} onOpenChange={setNewGoalOpen} />
    </div>
  );
}
