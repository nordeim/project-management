# Session 20 — v2.4 drift-correction pass (mobile-nav width semantics + icon normalization)

Continuing from session_19 (v2.3 shipped at 7f1cedc; session_19 log followed
at d671b2d). Workspace refreshed with `git pull` → d671b2d.

Core docs re-read (AGENTS/CLAUDE/README/PAD v2.3 + SKILL.md), session docs
reviewed (session_18, worklog, parity-remediation-v2.3, session_19), then
validated against the codebase: `.env` `DATABASE_URL="file:../db/custom.db"`
with `db/` at the repo root (custom.db + e2e.db + .gitkeep), the db-path
seam, vitest + playwright configs, and the mobile-nav code all match the
documented v2.3 state.

**Baseline gate GREEN on the pulled state** — lint 0 · typecheck 0 · 137/137
unit · build clean · 30/30 smoke · 26/26 Playwright. (The shell's absolute
`DATABASE_URL` override trap re-confirmed — every command ran with
`env -u DATABASE_URL`.)

**Live-app re-crawl (two authenticated agent-browser sessions at
390/768/1440):** the live was re-deployed since v2.3 and drifted again. All
findings computed-style verified on BOTH apps; the previously-uncrawled
logged-OUT login at 1440 was covered this time (h1/inputs/Sign-in/logo chip
all exact). Three real deltas found:

- F1 (HIGH) **Mobile tab chips must FILL the tab width**: the live's tab
  anchors carry no padding and their chip DIVs stretch to the full tab
  (73.2 of 73.2 at 390; 67.2 at 360). The MORE button carries its own
  8px-of-padding flex basis (content-box sizing) rendering it ~6.4px wider
  (81.2). The bar is content-height driven (73.5; no min-height). The v2.3
  chip spec (pad/r14/gap/inset pair) was unchanged — only the width
  semantics drifted.
- F2 (HIGH) **Icon stroke/size/glyph normalization**: chrome icons moved to
  stroke 1.5 (tabs, MORE sheet, pill nav, sidebar, Full-log arrows, AI chip,
  empty states), content icons reverted to the lucide default 2 (pencils/
  trash), date glyphs are plain `Calendar` (not `CalendarDays`), the AI chip
  swapped `Sparkles` → `Zap` (9px/1.5, ls 0.5px), Trash2 13→14px, ArrowLeft
  15→14, ADD-TASK Plus 13→12, Full-log ArrowRight 14→12@1.5, wizard Bot
  1.6 + X `#5A5A5A` + close-square blur 10. Verified equal and NOT changed:
  the 768 back-strip chevron (15px@1.8), sidebar chevron-right (14@1.5),
  login Mail/Lock (2), wizard sparkles 13@2, NEW GOAL plus 12@2.
- F3 (MEDIUM) **Mobile goal-card top row inverted**: the live renders the
  status as BARE text (7px dot, gap 6, no pill) and moves the percentage
  into a small WELL chip (bg #EBE7E2, r8, pad 3/10, the 2px inset pair,
  13px/500) — verified on all three seeded goals; row mb 10, title mt 0,
  card h≈136. The desktop card is unchanged (pill chip + bare 42px pct).

Non-findings re-verified equal: mobile chrome (app bar 62, bottom bar
390×73.5 y770 r20-top, MORE sheet 390×303 y541), dashboard numerals at both
widths (exact to the decimal), team view (INVITE/NEW AGENT inline), desktop
sidebar/goals/dashboard (h1, numerals, NEW GOAL pill, greeting all exact),
768 pill nav, task-card chip row (the live's dot is a DOM sibling — same
rendered layout), activity icon circles, wizard layout + bot-circle resting
shadow (the live's "glow" is its open animation; resting values already
matched).

**TDD execution (docs/parity-remediation-v2.4.md, validated against the
codebase before implementing):**

- RED: 4 new Playwright assertions (full-width chip, wider MORE, 1.5 icon
  stroke, mobile goal-card chip inversion) — all failed as expected.
- WS-1: tab bar restructured — buttons lose px-1/min-h, chips `w-full`
  (pad 8/4 r14 gap 4 transition 150ms), MORE `flex-[1_1_8px]` + own pad.
- WS-2: ~35 icon edits across 11 files + the shadcn Button
  `[&_svg:not([class*='size-'])]:size-4` trap fixed in the wizard
  (explicit `size-[13px]` opt-out) + the dashboard pill's hand-rolled plus
  swapped for the lucide glyph (13px@2).
- WS-3: mobile goal-card top row inverted (bare status + pct well chip).
- GREEN: **137/137 unit · 30/30 smoke · 29/29 Playwright** (26 + 3 new; one
  pre-existing auth-toast flake hardened with `.first()` after isolation
  runs proved it environmental).

**Re-probe (computed styles, both apps):** tab census EXACT —
[73.2×4, 81.2], chip 73.2×53.5, stroke 1.5, nav 73.5 both. Goal-card
internals exact (status row y254.6, pct chip h25.5 r8 pad 3/10, title
y290.1 lh20.8; 1px meta-row residual = probe noise). Named-glyph censuses
IDENTICAL across goals/goal-detail/dashboard/team/my-tasks/wizard (zap
9@1.5 ×11, calendar 13/11, pencil/trash at the right sizes/strokes). AI
chip zap/1.5/ls-0.5 exact. Date-picker calendar 14px #9A9A9A @1.5 exact.
VLM sanity: goal-card pair MATCH; the tab-bar VLM claims ("wider well",
"thinner icons") were contradicted by bounding-box measurement — documented
as VLM misreads (the running total of measurement-disproven VLM claims
this session: 6).

**Screenshots regenerated from the production build** (16 files incl. the
wizard flow 05/06 via a real AI generation — the 8-task scratch goal was
deleted afterward, seed back to 3 goals) + 14-login from a fresh logged-out
session.

**Docs aligned:** README (mobile bullet, goal-card bullet, Playwright
counts), AGENTS.md (commands/gate counts, mobile bullet rewrite, the
goal-card paragraph, a new icon-stroke two-class-system fact incl. the
shadcn size-4 trap), CLAUDE.md (visual-system bullet, browser-layer
counts), PAD v2.4 revision block, SKILL.md (chrome table, AI chip, counts,
session count), this log, the repo worklog, and the v2.4 plan executed.

**Suggested next steps:** none required — the changed chrome and icons are
pinned by Playwright. Optional: crawl the logged-out shell above 1024 (the
one state still uncrawled) at the next drift check.
