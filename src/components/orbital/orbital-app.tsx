"use client";

// Root of the authenticated SPA: boots the store, lays out the rounded app
// panel (sidebar + main), and switches views client-side. Desktop keeps the
// sidebar; mobile navigates via the bottom tab bar (HOME / GOALS / MY
// TASKS / AGENT / MORE) — MORE opens a bottom sheet with Tasks, Team and
// Settings — mirroring the reference app.

import { useEffect, useState, useSyncExternalStore } from "react";
import { Activity, CheckSquare, ChevronLeft, LayoutGrid, Menu, Settings, Target, Users, X } from "lucide-react";
import { useOrbital } from "@/components/orbital/store";
import { Sidebar } from "@/components/orbital/sidebar";
import { DashboardView } from "@/components/orbital/views/dashboard-view";
import { GoalsView } from "@/components/orbital/views/goals-view";
import { GoalDetailView } from "@/components/orbital/views/goal-detail-view";
import { MyTasksView } from "@/components/orbital/views/my-tasks-view";
import { ActivityView } from "@/components/orbital/views/activity-view";
import { TeamView } from "@/components/orbital/views/team-view";
import { SettingsView } from "@/components/orbital/views/settings-view";
import { LogoMark } from "@/components/orbital/logo";
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

export function OrbitalApp({ user }: { user: { id: string; email: string; name: string; avatarColor: string } }) {
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
    <div className="min-h-screen bg-orb-canvas p-0 sm:p-3 lg:p-4">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-[1500px] overflow-hidden rounded-none bg-orb-surface sm:rounded-[28px] lg:h-[calc(100vh-2rem)] lg:min-h-0">
        {/* Desktop sidebar: a white rounded panel inset in the surface
            (reference layout), collapsible to an icon rail. */}
        <aside
          className={cn(
            "hidden shrink-0 flex-col p-2 lg:flex",
            collapsed ? "w-[92px]" : "w-[268px]",
          )}
        >
          <div className="flex min-h-0 flex-1 flex-col rounded-[26px] bg-white shadow-[0_1px_2px_rgba(47,40,35,0.04),0_10px_28px_-16px_rgba(47,40,35,0.14)]">
            <Sidebar collapsed={collapsed} />
            {/* Collapse chevron, bottom center — mirrors the reference app */}
            <div className="flex shrink-0 justify-center pb-3">
              <button
                type="button"
                onClick={toggleSidebarCollapsed}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-pressed={collapsed}
                className="flex h-9 w-9 items-center justify-center rounded-full text-orb-muted transition-colors hover:bg-black/[0.05] hover:text-orb-heading"
              >
                <ChevronLeft
                  size={16}
                  strokeWidth={1.8}
                  className={cn("transition-transform duration-200", collapsed && "rotate-180")}
                />
              </button>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <main className="orb-scroll min-w-0 flex-1 overflow-y-auto px-4 pb-28 pt-5 sm:px-7 sm:pt-6 lg:px-9 lg:pb-10 lg:pt-8">
            {view === "dashboard" ? <DashboardView /> : null}
            {view === "goals" ? <GoalsView /> : null}
            {view === "goal-detail" ? <GoalDetailView /> : null}
            {view === "my-tasks" ? <MyTasksView /> : null}
            {view === "activity" ? <ActivityView /> : null}
            {view === "team" ? <TeamView /> : null}
            {view === "settings" ? <SettingsView /> : null}
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
