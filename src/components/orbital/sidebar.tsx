"use client";

// Sidebar navigation: brand, WORKSPACE + MANAGEMENT sections, and the bottom
// row with the analog clock + Tasks Status card (blocked / overdue, links to
// My Tasks) — mirroring the reference app. Supports an icon-only collapsed
// rail driven by the app shell (desktop collapse chevron sits at the bottom).

import { Activity, LayoutDashboard, Target, SquareCheckBig, Users, Settings } from "lucide-react";
import { useOrbital, type ViewId } from "@/components/orbital/store";
import { LogoMark } from "@/components/orbital/logo";
import { SidebarClock } from "@/components/orbital/sidebar-clock";
import { cn } from "@/lib/utils";
import { toPath } from "@/lib/router";
import type { ReactNode } from "react";

interface NavItem {
  id: ViewId;
  label: string;
  icon: ReactNode;
}

const workspaceItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} strokeWidth={2} /> },
  { id: "goals", label: "Goals", icon: <Target size={16} strokeWidth={2} /> },
  { id: "my-tasks", label: "My Tasks", icon: <SquareCheckBig size={16} strokeWidth={2} /> },
];

const managementItems: NavItem[] = [
  { id: "activity", label: "Agent Activity", icon: <Activity size={16} strokeWidth={2} /> },
  { id: "team", label: "Team", icon: <Users size={16} strokeWidth={2} /> },
  { id: "settings", label: "Settings", icon: <Settings size={16} strokeWidth={2} /> },
];

function isActive(current: ViewId, target: ViewId, goalId: string | null): boolean {
  if (target === "goals") return current === "goals" || current === "goal-detail";
  if (target === "my-tasks") return current === "my-tasks";
  return current === target;
}

/** v2.7 anchor click (measured live): plain left clicks navigate in-app
 *  (pushState); modified/middle clicks fall through so the truthful href
 *  opens a real tab. */
function sidebarAnchorGo(e: React.MouseEvent<HTMLAnchorElement>, navigate: (view: ViewId) => void, view: ViewId, onCollapse?: () => void) {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
  e.preventDefault();
  navigate(view);
  onCollapse?.();
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
      <a
        key={item.id}
        href={toPath(item.id)}
        onClick={(e) => sidebarAnchorGo(e, navigate, item.id, onCollapse)}
        aria-current={active ? "page" : undefined}
        title={collapsed ? item.label : undefined}
        aria-label={collapsed ? item.label : undefined}
        className={cn(
          // v1.8 (re-measured): nav rows pad 9px 14px (39px tall at 14px
          // text), full content width, 4px gaps between rows; inactive
          // items are 14px/400. The ACTIVE row carries the brighter
          // .orb-nav-active inset pair (255,252,248@0.75 / 180,165,150@0.32).
          // v2.7: the rows are real <a href> links (measured live).
          "flex w-full items-center rounded-[10px] py-[9px] text-[14px] transition-colors",
          collapsed ? "justify-center px-0" : "gap-3 px-[14px]",
          active
            ? "orb-nav-active font-medium text-orb-heading"
            : "font-normal text-orb-muted hover:bg-black/[0.03] hover:text-orb-heading",
        )}
      >
        <span className={cn(active ? "text-orb-heading" : "text-orb-muted")} aria-hidden="true">
          {item.icon}
        </span>
        {collapsed ? null : item.label}
      </a>
    );
  }

  if (collapsed) {
    // Icon-only rail: logo, nav icons, clock. Tasks status card is hidden.
    return (
      <div className="flex h-full w-full flex-col items-center px-2 py-5">
        <a
          href={toPath("dashboard")}
          onClick={(e) => sidebarAnchorGo(e, navigate, "dashboard")}
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          aria-label="Orbital home"
        >
          <LogoMark size={28} />
        </a>

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
      {/* v1.9 (measured): brand row — an 11px six-dot mark inset 10px from
          the content edge (x=50 on the panel at x=24+16) with an 8px gap to
          "ORBITAL" set in ARCHIVO 600 at 13px/ls 2.34px in #2F2823. */}
      <div className="flex items-center justify-between px-4 pb-2 pt-0">
        <a
          href={toPath("dashboard")}
          onClick={(e) => sidebarAnchorGo(e, navigate, "dashboard")}
          className="flex items-center gap-2 rounded-xl pl-2.5"
          aria-label="Orbital home"
        >
          <LogoMark size={11} />
          <span className="font-archivo text-[13px] font-semibold uppercase leading-[13px] tracking-[0.18em] text-orb-body">Orbital</span>
        </a>
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

      <p className="orb-label-sm px-6 pb-2 pt-6">Workspace</p>
      <nav className="flex flex-col gap-1 px-4" aria-label="Workspace">
        {workspaceItems.map(renderNavItem)}
      </nav>

      <p className="orb-label-sm px-6 pb-2 pt-5">Management</p>
      <nav className="flex flex-col gap-1 px-4" aria-label="Management">
        {managementItems.map(renderNavItem)}
      </nav>

      {/* v1.8 (re-measured — corrects v1.7): the Tasks Status block IS an
          INSET WELL — 80px tall (clock-aligned), radius 10, pad 0 12px, flex
          column — holding the 10px/600 label, 11px/700 numbers and 11px/400
          captions. It sits beside the 80px clock with a 10px gap. */}
      <div className="mt-auto flex items-center gap-[10px] px-4 pb-3">
        <SidebarClock size={80} />
        <a
          href={toPath("my-tasks")}
          onClick={(e) => sidebarAnchorGo(e, navigate, "my-tasks", onCollapse)}
          className="orb-well flex h-[80px] min-w-0 flex-1 flex-col justify-center gap-2 px-3 text-left"
          aria-label={`Tasks status: ${blocked} blocked, ${overdue} overdue. Open My Tasks.`}
        >
          <p className="orb-label-sm whitespace-nowrap">Tasks Status</p>
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
        </a>
      </div>
    </div>
  );
}

function PanelLeftCloseGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18" />
    </svg>
  );
}
