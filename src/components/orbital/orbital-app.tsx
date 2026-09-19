"use client";

// Root of the SPA: boots the store, lays out the neumorphic shell
// (raised sidebar + transparent main on the canvas), and switches views
// client-side. Desktop keeps the sidebar; mobile navigates via the bottom
// tab bar (HOME / GOALS / MY TASKS / AGENT / MORE) — MORE opens a bottom
// sheet with Tasks, Team and Settings. Signed-out visitors see the same
// shell with a LOG IN button (reference behavior, v1.4).

import { useEffect, useState, useSyncExternalStore } from "react";
import { Activity, CheckSquare, ChevronRight, LayoutGrid, ListTodo, Menu, Settings, Target, Users, X } from "lucide-react";
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
  { view: "dashboard", label: "Home", icon: <LayoutGrid size={20} strokeWidth={1.8} /> },
  { view: "goals", label: "Goals", icon: <Target size={20} strokeWidth={1.8} /> },
  { view: "my-tasks", label: "My Tasks", icon: <CheckSquare size={20} strokeWidth={1.8} /> },
  { view: "activity", label: "Agent", icon: <Activity size={20} strokeWidth={1.8} /> },
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
    <div className="min-h-screen bg-orb-canvas p-0 lg:p-6">
      {/* Decorative canvas glow (v1.8, re-measured): a fixed purple radial
          gradient over the UPPER-MIDDLE-RIGHT of the viewport — the live app
          moved it from the v1.5 bottom-right corner; pointer-events none,
          under the content. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(600px at 59.1667% 29.8889%, rgba(201, 179, 245, 0.35) 0%, rgba(0, 0, 0, 0) 70%)",
        }}
      />
      {/* v1.7 (measured): the mobile shell is FULL-BLEED — no outer padding
          below lg (the app bar and tab bar run edge-to-edge; content pads
          itself ~22px). Desktop keeps the 24px canvas frame. */}
      <div className="relative z-[1] flex min-h-screen flex-col gap-6 lg:min-h-[calc(100vh-3rem)] lg:flex-row">
        {/* Desktop sidebar: a raised neumorphic panel on the canvas
            (reference layout, v1.4), collapsible to a 64px icon rail.
            Reference (v1.7, measured): the sidebar is STICKY — top 0, height
            = viewport − 40px — so the clock / TASKS STATUS / collapse control
            stay pinned while the main content scrolls. */}
        <aside
          className={cn(
            "hidden shrink-0 flex-col lg:sticky lg:top-0 lg:flex lg:h-[calc(100vh-40px)]",
            collapsed ? "w-16" : "w-[240px]",
          )}
        >
          {/* v1.7 (measured): the PANEL is the full sticky height (viewport −
              40px) with its own 28/16/16 padding — the aside carries no
              padding so the shadow box matches the live app's 860px panel. */}
          <div className="orb-raised-lg flex min-h-0 flex-1 flex-col pb-4 pt-7">
            <Sidebar collapsed={collapsed} />
            {/* Collapse bar (v1.7: the panel carries the bottom padding —
                this wrapper adds only the horizontal inset): full-width
                neumorphic raised control at the sidebar bottom — the
                reference pattern. Chevron points left while expanded
                (chevron-right rotated 180°) and right when collapsed. */}
            <div className="shrink-0 px-4">
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

        {/* v1.8 (measured): on desktop this column is exactly the viewport
            height (minus the 2×24px canvas frame) so the dashboard can fill
            it with a 1fr bottom row while other views scroll inside main. */}
        <div className="flex min-w-0 flex-1 flex-col lg:h-[calc(100vh-3rem)]">
          {/* Mobile app bar (reference, v1.6/v1.7, measured): below lg the
              desktop greeting header is REPLACED by a full-bleed raised bar
              holding the ORBITAL logo (left) and the user pill (right) —
              sticky top, bottom drop shadow, 62px tall, p 14px 20px. With
              the v1.7 full-bleed shell it needs no negative margins. */}
          <header
            className="sticky top-0 z-50 flex h-[62px] shrink-0 items-center justify-between bg-orb-raised px-5 shadow-[0_4px_16px_rgba(160,143,126,0.18)] lg:hidden"
            aria-label="App bar"
          >
            <button
              type="button"
              onClick={() => navigate("dashboard")}
              className="flex items-center gap-2 rounded-xl focus-visible:outline-2 focus-visible:outline-ring"
              aria-label="Orbital home"
            >
              {/* v1.9 (measured): the mobile brand is the compact variant —
                  a 9px six-dot mark (3px dots) + "ORBITAL" in Archivo
                  12px/600/ls 2.16px #2F2823, 8px apart. */}
              <LogoMark size={9} />
              <span className="font-archivo text-[12px] font-semibold uppercase leading-[18px] tracking-[0.18em] text-orb-body">Orbital</span>
            </button>
            <UserMenuOrLogin compact />
          </header>
          {/* v1.8: mobile content starts 28px below the 62px app bar
              (measured hero-card top at y=90 on the live app). */}
          <main className="orb-scroll relative z-[1] flex min-w-0 flex-1 flex-col overflow-y-auto px-[22px] pb-24 pt-3 sm:px-7 sm:pt-6 lg:px-7 lg:pb-6 lg:pt-6">
            {/* Content clamp (reference, v1.5): every view renders inside a
                max-width 1200px column — the main area itself stays fluid.
                v1.8: flex-1 + min-h-0 so the column is exactly the scroll
                port height (taller views overflow it and main scrolls;
                the dashboard fills it with a 1fr bottom row). */}
            <div className="mx-auto flex min-h-0 w-full max-w-[1200px] flex-1 flex-col">
              {view === "dashboard" ? <DashboardView /> : null}
              {view === "goals" ? <GoalsView /> : null}
              {view === "goal-detail" ? <GoalDetailView /> : null}
              {view === "my-tasks" ? <MyTasksView /> : null}
              {view === "activity" ? <ActivityView /> : null}
              {view === "team" ? <TeamView /> : null}
              {view === "settings" ? <SettingsView /> : null}
            </div>
          </main>

          {/* Mobile bottom tab bar (reference, v1.7, measured): a
              FULL-WIDTH bottom-attached bar — rounded top corners only
              (20px), upward drop shadow, pad 8px 8px 12px. Tabs carry 20px
              icons and 9px/600 uppercase labels; the active tab is darker
              text only (no highlight pill). Replaces the v1.6 floating-pill
              reading. */}
          <nav
            className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around rounded-t-[20px] bg-orb-raised px-2 pt-2 pb-[calc(env(safe-area-inset-bottom)+12px)] shadow-[0_-4px_20px_rgba(160,143,126,0.22)] lg:hidden"
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
                    "flex min-h-[54px] flex-1 flex-col items-center justify-center gap-1 px-1 text-[9px] font-semibold uppercase tracking-[0.05em] transition-colors",
                    active ? "text-orb-heading" : "text-[#767676]",
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
                "flex min-h-[54px] flex-1 flex-col items-center justify-center gap-1 px-1 text-[9px] font-semibold uppercase tracking-[0.05em] transition-colors",
                moreActive ? "text-orb-heading" : "text-[#767676]",
              )}
            >
              <Menu size={20} strokeWidth={1.8} />
              More
            </button>
          </nav>

          {/* MORE bottom sheet: Tasks, Team, Settings — v2.0 (measured):
              radius 24, pad 20/20/40, upward-only shadow, 4px #CCC7C0 handle,
              a 32px r10 raised close square, the 9px brand mark + "ORBITAL"
              12px/600/ls 2.16 #2F2823, and PLAIN 16px/400 rows (h 49, 8px
              gaps, 20px list-todo/users/settings glyphs) over a 20% black +
              4px-blur scrim. */}
          <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
            <SheetContent
              side="bottom"
              showCloseButton={false}
              overlayClassName="bg-[rgba(0,0,0,0.2)] backdrop-blur-[4px]"
              className="gap-0 rounded-t-[24px] border-t-0 bg-orb-raised px-5 pt-5 pb-[calc(env(safe-area-inset-bottom)+40px)] shadow-[0_-8px_32px_rgba(160,143,126,0.28)]"
            >
              <div className="mx-auto h-1 w-10 rounded-full bg-[#CCC7C0]" aria-hidden="true" />
              <SheetHeader className="flex-row items-center justify-between space-y-0 px-0 pb-6 pt-[20px]">
                <SheetTitle asChild>
                  <span className="flex items-center gap-2 font-archivo text-[12px] font-semibold uppercase leading-[18px] tracking-[0.18em] text-orb-body">
                    <LogoMark size={9} />
                    Orbital
                  </span>
                </SheetTitle>
                <button
                  type="button"
                  onClick={() => setMoreOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-orb-raised text-orb-body shadow-[-4px_-4px_8px_rgba(255,250,244,0.78),4px_4px_8px_rgba(160,143,126,0.28)] transition-colors hover:text-orb-heading"
                  aria-label="Close menu"
                >
                  <X size={16} strokeWidth={2} />
                </button>
              </SheetHeader>
              <nav className="px-0" aria-label="More views">
                <ul className="space-y-[8px]">
                  {(
                    [
                      { view: "my-tasks", label: "Tasks", icon: <ListTodo size={20} strokeWidth={1.8} /> },
                      { view: "team", label: "Team", icon: <Users size={20} strokeWidth={1.8} /> },
                      { view: "settings", label: "Settings", icon: <Settings size={20} strokeWidth={1.8} /> },
                    ] as const
                  ).map((item) => (
                    <li key={item.view}>
                      <button
                        type="button"
                        onClick={() => go(item.view)}
                        aria-current={view === item.view ? "page" : undefined}
                        className="flex h-[49px] w-full items-center gap-3 text-left text-[16px] font-normal text-orb-body transition-colors hover:text-orb-heading"
                      >
                        <span className="text-orb-body" aria-hidden="true">
                          {item.icon}
                        </span>
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}
