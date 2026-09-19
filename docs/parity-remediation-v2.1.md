# ORBITAL Parity Remediation Plan v2.1 (Session 14)

Evidence: fresh side-by-side crawl 2026-09-19 (~03:00–04:30) — two
authenticated agent-browser sessions (`live` = `https://agent-pm-copy-15e23720.base44.app/`,
`clone` = production build on :3000) at 1440×900 and 390×844, computed-style
probes under `research/par-s14/` (per-view JSONs, targeted field probes,
dialog/scrim/datepicker probes, stitched screenshots + VLM cross-checks).
Computed styles are ground truth; VLM readings were disproven five times this
session (wizard "halo" — clone shadow is transparent; avatar icon color —
identical #7C6FA0; MORE-sheet "card rows"/"teal close" — computed identical;
login "card differences" — 448×746 identical; check-in "preselected radio" —
both unchecked).

Data-driven deltas excluded (user names, goal/task text, activity content,
counts, wrap-line differences from longer seed text). Probe-noise exclusions
unchanged (rounded-full ≡ 33554432px ≡ 50%; transparent transition shadows
≡ none; margin distribution when visual position matches).

Verified-clean this session (0 or noise deltas): goals cards (content), my
tasks, team, settings, activity feed, sidebar, login card (746=746, inputs,
h1, sign-in button), wizard wrapper 680×552/avatar/bubble/form panel/Continue
+ Cancel pills, check-in label/textarea/Post Update/radio rows, mobile app
bar + tab bar + MORE sheet (pixel-identical), mobile dashboard hero cards
(90/22 both), dashboard NPA well, greeting header, filter chips (counts +
active well), progress tracks (67% both).

Baseline gate on the v2.0 code (4bcd9a8): lint 0 · typecheck 0 · 122/122
unit · build clean · 30/30 smoke — the v2.0 claims hold; this plan closes
the residuals found by the fresh crawl.

## Systemic findings (v2.1)

1. **The dashboard stat numbers sit in WELL squares on the live — the clone
   renders them floating.** Desktop: 88×88 flex-centered box, bg `#EBE7E2`,
   radius 12, inset pair `rgba(255,250,244,0.68) -3px -3px 6px 0 inset /
   rgba(160,143,126,0.24) 3px 3px 6px 0 inset`. Mobile: 104×104, radius 10,
   same pair. The clone's `StatColumn` number box is transparent w-full
   (VLM confirmed the visual absence).
2. **Live dialog panels carry NO box-shadow.** add-task (500), goal-edit
   (480), check-in (448), invite (384), wizard (680) — all `box-shadow: none`
   on the panel. The v2.0 DialogContent base (and the check-in override)
   render the `-8px` neumorphic pair. Depth comes from the blurred scrim only.
3. **Scrim alpha is per-dialog-kind, not uniform.** Measured live: add-task
   0.3 · goal-edit 0.3 · wizard 0.3 · check-in 0.25 · invite 0.25. The clone
   uses 0.25 for every standard dialog (only the wizard overrides to 0.3).
4. **Standard-dialog form controls are 1–3px off per control.** Live: selects
   (native + trigger) h35 pad 8/12; the deadline `input[type=date]` h38;
   textareas fs13 pad 8/12 (goal-edit textarea h72). Clone: selects h38 pad
   8/14; date input h36; textarea fs14 pad 8/14 (goal-edit h64).
5. **The add-task submit pill is pad 8/22 (w 97), not 8/20 (w 93).** The
   goal-edit "Save" is 8/20 (w 67) — correct as shipped; only Add Task widens.
6. **Mobile list views start 28px too high and 4px too narrow.** Live mobile
   shell: main pad `16px 6px 90px`, then a per-view container — dashboard
   column pad 12/15.6 (content x≈22, hero y 90 — the clone matches via its
   own shell), list-view `page-container` pad 24/12 (h1 x 18, y 102). The
   clone's single shell (px 22, pt 12) puts every list h1 at x 22, y 74.
7. **Mobile stat numerals are 30px/400 on the live; the clone clamps to
   28px/300** (`clamp(28px,3.5vw,52px)` floors at 390px; live desktop 50.4
   = 3.5vw of 1440 ✓, live mobile 30 → the floor is 30, weight 400).
8. **The dashboard grid is 12px taller than the live's** (723.4 vs 711.4 at
   1440×900): the live's dashboard column carries 12px of bottom padding
   (bottom spacing 36px total: main 24 + column 12; the clone has 24).
