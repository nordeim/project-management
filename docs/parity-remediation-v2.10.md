# Parity & Infrastructure Remediation — v2.10

Session 31 plan. Survey executed 2026-09-23 against the live reference
(`https://agent-pm-copy-15e23720.base44.app/`, authenticated as
`sepnetflix2023@outlook.com`) and the clone (production standalone server on
:3000, re-seeded `db/custom.db` 3/31/36) with paired agent-browser sessions
(live + clone) at 390 / 768 / 1440. Every finding below is computed-style
verified on BOTH apps unless noted.

Baseline gate before any change (pulled at e9bc41b, v2.9 state): lint 0 ·
typecheck 0 · 138/138 unit · build clean · 30/30 smoke · 91/91 Playwright.

The operator's two named concerns re-verified FIRST: the MOBILE NAVIGATION
MENU still works as expected on both apps (the 390 tab-bar census is EXACT —
five tabs 73.2×53.5 + MORE 81.2, hrefs, glyphs, active chip, strokes 1.5,
shadow/radius strings identical; the MORE sheet panel byte-identical at
z-201 with navigation functional on both). The TailwindCSS v4 hunt produced
the remaining `shadow-[…]` composition sites and two more `rounded-full`
infinity-radius sites (F6). The session's headline finding is a NEW DIALOG
FORM GENERATION on the live (F1/F2/F3) plus a coherent z-index system
(100/200/201 — F5).

## Findings

### A. Functional / visual parity deltas (live vs clone)

- **F1 (HIGH, systemic) — the standard form dialogs (add-task / task-edit /
  goal-edit) were re-generated on the live.** The live's dialog ROOT is a
  scrim-flex container: `fixed inset-0 z-[200] flex items-center
  justify-center p-[24px_16px] bg-[rgba(46,42,38,0.3)]` with the panel as
  its CHILD (`relative rounded-[20px] max-w-[500px] p-[28px_28px_24px]`, no
  shadow — panel geometry unchanged). The clone still renders separate
  z-50 overlay + translate-centered z-50 content. Inside: the heading is a
  **`<p>` 15px/600 lh 22.5 with mb 20** (clone: H2 via DialogTitle with the
  content's gap-4 = 16); the **form is `flex flex-col gap-[14px]`** (clone:
  space-y-4 = 16); the **labels render 11px/600 uppercase ls 0.88px lh
  16.5px mb 6px** (clone `.orb-label` ls 1.1 lh 11 mb 8 — field rows 58 vs
  55); the inputs compute **h 35.5** (text/number) and **h 37.5** (date)
  vs the clone's 36/38; the **button row is mt 4 / gap 10** (goal-edit mt 6;
  clone mt 0 / gap 8); the **close X is 13px colored #5A5A5A** (clone 14px
  #2F2823); and the whole root computes **z-200** (clone z-50).
- **F2 (HIGH) — the invite dialog's control spec.** Live: H2 16px/**500**
  lh 16 ls -0.4 (clone 600/24); labels **12px/500 normal-case lh 12 mb 6**
  (clone .orb-label 11/600/uppercase mb 8); input **h 37.5 pad 9/14**
  (clone 36 pad 8/12); role toggle buttons **36px tall, 13px/500, r10, pad
  8/0, bg #EBE7E2** (clone 44px/14/r16/gray); button row **mt 8** (clone
  40px row with mt-4 buttons). z 50 matches.
- **F3 (HIGH) — the check-in modal re-anchored + radio re-spec.** The live
  renders the check-in **top-anchored at 5% of the viewport** (y 42.2 at
  844 = 844×0.05 exactly; the clone centers at y 190.3); the **radio
  circles compute radius 9999px** with color #2F2823 and fs 16/400 (clone:
  `rounded-full` → 33554432px, color #3A3A3A, fs 14/500) and the **labels
  are content-width spans with the input as a sibling** (59/52/69/34 wide;
  clone: 151px labels wrapping the button); the **textarea renders fs
  16px** (clone 14); the **close square's bg is the canvas #EEEAE2** with
  the X at #5A5A5A (clone: well #EBE7E2 + #2F2823). h2/Post Update/rows
  match (121×32 12/500 both).
- **F4 (MEDIUM) — wizard chrome.** The live's wizard outer panel is
  **radius 24 at every width** (clone r20 below md); the wizard scrim
  computes **z-100** (clone z-50); the **bot avatar circle computes
  radius 50%** (clone rounded-full → infinity); the **title input's
  horizontal pad is 14** (clone 12). The conversational structure, bubble,
  inner r16 panel, buttons, icons, and the visual field spacing all match.
