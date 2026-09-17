"use client";

// Agent Activity: full transparency feed. Header shows the online status,
// total action count, the last action, and a date-grouped timeline.

import { useMemo } from "react";
import { Bot } from "lucide-react";
import { useOrbital } from "@/components/orbital/store";
import { EmptyState } from "@/components/orbital/empty-state";
import { relativeTime, type ActivityDTO } from "@/lib/orbital";

function typeBadge(type: string): string {
  switch (type) {
    case "tasks_generated":
      return "Tasks Generated";
    case "task_assigned":
      return "Task Assigned";
    case "status_update":
      return "Status Update";
    case "goal_created":
      return "Goal Created";
    case "goal_analyzed":
      return "Goal Analyzed";
    case "goal_completed":
      return "Goal Completed";
    case "member_invited":
      return "Member Invited";
    case "agent_created":
      return "Agent Created";
    case "task_created":
      return "Task Created";
    case "task_deleted":
      return "Task Deleted";
    case "goal_deleted":
      return "Goal Deleted";
    case "settings_updated":
      return "Settings Updated";
    default:
      return "Activity";
  }
}

function FeedRow({ entry }: { entry: ActivityDTO }) {
  return (
    <li className="flex items-start gap-4">
      <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orb-purple/12 text-orb-purple-deep" aria-hidden="true">
        <Bot size={17} strokeWidth={1.8} />
      </span>
      <div className="min-w-0 flex-1 border-b border-black/[0.05] pb-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4">
          <p className="text-[14.5px] font-semibold text-orb-heading">{entry.message}</p>
          <span className="text-[12px] text-orb-muted">{relativeTime(entry.createdAt)}</span>
        </div>
        <p className="mt-1 text-[13.5px] leading-relaxed text-orb-muted">{entry.detail}</p>
        <p className="orb-label mt-2">{typeBadge(entry.type)}</p>
      </div>
    </li>
  );
}

export function ActivityView() {
  const activity = useOrbital((s) => s.activity);

  const groups = useMemo(() => {
    const map = new Map<string, ActivityDTO[]>();
    for (const entry of activity) {
      const date = new Date(entry.createdAt);
      const key = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }).toUpperCase();
      const list = map.get(key) ?? [];
      list.push(entry);
      map.set(key, list);
    }
    return Array.from(map.entries());
  }, [activity]);

  return (
    <div className="mx-auto max-w-3xl">
      <header>
        <h1 className="text-[28px] font-normal tracking-tight text-orb-heading">Agent Activity</h1>
        <p className="mt-1 text-[14px] text-orb-muted">Full transparency — every action the agent takes</p>
        <p className="mt-4 flex items-center gap-2 text-[13.5px] text-orb-muted">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orb-green opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-orb-green" />
          </span>
          Online <span aria-hidden="true">·</span> {activity.length} actions
        </p>
        {activity[0] ? (
          <div className="mt-4 rounded-2xl bg-orb-inset/70 p-4">
            <p className="text-[14px] text-orb-body">{activity[0]!.message}</p>
            <p className="orb-label mt-1">Last agent action</p>
          </div>
        ) : null}
      </header>

      {groups.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<Bot size={22} />}
            title="No agent activity yet"
            description="The AI assistant logs every action here — create a goal to see it draft a plan."
          />
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {groups.map(([day, entries]) => (
            <section key={day} aria-label={day}>
              <p className="orb-label border-b border-black/[0.07] pb-2">{day}</p>
              <ul className="mt-4 space-y-5">
                {entries.map((entry) => (
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
