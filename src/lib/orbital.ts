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
  const h = date.getHours();
  if (h < 12) return "Good Morning.";
  if (h < 18) return "Good Afternoon.";
  return "Good Evening.";
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? "s" : ""} ago`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}
