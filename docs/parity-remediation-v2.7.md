# Parity & Infrastructure Remediation — v2.7 — EXECUTED

Session 25 plan. Survey executed 2026-09-23 against the live reference
(`https://agent-pm-copy-15e23720.base44.app/`, authenticated as
`sepnetflix2023@outlook.com`) and the clone (production standalone server on
:3000, freshly re-seeded `db/custom.db`) with paired agent-browser sessions
(live + clone) at 390 / 768 / 1440. Every finding below is computed-style
verified on BOTH apps.

Baseline gate before any change (pulled at 7e9e9f9, v2.6 state): lint 0 ·
typecheck 0 · 137/137 unit · build clean · 30/30 smoke · 44/44 Playwright.
The v2.6 push is healthy — this session is another drift-correction pass:
the live was re-deployed since v2.6 and converted its navigation to REAL
ANCHOR links, added a new all-tasks view, and left two interaction seams
dead.

## Findings

### A. Visual / functional parity deltas (live vs clone)

- **F1 (HIGH) — Navigation semantics: every view-switch surface on the live
  is now a real `<a href>` anchor.** The v1.4–v2.6 button-based SPA nav is
  gone. Verified by DOM census on both apps:
  - Desktop sidebar nav ×6: `<a href="/">`, `/goals`, `/my-tasks`,
    `/activity`, `/team`, `/settings` (labels Dashboard/Goals/My Tasks/
    Agent Activity/Team/Settings — geometry UNCHANGED: 208×39 rows at the
    same y-positions, icons target/square-check-big/activity/users/settings
    at stroke 2). The clone renders buttons.
  - Sidebar BRAND ("ORBITAL" wordmark + dot mark): `<a href="/">` (the
    clone renders a button "Orbital home").
  - Sidebar "TASKS STATUS" widget: `<a href="/my-tasks">` (the clone
    renders a button).
  - Mobile tab bar ×4: `<a href="/">`, `/goals`, `/my-tasks`, `/activity`
    (Home/Goals/My Tasks/Agent; chip geometry, inset-well active state and
    73×4+81 census all UNCHANGED — only the element type changed). The MORE
    button stays a `<button>` on the live ✓.
  - 768 floating pill nav ×6: `<a href>` with the SHORT labels
    (Home/Goals/Tasks/Activity/Team/Settings — the pill's "Tasks" targets
    `/my-tasks`, NOT the new /tasks view). Pill geometry 495×71 UNCHANGED.
  - MORE sheet rows ×3: `<a href="/tasks">` (Tasks — the NEW view, see F2),
    `/team`, `/settings`. The clone renders buttons targeting my-tasks/
    team/settings.
  - Dashboard stat wells ×3: `<a href="/goals">` (Active Goals),
    `/my-tasks` (Blocked Tasks), `/my-tasks` (Completed Tasks) — 149×157
    desktop / 104×148 mobile, geometry UNCHANGED. The clone renders
    buttons.
  - Dashboard goal wells ×3 + goals-view cards ×3 + mobile goal cards:
    `<a href="/goals/<id>">` (490×84 desktop / 311×84 mobile / 1072×166
    goals view — geometry UNCHANGED). The clone renders buttons.
  - Dashboard "Full log" ×2: `<a href="/activity">` and `<a href="/goals">`
    (55×18). The clone renders buttons.
  - Dashboard "New Goal" (the 132×40 large pill): `<a
    href="/goals?new=true">` — clicking NAVIGATES to the goals view AND
    auto-opens the wizard; the `?new=true` deep link auto-opens the wizard
    on a hard load too (verified: the fixed z-100 overlay with "Tell me
    about your goal…" renders after a full navigation to
    `/goals?new=true`). The clone renders a button that opens the dialog
    in place without navigation.
  - CONFIRMED UNCHANGED (buttons on both): the 768 back-strip "Dashboard"
    (112×34), the goals-view "NEW GOAL" (121×35), the MORE trigger, the
    goals-view filter chips, the wizard controls.
