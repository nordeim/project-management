# Parity & Infrastructure Remediation — v2.5 — EXECUTED

Session 22 plan (executed 2026-09-22). Survey executed against the live
reference
(`https://agent-pm-copy-15e23720.base44.app/`, authenticated as
`sepnetflix2023@outlook.com`) and the clone (production standalone server on
:3000, freshly re-seeded `db/custom.db`) with paired agent-browser sessions
at 390 / 768 / 1440, plus fresh LOGGED-OUT sessions at the same widths —
closing the one state the v2.4 survey flagged as uncrawled (the logged-out
shell ≥1024). Every finding below is computed-style verified on BOTH apps.

Baseline gate before any change (pulled at 3f19ed4): lint 0 · typecheck 0 ·
137/137 unit · build clean · 30/30 smoke · 29/29 Playwright. The v2.4 push is
healthy — this session is a data-drift correction pass: the live's workspace
DATA was regenerated (new AI plans for goals 2–3, new activity log), which
surfaces both seed deltas and two feed-rendering semantics that the old data
could not reveal.

## Findings

### A. Visual / functional parity deltas (live vs clone)

- **F1 — Activity view: the hero entry ALSO renders in the date groups
  (HIGH).** The live renders "Online · 36" and 36 `… ago` rows: the most
  recent entry appears BOTH as the standalone hero card ("Last agent
  action") AND as the first row of its date group. The clone slices it off
  (`groupActivityByDate(activity.slice(1))` in `activity-view.tsx`) and
  renders only N−1 rows. Verified by paired row counts (live 36 rows /
  clone 21 rows against a 22-entry seed). The v1.9 "hero then groups"
  reading stays true — the slice is the bug.
- **F2 — Dashboard activity panel caps at 20 rows (HIGH).** The live's
  dashboard Agent Activity panel renders exactly 20 `… ago` rows (36
  entries exist; the feed is capped). The clone renders every entry the API
  returns (`activity.map(...)` in `dashboard-view.tsx`). With the new
  36-entry seed the clone's dashboard would render 36 rows vs the live's
  20.
- **F3 — LOG IN button (logged-out chrome) misses its measured spec
  (HIGH).** First crawl of the logged-out shell at 1024+ (the state v2.4
  flagged):
  - Desktop/tablet variant (dashboard header, ≥768): live = radius **12**,
    pad **11px 20px** (content-driven h40 = 11+lh18+11), the STANDARD
    raised pair `-5px -5px 10px rgba(255,250,244,0.78) / 5px 5px 12px
    rgba(160,143,126,0.27)`, 85×40 at x1158.7 y48. Clone = radius 20
    (`rounded-xl` resolves to 20px through the shadcn `--radius: 1rem`
    token override), pad 0 20 (`h-10`), 85×40 — same box, wrong
    radius/padding/shadow origin.
  - Mobile app-bar variant (<768): live = radius **10**, pad **6px 14px**
    (h28.5), the SMALL pair `-3px -3px 6px rgba(255,250,244,0.78) /
    3px 3px 6px rgba(160,143,126,0.22)`, 69.2×28.5. Clone = radius 20,
    pad 0 16 (`h-[34px]`), 73.2×34.
  - Typography already matches (12/600/ls 0.96 uppercase desktop ·
    11/600/ls 0.88 mobile); bg `#EEEAE6` matches.
- **F4 — Goal 2 "Launch new landing page" was regenerated on the live
  (HIGH, seed).** New description "Design, build and deploy a new marketing
  landing page for the Q3 campaign." and a completely new 9-task plan
  (8 done + 1 in_progress = 89%, 0 blocked): Design hero section wireframes
  (Sarah Johnson, Jul 5, 6h) · Write homepage copy (Marcus Lee, Jul 7, 4h) ·
  Develop responsive layout (Dev Team, Jul 10, 12h) · Integrate analytics
  tracking (Dev Team, Jul 12, 3h) · SEO optimization and meta tags (Sarah
  Johnson, Jul 14, 4h) · Cross-browser testing (QA Team, Jul 18, 8h) ·
  Performance optimization (Dev Team, Jul 20, 5h) · Final sign-off and
  deploy (Sarah Johnson, Jul 30, 2h) · Set up A/B test for landing page
  hero (Templates Base44, Jul 10 overdue, 3h, in_progress, AI, desc
  "Configure two hero variants and define success metrics for the test.").
  All AI-attributed. Target date Jul 30 unchanged; goal stays active.
- **F5 — Goal 3 "Q3 Content Marketing Campaign" was regenerated on the
  live (HIGH, seed).** New description "Plan and execute a full content
  marketing campaign including blog posts, social and email." and a new
  10-task plan (10/10 done = 100%): Define content calendar for
  July–August (Marcus Lee, Jun 28, 4h) · Write 4 long-form blog posts
  (Content Team, Jul 5, 16h) · Design social media assets (Sarah Johnson,
  Jul 8, 8h) · Set up email drip campaign (Marcus Lee, Jul 10, 6h) ·
  Publish LinkedIn thought-leadership posts (Marcus Lee, Jul 15, 3h) ·
  Launch paid social ads (Growth Team, Jul 18, 5h) · A/B test email
  subject lines (Marcus Lee, Jul 25, 4h) · Compile mid-campaign analytics
  report (Growth Team, Aug 1, 5h) · Final campaign wrap-up and learnings
  doc (Marcus Lee, Aug 15, 3h) · Draft Q3 blog post calendar (Ella Head
  Glazer, Jul 5, 2h, done, MANUAL — no AI chip, desc "Plan 12 blog post
  topics aligned with campaign themes and assign writers."). Target Aug 15
  unchanged; goal stays completed.
- **F6 — Activity feed: 36 new-shape entries (HIGH, seed).** The live's
  feed is now `Online · 36` — 3× `goal_analyzed` ("Analyzed goal: <title>"
  / "AI analyzed the goal "<title>" and prepared to generate tasks.") +
  3× `tasks_generated` (12 / 9 / 10 task counts) + 30× `task_assigned`,
  ALL stamped 2026-07-16 (single "Thu Jul 16 2026" group, all "2 months
  ago"), newest-first order: analyzed(POR) → generated(POR) →
  analyzed(Landing) → generated(Landing) → analyzed(Q3) → generated(Q3) →
  30 assignments. NO `goal_created` and NO `status_update` entries remain.
  The seed's 22-entry feed (3 goal_created + 3 tasks_generated (10/9/10) +
  12 task_assigned + 4 status_update, May–July spread) no longer mirrors
  the reference.
- **F7 — People directory: += "Templates Base44", "Content Team"
  (MEDIUM, seed).** Both are live assignees (goal 2's A/B task; goal 3's
  blog-posts task). The live's assignee model is free text (its add-task
  assignee select lists only "— Unassigned —" and its Team view is empty)
  — the clone's Person-referential schema stays (documented
  architecture); the seed just gains the two names (avatar colors
  unobservable in the live UI — assigned from the existing palette).

