"use client";

// ORBITAL client store (Zustand): holds all server state for the SPA and
// exposes typed actions. Every fetch goes through the `call()` helper which
// unwraps the `{ ok, data } | { ok, error }` envelope; failures surface as
// toast messages and never throw across render.

import { create } from "zustand";
import { toast } from "@/hooks/use-toast";
import type {
  ActivityDTO,
  DashboardStats,
  GoalDTO,
  PersonDTO,
  TaskDTO,
  TeamMemberDTO,
  WorkspaceSettingsDTO,
} from "@/lib/orbital";

export type ViewId =
  | "dashboard"
  | "goals"
  | "goal-detail"
  | "my-tasks"
  | "activity"
  | "team"
  | "settings";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  avatarColor: string;
}

interface ApiEnvelope<T> {
  ok: boolean;
  data?: T;
  error?: { code: string; message: string };
}

async function call<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(url, {
      ...init,
      headers: init?.body ? { "Content-Type": "application/json", ...(init?.headers ?? {}) } : init?.headers,
    });
    const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;
    if (!response.ok || !payload || !payload.ok) {
      const message = payload?.error?.message ?? `Request failed (${response.status})`;
      toast({ title: "Something went wrong", description: message, variant: "destructive" });
      return null;
    }
    return payload.data ?? null;
  } catch {
    toast({
      title: "Network error",
      description: "Could not reach the server. Check your connection and retry.",
      variant: "destructive",
    });
    return null;
  }
}

interface OrbitalState {
  user: SessionUser;
  view: ViewId;
  goalId: string | null;
  loading: boolean;
  booted: boolean;
  goals: GoalDTO[];
  goalTasks: Record<string, TaskDTO[]>;
  myTasks: TaskDTO[];
  activity: ActivityDTO[];
  people: PersonDTO[];
  members: TeamMemberDTO[];
  settings: WorkspaceSettingsDTO | null;
  stats: DashboardStats | null;

  navigate: (view: ViewId, goalId?: string | null) => void;
  syncUrl: () => void;
  boot: () => Promise<void>;
  refreshGoals: () => Promise<void>;
  refreshGoalDetail: (goalId: string) => Promise<void>;
  refreshMyTasks: () => Promise<void>;
  refreshActivity: () => Promise<void>;
  refreshStats: () => Promise<void>;
  refreshTeam: () => Promise<void>;
  refreshSettings: () => Promise<void>;

  createGoal: (input: { title: string; description?: string; targetDate?: string }) => Promise<string | null>;
  generateTasks: (goalId: string) => Promise<number | null>;
  updateGoal: (
    goalId: string,
    patch: { title?: string; description?: string; status?: string; targetDate?: string | null },
  ) => Promise<boolean>;
  deleteGoal: (goalId: string) => Promise<boolean>;
  createTask: (input: {
    goalId: string;
    title: string;
    description?: string;
    status?: string;
    deadline?: string;
    assigneeId?: string;
    estimatedHours?: number;
  }) => Promise<string | null>;
  updateTask: (taskId: string, goalId: string, patch: Record<string, unknown>) => Promise<boolean>;
  deleteTask: (taskId: string, goalId: string) => Promise<boolean>;
  postUpdate: (taskId: string, goalId: string, status: string, note?: string) => Promise<boolean>;
  inviteMember: (input: { name: string; email?: string; role?: string; kind?: string; agentRole?: string }) => Promise<boolean>;
  saveSettings: (patch: Partial<WorkspaceSettingsDTO>) => Promise<boolean>;
  signOut: () => Promise<void>;
}

function readUrlState(): { view: ViewId; goalId: string | null } {
  if (typeof window === "undefined") return { view: "dashboard", goalId: null };
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("view");
  const goal = params.get("goal");
  const allowed: ViewId[] = ["dashboard", "goals", "goal-detail", "my-tasks", "activity", "team", "settings"];
  const view = raw && allowed.includes(raw as ViewId) ? (raw as ViewId) : "dashboard";
  return { view: view === "goal-detail" && !goal ? "goals" : view, goalId: goal };
}

