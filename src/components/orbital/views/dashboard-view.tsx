"use client";

// Dashboard: greeting + user pill + NEW GOAL (desktop; mobile carries the
// app bar from the shell instead — the greeting header hides below lg),
// the 2×2 panel grid (date card + ring | stats; activity + goals), with the
// v1.6 measured specs: 20px grid gap, .orb-panel tier on all four panels,
// ring card p-6, stats p 20/24 with 10/8 columns, activity card p-0 with
// full-width rows, goals card p 20/18/0 with inset-well rows + 60px rings.

import { useMemo, useState } from "react";
import { ArrowRight, SquareCheckBig } from "lucide-react";
import { useOrbital } from "@/components/orbital/store";
import { ProgressRing } from "@/components/orbital/progress-ring";
import { UserMenuOrLogin } from "@/components/orbital/user-menu";
import { relativeTime, type ActivityDTO } from "@/lib/orbital";
import { nextPlannedAction } from "@/lib/next-action";
import { NewGoalDialog } from "@/components/orbital/dialogs/new-goal-dialog";

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

function DateCard() {
  const now = new Date();
  const day = now.getDate();
  const month = now.toLocaleDateString("en-US", { month: "long" });
  const year = now.getFullYear();
  return (
    <div
      className="orb-panel relative h-[180px] flex-1 overflow-hidden"
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
          radius 12 — bg color utility + shadow utility, no custom class,
          per the cascade rule). */}
      <div className="absolute bottom-2.5 left-3 flex flex-col items-center rounded-[12px] bg-orb-raised px-3 py-2 shadow-[-5px_-5px_10px_rgba(255,250,244,0.78),5px_5px_12px_rgba(160,143,126,0.27)]">
        <p className="text-[clamp(28px,3.5vw,52px)] font-light leading-none tracking-[-0.02em] text-[#2E2A26]">{day}</p>
        <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#7A7470]">
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
    <button
      type="button"
      onClick={onClick}
      className="flex min-w-0 flex-1 flex-col items-start justify-between gap-6 self-stretch p-[10px_8px] text-left transition-colors hover:bg-black/[0.02] sm:gap-8"
    >
      <p className="orb-label">
        <span className="sm:hidden">{labelShort}</span>
        <span className="hidden sm:inline">{label}</span>
      </p>
      <div>
        <p className="text-[44px] font-normal leading-none text-orb-heading">{value}</p>
        <p className="mt-1.5 text-[13px] text-orb-muted">
          <span className="sm:hidden">{subShort}</span>
          <span className="hidden sm:inline">{sub}</span>
        </p>
      </div>
    </button>
  );
}

function ActivityRow({ entry }: { entry: ActivityDTO }) {
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
          {/* Reference (v1.5): the greeting is 28px at every breakpoint. */}
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

      {/* Hero row (reference, v1.5/v1.6): a 2×2 grid — top-left cell holds
          the date card + 180px ring card side by side (side by side on every
          breakpoint, measured on mobile too), top-right holds the stats
          panel; bottom row = Agent Activity + Goals at equal widths.
          Gap is 20px (v1.6 measurement). */}
      <section className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2" aria-label="Overview">
        <div className="flex flex-row gap-4">
          <DateCard />
          <button
            type="button"
            onClick={() => navigate("goals")}
            className="orb-panel flex h-[180px] w-[44%] shrink-0 items-center justify-center p-[6px] sm:w-[180px]"
            aria-label={`${stats?.completionRate ?? 0}% of all tasks done. Open goals.`}
          >
            {/* Inset neumorphic circle (reference, v1.5): a plain CSS well —
                no SVG progress ring; big light numerals inside. p-6 on the
                card makes the circle measure 156px (v1.6 measurement). */}
            <div className="flex h-[calc(100%-12px)] w-[calc(100%-12px)] flex-col items-center justify-center rounded-full bg-orb-well shadow-[inset_-4px_-4px_8px_rgba(255,250,244,0.8),inset_4px_4px_8px_rgba(160,143,126,0.28)]">
              <span className="text-[clamp(28px,3.5vw,52px)] font-light leading-none tracking-[-0.03em] text-orb-heading">
                {stats?.completionRate ?? 0}%
              </span>
              <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-orb-muted">done</span>
            </div>
          </button>
        </div>
        {/* One unified stats panel with three columns (reference layout:
            whitespace between columns, no divider lines; v1.6: panel
            padding 20/24, columns 10/8). */}
        <div className="orb-panel flex min-h-[180px] flex-1 items-stretch gap-1 py-5 pr-6 pl-5 sm:pl-6" aria-label="Statistics">
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
          (p 20/18/0, inset-well rows) — v1.6 measurements. */}
      <section className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2" aria-label="Activity and goals">
        <div className="orb-panel flex flex-col">
          <div className="flex items-center justify-between px-[18px] pt-[14px]">
            <h2 className="flex items-center gap-2 text-[15px] font-semibold text-orb-heading">
              {/* Reference (v1.5): a single 7px green dot with a gentle
                  pulse — not Tailwind's expanding ping ring. */}
              <span className="orb-live-dot" aria-hidden="true" />
              <span className="orb-label !text-[12px] !font-semibold">Agent Activity</span>
            </h2>
            <button
              type="button"
              className="flex items-center gap-1 text-[13px] font-medium text-orb-muted hover:text-orb-heading"
              onClick={() => navigate("activity")}
            >
              Full log <ArrowRight size={14} />
            </button>
          </div>

          <div className="orb-well mx-[14px] mt-[14px] p-[12px_14px]">
            <p className="orb-label">Next planned action</p>
            <p className="mt-1.5 text-[14px] leading-relaxed text-orb-body">{nextPlanned}</p>
          </div>

          <ul className="mt-2 divide-y divide-black/[0.04]">
            {activity.slice(0, 5).map((entry) => (
              <ActivityRow key={entry.id} entry={entry} />
            ))}
          </ul>
        </div>

        <div className="orb-panel pb-0 pl-[18px] pr-[18px] pt-5">
          <div className="flex items-center justify-between">
            <h2 className="orb-label !text-[12px] !font-semibold">Goals</h2>
            <button
              type="button"
              className="flex items-center gap-1 text-[13px] font-medium text-orb-muted hover:text-orb-heading"
              onClick={() => navigate("goals")}
            >
              Full log <ArrowRight size={14} />
            </button>
          </div>
          <ul className="space-y-2 py-4">
            {goals.slice(0, 5).map((goal) => {
              const pct = goal.taskCount > 0 ? Math.round((goal.doneCount / goal.taskCount) * 100) : 0;
              return (
                <li key={goal.id}>
                  <button
                    type="button"
                    onClick={() => navigate("goal-detail", goal.id)}
                    className="orb-well flex w-full items-center gap-4 p-[12px_14px] text-left transition-transform hover:-translate-y-0.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold text-orb-heading">{goal.title}</p>
                      <p className="mt-0.5 text-[12px] text-orb-muted">
                        {goal.doneCount}/{goal.taskCount} tasks · {goal.blockedCount > 0 ? `${goal.blockedCount} blocked` : "on track"}
                      </p>
                    </div>
                    <ProgressRing value={pct} size={60} thickness={5.5}>
                      <span className="text-[11px] font-semibold text-orb-heading">{pct}%</span>
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

function greetingFor(date: Date): string {
  const hour = date.getHours();
  if (hour < 5) return "Good night.";
  if (hour < 12) return "Good morning.";
  if (hour < 18) return "Good afternoon.";
  return "Good evening.";
}