### B. Non-findings (verified equal — do not touch)

Mobile chrome at 390 (app bar 62px; bottom bar 390×73.5 y770.5 r20-top;
tab census **[73.2×4, 81.2]** with full-width chips 73.2×53.5, active chip
bg `#EBE7E2`, icons 20px @1.5; mobile goal card — pct well chip bg/r8/pad
3/10/13px/h25.5, title 16/500 mt0, card 136.3 vs 135.3 = documented noise),
mobile dashboard numerals (22 ring 28/300 x76; stats 2/2/26 30/400 x75.6/
187.2/290.1; hero cards 346.8+165.1 @150 tall), 768 middle state (pill nav
~494-495×70.5 y937.5 r20 — the ~5px width residual is the documented live
quirk; back strip 111-112×33.5-34 y18 r10 13px + chevron 15@1.8 #9A9A9A;
visible h1 190.8 x48 y87.5), desktop 1440 (sidebar 240; greeting 28px
x316 y48 w335.2 lh33.6 "Good Evening."; NEW GOAL 132.3×40 x1255.7 r12;
numerals 22/2/2/26 @50.4/300 to the decimal; goals-view NEW GOAL
121.4×34.5 x1266.6), goal 1 data + goal-detail task rows (identical
word-for-word incl. the zap AI chip HTML, user/calendar meta, no avatar
circles), my-tasks (both "0 tasks assigned to you", five tabs at 0),
settings (identical), team (both empty states), the wizard (624×417 r16
pad 22/24 bg #EEEAE6 on both), dashboard goals-panel data (8/12·2 blocked
67% · 8/9 on track 89% · 10/10 on track 100%), NPA text ("Resolve blocker
on "Review Q3 project milestones""), sidebar Tasks Status (2 Blocked ·
4 Overdue). The logged-out shell chrome at 1440/768/390 otherwise matches
(h1, sidebar, NEW GOAL pill, app bar); the live's public-read data in
logged-out state remains the documented Base44 platform deviation.