- **F2 (HIGH) — NEW VIEW: `/tasks` (all tasks).** The live added an
  all-tasks view reachable from the mobile MORE sheet's "Tasks" row (its
  only entry point — no sidebar/pill/tab item targets it):
  - h1 "Tasks" 28px/400 + subtitle "31 total tasks across all goals"
    (14px muted).
  - Five filter tabs with counts — All (31) / Pending (2) / In Progress
    (1) / Blocked (2) / Done (26) — the EXACT My-Tasks chip spec (12px/600,
    ls 0.72px, pad 7px 14px, h 32, active bg #EBE7E2). Desktop row y=129
    after the h1 block; mobile renders the same scrollable chip row.
  - Task rows: `div.cursor-pointer` cards — 1072 wide desktop / 354
    mobile, r14, bg #EEEAE6, pad 14px 18px, content = the TaskCard stack
    (status dot 8×8 + 11px/500 label + AI chip 10px/500 #996CE4, h4 title
    14px/500, description p 12px/400 #6B6B72 when present, meta row
    11px/400 #6E6E6E gap 16 mt 10). Row heights vary with content:
    98 (no description) / 117 (description) / 120 (description + AI chip),
    ~12px row gap. **NO edit/delete action squares** (unlike goal-detail
    TaskCards) and the click is INERT on the live (no dialog, no
    navigation — a WIP seam on their side; replicated faithfully).
  - No bottom-tab active state on /tasks (NONE of the five mobile tabs
    carries the inset well while on /tasks; the my-tasks tab is active on
    /my-tasks as before).
  - Route wiring needed: next.config.ts rewrite + router mapping + the
    store's navigate("tasks").
- **F3 (MEDIUM) — Home icon swap: the live's Home tab now renders lucide
  `layout-dashboard`** (mobile tab bar AND the 768 pill nav — measured 20px
  and 18px at stroke 2). The clone renders `layout-grid` in both places.
  The desktop sidebar's Dashboard icon is already `layout-dashboard` on
  both apps (no change).
- **F4 (MEDIUM) — The dashboard completion RING is dead on the live.** The
  ring panel (desktop 180×180 / mobile 166×150, "84% done" + the CSS
  progress well) renders as a plain `div` with `cursor: pointer` whose
  click does NOTHING — verified with a full mousedown/mouseup/click
  sequence on a solid authenticated session (stays on `/`, no dialog, no
  overlay; the v1.5 "Open goals" affordance is gone). The clone renders a
  button that navigates to the goals view. NOTE: the live's user pill is
  NOT dead (the full mouse sequence opens the Log Out popover — the
  clone's working popover stays).
- **F5 (LOW) — The mobile app-bar brand is not clickable on the live**
  (the header contains no a/button other than the LOG IN/user pill; the
  ORBITAL mark is a plain element). The clone renders a button "Orbital
  home" that navigates to the dashboard.

### B. Non-findings (verified equal — do not touch)

Stroke census: every icon on the live still renders at the lucide default
2 (sidebar, tabs, pill, task-meta, zap, picker chevrons — the v2.6
single-class system holds). Mobile chrome: tab bar 390×74 (y695 at 768
viewport height), tab census [73×4, 81], active chip #EBE7E2 + the inset
pair, 9px/600 labels, MORE sheet 390×303 r24 with 49×350 rows. 768 pill
nav 495×71 with the brand block + inset-well active chip; back strip
112×34 r10 (button on both). Desktop: greeting 28/400, date card 330×180
(plain div on both — never was clickable on the live), sidebar geometry
(208×39 rows, WORKSPACE/MANAGEMENT groups, collapse control), NPA block
(plain div, not clickable on the live; the clone's NPA well is a div
surface — equal), goals panel wells, goal cards 1072×166, goal-detail task
rows 1072×98/117 (div.cursor-pointer → task dialog on the live; button →
dialog on the clone — functionally identical, geometry identical; the
TaskCard gets a `cursor-pointer` class so the hover affordance matches).
User pill → Log Out popover (works on BOTH — full mouse sequence
verified on the live). Login page, LOG IN pill spec, wizard chrome,
date picker, check-in modal, team/settings/my-tasks views: all unchanged
per the v2.6 pins.

## Work streams

### WS-1 — Anchor-based navigation (F1)

A shared `NavAnchor` seam (client-side navigation on click, real href for
semantics — right-click/middle-click/crawlers see real URLs):
`<a href={toPath(view, goalId)} onClick={(e) => { if (plain left click)
{ e.preventDefault(); go(view); } }}>`. The clone stays an SPA (pushState)
while rendering the live's DOM shape. Surfaces:
- `orbital-app.tsx`: TABS ×4 → anchors (href /, /goals, /my-tasks,
  /activity); PILL_TABS ×6 → anchors; MORE sheet rows → anchors with
  "Tasks" → `/tasks` (the new view).
- `sidebar.tsx`: nav items ×6 → anchors; the brand → `<a href="/">`; the
  TASKS STATUS widget → `<a href="/my-tasks">`.
- `goals-view.tsx`: goal cards → `<a href="/goals/<id>">` (desktop + the
  mobile list).
- `dashboard-view.tsx`: stat wells ×3 → anchors (/goals, /my-tasks,
  /my-tasks); goal wells → /goals/<id>; "Full log" ×2 → /activity, /goals;
  the New Goal pill → `/goals?new=true` (navigate to goals AND open the
  wizard).
- `goals-view.tsx`: read `?new=true` on mount (and in applyUrlState) →
  open the NewGoalDialog (deep-link parity).
- `user-menu.tsx`: KEEP the button + popover (functionally identical to
  the live's div.menu; document the element-type note).
Pin with Playwright: tab bar items are `getByRole("link")` with the exact
hrefs; the sidebar nav renders anchors; the dashboard wells/Full log/New
Goal render anchors with the exact href map; `/goals?new=true` auto-opens
the wizard (soft nav AND hard load).

### WS-2 — The /tasks view (F2)

- `router.ts`: ViewId gains `"tasks"`; VIEW_PATHS["/tasks"] = "tasks";
  toPath handles it.
- `next.config.ts`: add the `/tasks` rewrite.
- New `views/tasks-view.tsx`: h1 "Tasks" + sub "{n} total tasks across all
  goals" + the five filter chips (the My-Tasks chip spec, with counts from
  the full task list) + task rows rendered as `div.cursor-pointer` cards
  (TaskCard's inner stack WITHOUT the action squares and WITHOUT the
  open-on-click — inert, faithfully replicating the live's WIP seam).
- `store.ts`: navigate("tasks"); the view switch renders TasksView; the
  mobile tab/pill/sidebar active states DON'T light for tasks (no tab
  carries the well on /tasks).
- `orbital-app.tsx`: the MORE sheet "Tasks" row → go("tasks").
- Data: the store already holds allTasks (the v2.5 NPA seam) — the view
  derives its list + counts from it.
Pin with Playwright: /tasks serves the view (heading + subtitle + counts
31/2/1/2/26 with the seed), the five chips filter, rows are non-button
divs with no action squares, clicking a row opens NO dialog, and no
mobile tab is active on /tasks.

### WS-3 — Home icon swap (F3)

`orbital-app.tsx`: TABS[0] and PILL_TABS[0] icon `LayoutGrid` →
`LayoutDashboard`. Pin: the mobile Home tab's svg carries
`lucide-layout-dashboard`.

### WS-4 — Dead ring + inert brand (F4 + F5)

- `dashboard-view.tsx`: the ring panel button → a plain `div` with
  `cursor-pointer` (visual affordance parity) and NO onClick (the live's
  ring is inert). Remove the "Open goals" aria-label. Mobile + desktop.
- `orbital-app.tsx`: the mobile app-bar brand button → a plain element
  (no onClick, no button). The 768 pill brand is already a plain span ✓.
Pin: the ring is not a link/button and clicking it does not navigate; the
mobile brand is not a button.

### WS-5 — TaskCard hover affordance (minor)

`task-card.tsx`: add `cursor-pointer` to the card button (the live's rows
show the pointer cursor; the clone's button shows default).

### WS-6 — Verification

1. Full gate: lint → typecheck → unit (137) → build → smoke (30) → e2e
   (44 — update the mobile-nav/goals specs to the anchor DOM, add the
   /tasks + wizard-deep-link + dead-ring pins).
2. Re-probe every changed surface against the live with computed styles
   (anchor census on both apps, /tasks view structure, tab census, the
   wizard deep link).
3. VLM sanity pass on regenerated screenshots.

### WS-7 — Screenshots + docs

1. Regenerate the affected `docs/screenshots/*.png` (nav surfaces, /tasks
   view — add a new 16-tasks screenshot; dashboard).
2. README (nav-anchor convention, /tasks view), AGENTS.md (navigation
   section rewrite — anchors + href map + the dead-ring note), CLAUDE.md
   (same), PAD v2.7 revision block, SKILL.md (anchor-nav lesson), the
   session_25 log, the worklog; mark this plan executed.

### WS-8 — Ship

Conventional Commit on `main`, push via `docs/ssh_git_wrapper_v3.py`,
verify the remote ref equals local HEAD, shred the key.

## Execution record (2026-09-23)

All work streams executed. Final gate: lint 0 · typecheck 0 · 138/138
unit (the /tasks router mapping pinned) · build clean · 30/30 smoke ·
60/60 Playwright (the 44 v2.6 checks + 16 net-new v27 pins: the anchor
census across every surface, the /tasks view, the wizard deep link on
soft nav AND hard load, the layout-dashboard Home icon, the dead ring,
the inert mobile brand). Re-probes EXACT on every changed surface. See
docs/session_25.md.