export const useOrbital = create<OrbitalState>((set, get) => ({
  user: { id: "", email: "", name: "", avatarColor: "#996CE4" },
  view: "dashboard",
  goalId: null,
  loading: false,
  booted: false,
  goals: [],
  goalTasks: {},
  myTasks: [],
  activity: [],
  people: [],
  members: [],
  settings: null,
  stats: null,

  navigate: (view, goalId = null) => {
    set({ view, goalId });
    get().syncUrl();
  },

  syncUrl: () => {
    if (typeof window === "undefined") return;
    const { view, goalId } = get();
    const params = new URLSearchParams();
    if (view !== "dashboard") params.set("view", view);
    if (view === "goal-detail" && goalId) params.set("goal", goalId);
    const qs = params.toString();
    const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  },

  boot: async () => {
    const { view, goalId } = readUrlState();
    set({ view, goalId, loading: true });
    await Promise.all([
      get().refreshGoals(),
      get().refreshActivity(),
      get().refreshStats(),
      get().refreshTeam(),
      get().refreshSettings(),
      get().refreshMyTasks(),
    ]);
    if (view === "goal-detail" && goalId) await get().refreshGoalDetail(goalId);
    set({ booted: true, loading: false });
  },

  refreshGoals: async () => {
    const goals = await call<GoalDTO[]>("/api/goals");
    if (goals) set({ goals });
  },

  refreshGoalDetail: async (goalId) => {
    const payload = await call<{ goal: GoalDTO; tasks: TaskDTO[] }>(`/api/goals/${goalId}`);
    if (!payload) return;
    set((state) => ({
      goals: state.goals.some((g) => g.id === goalId)
        ? state.goals.map((g) => (g.id === goalId ? { ...g, ...payload.goal } : g))
        : [...state.goals, payload.goal],
      goalTasks: { ...state.goalTasks, [goalId]: payload.tasks },
    }));
  },

  refreshMyTasks: async () => {
    const tasks = await call<TaskDTO[]>("/api/tasks?assignee=me");
    if (tasks) set({ myTasks: tasks });
  },

  refreshActivity: async () => {
    const activity = await call<ActivityDTO[]>("/api/activity");
    if (activity) set({ activity });
  },

  refreshStats: async () => {
    const stats = await call<DashboardStats>("/api/stats");
    if (stats) set({ stats });
  },

  refreshTeam: async () => {
    const payload = await call<{ people: PersonDTO[]; members: TeamMemberDTO[] }>("/api/team");
    if (payload) set({ people: payload.people, members: payload.members });
  },

  refreshSettings: async () => {
    const settings = await call<WorkspaceSettingsDTO>("/api/settings");
    if (settings) set({ settings });
  },

  createGoal: async (input) => {
    const created = await call<{ id: string }>("/api/goals", {
      method: "POST",
      body: JSON.stringify(input),
    });
    if (!created) return null;
    await Promise.all([get().refreshGoals(), get().refreshStats(), get().refreshActivity()]);
    return created.id;
  },

  generateTasks: async (goalId) => {
    const result = await call<{ created: number }>(`/api/goals/${goalId}/generate-tasks`, {
      method: "POST",
    });
    if (!result) return null;
    await Promise.all([
      get().refreshGoalDetail(goalId),
      get().refreshGoals(),
      get().refreshActivity(),
      get().refreshStats(),
    ]);
    return result.created;
  },

  updateGoal: async (goalId, patch) => {
    const okResult = await call<{ id: string }>(`/api/goals/${goalId}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
    if (!okResult) return false;
    await Promise.all([get().refreshGoals(), get().refreshActivity(), get().refreshStats()]);
    if (get().goalId === goalId) await get().refreshGoalDetail(goalId);
    return true;
  },

  deleteGoal: async (goalId) => {
    const okResult = await call<{ deleted: boolean }>(`/api/goals/${goalId}`, { method: "DELETE" });
    if (!okResult) return false;
    await Promise.all([get().refreshGoals(), get().refreshActivity(), get().refreshStats(), get().refreshMyTasks()]);
    if (get().view === "goal-detail") get().navigate("goals");
    return true;
  },

  createTask: async (input) => {
    const created = await call<{ id: string }>("/api/tasks", {
      method: "POST",
      body: JSON.stringify(input),
    });
    if (!created) return null;
    await Promise.all([
      get().refreshGoalDetail(input.goalId),
      get().refreshGoals(),
      get().refreshActivity(),
      get().refreshStats(),
      get().refreshMyTasks(),
    ]);
    return created.id;
  },

  updateTask: async (taskId, goalId, patch) => {
    const okResult = await call<{ id: string }>(`/api/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
    if (!okResult) return false;
    await Promise.all([
      get().refreshGoalDetail(goalId),
      get().refreshGoals(),
      get().refreshActivity(),
      get().refreshStats(),
      get().refreshMyTasks(),
    ]);
    return true;
  },

  deleteTask: async (taskId, goalId) => {
    const okResult = await call<{ deleted: boolean }>(`/api/tasks/${taskId}`, { method: "DELETE" });
    if (!okResult) return false;
    await Promise.all([
      get().refreshGoalDetail(goalId),
      get().refreshGoals(),
      get().refreshActivity(),
      get().refreshStats(),
      get().refreshMyTasks(),
    ]);
    return true;
  },

  postUpdate: async (taskId, goalId, status, note) => {
    const okResult = await call<{ id: string; taskStatus: string }>(`/api/tasks/${taskId}/updates`, {
      method: "POST",
      body: JSON.stringify({ status, note }),
    });
    if (!okResult) return false;
    await Promise.all([
      get().refreshGoalDetail(goalId),
      get().refreshGoals(),
      get().refreshActivity(),
      get().refreshStats(),
      get().refreshMyTasks(),
    ]);
    return true;
  },

  inviteMember: async (input) => {
    const created = await call<{ id: string }>("/api/team", {
      method: "POST",
      body: JSON.stringify(input),
    });
    if (!created) return false;
    await Promise.all([get().refreshTeam(), get().refreshActivity()]);
    return true;
  },

  saveSettings: async (patch) => {
    const settings = await call<WorkspaceSettingsDTO>("/api/settings", {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
    if (!settings) return false;
    set({ settings });
    await get().refreshActivity();
    return true;
  },

  signOut: async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  },
}));
