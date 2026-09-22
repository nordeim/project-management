# Session 22 — v2.5 data-drift correction (feed semantics + NPA derivation + logged-out chrome + seed regeneration)

Continuing from session_21 (v2.4 shipped at a53f932; session_21 log
followed at 3f19ed4). Workspace refreshed with `git pull` → 3f19ed4.

Core docs re-read (AGENTS/CLAUDE/README/PAD v2.4 + SKILL.md), session docs
reviewed (session_20, worklog, parity-remediation-v2.4, session_21), then
validated against the codebase: `.env` `DATABASE_URL="file:../db/custom.db"`
with `db/` at the repo root, the db-path seam, vitest + playwright configs,
and the v2.4 chrome all match the documented state.

**Baseline gate GREEN on the pulled state** — lint 0 · typecheck 0 · 137/137
unit · build clean · 30/30 smoke · 29/29 Playwright. (The shell's absolute
`DATABASE_URL` override trap re-confirmed — every command ran with
`env -u DATABASE_URL`.)

**Live re-crawl (authenticated sessions at 390/768/1440 + fresh LOGGED-OUT
sessions at the same widths — closing the one state v2.4 flagged as
uncrawled):** the live's workspace DATA was regenerated since v2.4 (new AI
plans for goals 2–3, a rebuilt 36-entry activity feed), which surfaced
previously-invisible rendering semantics plus one first-crawled chrome
surface. All findings computed-style verified on BOTH apps; task/goal
counts, chrome geometry, and the wizard re-confirmed equal. Seven findings
(docs/parity-remediation-v2.5.md):

- F1 (HIGH) **Activity view hero ALSO renders in its date group**: the live
  shows "Online · 36" with 36 timestamped rows — the hero is not sliced out
  (the clone's `groupActivityByDate(activity.slice(1))` rendered N−1).
- F2 (HIGH) **Dashboard activity panel caps at 20 rows** (the live renders
  20 of its 36; the clone rendered every entry).
- F3 (HIGH) **Logged-out LOG IN pill spec (first crawl ≥1024)**: desktop =
  r12 / pad 11px 20px (content-driven h40) / the standard raised pair;
  mobile app-bar = r10 / pad 6px 14px (h≈28.5) / the small -3px pair. The
  clone's `rounded-xl` computed to 20px through the shadcn `--radius: 1rem`
  override — the documented Tailwind v4 token trap.
- F4–F6 (HIGH, seed) **Goals 2–3 regenerated + a 36-entry feed**: new
  descriptions and task sets (Templates Base44's overdue A/B task; Content
  Team's blog-posts task; the manual no-AI "Draft Q3 blog post calendar"),
  feed = 3 goal_analyzed + 3 tasks_generated (12/9/10) + 30 task_assigned,
  all 2026-07-16, one "Thu Jul 16 2026" group.
- F7 (MEDIUM, seed) **People directory += "Templates Base44" +
  "Content Team"**.
- Found during re-probe: **NPA derivation** — the live derives "Next
  Planned Action" from the first blocked TASK (its feed has no status
  updates), not from blocked check-in rows; added to the plan as a WS
  mid-execution.

**TDD execution (plan validated against the codebase before
implementing):**

- RED: 8 new Playwright assertions in `tests/e2e/v25-parity.spec.ts`
  (hero-in-group count invariant, 12-task generation entry, 20-row cap,
  goals 2–3 regenerated plans, LOG IN specs at desktop + mobile) — all
  failed as expected; then the NPA unit contract rewritten RED (3 failing
  checks) before the seam.
- WS-1: `activity-view.tsx` groups the FULL feed (`slice(1)` removed).
- WS-2: `dashboard-view.tsx` slices `activity.slice(0, 20)`.
- WS-3: `user-menu.tsx` LOG IN — explicit `rounded-[12px] py-[11px] px-5`
  (standard pair) and `rounded-[10px] py-[6px] px-[14px]` (small pair).
- WS-4: `prisma/seed.ts` — goals 2–3 new plans/descriptions, 2 new people,
  the 36-entry feed in the live's rendered order.
- NPA (mid-execution): `src/lib/next-action.ts` rewritten task-based
  (`nextPlannedAction(tasks, goals)` — display order = goal order then
  task sortOrder, unknown goals last; 6 unit checks), the store gained an
  `allTasks` slice (`/api/tasks`) wired into all 12 activity-refresh
  sites, the dashboard passes `allTasks + goals`.
- GREEN hardening: two feed tests made order-independent (the suite's
  mutating goals specs legitimately add feed rows — the count invariant
  now uses a ≥36 floor plus a hero==first-row check), one race fixed by
  waiting on feed content instead of the static panel header; the
  "Target crashed" failures were the documented sandbox thread-budget
  trap (browser sessions closed before Playwright runs).
- **FINAL GATE GREEN: lint 0 · typecheck 0 · 137/137 unit · build clean ·
  30/30 smoke · 36/36 Playwright** (29 + 7 new).

**Re-probe (computed styles, both apps):** activity view EXACT (36 rows,
"Online · 36", single "Thu Jul 16 2026" label, hero message == first group
row); dashboard EXACT (20 rows, NPA `Resolve blocker on "Review Q3 project
milestones"` identical, stats/numerals unchanged); goals 2–3 detail text
IDENTICAL word-for-word (diff empty); goal-detail named-glyph census
IDENTICAL (zap 9@1.5 ×9, calendar/pencil/trash/user/clock at the right
sizes and strokes); LOG IN pill exact at 1440/768/390 (pinned by the new
Playwright checks).

**Artifacts:** 15 screenshots regenerated from the production build (incl.
the wizard flow 05/06 with a REAL AI 9-task generation — scratch goal
deleted after, seed back to 3 goals; 14-login from a fresh logged-out
session). `.env.example` re-verified truthful (DATABASE_URL / AUTH_SECRET /
NEXT_PUBLIC_SITE_URL all implemented). Docs aligned: README (feed
semantics, dashboard cap + NPA, LOG IN spec, seed counts, 36 e2e), AGENTS
(activity feed v1.6–v2.5, dashboard 20-cap + task-based NPA, LOG IN pill
spec incl. the rounded-xl trap, seam list), CLAUDE (same), PAD v2.5
revision block, SKILL.md (counts, three new lessons), this log, the repo
worklog, and the v2.5 plan marked EXECUTED.

**Suggested next steps:** none required — the new semantics are pinned by
Playwright and the seed mirrors the live's current data. Optional next
drift check: the live's goal 1 was NOT regenerated this deploy; if it
eventually is, the seed's g1tasks + feed's 12-task count need a re-crawl.
