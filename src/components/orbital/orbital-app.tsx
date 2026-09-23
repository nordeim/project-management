"use client";

// Root of the SPA: boots the store, lays out the neumorphic shell
// (raised sidebar + transparent main on the canvas), and switches views
// client-side. Desktop keeps the sidebar; mobile navigates via the bottom
// tab bar (HOME / GOALS / MY TASKS / AGENT / MORE) — MORE opens a bottom
// sheet with Tasks, Team and Settings. Signed-out visitors see the same
// shell with a LOG IN button (reference behavior, v1.4).
//
// v2.7 (measured live): every view-switch surface is a REAL ANCHOR now —
// the live re-deployed with <a href> navigation (sidebar, mobile tabs,
// pill nav, MORE sheet rows, dashboard wells, goal cards, Full log, the
// New Goal link at /goals?new=true). We render the same anchor DOM while
// keeping the SPA: plain left clicks call preventDefault + the store's
// navigate (pushState); modified clicks / middle-click fall through to
// the browser (real URLs open in new tabs — the href is truthful).

import { useEffect, useState, useSyncExternalStore } from "react";
import { Activity, ChevronLeft, ChevronRight, LayoutDashboard, ListTodo, Menu, Settings, SquareCheckBig, Target, Users, X } from "lucide-react";
import { useOrbital, type SessionUser } from "@/components/orbital/store";
import { Sidebar } from "@/components/orbital/sidebar";
import { DashboardView } from "@/components/orbital/views/dashboard-view";
import { GoalsView } from "@/components/orbital/views/goals-view";
import { GoalDetailView } from "@/components/orbital/views/goal-detail-view";
import { MyTasksView } from "@/components/orbital/views/my-tasks-view";
import { TasksView } from "@/components/orbital/views/tasks-view";
import { ActivityView } from "@/components/orbital/views/activity-view";
import { TeamView } from "@/components/orbital/views/team-view";
import { SettingsView } from "@/components/orbital/views/settings-view";
import { LogoMark } from "@/components/orbital/logo";
import { UserMenuOrLogin } from "@/components/orbital/user-menu";
import { sidebarCollapsedStore, toggleSidebarCollapsed } from "@/components/orbital/sidebar-collapse";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { toPath, type ViewId } from "@/lib/router";

const TABS: Array<{ view: ViewId; label: string; icon: React.ReactNode }> = [
  { view: "dashboard", label: "Home", icon: <LayoutDashboard size={20} strokeWidth={2} /> },
  { view: "goals", label: "Goals", icon: <Target size={20} strokeWidth={2} /> },
  { view: "my-tasks", label: "My Tasks", icon: <SquareCheckBig size={20} strokeWidth={2} /> },
  { view: "activity", label: "Agent", icon: <Activity size={20} strokeWidth={2} /> },
];

// v2.2 (measured live middle state): the md–lg floating pill nav carries
// the SIX desktop nav items with their SHORT labels (Home / Goals / Tasks /
// Activity / Team / Settings — the live's wording, not the sidebar's) and
// 18px glyphs; every live nav uses lucide's square-check-big for the tasks
// view (the mobile tab bar's My Tasks glyph was swapped to match too).
const PILL_TABS: Array<{ view: ViewId; label: string; icon: React.ReactNode }> = [
  { view: "dashboard", label: "Home", icon: <LayoutDashboard size={18} strokeWidth={2} /> },
  { view: "goals", label: "Goals", icon: <Target size={18} strokeWidth={2} /> },
  { view: "my-tasks", label: "Tasks", icon: <SquareCheckBig size={18} strokeWidth={2} /> },
  { view: "activity", label: "Activity", icon: <Activity size={18} strokeWidth={2} /> },
  { view: "team", label: "Team", icon: <Users size={18} strokeWidth={2} /> },
  { view: "settings", label: "Settings", icon: <Settings size={18} strokeWidth={2} /> },
];

function tabActive(current: ViewId, target: ViewId): boolean {
  if (target === "goals") return current === "goals" || current === "goal-detail";
  return current === target;
}

