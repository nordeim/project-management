# Session 25 — v2.7 anchor navigation + the /tasks view + dead-seam parity

Continuing from session_24 (v2.6 shipped at 1a86282; upstream added the
session_24 log + the Tailwind-V4 validation report at 7e9e9f9). Workspace
refreshed with `git pull` → 7e9e9f9. The vestigial `tailwind.config.ts`
was confirmed inert (no `@config` directive — the project is fully
CSS-first v4 per `globals.css`'s `@theme inline`; the validation report
matches the codebase).

**Baseline gate GREEN on the pulled state** — lint 0 · typecheck 0 ·
138→137/137 unit · build clean · 30/30 smoke · 44/44 Playwright. (The
shell's absolute `DATABASE_URL` override trap re-confirmed — every
command ran with `env -u DATABASE_URL`. The clone's `db/custom.db` was
re-seeded to the pristine 3 goals / 31 tasks / 36 entries after the
smoke suite's residue.)

**Live re-crawl (fresh authenticated agent-browser sessions at
390/768/1440, paired against the production clone on :3000):** the live
re-deployed again and converted its navigation to REAL ANCHOR LINKS,
added a new all-tasks view, and left two interaction seams dead. Five
findings (docs/parity-remediation-v2.7.md), every one computed-style
verified on BOTH apps:

- F1 (HIGH) **Anchor navigation everywhere**: sidebar nav ×6 + brand +
  TASKS STATUS widget, mobile tab bar ×4 (MORE stays a button), 768 pill
  nav ×6 (its "Tasks" targets /my-tasks), MORE sheet rows ×3 ("Tasks" →
  /tasks — the NEW view), dashboard stat wells + goal wells + Full log
  ×2 + the New Goal pill (/goals?new=true — navigates to goals AND
  auto-opens the wizard; the deep link works on hard loads too), and
  the goals-view cards (/goals/<id>). Geometry UNCHANGED everywhere —
  only the element semantics moved. The clone rendered buttons.
- F2 (HIGH) **NEW VIEW /tasks** (all tasks): h1 "Tasks" + "31 total
  tasks across all goals", the My-Tasks five-chip filter row with
  workspace counts, TaskCard-content rows as plain cursor-pointer divs
  — NO action squares, click INERT (the live's WIP seam). No entry
  point except the mobile MORE sheet; no tab/sidebar lights up on it.
- F3 (MEDIUM) **Home icon swap**: the live's Home tab + pill nav render
  lucide `layout-dashboard` (the clone used `layout-grid`).
- F4 (MEDIUM) **The dashboard ring is dead on the live** (plain
  cursor-pointer div, full mousedown/mouseup/click sequence → nothing;
  the user pill's Log Out popover still works — verified with the same
  full sequence).
- F5 (LOW) **The mobile app-bar brand is not clickable on the live.**

Non-findings re-confirmed equal: the whole v2.6 chrome (stroke census
all 2, tab census 73×4+81, sidebar geometry 208×39 at identical
y-positions, pill 495×71, group cards, goal-detail rows 117 with
descriptions / 98 without — the goals' own data decides), the 768
back-strip (button on both), the goals-view NEW GOAL (button on both),
the user pill popover, the date card/NPA (plain divs on both).

**TDD execution (plan validated against the codebase first):**

- RED: the router unit tests extended for /tasks (parseUrl + toPath +
  round-trip — 2 failing) and 16 new/rewritten Playwright assertions in
  `tests/e2e/v27-parity.spec.ts` (anchor census across every surface,
  /tasks counts + inert rows + no-active-tab, the wizard deep link on
  soft nav AND hard load, the layout-dashboard Home icon, the dead
  ring, the inert mobile brand) plus the mobile-nav/goals/workspace
  specs updated to the anchor DOM — all failed as expected.
- WS-1 anchors: `orbital-app.tsx` (TABS ×4, PILL_TABS ×6, MORE rows ×3,
  the shared `anchorGo` click contract — preventDefault + store
  navigate on plain left clicks, fall-through on modified/middle
  clicks), `sidebar.tsx` (nav ×6 + brand + TASKS STATUS), `goals-view.tsx`
  (cards ×2 variants), `dashboard-view.tsx` (StatColumn → anchors,
  goal wells, Full log ×2, the New Goal pill).
- WS-2 /tasks: `router.ts` + `next.config.ts` gain the mapping; new
  `views/tasks-view.tsx` (five chips + inert rows from `allTasks`).
- WS-3 icon: `LayoutGrid` → `LayoutDashboard` (TABS[0] + PILL_TABS[0]).
- WS-4 dead seams: the ring → plain `cursor-pointer` div (no handler);
  the mobile brand → plain element; TaskCard gains `cursor-pointer`.
- The wizard deep link: a store `newGoalIntent` flag (set by
  `openNewGoal()` on soft nav, by `boot()`/`applyUrlState()` on hard
  loads/popstate) + the GoalsView dialog DERIVING its open state from
  the flag (the first `useEffect`+setState draft tripped the
  `react-hooks/set-state-in-effect` lint rule — the derived form is
  both lint-clean and hydration-safe) + `syncUrl` keeping `?new=true`.
- GREEN hardening: the goals.spec add-task test now deletes its scratch
  task (order-independence for the /tasks counts), the /tasks count
  assertions derive from the API, the hard-load wizard test asserts the
  DIALOG (the modal hides the background h1 from role queries), and the
  hidden-variant collision is dodged with role queries.
- **FINAL GATE GREEN: lint 0 · typecheck 0 · 138/138 unit · build clean
  · 30/30 smoke · 60/60 Playwright** (44 + 16 net-new).

**Re-probe (computed styles, both apps): EXACT on every changed
surface** — sidebar href map identical; the mobile tab census renders 4
anchors + the More button with the live's exact hrefs and the
layout-dashboard icon at stroke 2; /tasks renders the live's h1/sub/
chips/rows (354×117 r14 pad 14/18, 31 rows, zero active tabs); the
MORE sheet rows are anchors to /tasks, /team, /settings;
/goals?new=true opens the wizard on a hard load; the ring is a DIV with
pointer cursor and no handler; the mobile brand has zero clickables.

**Artifacts:** the 14 nav-surface screenshots regenerated + a NEW
`16-tasks.png` (VLM-verified: h1/sub/chips/rows all correct); 05/06
(the real-AI wizard flow) stand unchanged from session_24.
`.env.example` re-verified truthful. Docs aligned: README (anchor-nav
convention, /tasks, 60 e2e, the 16-tasks shot), AGENTS/CLAUDE (the
anchor-nav + /tasks architecture facts, gate counts), PAD v2.7 revision
block, SKILL.md (lessons 8 + 9 — anchor/SPA coexistence, dead-seam
replication with the full-mouse-sequence caveat), this log, the
worklog, and the v2.7 plan marked EXECUTED.

**Suggested next steps:** none required — every changed surface is
pinned by 60 Playwright checks and re-probed EXACT. The next drift
watch: the live's anchor conversion left their ring and /tasks rows
unwired; if they wire them up, the dead-seam e2e pins will fail loudly
— re-measure before relaxing them.
