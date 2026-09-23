# Session 23 — v2.6 icon-stroke reversion + layout seams (group card, row wrap, chip case, picker headers, check-in spacing)

Continuing from session_22 (v2.5 shipped at b6bfb35). Workspace refreshed
with `git pull` → b6bfb35.

Core docs re-read (AGENTS/CLAUDE/README/PAD v2.5 + SKILL.md), session docs
reviewed (session_20, worklog, parity-remediation-v2.4/v2.5, session_21/22),
then validated against the codebase: `.env`
`DATABASE_URL="file:../db/custom.db"` with `db/` at the repo root, the
db-path seam, vitest + playwright configs, the v2.5 feed/NPA/LOG IN
semantics, and the regenerated seed all match the documented state.

**Baseline gate GREEN on the pulled state** — lint 0 · typecheck 0 · 137/137
unit · build clean · 30/30 smoke · 36/36 Playwright. (The shell's absolute
`DATABASE_URL` override trap re-confirmed — every command ran with
`env -u DATABASE_URL`.)

**Live re-crawl (authenticated sessions at 390/768/1440 + fresh LOGGED-OUT
sessions, paired against the production clone on :3000 with a freshly
re-seeded `db/custom.db`):** the live was re-deployed since v2.5 and reverted
its icon system plus several layout seams. Eight findings
(docs/parity-remediation-v2.6.md), every one computed-style verified on BOTH
apps:

- F1 (HIGH) **Icon stroke REVERSION — every icon now renders at the lucide
  default 2.** The v2.4 two-class system (chrome 1.5 / content 2) is gone:
  mobile tabs ×4, MORE sheet rows ×3, pill tabs ×6, sidebar nav ×6 +
  collapse chevron, 768 back-strip chevron (was 1.8), dashboard activity
  glyphs + "Full log" arrows, activity-view hero Search, task-card
  User/Calendar/Clock, AI chip Zap, date-picker trigger Calendar, wizard Bot
  (was 1.6). ~33 sites across 13 files carried strokeWidth 1.5/1.8/1.6.
- F2 (HIGH) **Dashboard activity rows: gap 12 + the detail WRAPS** (2-line
  first row 86.5px tall; the clone had gap 14 + `truncate` → 68.5). The
  divider reading is EQUAL (border-bottom rgba(163,163,163,0.18)) — the
  earlier border-top #D8D4CF was an inert declaration.
- F3 (HIGH) **Activity view: each date group's rows wrapped in ONE big r14
  card with the deeper pair** (the v1.9 "plain rows, no card wrapper"
  reading is retired).
- F4 (MEDIUM) **Activity-view date-label block: lh-24 wrap + 10px
  margin-bottom** (label sits 7px lower, group card 5px lower).
- F5 (MEDIUM) **Desktop goal-card chip blocked count: UPPERCASE 0.88
  tracking** (the v2.3 normal-case reading retired for the DESKTOP chip;
  mobile stays normal-case — verified equal).
- F6 (MEDIUM) **Date-picker weekday headers 11px/700 #9A9A9A on a 25px row**
  (clone: 500 #6E6E6E, 21px) + the popover 4px taller (275 vs 271).
- F7 (MEDIUM) **Check-in modal: mt-16 spacing + content-width radio
  labels** (panel 353 vs 322; labels 59/52/69/34 wide vs fixed 196).
- F8 (LOW) **Mobile goal-card pct chip letter-spacing −0.13px**.

Non-findings re-confirmed equal (do-not-touch list in the plan): the whole
mobile chrome (tab census 73×4+81 with full-width chips, MORE sheet,
dashboard ring/stat wells, goal-card case split), 768 pill nav + back strip,
desktop dashboard (greeting/date-card/ring/NPA/20-cap/goals panel), goal
cards, goal-detail task rows, my-tasks/team/settings, login page, LOG IN
pill, wizard chrome, app bar.

**TDD execution (plan validated against the codebase before
implementing):**

- RED: 9 new/rewritten assertions in `tests/e2e/v26-parity.spec.ts` (stroke
  census via named-glyph scan, dashboard row wrap + gap, group-card shadow
  pair + label block, desktop chip uppercase, picker headers 700/#9A9A9A,
  check-in modal spacing + label widths, mobile tab stroke 2 — the v2.4
  1.5 assertion relaxed) — all failed as expected.
- WS-1: stroke sweep across 13 files (~33 sites 1.5/1.8/1.6 → 2, mostly by
  deleting the strokeWidth prop so the lucide default applies).
- WS-2: `dashboard-view.tsx` ActivityRow — gap 12 + wrapping detail.
- WS-3: `activity-view.tsx` — groups wrapped in the `.orb-row-card` primitive
  (r14, deeper pair); date label inline span in a lh-24 mb-10 block.
- WS-4: `goals-view.tsx` desktop chip blocked count → uppercase 0.88.
- WS-5: `date-picker.tsx` weekday headers → 700 #9A9A9A (25px row); popover
  month-row margin rebalanced to the live's 271px (mb-3 + pb-1 → 25px row).
- WS-6: `task-detail-dialog.tsx` check-in — radio grid → textarea/button
  mt-16; radio labels content-width with input as sibling.
- WS-7: mobile pct chip `tracking-[-0.01em]`.
- GREEN hardening: the v25 pill-read race (wait on feed content, not the
  static header), the group-card probe made order-independent, two
  measurement probes fixed (tallest-of-N for the modal panel, label-bottom
  for the radio gap).
- **FINAL GATE GREEN: lint 0 · typecheck 0 · 137/137 unit · build clean ·
  30/30 smoke · 44/44 Playwright** (36 + 8 net-new; the four v2.4-era stroke
  assertions rewritten in place).

**Re-probe (computed styles, both apps):** stroke census IDENTICAL (mobile
tabs 73×4+81 @2, MORE rows, sidebar, task-meta, zap, picker chevrons);
dashboard activity rows EXACT (gap 12, 86.5 wrapped detail, stroke 2);
activity view EXACT (group cards with the deeper pair, date label
[316,225,98,13] both); goal chip EXACT; date picker EXACT (271 height,
headers 700 #9A9A9A); check-in modal EXACT (352≈353, gaps 16/16,
content-width labels). VLM sanity pass on the regenerated screenshots.

**Artifacts:** all 15 screenshots regenerated from the final production
build (the wizard flow 05/06 with a REAL AI 9-task generation — scratch
goal + its 12 activity entries deleted after; seed back to 3 goals / 31
tasks / 36 entries). `.env.example` re-verified truthful (DATABASE_URL /
AUTH_SECRET / NEXT_PUBLIC_SITE_URL all implemented). Docs aligned: README
(icon convention, activity group card, chip case, 44 e2e), AGENTS (icon
convention rewrite — single-class stroke 2; activity feed group card;
goal-chip case split), CLAUDE (same), PAD v2.6 revision block, SKILL.md
(stroke lesson + counts), this log, the repo worklog, and the v2.6 plan
marked EXECUTED.

**Suggested next steps:** none required — every changed surface is pinned by
Playwright and re-probed EXACT. Optional next drift check: watch for another
icon-system flip (the live has now changed strokes twice in three deploys —
v2.4 split to 1.5, v2.6 back to 2); a stroke-census probe run before any
future survey would catch it in one pass.