## Work streams

### WS-1 — Activity view: render the hero entry in the groups too (F1)

`activity-view.tsx`: `groupActivityByDate(activity.slice(1))` →
`groupActivityByDate(activity)`. TDD: Playwright RED first — the activity
view's `… ago` row count must equal the feed length shown in the
"Online · N" pill (with the new seed: 36 rows, N=36).

### WS-2 — Dashboard activity panel: cap at 20 rows (F2)

`dashboard-view.tsx`: `activity.map(...)` → `activity.slice(0, 20).map(...)`
(also bound the divider computation to the sliced array). TDD: Playwright
RED — the dashboard panel renders exactly 20 `… ago` rows with the
36-entry seed.

### WS-3 — LOG IN button spec (F3)

`user-menu.tsx`: non-compact variant → drop `h-10`, use
`rounded-[12px] py-[11px] px-5` + keep the standard pair; compact variant →
drop `h-[34px]`, use `rounded-[10px] py-[6px] px-[14px]` + the small pair
`-3px -3px 6px rgba(255,250,244,0.78), 3px 3px 6px rgba(160,143,126,0.22)`.
TDD: Playwright RED at 1280 (r12 + pad 11/20 + pair) and at 390 (r10 +
small pair) in logged-out contexts.

### WS-4 — Seed data refresh (F4–F7)

`prisma/seed.ts`: replace goal 2/3 descriptions + task arrays (F4/F5 —
titles, assignees, deadlines, hours, statuses, AI flags, the two task
descriptions), add "Templates Base44" + "Content Team" to the people list
(F7), and replace the activity array with the 36-entry live feed (F6 —
goal_analyzed ×3, tasks_generated ×3 with 12/9/10, task_assigned ×30 in
the live's rendered order, all `2026-07-16T*` descending so the feed
renders newest-first in one date group). TDD: Playwright RED — "Online ·
36", the hero text "Analyzed goal: Product Onboarding Redesign", goal 2's
"Set up A/B test for landing page hero" visible in its detail, and the
tasks-generated feed entries read 12 (not 10).

### WS-5 — Verification

1. Full gate: lint → typecheck → unit (137) → build → smoke (30) →
   e2e (29 + new checks).
2. Re-probe every changed surface against the live with computed styles
   (activity view row counts + hero; dashboard panel row count; LOG IN
   button at 1440/768/390 logged-out; goal 2/3 details; feed census).
3. VLM sanity pass on the changed pairs.

### WS-6 — Screenshots + docs

1. Regenerate affected `docs/screenshots/*.png` from the production build
   (all data-bearing views + a logged-out capture if useful).
2. README (seed counts 22 → 36 activity entries, feed shape), AGENTS.md
   (activity-view semantics, dashboard 20-cap, LOG IN spec), CLAUDE.md
   (same), PAD v2.5 revision block, SKILL.md, session_22, worklog; mark
   this plan executed.

### WS-7 — Ship

Conventional Commit on `main`, push via `docs/ssh_git_wrapper_v3.py`,
verify the remote ref equals local HEAD, shred the key.

## Execution record (2026-09-22)

All work streams executed. Mid-execution addition: the NPA derivation
(live derives it from blocked TASKS, not status-update rows) — fixed under
TDD alongside WS-1..WS-4. Final gate: lint 0 · typecheck 0 · 137/137 unit
(next-action seam rewritten, 6 checks) · build clean · 30/30 smoke ·
36/36 Playwright (29 + 7 new). Re-probes EXACT on every changed surface
(activity 36/36 + single date label; dashboard 20-cap + NPA string; goals
2–3 detail text identical; goal-detail glyph census identical; LOG IN
exact at 1440/768/390). Screenshots regenerated (15 incl. the real-AI
wizard flow); README/AGENTS/CLAUDE/PAD v2.5/SKILL/session_22/worklog
aligned. See docs/session_22.md.
