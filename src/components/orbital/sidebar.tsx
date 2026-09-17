"use client";

// Sidebar navigation: brand, WORKSPACE + MANAGEMENT sections, and the
// Tasks Status card (blocked / overdue) that links to My Tasks.

import { LayoutDashboard, Target, CheckSquare, Bot, Users, Settings, PanelLeftClose } from "lucide-react";
import { useOrbital, type ViewId } from "@/components/orbital/store";
import { LogoMark } from "@/components/orbital/logo";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface NavItem {
  id: ViewId;
  label: string;
  icon: ReactNode;
}

const workspaceItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={17} strokeWidth={1.8} /> },
  { id: "goals", label: "Goals", icon: <Target size={17} strokeWidth={1.8} /> },
  { id: "my-tasks", label: "My Tasks", icon: <CheckSquare size={17} strokeWidth={1.8} /> },
];

const managementItems: NavItem[] = [
  { id: "activity", label: "Agent Activity", icon: <Bot size={17} strokeWidth={1.8} /> },
  { id: "team", label: "Team", icon: <Users size={17} strokeWidth={1.8} /> },
  { id: "settings", label: "Settings", icon: <Settings size={17} strokeWidth={1.8} /> },
];

function isActive(current: ViewId, target: ViewId, goalId: string | null): boolean {
  if (target === "goals") return current === "goals" || current === "goal-detail";
  if (target === "my-tasks") return current === "my-tasks";
  return current === target;
}

export function Sidebar({ onCollapse }: { onCollapse?: () => void }) {
  const view = useOrbital((s) => s.view);
  const goalId = useOrbital((s) => s.goalId);
  const navigate = useOrbital((s) => s.navigate);
  const stats = useOrbital((s) => s.stats);

  const blocked = stats?.blockedTasks ?? 0;
  const overdue = stats?.overdueTasks ?? 0;

  function renderNavItem(item: NavItem) {
    const active = isActive(view, item.id, goalId);
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => {
          navigate(item.id);
          onCollapse?.();
        }}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-[14px] transition-colors",
          active
            ? "bg-black/[0.055] font-semibold text-orb-heading"
            : "font-medium text-orb-muted hover:bg-black/[0.03] hover:text-orb-heading",
        )}
      >
        <span className={cn(active ? "text-orb-heading" : "text-orb-muted")} aria-hidden="true">
          {item.icon}
        </span>
        {item.label}
      </button>
    );
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <button
          type="button"
          onClick={() => navigate("dashboard")}
          className="flex items-center gap-2.5 rounded-xl focus-visible:outline-2 focus-visible:outline-ring"
          aria-label="Orbital home"
        >
          <LogoMark size={30} />
          <span className="text-[15px] font-bold uppercase tracking-[0.18em] text-orb-heading">Orbital</span>
        </button>
        {onCollapse ? (
          <button
            type="button"
            onClick={onCollapse}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-orb-muted hover:bg-black/[0.04] hover:text-orb-heading lg:hidden"
            aria-label="Close menu"
          >
            <PanelLeftClose size={18} />
          </button>
        ) : null}
      </div>

      <p className="orb-label px-5 pt-6 pb-2">Workspace</p>
      <nav className="flex flex-col gap-0.5 px-3" aria-label="Workspace">
        {workspaceItems.map(renderNavItem)}
      </nav>

      <p className="orb-label px-5 pt-6 pb-2">Management</p>
      <nav className="flex flex-col gap-0.5 px-3" aria-label="Management">
        {managementItems.map(renderNavItem)}
      </nav>

      <div className="mt-auto px-4 pb-4">
        <button
          type="button"
          onClick={() => {
            navigate("my-tasks");
            onCollapse?.();
          }}
          className="orb-card w-full rounded-2xl p-4 text-left transition-transform hover:-translate-y-0.5"
          aria-label={`Tasks status: ${blocked} blocked, ${overdue} overdue. Open My Tasks.`}
        >
          <div className="flex items-start justify-between">
            <p className="orb-label">Tasks Status</p>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true" className="text-orb-muted">
              <circle cx="13" cy="13" r="11" stroke="currentColor" strokeWidth="1.6" opacity="0.5" />
              <path d="M13 7.5V13l3.5 2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="flex items-baseline gap-2">
              <span className="text-[22px] font-normal leading-none text-orb-heading">{blocked}</span>
              <span className="flex items-center gap-1.5 text-[13px] text-orb-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-orb-coral" aria-hidden="true" />
                Blocked
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[22px] font-normal leading-none text-orb-heading">{overdue}</span>
              <span className="flex items-center gap-1.5 text-[13px] text-orb-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-orb-amber" aria-hidden="true" />
                Overdue
              </span>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
