"use client";

// Root of the SPA: boots the store, lays out the neumorphic shell
// (raised sidebar + transparent main on the canvas), and switches views
// client-side. Desktop keeps the sidebar; mobile navigates via the bottom
// tab bar (HOME / GOALS / MY TASKS / AGENT / MORE) — MORE opens a bottom
// sheet with Tasks, Team and Settings. Signed-out visitors see the same
// shell with a LOG IN button (reference behavior, v1.4).

import { useEffect, useState, useSyncExternalStore } from "react";
import { Activity, CheckSquare, ChevronRight, LayoutGrid, Menu, Settings, Target, Users, X } from "lucide-react";
import { useOrbital, type SessionUser } from "@/components/orbital/store";
import { Sidebar } from "@/components/orbital/sidebar";
import { DashboardView } from "@/components/orbital/views/dashboard-view";
import { GoalsView } from "@/components/orbital/views/goals-view";
import { GoalDetailView } from "@/components/orbital/views/goal-detail-view";
import { MyTasksView } from "@/components/orbital/views/my-tasks-view";
import { ActivityView } from "@/components/orbital/views/activity-view";
import { TeamView } from "@/components/orbital/views/team-view";
import { SettingsView } from "@/components/orbital/views/settings-view";
import { LogoMark } from "@/components/orbital/logo";
import { UserMenuOrLogin } from "@/components/orbital/user-menu";
import { sidebarCollapsedStore, toggleSidebarCollapsed } from "@/components/orbital/sidebar-collapse";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { ViewId } from "@/lib/router";

const TABS: Array<{ view: ViewId; label: string; icon: React.ReactNode }> = [
  { view: "dashboard", label: "Home", icon: <LayoutGrid size={19} strokeWidth={1.8} /> },
  { view: "goals", label: "Goals", icon: <Target size={19} strokeWidth={1.8} /> },
  { view: "my-tasks", label: "My Tasks", icon: <CheckSquare size={19} strokeWidth={1.8} /> },
  { view: "activity", label: "Agent", icon: <Activity size={19} strokeWidth={1.8} /> },
];

function tabActive(current: ViewId, target: ViewId): boolean {
  if (target === "goals") return current === "goals" || current === "goal-detail";
  return current === target;
}