- **F5 (MEDIUM) — a coherent z-index system on the live.** Measured: tab
  bar **100** (clone 40) · 768 pill nav 100 ✓ · form-dialog roots **200**
  (clone 50) · the MORE sheet overlay **200** / panel 201 (clone overlay
  50 / panel 201) · the wizard **100** (clone 50) · check-in 50 ✓ · user
  popover 50 ✓ · date-picker wrapper 50 ✓. Invisible in normal flows (both
  stack correctly) but computed deltas — plus ONE functional trap: the
  clone's date-picker popover is portaled to `<body>` at z-50, so once the
  dialogs move to z-200 the picker would render UNDER the dialog. The
  clone's picker wrapper must move to **z-[210]** (the live's picker lives
  INSIDE its dialog's stacking context, which the portal cannot mirror —
  a documented structural deviation).
- **F6 (MEDIUM, systemic) — the remaining Tailwind v4 serialization
  sites.** (a) the 768 pill-nav ACTIVE chip's inset pair composes zero
  alpha prefixes (live: clean `rgba(255,252,248,0.75) -3px -3px 6px inset,
  rgba(180,165,150,0.32) 3px…`); (b) the 768 back-strip Dashboard button's
  raised pair composes (live: clean); (c) the sidebar clock's inset shadow
  composes AND its circle computes `rounded-full` infinity (live: clean
  shadow + radius 50%); (d) the check-in radio circles (F3) — 9999px; (e)
  the wizard bot avatar (F4) — 50%; (f) the date-picker INNER card's -8px
  pair composes (live clean); the picker's month chevron circles compute
  r16 (clone rounded-full — visually identical, computed-only).
