"use client";

// Dashboard (v1.8, re-measured side-by-side): the desktop layout is a
// VIEWPORT-FILLING 2×2 grid — the shell pins the main column to the viewport
// height, the grid's bottom row is 1fr, the Agent Activity panel renders ALL
// feed entries inside an overflow-hidden rows container, and the Goals panel
// stretches to match. Stats columns wrap the numeral in an 88px flex-centered
// box (104px on mobile) with a 10px label margin, so the vertical rhythm
// matches the live app. The icon mapping lives in the tested activity-icons
// seam; row dividers are rgba(160,143,126,0.15).

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useOrbital } from "@/components/orbital/store";
import { ProgressRing } from "@/components/orbital/progress-ring";
import { UserMenuOrLogin } from "@/components/orbital/user-menu";
import { ActivityIcon } from "@/components/orbital/views/activity-icon";
import { greetingFor, relativeTime, type ActivityDTO } from "@/lib/orbital";
import { nextPlannedAction } from "@/lib/next-action";
import { NewGoalDialog } from "@/components/orbital/dialogs/new-goal-dialog";

function DateCard() {
  const now = new Date();
  const day = now.getDate();
  const month = now.toLocaleDateString("en-US", { month: "long" });
  const year = now.getFullYear();
  return (
    <div
      className="orb-panel relative h-[150px] flex-1 overflow-hidden p-[10px_12px] lg:h-[180px]"
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
      {/* Date square (v1.8, measured): raised panel pinned bottom-left —
          radius 12, pad 8px 12px (115px wide), flush day+month stack. */}
      <div className="absolute bottom-2.5 left-3 flex flex-col items-center rounded-[12px] bg-orb-raised px-[12px] py-[8px] shadow-[-5px_-5px_10px_rgba(255,250,244,0.78),5px_5px_12px_rgba(160,143,126,0.27)]">
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
    // v1.8 (measured): MOBILE — fixed 104px columns, no inner padding,
    // label mb-6, a 104px number box, sub mt-6 (148px column), compact
    // label/sub wording. DESKTOP — flex-1 columns with a 10px 8px inner
    // block, label mb-10, an 88px number box, sub mt-4 (~157px column
    // that the panel centers). The display:none variant is skipped by
    // screen readers, so the wording swap is a11y-clean.
    <button
      type="button"
      onClick={onClick}
      className="flex w-[104px] flex-none flex-col items-center text-center transition-colors hover:bg-black/[0.02] sm:min-w-0 sm:flex-1"
    >
      <div className="flex w-full flex-col items-center sm:px-2 sm:py-[10px]">
        <p className="orb-label mb-[6px] whitespace-nowrap sm:mb-[10px]">
          <span className="sm:hidden">{labelShort}</span>
          <span className="hidden sm:inline">{label}</span>
        </p>
        <div className="flex h-[104px] w-full items-center justify-center sm:h-[88px]">
          <span className="text-[clamp(28px,3.5vw,52px)] font-light leading-none tracking-[-0.03em] text-orb-heading">
            {value}
          </span>
        </div>
        <p className="mt-[6px] text-[12px] font-normal text-[#665F57] sm:mt-[4px]">
          <span className="sm:hidden">{subShort}</span>
          <span className="hidden sm:inline">{sub}</span>
        </p>
      </div>
    </button>
  );
}