9. **Task cards: the chip-row → title gap is 6px on the live, 0 on the
   clone** (card h 117.2 vs 112.2), and the title mb is 4 (clone 5).
10. **Goals view: the cards container lands 2px high** (live cards y 186.6,
    clone 184.6 — the live's 2px-padded filter wrapper adds 2px below the
    chips row).
11. **Check-in description: fs 13 + `#6E6E6E`** (clone 13.5 + `#2F2823`).
12. **Date-picker popover: radius 14 + bg `#ECEBE9`** (clone 16 + `#EEEAE6`);
    day cells radius 16 (clone full-round). The dynamic 5-row grid, trigger
    (576×38 "Pick a deadline"), month header and chevrons all match.
13. Mobile main bottom padding 90 (clone 96 — folded into WS-6).

## WS-1 Dashboard stats wells (HIGH)

- **1.1** `views/dashboard-view.tsx` `StatColumn`: wrap the numeral span in
  a well square — desktop `h-[88px] w-[88px] rounded-[12px]`, mobile
  `h-[104px] w-[104px] rounded-[10px]`, `flex items-center justify-center
  bg-orb-well shadow-[inset_-3px_-3px_6px_rgba(255,250,244,0.68),inset_3px_3px_6px_rgba(160,143,126,0.24)]`
  (keep the column gap/pad structure: the box REPLACES the current
  `h-[104px]/sm:h-[88px]` transparent box; the numeral keeps
  `clamp(30px,3.5vw,52px)` per WS-1.2).

## WS-2 Mobile stat numerals (HIGH)

- **2.1** `StatColumn` numeral: `text-[clamp(28px,3.5vw,52px)] font-light` →
  `text-[clamp(30px,3.5vw,52px)] sm:font-light` (mobile 30px/400, desktop
  50.4/300). Same change for the ring "84%" numeral? NO — the ring matches
  at both breakpoints (28px mobile measured identical); only the stat
  columns differ.

## WS-3 Dialog system (HIGH)

- **3.1** `ui/dialog.tsx` DialogContent base: drop the
  `shadow-[-8px_-8px_16px_rgba(255,250,244,0.78),8px_8px_18px_rgba(160,143,126,0.31)]`
  utility (live panels carry no shadow; depth = the blurred scrim).
- **3.2** Scrim alphas: default overlay 0.25 → keep; add-task / goal-edit /
  task-edit pass `overlayClassName="bg-[rgba(46,42,38,0.3)]"` (measured
  0.3); check-in + invite keep 0.25; the wizard already 0.3.
- **3.3** Dialog selects (add-task, goal-edit, task-edit triggers):
  `h-[38px] px-3.5` → `h-[35px] px-3 py-2` (pad 8/12, 13px text).
- **3.4** Dialog date inputs: `h-[36px]` → `h-[38px]` (native date field
  renders 38 on the live).
- **3.5** Dialog textareas: `text-sm px-3.5` → `text-[13px] px-3 py-2`;
  goal-edit description textarea height 64 → 72 (rows 3 → 4 or min-h).
- **3.6** `.orb-btn-submit` stays 8/20 for Save; the add-task submit gets a
  local `px-[22px]` (w 97).

## WS-4 Check-in modal (MEDIUM)

- **4.1** `dialogs/task-detail-dialog.tsx` description `<p>`:
  `text-[13.5px] text-orb-body` → `text-[13px] text-orb-muted`.
- **4.2** Panel shadow: the 448px override carries its own shadow class —
  remove it (WS-3.1 covers the base; verify no shadow remains).

## WS-5 Date picker (MEDIUM)

- **5.1** `ui/date-picker.tsx` PopoverContent: `rounded-[16px] bg-orb-raised`
  → `rounded-[14px] bg-[#ECEBE9]` (pad 16/18 stays — the live's inner
  container provides equivalent margins).
- **5.2** Day cells: `rounded-full` → `rounded-[16px]` (32px cells, r16).

## WS-6 Mobile shell geometry (HIGH)

- **6.1** `orbital-app.tsx` main: `px-[22px] pb-24 pt-3` → `px-[6px]
  pb-[90px] pt-4` on mobile (sm:/lg: overrides unchanged).
