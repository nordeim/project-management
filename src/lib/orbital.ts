// Shared domain types + display metadata for ORBITAL.
// Both API routes and client components import from here — keep it free of
// server-only and client-only imports.

export type GoalStatus = "active" | "done" | "draft" | "paused";
export type TaskStatus = "pending" | "in_progress" | "blocked" | "need_help" | "done";
export type UpdateStatus = "on_track" | "blocked" | "need_help" | "done";

export interface PersonDTO {
  id: string;
  name: string;
  avatarColor: string;
  userId: string | null;
}

export interface TeamMemberDTO {
  id: string;
  name: string;
  email: string | null;
  role: string | null;
  avatarColor: string;
  kind: "human" | "agent";
  agentRole: string | null;
  description: string | null;
  instructions: string | null;
}

export interface GoalDTO {
  id: string;
  title: string;
  description: string | null;
  status: GoalStatus;
  targetDate: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  taskCount: number;
  doneCount: number;
  blockedCount: number;
}

export interface TaskDTO {
  id: string;
  goalId: string;
  goalTitle: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  deadline: string | null;
  assignee: PersonDTO | null;
  estimatedHours: number | null;
  createdByAi: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  updates: TaskUpdateDTO[];
}

export interface TaskUpdateDTO {
  id: string;
  status: UpdateStatus;
  note: string | null;
  createdAt: string;
}

export interface ActivityDTO {
  id: string;
  type: string;
  message: string;
  detail: string | null;
  createdAt: string;
}

export interface WorkspaceSettingsDTO {
  name: string;
  workStart: string;
  workEnd: string;
  pingFrequency: "once_daily" | "twice_daily" | "weekly";
  aiTone: "friendly" | "professional" | "concise";
}

export interface DashboardStats {
  totalTasks: number;
  doneTasks: number;
  blockedTasks: number;
  overdueTasks: number;
  activeGoals: number;
  completionRate: number; // 0-100
}

export interface SessionUserDTO {
  id: string;
  email: string;
  name: string;
  avatarColor: string;
}

export const TASK_STATUS_META: Record<TaskStatus, { label: string; dot: string; text: string }> = {
  pending: { label: "Pending", dot: "#F5B841", text: "#8A6A1F" },
  in_progress: { label: "In Progress", dot: "#996CE4", text: "#6B4BBF" },
  blocked: { label: "Blocked", dot: "#FF8077", text: "#BD3228" },
  need_help: { label: "Need Help", dot: "#FFCBDE", text: "#B06A85" },
  done: { label: "Done", dot: "#2ECC8A", text: "#1F8F5F" },
};

export const GOAL_STATUS_META: Record<GoalStatus, { label: string; color: string }> = {
  active: { label: "Active", color: "#2ECC8A" },
  done: { label: "Completed", color: "#996CE4" },
  draft: { label: "Draft", color: "#6E6E6E" },
  paused: { label: "Paused", color: "#C4996A" },
};

export const UPDATE_STATUS_META: Record<UpdateStatus, { label: string }> = {
  on_track: { label: "On Track" },
  blocked: { label: "Blocked" },
  need_help: { label: "Need Help" },
  done: { label: "Done" },
};

export function isOverdue(deadline: string | null, status: TaskStatus): boolean {
  if (!deadline || status === "done") return false;
  return new Date(deadline).getTime() < Date.now();
}

export function greetingFor(date: Date): string {
  // v1.9 (live bundle QF()): the morning band starts at hour 5 — the small
  // hours (00:00–04:59) still greet with "Good Evening."
  const h = date.getHours();
  if (h >= 5 && h < 12) return "Good Morning.";
  if (h >= 12 && h < 18) return "Good Afternoon.";
  return "Good Evening.";
}

/** Timezone offset in ms for a date (the date-fns DST normalization core). */
function tzOffsetMs(date: Date): number {
  const utc = Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds(),
  );
  return date.getTime() - utc;
}

/** Calendar months between two dates (date-fns differenceInMonths with the
 * Feb-27 edge rule); sign follows later − earlier. */
export function differenceInMonths(later: Date, earlier: Date): number {
  const sign = later >= earlier ? 1 : -1;
  const [a, b] = sign === 1 ? [later, earlier] : [earlier, later];
  const calendar = (a.getFullYear() - b.getFullYear()) * 12 + (a.getMonth() - b.getMonth());
  const abs = Math.abs(calendar);
  if (abs < 1) return 0;
  const stepped = new Date(a.getTime());
  if (stepped.getMonth() === 1 && stepped.getDate() > 27) stepped.setDate(30);
  stepped.setMonth(stepped.getMonth() - abs);
  let lastMonthNotFull = sign === 1 ? stepped < b : stepped > b;
  // Feb edge (date-fns): a one-month span landing on the month's final days
  // counts as full even when the stepped-back date lands after `b`.
  if (a.getMonth() === 1 && a.getDate() >= 28 && abs === 1 && b.getMonth() === 1 && b.getDate() >= 28) {
    lastMonthNotFull = false;
  }
  const result = sign * (abs - Number(lastMonthNotFull));
  return result === 0 ? 0 : result;
}

function plural(count: number, unit: string): string {
  return count === 1 ? `1 ${unit}` : `${count} ${unit}s`;
}

/** date-fns formatDistance (v1.9, extracted from the live bundle): the
 * long-form distance the reference's feeds render — "5 minutes", "about 2
 * hours", "3 days", "2 months", "over 2 years". Pure so the calendar-months
 * path is unit-testable with fixed clock dates. */
export function formatDistance(later: Date, earlier: Date): string {
  const seconds = Math.trunc((later.getTime() - earlier.getTime()) / 1000);
  const dstShift = (tzOffsetMs(later) - tzOffsetMs(earlier)) / 1000;
  const minutes = Math.round((seconds - dstShift) / 60);

  if (minutes < 1) return "less than a minute";
  if (minutes < 45) return plural(minutes, "minute");
  if (minutes < 90) return "about 1 hour";
  if (minutes < 1440) return `about ${plural(Math.round(minutes / 60), "hour")}`;
  if (minutes < 2520) return "1 day";
  if (minutes < 43200) return plural(Math.round(minutes / 1440), "day");
  if (minutes < 86400) return `about ${plural(Math.round(minutes / 43200), "month")}`;

  const months = differenceInMonths(later, earlier);
  if (months < 12) return plural(Math.round(minutes / 43200), "month");
  const trailing = months % 12;
  const years = Math.trunc(months / 12);
  if (trailing < 3) return `about ${plural(years, "year")}`;
  if (trailing < 9) return `over ${plural(years, "year")}`;
  return `almost ${plural(years + 1, "year")}`;
}

export function relativeTime(iso: string): string {
  // v1.9 (measured): the reference renders date-fns formatDistanceToNow long
  // form — "3 minutes ago", "2 months ago" — never abbreviations.
  return `${formatDistance(new Date(), new Date(iso))} ago`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}
