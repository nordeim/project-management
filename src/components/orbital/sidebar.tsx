"use client";

// Sidebar navigation: brand, WORKSPACE + MANAGEMENT sections, and the bottom
// row with the analog clock + Tasks Status card (blocked / overdue, links to
// My Tasks) — mirroring the reference app. Supports an icon-only collapsed
// rail driven by the app shell (desktop collapse chevron sits at the bottom).

import { Activity, LayoutDashboard, Target, CheckSquare, Users, Settings } from "lucide-react";
import { useOrbital, type ViewId } from "@/components/orbital/store";
import { LogoMark } from "@/components/orbital/logo";
import { SidebarClock } from "@/components/orbital/sidebar-clock";
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
  { id: "activity", label: "Agent Activity", icon: <Activity size={17} strokeWidth={1.8} /> },
  { id: "team", label: "Team", icon: <Users size={17} strokeWidth={1.8} /> },
  { id: "settings", label: "Settings", icon: <Settings size={17} strokeWidth={1.8} /> },
];

function isActive(current: ViewId, target: ViewId, goalId: string | null): boolean {
  if (target === "goals") return current === "goals" || current === "goal-detail";
  if (target === "my-tasks") return current === "my-tasks";
  return current === target;
}

export function Sidebar({
  collapsed = false,
  onCollapse,
}: {
  collapsed?: boolean;
  onCollapse?: () => void;
}) {
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
        title={collapsed ? item.label : undefined}
        aria-label={collapsed ? item.label : undefined}
        className={cn(
          // v1.7 (measured): live nav rows are 39px tall; inactive items
          // are 14px/400 (not 500) — the active row keeps the well + 500.
          "flex min-h-[39px] w-full items-center rounded-[10px] transition-colors",
          collapsed ? "justify-center px-0" : "gap-3 px-3 text-[14px]",
          active
            ? "bg-orb-well font-medium text-orb-heading shadow-[inset_-3px_-3px_6px_rgba(255,250,244,0.68),inset_3px_3px_6px_rgba(160,143,126,0.24)]"
            : "font-normal text-orb-muted hover:bg-black/[0.03] hover:text-orb-heading",
        )}
      >
        <span className={cn(active ? "text-orb-heading" : "text-orb-muted")} aria-hidden="true">
          {item.icon}
        </span>
        {collapsed ? null : item.label}
      </button>
    );
  }

  if (collapsed) {
    // Icon-only rail: logo, nav icons, clock. Tasks status card is hidden.
    return (
      <div className="flex h-full w-full flex-col items-center px-2 py-5">
        <button
          type="button"
          onClick={() => navigate("dashboard")}
          className="flex h-11 w-11 items-center justify-center rounded-xl focus-visible:outline-2 focus-visible:outline-ring"
          aria-label="Orbital home"
        >
          <LogoMark size={28} />
        </button>

        <nav className="mt-6 flex w-full flex-col gap-1" aria-label="Workspace">
          {workspaceItems.map(renderNavItem)}
        </nav>
        <nav className="mt-5 flex w-full flex-col gap-1" aria-label="Management">
          {managementItems.map(renderNavItem)}
        </nav>

        <div className="mt-auto pb-1">
          <SidebarClock />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col">
      {/* v1.7 (measured): the brand row sits flush at the panel's top
          padding — a compact ~16px six-dot mark beside "ORBITAL" at
          13px/600/ls 2.34px (0.18em) in #2F2823. */}
      <div className="flex items-center justify-between px-4 pb-2 pt-0">
        <button
          type="button"
          onClick={() => navigate("dashboard")}
          className="flex items-center gap-2 rounded-xl focus-visible:outline-2 focus-visible:outline-ring"
          aria-label="Orbital home"
        >
          <LogoMark size={16} />
          <span className="text-[13px] font-semibold uppercase tracking-[0.18em] text-orb-body">Orbital</span>
        </button>
        {onCollapse ? (
          <button
            type="button"
            onClick={onCollapse}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-orb-muted hover:bg-black/[0.04] hover:text-orb-heading lg:hidden"
            aria-label="Close menu"
          >
            <PanelLeftCloseGlyph />
          </button>
        ) : null}
      </div>

      <p className="orb-label-sm px-5 pt-6 pb-2">Workspace</p>
      <nav className="flex flex-col gap-0.5 px-3" aria-label="Workspace">
        {workspaceItems.map(renderNavItem)}
      </nav>

      <p className="orb-label-sm px-5 pt-6 pb-2">Management</p>
      <nav className="flex flex-col gap-0.5 px-3" aria-label="Management">
        {managementItems.map(renderNavItem)}
      </nav>

      {/* v1.7 (measured): the Tasks Status block is a PLAIN link (no well) —
          10px/600 label, 11px/700 numbers, 11px/400 #767676 captions —
          sitting beside the 80px clock with a 10px gap, at the panel's own
          16px horizontal padding. */}
      <div className="mt-auto flex items-center gap-[10px] px-4 pb-3">
        <SidebarClock size={80} />
        <button
          type="button"
          onClick={() => {
            navigate("my-tasks");
            onCollapse?.();
          }}
          className="min-w-0 flex-1 text-left"
          aria-label={`Tasks status: ${blocked} blocked, ${overdue} overdue. Open My Tasks.`}
        >
          <p className="orb-label-sm whitespace-nowrap">Tasks Status</p>
          <div className="mt-2 space-y-2">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-orb-coral" aria-hidden="true" />
              <span className="text-[11px] font-bold leading-none text-orb-heading">{blocked}</span>
              <span className="text-[11px] font-normal text-[#767676]">Blocked</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-orb-tan" aria-hidden="true" />
              <span className="text-[11px] font-bold leading-none text-orb-heading">{overdue}</span>
              <span className="text-[11px] font-normal text-[#767676]">Overdue</span>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

function PanelLeftCloseGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18" />
    </svg>
  );
}
