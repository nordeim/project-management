// Path router: the single source of truth for mapping app views to URLs.
//
// The reference app is a browser SPA whose URLs are real paths —
// `/goals/<id>`, `/my-tasks`, `/activity`, … — with working browser
// back/forward. We preserve the single-page architecture (one Next.js
// route; every view path is rewritten to `/` in next.config.ts) while
// syncing view state to `location.pathname` via the History API.
//
// Legacy `?view=…&goal=…` links from the pre-path era still resolve, so
// old deep links keep working.

export type ViewId =
  | "dashboard"
  | "goals"
  | "goal-detail"
  | "my-tasks"
  | "tasks"
  | "activity"
  | "team"
  | "settings";

const VIEW_PATHS: Record<string, ViewId> = {
  "/my-tasks": "my-tasks",
  "/tasks": "tasks",
  "/activity": "activity",
  "/team": "team",
  "/settings": "settings",
  "/goals": "goals",
};

const LEGACY_VIEWS: ViewId[] = [
  "dashboard",
  "goals",
  "goal-detail",
  "my-tasks",
  "tasks",
  "activity",
  "team",
  "settings",
];

export interface UrlState {
  view: ViewId;
  goalId: string | null;
}

/** Parse a pathname (+ optional legacy search string) into view state. */
export function parseUrl(pathname: string, search = ""): UrlState {
  // Tolerate combined "?query" strings in the pathname argument.
  const qIndex = pathname.indexOf("?");
  if (qIndex !== -1) {
    search = pathname.slice(qIndex);
    pathname = pathname.slice(0, qIndex);
  }
  const path = pathname.replace(/\/+$/, "") || "/";

  // /goals/<id> -> goal detail
  const goalMatch = path.match(/^\/goals\/([^/]+)$/);
  if (goalMatch) {
    return { view: "goal-detail", goalId: decodeURIComponent(goalMatch[1]!) };
  }

  // Known section paths
  const byPath = VIEW_PATHS[path];
  if (byPath) return { view: byPath, goalId: null };

  // Legacy ?view=…&goal=… deep links (only when the path itself is the shell)
  if (path === "/") {
    const params = new URLSearchParams(search);
    const raw = params.get("view");
    if (raw && LEGACY_VIEWS.includes(raw as ViewId)) {
      const view = raw as ViewId;
      const goal = params.get("goal");
      if (view === "goal-detail") {
        return goal ? { view, goalId: goal } : { view: "goals", goalId: null };
      }
      return { view, goalId: null };
    }
  }

  // Unknown paths (e.g. direct hits on /foo) land on the dashboard —
  // next.config.ts only rewrites the known view paths, so anything else
  // is a 404 at the HTTP layer; this branch covers in-app robustness.
  return { view: "dashboard", goalId: null };
}

/** Serialize view state to the app path (what we pushState). */
export function toPath(view: ViewId, goalId?: string | null): string {
  if (view === "goal-detail") {
    return goalId ? `/goals/${encodeURIComponent(goalId)}` : "/goals";
  }
  if (view === "dashboard") return "/";
  return `/${view}`;
}