- **F7 (MEDIUM) — sidebar chrome.** The live moved the panel properties
  ONTO the `aside` (bg raised, r20, large pair, pad 28/16/16) and renders
  208-wide children with the brand row at **pl 10** (mark at x50; the
  clone's brand sits at x40) and **mb 32**; the **collapse bar carries
  pad 8** (clone pad 0); the clock circle (F6c). The rendered nav rows,
  section-label positions, and brand text all already match — the aside
  restructure itself is a computed-only deviation kept as a documented
  DOM difference (the panel div keeps the rendered box); the VISIBLE
  deltas are the brand x, the collapse pad, and the clock.
- **F8 (LOW) — activity feed.** The "Online · N" pill re-structured on the
  live: `[7px dot span][Online span][· N span]` flex gap 6 → text
  "Online· 36", 100×31 (clone: text node "Online " + span → 96×31);
  the date-group label's line-height is 15 (clone 24 — the v2.6 "24px
  line box" spec retired; ~2px row-start shift).
- **F9 (LOW) — settings.** The Save button's icon renders 14px on the
  live (clone 16 — the shadcn Button `[&_svg:not([class*='size-'])]:size-4`
  base forces 16; opt out with an explicit `size-3.5` class).
- **F10 (MEDIUM) — login page.** The live's card computes **746 tall**
  (clone 778 — exactly +32: the footer sits INSIDE the form's bottom
  block at **mt 12** after Sign in, not as a mb-32 sibling; the
  label→input gap is **6** (clone 10) and the field gap **16** (clone
  20)); the card's backdrop blur is **4px** (clone blur-sm = 8). The body
  background renders white (clone canvas #EBE7E2 — invisible under the
  gradient wrapper; documented, not fixed).
- **F11 (LOW) — goal-edit specifics.** The status select's option order is
  **Draft | Active | Paused | Completed** (clone: alphabetical Active |
  Completed | Draft | Paused); the Title label carries NO asterisk (clone
  "Title *" — add-task keeps its asterisk).
- **F12 (LOW) — user menu popover offset.** The popover opens 10px below
  the pill on the live (clone 4 — the sideOffset needs +4→8/10; verified
  against the pill's bottom edge during the re-probe).

### B. Non-findings (verified equal — do not touch)

**Mobile navigation menu (the operator's named focus — WORKING AS
EXPECTED on both apps):** the 390 tab-bar census EXACT (NAV [0,770.5,390,
73.5]; four anchors 73.2×53.5 + MORE 81.2 button; hrefs /, /goals,
/my-tasks, /activity; glyphs layout-dashboard/target/square-check-big/
activity at 20px computed stroke 1.5; the Home chip's active well bg
#EBE7E2 + the 0.75/0.32 inset pair; tab-bar shadow + radius identical);
the MORE sheet opens on both (panel [0,541,390,303] r24, pad 20/20/40, z
201, upward shadow, brand ORBITAL, 32×32 r10 close with X@2, rows 350×49
with 20px list-todo/users/settings glyphs at 1.5) and its rows navigate
on both. The app bar (radius 0 0 20 20, pad 14/20, content-driven 62
authenticated, ORBITAL brand, shadow identical). The 768 pill nav: rect
494.3×70.5, z 100, r20, pad 10/16, gap 4, brand divider 1px rgba(160,
143,126,0.18) + ORBITAL, six anchor-wrapped chips (min-w 52, r12, pad
8/12, active well on the chip), strokes 1.5 — EXACT except the F6a shadow
composition. The 1440 stroke census EXACT (sidebar 16@1.5, chevron-right
14@1.5, NEW GOAL plus 13@2, feed 13@1.5, arrows 12@1.5, rings 60 raw) —
the 1.5/2 split holds everywhere. /team and /tasks byte-clean (buttons,
cards, chips, counts, rows 117-tall). Goal cards 1072×166 with 29×23/30×24
action squares on both. The activity feed's hero card, group-card rows
(1072×89, pad 14/18), type tags (10/600 #B3B3B3), and 35-cell day grids
match. The user popover's panel (160×44 r12, -6px pair, LogOut 14@2 pad
12/16 #BD3228) matches. The date picker's two-layer structure (outer
262×271 r14 #ECEBE9 1px #D8D4CF z50 + inner 260×269 r16 #EEEAE2) matches
the live — only the inner shadow composes. The dashboard, greeting,
settings cards (three 528-wide r16 panels), and the seed workspace
(3/31/36) all re-confirmed equal.

## Work streams

### WS-1 — Dialog base restructure (F1 core + F5)

`src/components/ui/dialog.tsx`: render the overlay AS the flex root —
`DialogPortal > DialogOverlay(scrim-flex) > DialogContent(panel child)`.
The overlay gains `flex items-center justify-center p-[24px_16px]` (its
bg alpha stays per-kind); the content drops `top-50% translate-* grid
gap-4` for `relative` (the panel keeps r20/maxW/pad/no-shadow); the close
square's X becomes `size-[13px] text-[#5A5A5A]`; the content's base z
moves per-kind via className (`z-[200]` form dialogs, `z-[50]` check-in,
`z-[100]` wizard). Radix's DismissableLayer keeps outside-click closing
(the overlay area is outside the content). The wizard's scrim-flex
inherits the same pattern at z-100.

### WS-2 — The form-dialog generation (F1 + F11)

The three dialogs: heading → `<p>` 15/600 mb 20 (DialogTitle asChild);
form → `flex flex-col gap-[14px]`; labels → a new `.orb-label-dlg` class
(11/600/uppercase/ls 0.88px/lh 16.5/mb 6/#6E6E6E); inputs `h-[35.5px]`
(text/number) + `h-[37.5px]` (date); the button row `mt-[4px] gap-[10px]`
(goal-edit `mt-[6px]`); goal-edit: select order
draft→active→paused→done + the plain "Title" label; close X via WS-1.
The invite dialog (F2): H2 `text-[16px] font-medium leading-[16px]
tracking-[-0.4px]`; labels 12/500 normal-case lh 12 mb 6; input h 37.5
pad 9/14; role buttons 36/13/r10/pad 8/0/bg #EBE7E2; button row mt 8.

### WS-3 — Check-in modal (F3)

`task-detail-dialog.tsx`: the content anchors `top-[5%]` (horizontal
centering kept); the radio grid re-rendered as label-row flex cells
(content-width `<span>` labels, the 16px circle as a sibling, `rounded-
[9999px] text-[#2F2823]`); the textarea `text-[16px]`; the close square
`bg` canvas + X #5A5A5A (via WS-1's X or a local override).

### WS-4 — Wizard chrome (F4)

`new-goal-dialog.tsx` + `ui/dialog.tsx`: outer panel `rounded-[24px]` at
all widths; the scrim-flex root at z-100; the bot avatar `rounded-[50%]`;
the title input `px-[14px]`.

### WS-5 — z-index sweep (F5)

`orbital-app.tsx` tab bar `z-40` → `z-[100]`; `ui/sheet.tsx` SheetOverlay
`z-50` → `z-[200]` (panel 201 already); `ui/date-picker.tsx` popover
wrapper `z-50` → `z-[210]` (documented portal deviation).

### WS-6 — v4 serialization cleanups (F6)

New plain-declaration classes in `globals.css`: `.orb-chip-active` (the
0.75/0.32 inset pair) for the 768 pill chip; `.orb-back-btn` (the back
strip's clean raised pair); `.orb-clock` (the clock's clean inset pair);
the date-picker inner card swaps its composed `-8px` shadow for a custom
class; the month chevron circles `rounded-[16px]`; the radio circles +
bot avatar (WS-3/WS-4).

### WS-7 — Sidebar + activity + settings + login + user menu (F7–F12)

Brand row `pl-[26px]` (mark at x50); collapse bar `p-2`; the activity
pill restructured to `[dot][Online][· N]` flex gap 6; the group label
`leading-[15px]`; the Settings Save icon `size-3.5`; the login footer
moved inside the form's bottom block (`mt-[12px]` after Sign in), the
label gap 10→6 (label mb 6) and the field gap 20→16, the card
`backdrop-blur-[4px]`; the user-menu sideOffset 4→8 (verified 10 during
the re-probe).

### WS-8 — Verification (TDD)

1. **RED first**: `tests/e2e/v30-parity.spec.ts` — the scrim-flex dialog
   root (flex/pad/z 200), the P heading + mb 20, the form gap 14, the
   label lh 16.5/ls 0.88/mb 6, the button row mt/gap, the close X 13px
   #5A5A5A, the goal-edit option order + no-asterisk, the check-in top
   anchor + radio r9999/label widths + textarea fs 16 + close colors,
   the wizard r24/z-100/avatar 50%/input pad, the z census (tab 100,
   sheet overlay 200), the pill-chip/back-strip/clock/date-picker-inner
   clean shadows, the sidebar brand x + collapse pad, the activity pill
   text + label lh, the settings save 14, the login card 746 + blur 4 +
   footer-inside-form. All fail on the current build.
2. Update the retired pins my changes break (v25/v26/v27/v28/v29: the
   dialog heading/label/geometry assertions, the check-in radio/labels,
   the login card spacing, the wizard radius if pinned).
3. Full gate after GREEN: lint → typecheck → unit (138) → build →
   smoke (30) → e2e (91 + the v30 pins).
4. Re-probe every changed surface against the live with computed styles.
5. VLM sanity pass on the regenerated screenshots.

### WS-9 — Screenshots + docs + ship

1. Regenerate the affected `docs/screenshots/*.png` (dialogs, check-in,
   wizard, login, tablet, sidebar).
2. README / AGENTS.md / CLAUDE.md (the v2.10 dialog-generation spec, the
   z-system map, the login/check-in/invite/wizard specs, gate counts),
   PAD v2.10 revision block, SKILL.md lesson, `docs/session_31.md`,
   worklog; mark this plan EXECUTED.
3. Conventional Commit on `main`, push via `docs/ssh_git_wrapper_v3.py`,
   verify remote == local HEAD, shred the key.

## Session-31 completion audit (2026-09-23, this session)

The prior session's upload captured a PARTIAL state: WS-1 (dialog
scrimFlex base), WS-2's add-task conversion, WS-4 (wizard), and the
WS-6 globals.css classes are in; the remaining wiring is not. Baseline
re-verified: lint 0 · typecheck 0 · 138/138 unit · build clean · e2e
95/114 (18 v30 pins red + v29:209 flake). Root causes probed live
(scripts/probe-checkin.mjs):

- **DialogTitle base cascade (v30:85)** — Radix `asChild` Slot
  CONCATENATES classes (no tailwind-merge), so the base
  `text-lg leading-none` survives alongside `leading-[22.5px]`; in v4
  stylesheet order `.leading-none` (line-height:1) wins → lh 15px.
  Fix: strip base typography from `DialogTitle`; every usage carries
  explicit classes (the wizard's bare title gets them pinned to its
  current 18/600/lh18 rendering, which matched the live).
- **Label height (v30:118)** — the shadcn `Label` base `display:flex`
  makes the label height the font's ascent/descent box (16.01px) not
  the 16.5px line box; the live label is block. Fix:
  `.orb-label-dlg { display: block }`.
- **Check-in 5% anchor (v30:200)** — FALSE CSS BUG: computed top is
  42.19px (correct); the test measured mid zoom-in animation
  (scale .9704 shifts the top edge +6.7px). Fix: expect.poll in the
  spec (pin value unchanged).
- **Radio labels (v30:209)** — the inner `<span>` duplicates the
  label-text matches (8 vs 4). Fix: bare text node.
- **Online pill (v30:389)** — literal space before "·" (live renders
  "Online· 36") + the test measured before the async feed load
  ("· 0"). Fix: span-per-part + poll for data in the spec.
- **goal-edit/task-edit** still on the old generation (H2 heading,
  space-y forms, orb-label labels, no scrimFlex) — convert mirroring
  the completed add-task pattern; goal-edit also takes the F11 option
  order (draft→active→paused→done), the plain "Title" label, and the
  mt-6 button row.
- **WS-5/6/7 wiring** — tab bar z-40→z-[100]; SheetOverlay z-50→
  z-[200]; date-picker popover z-[210] + `.orb-panel-shadow` inner
  card + r16 chevrons; pill chip `.orb-chip-active`; back strip
  `.orb-back-btn`; clock `rounded-[50%]` + `.orb-clock`; sidebar brand
  row pl-[26px] (mark x50) + collapse bar p-2; activity pill
  restructure + group label lh 15; Settings Save icon `size-3.5`;
  invite F2 spec (16/500/lh16/ls-0.4 H2 without the icon circle,
  12/500 labels, 36px role toggles, mt-8 row); login F10 (footer
  inside the form at mt 12, gaps 6/16, blur 4px).
- **Retired pins updated** — v29:201 (heading role → text locator,
  the p generation carries no heading semantics) and v29:213 (option
  order → the F11 sequence). v26 radio pins verified geometry-only
  (safe). v29:209 re-checked post-fix for the pollution flake.

## Session-33 completion record (2026-09-24) — PLAN EXECUTED

Sessions 31/32 shipped the wiring (WS-1..WS-7 source changes committed via
uploads); session 33 completed the remaining spec + verification work with
fresh live ground-truth probes:

- **Spec fixes (v30)**: button-row/label/check-in/popover reads wrapped in
  expect.poll (the zoom-in-95 + slide-in animations under-measure mid-flight
  — 34→33, 17→16, 42.2→49, 8→6.3; pins unchanged); the group-label and
  settings-save tests poll for their async-rendered surfaces; the login
  describe opts out of storageState (the authenticated redirect left no form
  to measure); the back-strip test polls (a sequential-run flake).
- **Live ground truth re-probed**: login card 746×448 blur 4px; the form's
  computed margins live on the LATER children (input wrapper mt 6, password
  block mt 16, bottom block mt 20, footer mt 12) with INLINE labels (the
  24px strut line box makes each field block 78); the pill is a 101×30.5
  DIV whose [7px dot][Online 39][· N 19] children carry their own fs (the
  live serves NO DM Sans file — system-ui fallback; the clone's self-hosted
  DM Sans advances +2px — documented deviation, span-pinned); the group
  label span lh 15 inside a 24px parent line box (the clone was already
  exact — the failure was async timing); the user popover opens EXACTLY 8px
  below the pill (F12 settled).
- **Source fixes (TDD red→green)**: `user-menu.tsx` sideOffset 4→8;
  `login-screen.tsx` restructured to explicit mt utilities mirroring the
  live's computed layout (v4's space-y margin-flip documented in PAD
  lesson 18) + `inline leading-5` labels + the google/divider/form sibling
  structure; `activity-view.tsx` pill P→DIV with per-span classes.
- **Retired-pin updates**: v25's pill locator (p→div); v29's native-select
  read polls for the animation settle.
- **Full gate GREEN**: lint 0 · typecheck 0 · 138/138 unit · build clean ·
  30/30 smoke · **115/115 Playwright** (114 + the net-new popover-gap pin).
- **Re-probes EXACT** on every changed surface + the operator's mobile-nav
  focus: the 390 tab census byte-identical (5 tabs 73.2×53.5 + MORE 81.2,
  strokes 1.5, hrefs, z 100, radius, rect 771/73.5), the MORE sheet
  (overlay 200 / panel 201 / rows + hrefs + navigation functional), the 768
  pill nav (494×70.5 z 100, 6 tabs), the popover gap 8, the login card 746
  with the full computed-margin set, the pill structure.
- **Screenshots**: all 16 regenerated from the production build (the wizard
  pair via capture-wizard.sh against the real AI plan, scratch goal cleaned
  up, db back to the pristine 3/31/36); VLM sanity unavailable (the chat
  endpoint is not multimodal + rate-limited) — verified via the 115 green
  e2e pins + size/entropy sanity instead.
- **New finding (F13, open)**: the LIVE's `/login` renders the login card
  for AUTHENTICATED visitors (no redirect); the clone redirects to `/`
  (pinned by auth.spec + documented since v1.4). Recorded for the next
  remediation plan.
- **Docs aligned**: README (v2.10 section, 115 e2e), AGENTS (gate counts +
  the v2.10 dialog/z-system/space-y facts), CLAUDE (browser layer v2.10
  pins), PAD (v2.10 revision block + counts), SKILL (sessions 1–33, lessons
  18–19), worklog, this plan marked EXECUTED.