function ActivityRow({ entry, divider }: { entry: ActivityDTO; divider: boolean }) {
  return (
    // v1.8 (measured): icon gap 12px; message lh 20 / detail lh 18; the
    // timestamp sits INSIDE the message flex row (right-aligned); the
    // dashboard rows divide with 1px rgba(163,163,163,0.18) (the feed
    // uses the warmer rgba(160,143,126,0.15)).
    <li className={`flex items-start gap-3 px-[18px] py-[14px] ${divider ? "border-b border-[rgba(163,163,163,0.18)]" : ""}`}>
      <ActivityIcon type={entry.type} />
      <div className="min-w-0 flex-1">
        <p className="flex items-baseline justify-between gap-3 leading-[20px]">
          <span className="truncate text-[13px] font-medium text-orb-heading">{entry.message}</span>
          <span className="shrink-0 text-[11px] font-normal leading-[16.5px] text-[#767676]">{relativeTime(entry.createdAt)}</span>
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
    <div className="w-full lg:flex lg:h-full lg:min-h-0 lg:flex-col">
      {/* Desktop header (reference, v1.6 mobile measurement: the greeting
          header is replaced by the shell's mobile app bar below lg). */}
      <header className="hidden flex-wrap items-start justify-between gap-4 lg:flex">
        <div>
          {/* Reference (v1.5): the greeting is 28px at every breakpoint;
              v1.7: Title Case with a period ("Good Evening."). */}
          <h1 className="text-[28px] font-normal leading-[1.2] tracking-[-0.01em] text-orb-heading">{greeting}</h1>
          <p className="mt-1.5 text-[14px] text-orb-muted">Here&apos;s what&apos;s happening across your projects today.</p>
        </div>
        <div className="flex items-start gap-3">
          <UserMenuOrLogin />
          <button type="button" className="orb-pill-outline self-start" onClick={() => setNewGoalOpen(true)}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            New Goal
          </button>
        </div>
      </header>

      {/* v1.8 (measured): ONE grid — top row 180px (date+ring | stats),
          bottom row 1fr so both panels stretch to the viewport bottom on
          desktop. Below lg the rows stack at content height. */}
      <section
        className="mt-4 grid flex-1 grid-cols-1 gap-5 lg:mt-5 lg:min-h-0 lg:grid-cols-2 lg:grid-rows-[180px_minmax(0,1fr)]"
        aria-label="Overview"
      >
        {/* Top-left cell: date card + ring side by side (150px mobile). */}
        <div className="flex min-h-0 flex-row gap-4">
          <DateCard />
          <button
            type="button"
            onClick={() => navigate("goals")}
            className="orb-panel flex h-[150px] w-[48%] shrink-0 items-center justify-center p-[6px] sm:w-[180px] lg:h-[180px]"
            aria-label={`${stats?.completionRate ?? 0}% of all tasks done. Open goals.`}
          >
            {/* Inset neumorphic circle (reference, v1.5): a plain CSS well —
                no SVG progress ring; big light numerals inside. */}
            <div className="flex h-[calc(100%-12px)] w-[calc(100%-12px)] flex-col items-center justify-center rounded-full bg-orb-well shadow-[inset_-4px_-4px_8px_rgba(255,250,244,0.8),inset_4px_4px_8px_rgba(160,143,126,0.28)]">
              <span className="text-[clamp(28px,3.5vw,52px)] font-light leading-none tracking-[-0.03em] text-orb-heading">
                {stats?.completionRate ?? 0}%
              </span>
              {/* v1.7 (measured): 10px/400, ls 0.6px, #767676. */}
              <span className="mt-[2px] text-[10px] font-normal uppercase tracking-[0.06em] text-[#767676]">done</span>
            </div>
          </button>
        </div>

        {/* Top-right cell: the three-column stats panel (v1.8 mobile
            measurements: card pad 14/10, 7px column gaps; desktop 20/24,
            16px gaps). */}
        <div className="orb-panel flex min-h-[150px] flex-1 items-center gap-[7px] px-[10px] py-[14px] sm:gap-4 sm:px-6 sm:py-5 lg:min-h-[180px]" aria-label="Statistics">
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

        {/* Bottom-left cell: Agent Activity — ALL entries, clipped. */}
        <div className="orb-panel flex min-h-0 flex-col overflow-hidden">
          {/* v1.8 (measured): header container 38px tall (pt 20 + label)
              with a 14px bottom margin; the NPA well then adds its own
              14px top margin — net 29px between the header text and the
              well, matching the live geometry (NPA top at panel.y + 66). */}
          <div className="mb-[14px] flex shrink-0 items-center justify-between px-[18px] pt-5">
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

          <div className="orb-well mx-[14px] mt-[14px] shrink-0 p-[12px_14px]">
            {/* v1.7 (measured): "Next Planned Action" — the 10px small-label
                tier (ls 1px); value 13px/400 #3A3A3A, lh 19.5px (v1.8). */}
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#767676]">Next Planned Action</p>
            <p className="mt-1.5 text-[13px] font-normal leading-[19.5px] text-orb-heading">{nextPlanned}</p>
          </div>

          {/* v1.8 (measured): ALL feed entries render inside an
              overflow-hidden container — the panel clips at the viewport
              bottom exactly like the live app. */}
          <ul className="mt-[14px] min-h-0 flex-1 overflow-hidden">
            {activity.map((entry, index) => (
              <ActivityRow key={entry.id} entry={entry} divider={index < activity.length - 1} />
            ))}
          </ul>
        </div>

        {/* Bottom-right cell: Goals panel. */}
        <div className="orb-panel min-h-0 pb-0 pl-[18px] pr-[18px] pt-5">
          {/* v1.7 (measured): header margin-bottom 20px. */}
          <div className="mb-5 flex shrink-0 items-center justify-between">
            <h2 className="orb-label">Goals</h2>
            <button
              type="button"
              className="flex items-center gap-1 text-[13px] font-medium text-orb-muted hover:text-orb-heading"
              onClick={() => navigate("goals")}
            >
              Full log <ArrowRight size={14} />
            </button>
          </div>
          <ul className="space-y-[6px] pb-[18px]">
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
