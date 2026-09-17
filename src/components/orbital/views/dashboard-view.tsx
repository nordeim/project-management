"use client";

// Dashboard: greeting + user pill + NEW GOAL, hero row (date card, progress
// ring, stat cards), agent activity feed with next planned action, and the
// goals preview list — mirroring the reference layout.

import { useMemo, useState } from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { useOrbital } from "@/components/orbital/store";
import { ProgressRing } from "@/components/orbital/progress-ring";
import { UserMenu } from "@/components/orbital/user-menu";
import { greetingFor, relativeTime, type ActivityDTO } from "@/lib/orbital";
import { NewGoalDialog } from "@/components/orbital/dialogs/new-goal-dialog";

function activityIcon(type: string): { bg: string; fg: string; glyph: React.ReactNode } {
  if (type === "tasks_generated") {
    return { bg: "bg-orb-green/15", fg: "text-orb-green-deep", glyph: <Sparkles size={15} /> };
  }
  if (type === "status_update") {
    return { bg: "bg-orb-lavender/30", fg: "text-orb-purple-deep", glyph: <ActivityDot /> };
  }
  return { bg: "bg-orb-purple/15", fg: "text-orb-purple-deep", glyph: <PersonGlyph /> };
}

function ActivityDot() {
  return <span className="block h-2 w-2 rounded-full bg-current" aria-hidden="true" />;
}

function PersonGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="5.2" r="2.6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M2.8 13.6c.8-2.5 2.8-3.8 5.2-3.8s4.4 1.3 5.2 3.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function DateCard() {
  const now = new Date();
  const day = now.getDate();
  const month = now.toLocaleDateString("en-US", { month: "long" });
  const year = now.getFullYear();
  return (
    <div
      className="orb-card relative min-h-[210px] flex-1 overflow-hidden rounded-3xl"
      role="img"
      aria-label={`Today is ${month} ${day}, ${year}`}
    >
      {/* Soft dusk landscape (bundled asset, OSS-sourced) */}
      <img
        src="/dusk-hills.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute bottom-4 left-4 rounded-2xl bg-white/95 px-4 py-3 shadow-[0_8px_24px_-10px_rgba(47,40,35,0.35)]">
        <p className="text-[34px] font-medium leading-none text-orb-heading">{day}</p>
        <p className="orb-label mt-1">
          {month} {year}
        </p>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  onClick,
}: {
  label: string;
  value: number;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="orb-card flex min-h-[210px] flex-1 flex-col items-start justify-between p-5 text-left transition-transform hover:-translate-y-0.5"
    >
      <p className="orb-label">{label}</p>
      <p className="text-[44px] font-normal leading-none text-orb-heading">{value}</p>
      <p className="text-[13px] text-orb-muted">{sub}</p>
    </button>
  );
}