export function OrbitalApp({ user }: { user: SessionUser | null }) {
  const boot = useOrbital((s) => s.boot);
  const view = useOrbital((s) => s.view);
  const navigate = useOrbital((s) => s.navigate);
  const setField = useOrbital.setState;
  const [moreOpen, setMoreOpen] = useState(false);
  const collapsed = useSyncExternalStore(
    sidebarCollapsedStore.subscribe,
    sidebarCollapsedStore.getSnapshot,
    sidebarCollapsedStore.getServerSnapshot,
  );

  useEffect(() => {
    setField({ user });
    void boot();
  }, [boot, setField, user]);

  // Browser back/forward: re-derive view state from the URL (path routing).
  useEffect(() => {
    const onPopState = () => useOrbital.getState().applyUrlState();
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const moreActive = view === "team" || view === "settings";

  function go(view: ViewId) {
    navigate(view);
    setMoreOpen(false);
  }

  return (
    <div className="min-h-screen bg-orb-canvas p-6">
      {/* Decorative canvas glow (reference, v1.5): a fixed purple radial
          gradient over the bottom-right of the page — pointer-events none,
          under the content. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(600px at 87.4359% 95.3791%, rgba(201, 179, 245, 0.35) 0%, transparent 70%)",
        }}
      />
      <div className="relative z-[1] flex min-h-[calc(100vh-3rem)] gap-6">
        {/* Desktop sidebar: a raised neumorphic panel on the canvas
            (reference layout, v1.4), collapsible to a 64px icon rail. */}
        <aside
          className={cn(
            "hidden shrink-0 flex-col pt-7 pb-4 lg:flex",
            collapsed ? "w-16" : "w-[240px]",
          )}
        >
          <div className="orb-raised-lg flex min-h-0 flex-1 flex-col">
            <Sidebar collapsed={collapsed} />
            {/* Collapse bar: full-width neumorphic raised control at the
                sidebar bottom — the reference pattern. Chevron points left
                while expanded (chevron-right rotated 180°) and right when
                collapsed. */}
            <div className="shrink-0 px-4 pb-4">
              <button
                type="button"
                onClick={toggleSidebarCollapsed}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-pressed={collapsed}
                className="flex h-[30px] w-full items-center justify-center rounded-[10px] bg-orb-raised text-orb-muted shadow-[-5px_-5px_10px_rgba(255,250,244,0.78),5px_5px_10px_rgba(160,143,126,0.27)] transition-colors hover:text-orb-heading"
              >
                <ChevronRight
                  size={14}
                  strokeWidth={1.5}
                  className={cn("transition-transform duration-200", !collapsed && "rotate-180")}
                />
              </button>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <main className="orb-scroll relative z-[1] min-w-0 flex-1 overflow-y-auto px-4 pb-28 pt-5 sm:px-7 sm:pt-6 lg:px-7 lg:pb-6 lg:pt-7">
            {/* Content clamp (reference, v1.5): every view renders inside a
                max-width 1200px column — the main area itself stays fluid. */}
            <div className="mx-auto w-full max-w-[1200px]">
              {view === "dashboard" ? <DashboardView /> : null}
              {view === "goals" ? <GoalsView /> : null}
              {view === "goal-detail" ? <GoalDetailView /> : null}
              {view === "my-tasks" ? <MyTasksView /> : null}
              {view === "activity" ? <ActivityView /> : null}
              {view === "team" ? <TeamView /> : null}
              {view === "settings" ? <SettingsView /> : null}
            </div>
          </main>

          {/* Mobile bottom tab bar */}
          <nav
            className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-black/[0.06] bg-orb-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
            aria-label="Primary"
          >
            {TABS.map((tab) => {
              const active = tabActive(view, tab.view);
              return (
                <button
                  key={tab.view}
                  type="button"
                  onClick={() => go(tab.view)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-[62px] flex-1 flex-col items-center justify-center gap-1 pt-1.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] transition-colors",
                    active ? "text-orb-heading" : "text-orb-muted",
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              aria-expanded={moreOpen}
              aria-current={moreActive ? "page" : undefined}
              className={cn(
                "flex min-h-[62px] flex-1 flex-col items-center justify-center gap-1 pt-1.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] transition-colors",
                moreActive ? "text-orb-heading" : "text-orb-muted",
              )}
            >
              <Menu size={19} strokeWidth={1.8} />
              More
            </button>
          </nav>

          {/* MORE bottom sheet: Tasks, Team, Settings */}
          <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
            <SheetContent
              side="bottom"
              className="rounded-t-[28px] px-0 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-2"
            >
              <div className="mx-auto mb-1 h-1.5 w-10 rounded-full bg-black/[0.12]" aria-hidden="true" />
              <SheetHeader className="flex-row items-center justify-between space-y-0 px-5 pb-3 pt-2">
                <SheetTitle asChild>
                  <span className="flex items-center gap-2.5 text-[15px] font-bold uppercase tracking-[0.18em] text-orb-heading">
                    <LogoMark size={26} />
                    Orbital
                  </span>
                </SheetTitle>
                <button
                  type="button"
                  onClick={() => setMoreOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-orb-muted hover:bg-black/[0.05] hover:text-orb-heading"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </SheetHeader>
              <div className="px-3">
                {(
                  [
                    { view: "my-tasks", label: "Tasks", icon: <CheckSquare size={18} strokeWidth={1.8} /> },
                    { view: "team", label: "Team", icon: <Users size={18} strokeWidth={1.8} /> },
                    { view: "settings", label: "Settings", icon: <Settings size={18} strokeWidth={1.8} /> },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.view}
                    type="button"
                    onClick={() => go(item.view)}
                    aria-current={view === item.view ? "page" : undefined}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3.5 text-[15px] font-medium text-orb-heading transition-colors hover:bg-black/[0.04]"
                  >
                    <span className="text-orb-muted" aria-hidden="true">
                      {item.icon}
                    </span>
                    {item.label}
                  </button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}
