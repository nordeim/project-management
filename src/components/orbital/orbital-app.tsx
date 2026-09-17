"use client";

// Root of the authenticated SPA: boots the store, lays out the rounded app
// panel (sidebar + main), and switches views client-side. Mobile gets a
// hamburger + slide-over sidebar.

import { useEffect, useState } from "react";
import { useOrbital } from "@/components/orbital/store";
import { Sidebar } from "@/components/orbital/sidebar";
import { DashboardView } from "@/components/orbital/views/dashboard-view";
import { GoalsView } from "@/components/orbital/views/goals-view";
import { GoalDetailView } from "@/components/orbital/views/goal-detail-view";
import { MyTasksView } from "@/components/orbital/views/my-tasks-view";
import { ActivityView } from "@/components/orbital/views/activity-view";
import { TeamView } from "@/components/orbital/views/team-view";
import { SettingsView } from "@/components/orbital/views/settings-view";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export function OrbitalApp({ user }: { user: { id: string; email: string; name: string; avatarColor: string } }) {
  const boot = useOrbital((s) => s.boot);
  const view = useOrbital((s) => s.view);
  const setField = useOrbital.setState;
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setField({ user });
    void boot();
  }, [boot, setField, user]);

  return (
    <div className="min-h-screen bg-orb-canvas p-0 sm:p-3 lg:p-4">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-[1500px] overflow-hidden rounded-none bg-orb-surface sm:rounded-[28px]">
        {/* Desktop sidebar */}
        <aside className="hidden w-[264px] shrink-0 border-r border-black/[0.05] lg:flex lg:flex-col">
          <Sidebar />
        </aside>

        {/* Mobile slide-over sidebar */}
        <div
          className={cn(
            "fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] transition-opacity lg:hidden",
            menuOpen ? "opacity-100" : "pointer-events-none opacity-0",
          )}
          aria-hidden="true"
          onClick={() => setMenuOpen(false)}
        />
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-[280px] bg-orb-surface shadow-2xl transition-transform duration-300 lg:hidden",
            menuOpen ? "translate-x-0" : "-translate-x-full",
          )}
          aria-label="Sidebar menu"
          aria-hidden={!menuOpen}
        >
          <Sidebar onCollapse={() => setMenuOpen(false)} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile top bar */}
          <div className="flex items-center gap-3 px-4 pt-4 lg:hidden">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-xl text-orb-heading"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </Button>
            <span className="text-[14px] font-bold uppercase tracking-[0.18em] text-orb-heading">Orbital</span>
          </div>

          <main className="orb-scroll min-w-0 flex-1 overflow-y-auto px-4 pb-10 pt-4 sm:px-7 sm:pt-6 lg:px-9 lg:pt-8">
            {view === "dashboard" ? <DashboardView /> : null}
            {view === "goals" ? <GoalsView /> : null}
            {view === "goal-detail" ? <GoalDetailView /> : null}
            {view === "my-tasks" ? <MyTasksView /> : null}
            {view === "activity" ? <ActivityView /> : null}
            {view === "team" ? <TeamView /> : null}
            {view === "settings" ? <SettingsView /> : null}
          </main>
        </div>
      </div>
    </div>
  );
}
