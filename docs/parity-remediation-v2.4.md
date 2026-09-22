# Parity & Infrastructure Remediation — v2.4 — EXECUTED

Session 20 plan. Survey executed 2026-09-22 against the live reference
(`https://agent-pm-copy-15e23720.base44.app/`, authenticated as
`sepnetflix2023@outlook.com`) and the clone (production standalone server on
:3000, seeded `db/custom.db`) with paired agent-browser sessions at
390 / 768 / 1440. Every finding below is computed-style verified on BOTH apps
(VLM claims cross-checked; VLM misreads again disproven by measurement — the
wizard bot-avatar "glow" is the live's open-animation mid-transition, whose
resting values the clone already matches).

Baseline gate before any change (pulled at d671b2d): lint 0 · typecheck 0 ·
137/137 unit · build clean · 30/30 smoke · 26/26 Playwright. The v2.3 push is
healthy — this session is a drift-correction pass against a re-deployed live.

## Findings

### A. Visual parity deltas (live vs clone)

- **F1 — Mobile bottom-nav chip must FILL the tab width (HIGH).** The live's
  four view tabs are unpadded `<a style="flex:1 1 0%">` wrappers whose inner
  chip DIV — `flex column center gap-4 pad 8/4 r14, transition .15s` — STRETCHES
  to the full tab width (73.2px at 390, 67.2 at 360; scales with viewport).
  The ACTIVE chip gets bg `#EBE7E2` + the `.orb-nav-active` inset pair; the
  MORE tab keeps color-only and carries its own `padding: 8px 4px`, which (via
  content-box flex-basis participation) renders it 8px WIDER than its equal
  share (81.2 vs 73.2 at 390 — verified the same +8px offset at 360). The bar
  is content-height driven (nav 73.5 = pad 8/12 + chip 53.5; no min-height).
  The clone renders the chip at content width (36px), all five tabs equal
  (74.8), and sets `min-h-[54px]` (nav 74). The v2.3 chip spec (pad/r14/
  gap/inset pair) is confirmed unchanged — only the width semantics drifted.
- **F2 — Icon stroke/size/glyph normalization (HIGH).** The live re-deploy
  thinned its chrome icons to stroke **1.5** and reverted content icons to the
  lucide default **2**; the clone still carries v1.7's 1.8 strokes and has
  three glyph/size drifts. Verified by named-glyph census on both apps:
  - Chrome → 1.5: mobile TABS ×4 (20px), Menu (20px), MORE-sheet rows ×3
    (20px), pill tabs ×6 (18px), sidebar nav ×6 (16px) + the 18px inline
    panel glyph; dashboard "Full log" ArrowRight ×2 (also 14→**12px**).
  - Content → 2 (default): goals-view Pencil 13 + Trash2 (13→**14px**),
    task-card Pencil/Trash2 11.
  - Glyph swaps: `CalendarDays` → `Calendar` (date-picker trigger 15→**14px**
    + color `#6E6E6E`→`#9A9A9A` + stroke 1.5; task-card meta 11px; goal-detail
    target line 13px); AI chip icon `Sparkles` → `Zap` (9px @1.5).
  - Wizard: Bot stroke 1.8→**1.6**; close X color `#2F2823`→`#5A5A5A`; close
    square dark-shadow blur 8→**10px**.
  - Empty-state icons → 1.5: my-tasks SquareCheckBig 28, team Users 22 +
    Sparkles 22, goal-detail/goals-view Plus 22.
  - Sizes: goal-detail ArrowLeft 15→**14px**; ADD TASK Plus 13→**12px**.
  - AI chip letter-spacing: normal → **0.5px**.
  - Confirmed UNCHANGED (do not touch): 768 back-strip chevron 15px@1.8
    `#9A9A9A` (verified equal), sidebar chevron-right 14px@1.5, login
    Mail/Lock @2, NEW GOAL Plus 12@2, wizard CONTINUE Sparkles 13@2, X 14@2.
- **F3 — Mobile goal-card top row is INVERTED (MEDIUM).** The live's mobile
  goal card renders the status as BARE text — dot 7px (status-colored, gap 6)
  + 11px/600/uppercase/ls 0.88 `#6E6E6E` + normal-case coral blocked count,
  NO pill background — and moves the percentage into a SMALL WELL CHIP:
  bg `#EBE7E2`, radius **8**, pad **3px 10px**, inset pair
  `rgba(255,250,244,0.8) -2px -2px 5px` / `rgba(160,143,126,0.28) 2px 2px 5px`,
  13px/500 `#3A3A3A` (element h25.5; verified on all three seeded goals:
  67%/89%/100%). The row carries mb **10px** and the title mt **0** (clone:
  row mb 0 + title mt 8). Card height 136.3 vs clone 132.5. The DESKTOP card
  is unchanged (pill status chip + bare 42px pct — verified equal) — only the
  mobile variant drifted.