- **6.2** `views/dashboard-view.tsx` root wrapper: add `px-[16px] pt-3
  lg:px-0 lg:pt-0`; the grid section's mobile `mt-4` → `lg:mt-5` only
  (mobile margin comes from the wrapper's pt). Hero lands at x 22, y 90
  (unchanged); desktop untouched.
- **6.3** List views (goals, goal-detail, my-tasks, activity, team,
  settings): root gets `px-3 pt-6 lg:px-0 lg:pt-0` → h1 x 18, y 102.

## WS-7 Dashboard grid + goals/task-card rhythm (MEDIUM)

- **7.1** Dashboard bottom spacing: the dashboard wrapper (WS-6.2) also
  carries `pb-3 lg:pb-0` → grid 723.4 → 711.4 (matches the live's column
  bottom pad 12).
- **7.2** `task-card.tsx`: chip row div + `mb-[6px]`; h4 `mb-[5px]` →
  `mb-[4px]`.
- **7.3** `views/goals-view.tsx` cards container `mt-[24px]` → `mt-[26px]`
  (live cards y 186.6).

## WS-8 Verification

- **8.1** Full gate: lint → typecheck → test (122) → build → smoke (30).
- **8.2** Re-probe every changed surface at 1440×900 + 390×844 (stat wells,
  grid height, dialogs: add-task/goal-edit/task-edit/check-in + scrims,
  date picker, mobile list views + dashboard, task cards, goals container);
  every delta closed or data-driven.
- **8.3** Screenshot regeneration for changed views; VLM sanity pass.

## WS-9 Documentation

- **9.1** README / AGENTS.md / CLAUDE.md: stat-well spec, no-shadow dialog
  panels, per-dialog scrim alphas, control heights (35/38/13px), mobile
  shell geometry (main 16/6/90 + per-view containers), task-card 6px gap.
- **9.2** PAD v2.1 revision block; session_14 log; worklog update.

## Execution record (session 14, 2026-09-19)

Executed in plan order (WS-1 → WS-7) with a re-probe loop after each
group; full gate green before and after (lint 0 · typecheck 0 · 122/122
unit · build · 30/30 smoke). Deviations and verification-phase
discoveries folded in:

- **WS-7.1 deviation**: the plan's `pb-3 lg:pb-0` reset the very padding
  the live carries at desktop — re-probe showed the grid still 723.4.
  Shipped as a persistent `pb-3` (all breakpoints); grid now exactly
  711.4.
- **WS-3.6 deviation**: `px-[22px]` loses to the unlayered
  `.orb-btn-submit` padding in the cascade — the 8/22 pills ship as
  inline styles (add-task w 96.5, task-edit w 124.9, both measured
  exact on the live).
- **Verification discoveries** (measured on the live during WS-8.2):
  goal-edit's submit label is literally "Save" (w 67.5 at 8/20); the
  check-in's Send icon carries mr-4 (Post Update w 121.4); the goals
  header row is items-START (pill top-aligns with the h1); the live's
  goal-edit add-task date inputs are 37.5px-tall native fields (clone
  h38 — 0.5px rounding).
- **WS-5 completion**: the popover is a TWO-LAYER card (outer 262/r14/
  #ECEBE9 with 1px #D8D4CF border + Material drop shadow; inner r16/
  #EEEAE6 pad 16/18 with the -8px pair) — the plan's single-card
  change preserved the live's ring + distributed shadows. A 4px
  inner-height residual (live renders a table with border-spacing vs
  the clone's CSS grid) is accepted as sub-visual.
- **Mobile crawl extensions** (beyond the plan, found by the WS-8.3
  VLM pass and confirmed by measurement): the live's mobile goal card
  is a COMPACT single-column layout (chip + 13px pct top row, 16px
  full-width title, 6px track, meta row with date + 23px actions,
  status-colored chip pip); filter chips (goals + my-tasks) are a
  single non-wrapping row (nowrap + shrink-0, overflowing the right
  edge like the live). Both shipped.
- **WS-8 results**: stat wells exact (104/r10 + 30/400 mobile, 88/r12
  desktop); grid 711.4; task cards 117.2/gap 6/mb 4 exact; all five
  dialogs verified (shadow none, per-kind scrims, control spec);
  date-picker two-layer card verified; mobile hero x22/y90, list h1
  x18/y102, main pad 16/6/90. Six VLM misreads disproven by computed
  styles (the noise rules held). VLM verdicts: dashboard, add-task,
  date picker, mobile dashboard IDENTICAL; mobile goals residual
  claims (app-bar color, tab icons) disproven by measurement.

**Status: COMPLETE — v2.1 shipped.**