/** v2.7 anchor click: plain left clicks do SPA navigation (pushState);
 *  modified clicks (cmd/ctrl/shift/alt) and middle-clicks fall through to
 *  the browser so the truthful href opens a new tab — the live's link
 *  semantics. */
function anchorGo(e: React.MouseEvent<HTMLAnchorElement>, go: (view: ViewId) => void, view: ViewId) {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
  e.preventDefault();
  go(view);
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
      {/* Decorative canvas glow (v2.2, re-measured on the isolated layer
          at 390/768/1440): the live paints a plain 600px circle at the
          VIEWPORT CENTER at every breakpoint — no `at` clause (the v1.8
          "59.17%/29.89%" reading was pixel pollution from content, and the
          v1.5 "87.44%/95.38%" note doubly stale). pointer-events none,
          under the content. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(600px, rgba(201, 179, 245, 0.35) 0%, rgba(0, 0, 0, 0) 70%)",
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
                  strokeWidth={2}
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
          {/* Mobile app bar (reference, v1.6/v1.7, measured): below md the
              desktop greeting header is REPLACED by a full-bleed raised bar
              holding the ORBITAL logo (left) and the user pill (right) —
              sticky top, bottom drop shadow, 62px tall, p 14px 20px. The
              live's mobile chrome runs through 767 (v2.2); at md the
              MIDDLE state takes over (greeting header + pill nav). */}
          <header
            className="sticky top-0 z-50 flex h-[62px] shrink-0 items-center justify-between bg-orb-raised px-5 orb-appbar-shadow md:hidden"
            aria-label="App bar"
          >
            {/* v2.7 (measured live): the mobile app-bar brand is NOT
                clickable — the reference header carries no button/link for
                the mark (the desktop sidebar's brand IS a link; see
                sidebar.tsx). */}
            <div className="flex items-center gap-2">
              {/* v1.9 (measured): the mobile brand is the compact variant —
                  a 9px six-dot mark (3px dots) + "ORBITAL" in Archivo
                  12px/600/ls 2.16px #2F2823, 8px apart. */}
              <LogoMark size={9} />
              <span className="font-archivo text-[12px] font-semibold uppercase leading-[18px] tracking-[0.18em] text-orb-body">Orbital</span>
            </div>
            <UserMenuOrLogin compact />
          </header>
          {/* v2.2 (measured live middle state): at md–lg every view except
              the dashboard carries a 52px strip with a "Dashboard" BACK
              button — a raised r10 neumorphic pill (bg #EEEAE6, the small
              -3px/-3px 7px 0.78 / 3px 3px 8px 0.22 pair, pad 7/14/7/10,
              gap 5, 112×34) with a chevron-left 15px #9A9A9A + 13px/500
              #6E6E6E label, strip pad 18px 20px 0 — sitting ABOVE the
              scroll port (it does not scroll away). The live shows it on
              goals, goal-detail, my-tasks, activity, team and settings
              alike. */}
          {view !== "dashboard" ? (
            <div className="hidden h-[52px] shrink-0 items-start pl-5 pt-[18px] md:flex lg:hidden">
              <button
                type="button"
                onClick={() => navigate("dashboard")}
                className="inline-flex h-[34px] items-center gap-[5px] rounded-[10px] bg-orb-raised p-[7px_14px_7px_10px] text-[13px] font-medium text-orb-muted shadow-[-3px_-3px_7px_rgba(255,250,244,0.78),3px_3px_8px_rgba(160,143,126,0.22)] transition-colors hover:text-orb-heading"
              >
                <ChevronLeft size={15} strokeWidth={2} aria-hidden="true" className="text-[#9A9A9A]" />
                Dashboard
              </button>
            </div>
          ) : null}
          {/* v1.8: mobile content starts 28px below the 62px app bar
              (measured hero-card top at y=90 on the live app).
              v2.1 (WS-6.1, measured live mobile shell): main pad
              16px 6px 90px — horizontal split moved to the per-view
              containers (dashboard wrapper px-16, list views px-3).
              v2.2 (measured): the mobile spec holds through 767 (no sm:
              growth on the live); at md the middle state pads main
              12px 20px 100px (list h1 lands at y88 via the 52px strip
              + the view root's 24px; the dashboard root adds its own
              36px so the greeting lands at y48). */}
          <main className="orb-scroll relative z-[1] flex min-w-0 flex-1 flex-col overflow-y-auto px-[6px] pb-[90px] pt-4 md:px-5 md:pb-[100px] md:pt-3 lg:px-7 lg:pb-6 lg:pt-6">
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
              {view === "tasks" ? <TasksView /> : null}
              {view === "activity" ? <ActivityView /> : null}
              {view === "team" ? <TeamView /> : null}
              {view === "settings" ? <SettingsView /> : null}
            </div>
          </main>

          {/* Mobile bottom tab bar (reference, v1.7, measured; active state
              re-measured v2.3; width semantics re-measured v2.4): a
              FULL-WIDTH bottom-attached bar — rounded top corners only
              (20px), upward drop shadow, pad 8px 8px 12px. The view-tab
              buttons carry NO padding — every tab's icon+label sits in a
              flex-column chip (gap 4px, pad 8px 4px, radius 14px,
              transition 150ms) that STRETCHES TO THE FULL TAB WIDTH
              (73.2 of 73.2 at 390 — the live's anchors wrap full-width
              divs); the ACTIVE tab's chip gets the BRIGHT inset-well
              treatment (bg #EBE7E2 + the rgba(255,252,248,0.75)/
              rgba(180,165,150,0.32) inset pair — the .orb-nav-active
              pair). The MORE tab carries its OWN padding (8px 4px) plus
              an 8px flex-basis (mirroring the live's content-box basis
              participation), rendering it ~6.4px wider than the view tabs
              — and NEVER receives the well (color-only active state).
              Labels are 9px/600 uppercase; the bar is content-height
              driven (chip 53.5 — no min-height). Mobile chrome runs
              through 767 (v2.2) — at md the floating pill nav replaces
              it. */}
          <nav
            className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around rounded-t-[20px] bg-orb-raised px-2 pt-2 pb-[calc(env(safe-area-inset-bottom)+12px)] orb-tabbar-shadow md:hidden"
            aria-label="Primary"
          >
            {TABS.map((tab) => {
              const active = tabActive(view, tab.view);
              return (
                <a
                  key={tab.view}
                  href={toPath(tab.view)}
                  onClick={(e) => anchorGo(e, go, tab.view)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex flex-1 flex-col items-stretch justify-center text-[9px] font-semibold uppercase tracking-[0.05em] transition-colors",
                    active ? "text-orb-heading" : "text-[#767676]",
                  )}
                >
                  <span
                    className={cn(
                      "flex w-full flex-col items-center gap-1 rounded-[14px] px-1 py-2 transition-colors duration-150",
                      active && "orb-nav-active",
                    )}
                  >
                    {tab.icon}
                    {tab.label}
                  </span>
                </a>
              );
            })}
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              aria-expanded={moreOpen}
              aria-current={moreActive ? "page" : undefined}
              className={cn(
                "flex flex-[1_1_8px] flex-col items-center justify-center gap-1 px-1 py-2 text-[9px] font-semibold uppercase tracking-[0.05em] transition-colors",
                moreActive ? "text-orb-heading" : "text-[#767676]",
              )}
            >
              <Menu size={20} strokeWidth={2} />
              More
            </button>
          </nav>

          {/* Floating pill nav (v2.2, measured live middle state): at
              md–lg the mobile tab bar is replaced by a CENTERED floating
              pill — fixed, bottom 16px, left 50% translateX(-50%),
              ~495×71, pad 10px 16px, gap 4, bg #EEEAE6, radius 20, the
              LARGE panel shadow pair. It carries the brand (9px dot mark +
              "ORBITAL" 11px/600/ls 1.98px) and the SIX desktop nav items
              (Home/Goals/Tasks/Activity/Team/Settings, 18px icons, 16px
              labels). The ACTIVE tab renders as an inset WELL chip —
              bg #EBE7E2, radius 12, pad 8/12, flex col center gap 3px,
              the 3px inset pair rgba(255,252,248,0.75)/rgba(180,165,150,
              0.32), icon+label #3A3A3A, label 9px/600/ls 0.36px
              uppercase; inactive tabs stay transparent with #767676 and a
              400-weight label. */}
          <nav
            className="fixed bottom-4 left-1/2 z-40 hidden -translate-x-1/2 items-center gap-1 rounded-[20px] bg-orb-raised p-[10px_16px] orb-pill-nav-shadow md:flex lg:hidden"
            aria-label="Primary"
          >
            {/* v2.2 (measured): the live brand block carries mr-4px (the pill
                gap 4px does NOT separate brand from tabs — the margin does). */}
            <span className="mr-1 flex items-center gap-1.5 p-[4px_10px_4px_4px]" aria-hidden="true">
              <LogoMark size={9} />
              <span className="font-archivo text-[11px] font-semibold uppercase leading-none tracking-[0.18em] text-orb-body">ORBITAL</span>
            </span>
            {PILL_TABS.map((tab) => {
              const active = tabActive(view, tab.view);
              return (
                <a
                  key={tab.view}
                  href={toPath(tab.view)}
                  onClick={(e) => anchorGo(e, go, tab.view)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex flex-col items-center justify-center gap-[3px] rounded-[12px] px-3 py-2 transition-colors",
                    active
                      ? "bg-orb-well text-orb-heading shadow-[inset_-3px_-3px_6px_rgba(255,252,248,0.75),inset_3px_3px_6px_rgba(180,165,150,0.32)]"
                      : "text-[#767676]",
                  )}
                >
                  {tab.icon}
                  <span
                    className={cn(
                      "text-[9px] uppercase leading-[13.5px] tracking-[0.04em]",
                      active ? "font-semibold" : "font-normal",
                    )}
                  >
                    {tab.label}
                  </span>
                </a>
              );
            })}
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
              className="gap-0 rounded-t-[24px] border-t-0 bg-orb-raised px-5 pt-5 pb-[calc(env(safe-area-inset-bottom)+40px)] orb-sheet-shadow"
            >
              <div className="mx-auto h-1 w-10 rounded-full bg-[#CCC7C0]" aria-hidden="true" />
              <SheetHeader className="flex-row items-center justify-between space-y-0 px-0 pb-6 pt-[20px]">
                <SheetTitle asChild>
                  {/* v2.8 (measured): the live's brand textContent is the
                      literal "ORBITAL" (their span keeps a redundant
                      text-transform: uppercase — mirrored). */}
                  <span className="flex items-center gap-2 font-archivo text-[12px] font-semibold uppercase leading-[18px] tracking-[0.18em] text-orb-body">
                    <LogoMark size={9} />
                    ORBITAL
                  </span>
                </SheetTitle>
                <button
                  type="button"
                  onClick={() => setMoreOpen(false)}
                  className="orb-sheet-close flex h-8 w-8 items-center justify-center rounded-[10px] bg-orb-raised text-orb-body transition-colors hover:text-orb-heading"
                  aria-label="Close menu"
                >
                  <X size={16} strokeWidth={2} />
                </button>
              </SheetHeader>
              <nav className="px-0" aria-label="More views">
                <ul className="space-y-[8px]">
                  {(
                    [
                      // v2.7 (measured live): the MORE sheet rows are real
                      // links now — "Tasks" targets the NEW all-tasks view
                      // at /tasks (not /my-tasks).
                      { view: "tasks", label: "Tasks", href: "/tasks", icon: <ListTodo size={20} strokeWidth={2} /> },
                      { view: "team", label: "Team", href: "/team", icon: <Users size={20} strokeWidth={2} /> },
                      { view: "settings", label: "Settings", href: "/settings", icon: <Settings size={20} strokeWidth={2} /> },
                    ] as const
                  ).map((item) => (
                    <li key={item.view}>
                      <a
                        href={item.href}
                        onClick={(e) => anchorGo(e, go, item.view)}
                        aria-current={view === item.view ? "page" : undefined}
                        className="flex h-[49px] w-full items-center gap-3 text-left text-[16px] font-normal text-orb-body transition-colors hover:text-orb-heading"
                      >
                        <span className="text-orb-body" aria-hidden="true">
                          {item.icon}
                        </span>
                        {item.label}
                      </a>
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