### B. Non-findings (verified equal — do not touch)

Mobile chrome (app bar 62px, bottom bar 390×73.5 y770 r20-top pad 8/8/12,
MORE sheet 390×303 y541 r24 pad 20/20/40 rows h49), mobile dashboard numerals
(22/2/2/26 — fs/weight/positions exact), team view (INVITE w95.6 x276.4 y102;
NEW AGENT w128.7 x243.3 inline; h2 x18), desktop sidebar (240×860, 39px rows),
desktop goals h1 (28px/400 x316 y48 w190.8 ls -0.28), desktop dashboard
(numerals fs50.4 fw300 positions exact; NEW GOAL 132.3×40 x1255.7; greeting
28px/400 x316 y48 w335.2 lh33.6), goal order + blocked-count typography,
768 pill nav (geometry, 6 tabs, inset-well active chip; 3px width residual =
documented live quirk), logged-OUT login at 1440 (h1 368×72 x536 y253 fs30/700;
inputs 368×48 fs14 bg rgba(248,250,252,0.5) r12; Sign in 368×48 y703 bg
rgb(15,23,42); logo 96px circular ring-4 white/50 + shadow-lg) — the last
uncrawled v2.3 state, now covered. Task-card chip row (live's dot is a SIBLING
of the text span — identical rendered layout: dot 8 + gap 8 + text), AI chip
family styles (fs/fw/col/border/r6/pad 1/5/bg/gap 2 — except letter-spacing
above), activity icon circles (30px #C9B3F5/#2ECC8A, hero 36px), task-card
meta icons (user/clock 11px@1.5), my-tasks/settings views (VLM: near-identical;
clock = live time), wizard layout/typography/bot-circle resting shadow.

## Work streams

### WS-1 — Mobile tab bar: full-width chips (F1)

View tabs: drop the button's `px-1` and `min-h-[54px]`; the chip `<span>`
becomes `w-full` (stretches to the tab) keeping pad 8/4 (px-1 py-2), gap 4
(gap-1), r14, `transition-colors duration-150`; active keeps `.orb-nav-active`
+ text color on the button. MORE: keeps its own pad 8/4 (px-1 py-2), gains
`flex-[1_1_8px]` so it renders ~6.4px wider than the view tabs (mirrors the
live's content-box basis), no chip wrapper, color-only active state. Pin with
Playwright: active chip width ≈ tab width; MORE button wider than a view tab.

### WS-2 — Icon normalization (F2)

Apply the stroke/size/glyph/color table above across orbital-app.tsx,
sidebar.tsx, task-card.tsx, goals-view.tsx, goal-detail-view.tsx,
dashboard-view.tsx, my-tasks-view.tsx, team-view.tsx, widgets.tsx,
date-picker.tsx, new-goal-dialog.tsx. Glyph imports: `Calendar` replaces
`CalendarDays` (3 sites); `Zap` replaces `Sparkles` in widgets.tsx only.
Pin representative chrome strokes in the Playwright mobile spec (tab icon
stroke 1.5).

### WS-3 — Mobile goal-card top row (F3)

Mobile variant only (the `md:hidden` button): status becomes a bare inline
row (dot + gap 6 + label + blocked span), pct becomes the r8 pad-3/10 well
chip with the 2px inset pair, row `mb-[10px]`, title `mt-0`. Desktop variant
untouched. Pin with Playwright: mobile pct element has the well background +
radius 8; the status label has no background.

### WS-4 — Verification

1. Full gate: lint → typecheck → unit (137) → build → smoke (30) → e2e
   (26 + new checks).
2. Re-probe every changed surface against the live at 390/768/1440 with
   computed styles.
3. VLM sanity pass on stitched before/after pairs (tab bar, mobile goal card).

### WS-5 — Screenshots + docs

1. Regenerate affected `docs/screenshots/*.png` from the production build
   (mobile dashboard/goals/menu + any view whose icons changed — i.e. all).
2. README/AGENTS/CLAUDE/PAD v2.4 revision block/session_20/SKILL.md aligned
   with the new measurements; mark this plan executed.

### WS-6 — Ship

Conventional Commit on `main`, push via `docs/ssh_git_wrapper_v3.py`, verify
the remote ref equals local HEAD, shred the key.
