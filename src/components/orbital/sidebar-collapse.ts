"use client";

// Sidebar collapse state as an external store (localStorage-backed) consumed
// through useSyncExternalStore — no setState-in-effect, hydration-safe
// (server snapshot = expanded), and the collapse persists across visits like
// the reference app.

const KEY = "orbital-sidebar-collapsed";

const listeners = new Set<() => void>();

function read(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KEY) === "1";
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  // Sync across tabs, matching the localStorage source of truth.
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function toggleSidebarCollapsed(): void {
  const next = !read();
  window.localStorage.setItem(KEY, next ? "1" : "0");
  for (const listener of listeners) listener();
}

export const sidebarCollapsedStore = {
  subscribe,
  getSnapshot: read,
  getServerSnapshot: (): boolean => false,
};