function ActivityRow({ entry }: { entry: ActivityDTO }) {
  const icon = activityIcon(entry.type);
  return (
    <li className="flex items-start gap-3 border-b border-black/[0.05] py-4 last:border-b-0">
      <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${icon.bg} ${icon.fg}`} aria-hidden="true">
        {icon.glyph}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold text-orb-heading">{entry.message}</p>
        <p className="mt-0.5 text-[13px] text-orb-muted">{entry.detail}</p>
      </div>
      <span className="shrink-0 pt-0.5 text-[12px] text-orb-muted">{relativeTime(entry.createdAt)}</span>
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

  const nextPlanned = useMemo(() => {
    const blocked = activity.find((a) => a.type === "status_update" && a.detail?.includes("Blocked"));
    return blocked?.message
      ? `Follow up on a blocked item: ${blocked.message.replace(" checked in on", " —")}.`
      : "Ping the team for a status check-in on active goals.";
  }, [activity]);

  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-normal tracking-tight text-orb-heading sm:text-[32px]">{greeting}</h1>
          <p className="mt-1 text-[14px] text-orb-muted">Here&apos;s what&apos;s happening across your projects today.</p>
        </div>
        <div className="flex items-center gap-3">
          <UserMenu />
          <button type="button" className="orb-pill" onClick={() => setNewGoalOpen(true)}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            New Goal
          </button>
        </div>
      </header>

      <section className="mt-7 flex flex-col gap-4 md:flex-row" aria-label="Overview">
        <DateCard />
        <button
          type="button"
          onClick={() => navigate("goals")}
          className="orb-card flex min-h-[210px] w-full flex-col items-center justify-center gap-1 p-5 transition-transform hover:-translate-y-0.5 md:w-[240px]"
          aria-label={`${stats?.completionRate ?? 0}% of all tasks done. Open goals.`}
        >
          <ProgressRing value={stats?.completionRate ?? 0} size={118} thickness={11}>
            <span className="text-[26px] font-normal leading-none text-orb-heading">{stats?.completionRate ?? 0}%</span>
            <span className="orb-label mt-1">done</span>
          </ProgressRing>
        </button>
        <div className="flex flex-1 flex-col gap-4 sm:flex-row" aria-label="Statistics">
          <StatCard
            label="Active Goals"
            value={stats?.activeGoals ?? 0}
            sub={`${stats?.totalTasks ?? 0} total tasks`}
            onClick={() => navigate("goals")}
          />
          <StatCard
            label="Blocked Tasks"
            value={stats?.blockedTasks ?? 0}
            sub={`${stats?.doneTasks ?? 0} completed`}
            onClick={() => navigate("my-tasks")}
          />
          <StatCard
            label="Completed Tasks"
            value={stats?.doneTasks ?? 0}
            sub={`${stats?.completionRate ?? 0}% of total`}
            onClick={() => navigate("goals")}
          />
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]" aria-label="Activity and goals">
        <div className="orb-card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-[15px] font-semibold text-orb-heading">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orb-green opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-orb-green" />
              </span>
              Agent Activity
            </h2>
            <button
              type="button"
              className="flex items-center gap-1 text-[13px] font-medium text-orb-muted hover:text-orb-heading"
              onClick={() => navigate("activity")}
            >
              Full log <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="mt-4 rounded-2xl bg-orb-inset/70 p-4">
            <p className="orb-label">Next planned action</p>
            <p className="mt-1.5 text-[14px] leading-relaxed text-orb-body">{nextPlanned}</p>
          </div>

          {activity.length > 0 ? (
            <p className="mt-4 text-[13px] text-orb-muted">
              {activity[0]!.message} <span className="block text-[12px] opacity-75">Last agent action</span>
            </p>
          ) : null}

          <ul className="mt-2">
            {activity.slice(0, 5).map((entry) => (
              <ActivityRow key={entry.id} entry={entry} />
            ))}
          </ul>
        </div>

        <div className="orb-card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-orb-heading">Goals</h2>
            <button
              type="button"
              className="flex items-center gap-1 text-[13px] font-medium text-orb-muted hover:text-orb-heading"
              onClick={() => navigate("goals")}
            >
              View all <ArrowUpRight size={14} />
            </button>
          </div>
          <ul className="mt-3">
            {goals.slice(0, 5).map((goal) => {
              const pct = goal.taskCount > 0 ? Math.round((goal.doneCount / goal.taskCount) * 100) : 0;
              return (
                <li key={goal.id}>
                  <button
                    type="button"
                    onClick={() => navigate("goal-detail", goal.id)}
                    className="flex w-full items-center gap-4 rounded-2xl px-2 py-3.5 text-left transition-colors hover:bg-black/[0.03]"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-semibold text-orb-heading">{goal.title}</p>
                      <p className="mt-0.5 text-[12.5px] text-orb-muted">
                        {goal.doneCount}/{goal.taskCount} tasks · {goal.blockedCount > 0 ? `${goal.blockedCount} blocked` : "on track"}
                      </p>
                    </div>
                    <ProgressRing value={pct} size={46} thickness={4.5}>
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
