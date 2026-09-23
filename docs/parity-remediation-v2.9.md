# Parity & Infrastructure Remediation — v2.9

Session 29 plan. Survey executed 2026-09-23 against the live reference
(`https://agent-pm-copy-15e23720.base44.app/`, authenticated as
`sepnetflix2023@outlook.com`) and the clone (production standalone server on
:3000, re-seeded `db/custom.db` 3/31/36) with paired agent-browser sessions
(live + clone) at 390 / 768 / 1440. Every finding below is computed-style
verified on BOTH apps unless noted.

Baseline gate before any change (pulled at 377008d, v2.8 state): lint 0 ·
typecheck 0 · 138/138 unit · build clean · 30/30 smoke · 73/73 Playwright.
The v2.8 push is healthy — this session is another drift-correction pass.
The operator's two named concerns were re-verified FIRST: the MOBILE
NAVIGATION MENU is still working as expected on both apps (tab-bar census
EXACT — five tabs 73.2×53.5 + MORE 81.2, hrefs, glyphs, active-well chip,
shadow and radius strings identical; the MORE sheet geometry/rows/hrefs
byte-identical and navigation functional on both; VLM-confirmed), and the
TailwindCSS v4 hunt produced the stroke-system discovery below (the live's
inline-style overrides) plus the remaining inset-shadow composition sites.

## Findings

### A. Functional / visual parity deltas (live vs clone)

- **F1 (HIGH, systemic) — The live's icon system renders at computed
  1.5px, not 2.** The live stamps an inline `style="stroke-width: 1.5"`
  (plus width/height) on every lucide svg; the presentation attribute
  stays `stroke-width="2"` but CSS beats presentation attributes, so the
  COMPUTED stroke is 1.5px. The v2.6 "universal stroke 2" census read the
  ATTRIBUTE (getAttribute) and missed the inline styles — a methodology
  artifact, now corrected. Computed censuses (visible icons only):
  dashboard 390 30/31@1.5 · 768 28/29@1.5 · 1440 16/17@1.5 · /activity
  44/44@1.5 · /team 9/12@1.5 · /settings 7/12@1.5. The clone renders
  EVERY icon at 2px. The live's **2px exception set** (action-button and
  form-control glyphs): the NEW GOAL plus (12px goals-view / 13px
  dashboard), the goal-card action squares (pencil 13 / trash 14), the
  task-card action squares (pencil 11 / trash 11), the goal-detail DELETE
  trash (13) + Target-line Calendar (13), the Team view's plus buttons
  (12/14), the Settings select chevron-downs (16) + save (14), every
  dialog close X (14–16), the check-in Send (16), the wizard close X (14)
  + sparkles (13), the date-picker popover chevrons (14), the login
  input mail/lock (16), the user-popover log-out (14). Two special
  values: the 768 back-strip chevron-left (15) renders **1.8px** and the
  wizard's bot avatar (16) renders **1.6px** (the v2.4 readings, never
  actually gone).
- **F2 (HIGH, visual) — The login page has been redesigned on the live.**
  Measured on /login at 1440 and 390: the page carries a **slate gradient
  background** (`bg-gradient-to-br from-slate-50 to-slate-100`, p-4) —
  not the clone's pure white; the card is `relative overflow-hidden
  shadow-2xl bg-white/95 backdrop-blur-sm rounded-2xl` (max-w-md) with a
  **4px top gradient bar** (`h-1 bg-gradient-to-r from-slate-200
  via-slate-300 to-slate-200`) and responsive padding `p-8 sm:p-10
  md:pt-12 md:pb-10 md:px-10` (the clone pins 48/40/40 at every width);
  the content column is **CENTERED** (`flex flex-col items-center
  text-center space-y-6 sm:space-y-8`) with the h1 `text-2xl sm:text-3xl
  font-bold tracking-tight` centered (the clone is left-aligned); the
  logo sits in a `relative group` wrapper with a **blur halo** (absolute
  inset-0, gradient rounded-full, blur-xl, opacity-30) behind the 80/96px
  chip; the Google button carries a **20px Google icon** (`h-5 w-5`)
  inside a `-ml-4 transition-transform duration-200` div (the clone: a
  16px glyph); the input glyphs are **16px** (clone: 15px); the "or"
  divider is an absolute line with a centered `text-xs uppercase
  tracking-wider` label (clone: flex gap-3 with "OR"); the footer is
  `flex flex-col sm:flex-row items-center justify-between` with a single
  "Need an account? Sign up" button whose "Sign up" is a nested
  font-medium span (clone: two separate controls). Core geometry that
  already matches and must be preserved: card 448×746 at [496,77],
  h1 30px/700/-0.025em, subtitle 16px #64748B, inputs 368×48 (bg
  rgba(248,250,252,0.5), 1px #E2E8F0, r12), Google button 368×54, Sign in
  368×48 #0F172A, the 80px (390) / 96px (1440) circular chip with
  ring-4 ring-white/50 + shadow-lg.
- **F3 (MEDIUM) — The mobile app bar lost its rounded bottom corners and
  the literal brand.** Live header: `border-radius: 0px 0px 20px 20px`,
  pad `14px 20px`, **content-driven height** (56.5 logged-out with the
  69×28.5 Log In pill; 62 authenticated with the 34px user pill), brand
  textContent "ORBITAL" (redundant uppercase transform). Clone: radius
  0px, fixed `h-[62px]` + `px-5` (pad 0px 20px), brand "Orbital".
- **F4 (MEDIUM) — The 768 pill nav's brand divider + chip structure.**
  The live's brand wrapper carries `border-right: 1px solid
  rgba(160,143,126,0.18)` + margin-right 4px (the clone has only mr-1);
  every tab is an anchor wrapping a **chip div** (`flex flex-col
  items-center gap 3px; padding 8px 12px; border-radius 12px; transition
  0.15s; min-width 52px`) with the ACTIVE treatment (bg #EBE7E2 + the
  0.75/0.32 inset pair) on the CHIP — the clone puts the active styles
  directly on the anchor and has no chip/min-width, so its pill renders
  490 wide vs the live's 494 (Team 49.1 vs 52). The live's pill z-index
  is 100 (clone 40).
- **F5 (MEDIUM) — The goal-edit dialog carries NO close square on the
  live.** Measured: the live's Edit Goal overlay (480×396 panel, z-200)
  contains exactly three controls — the status select trigger (86×35),
  Cancel (75×34) and Save (67×34); NO 30px close square. The clone
  renders the standard close square. (add-task and task-edit DO carry
  the close square on the live — 30×30 with a 14px X at stroke 2 — so
  only goal-edit changes.)
- **F6 (MEDIUM) — The user-menu pill + popover radii and glyphs.** Live
  pill: radius **12px** (the clone's rounded-xl resolves to 20px via the
  shadcn `--radius` trap), pad 11px 16px, gap 10, name 12px/500
  #6E6E6E (clone: 13px #3A3A3A); live popover: radius **12px** (clone
  rounded-xl = 20px), shadow `-6px -6px 12px 0.78 / 6px 6px 14px 0.31`
  (matches), Log Out row pad 12/16, 13px/500 #BD3228 (matches), but the
  **log-out glyph is 14px** (clone: 24px).
- **F7 (LOW) — z-index stacking.** The live's MORE sheet computes z-201
  (clone z-50) and the pill nav z-100 (clone z-40). Invisible in normal
  flows (both sit above content) but computed-style deltas; aligning is
  two class changes.
- **F8 (LOW, systemic) — The remaining `shadow-[inset…]` utilities
  compose Tailwind v4's `--tw-inset-*` vars**, emitting four zero-alpha
  prefixes in computed box-shadows (the user pill, the form-control
  primitives, the date-picker trigger) where the live renders clean
  declarations. Same artifact class the v2.8 chrome-shadow pass fixed;
  visually identical, computed parity only. Scope this pass to the
  shared primitives + the user pills.

### B. Non-findings (verified equal — do not touch)

**Mobile navigation menu (the operator's named focus — WORKING AS
EXPECTED on both apps):** the 390 tab-bar census is EXACT on both sides
(NAV [0,771,390,74]; four anchors 73.2×53.5 with hrefs `/`, `/goals`,
`/my-tasks`, `/activity`; glyphs layout-dashboard / target /
square-check-big / activity; the Home chip's active well #EBE7E2 + the
0.75/0.32 inset pair; the MORE button 81.2×53.5 stays a `<button>`;
shadow `rgba(160,143,126,0.22) 0px -4px 20px`, radius 20/0/0/20). The
MORE sheet opens on both (geometry [0,541,390,303], r24, pad 20/20/40,
handle, brand ORBITAL, 32×32 r10 close with the 3px/6px pair, rows
350×49 with list-todo / users / settings glyphs), its rows are anchors
to `/tasks`, `/team`, `/settings` on both, and CLICKING THEM NAVIGATES
on both (verified: both land on /tasks with h1 "Tasks"). The 768 pill
nav geometry/hrefs/labels/shadow match (the F4 deltas aside). The
desktop sidebar anchor map, the LOG IN pill (1440: [1159,48,85,40] r12
pad 11/20 12px/600 standard pair; 390 app bar: 69×29 r10 small pair)
match. Other verified-equal surfaces: the dashboard activity card
(20-row cap, NPA well), the add-task / task-edit / check-in / wizard
dialogs (geometry, buttons, scrims — incl. the 448×408 check-in with
Send 16 + Close 30), the date picker (262×271 popover, chevrons at 2),
the /tasks view, the greeting, the seed workspace (3 goals / 31 tasks /
36 entries), and the goal-card action-square strokes (2px on both).

## Work streams

### WS-1 — The icon stroke re-split (F1)

Sweep ~45 sites across ~15 files: every chrome/content icon moves to
computed 1.5px via `strokeWidth={1.5}` (the attribute approach computes
correctly since no CSS rule sets stroke-width); the measured 2px
exception set stays at the lucide default (DELETE the prop where
possible per the house style); the 768 back-strip chevron-left becomes
`strokeWidth={1.8}`; the wizard bot becomes `strokeWidth={1.6}`.
Concrete sites (live-measured):
- `orbital-app.tsx`: TABS ×4 (20px) + PILL_TABS ×6 (18px) + Menu (20) +
  the MORE sheet rows ×3 (20) → 1.5; the sheet close X (16) stays 2;
  the back-strip ChevronLeft (15) → 1.8.
- `sidebar.tsx`: nav icons ×6 (16) → 1.5.
- `dashboard-view.tsx`: Full log ArrowRight ×2 (12) → 1.5; the NEW GOAL
  plus (13) stays 2.
- `activity-icon.tsx` (every feed glyph) + `activity-view.tsx` Search
  (16) → 1.5.
- `task-card.tsx` + `tasks-view.tsx` meta icons (User/Calendar/Clock
  11) → 1.5; the action squares (pencil/trash 11) stay 2.
- `widgets.tsx` Zap (9) → 1.5.
- `goals-view.tsx` / `goal-detail-view.tsx` / `my-tasks-view.tsx` /
  `team-view.tsx` empty-state glyphs (22/28) → 1.5; the goal-card
  pencil/trash (13/14) and NEW GOAL plus (12) stay 2; the goal-detail
  DELETE trash (13) + Target Calendar (13) stay 2.
- `user-menu.tsx` LogOut → size 14 (from 24; WS-6).
- `new-goal-dialog.tsx`: Bot (16) → 1.6; the close X (14) + the AI hint
  sparkles (13) stay 2.
- `date-picker.tsx`: the trigger Calendar (14) → 1.5; the popover
  chevrons stay 2.
- `login-screen.tsx`: Mail/Lock → size 16 (from 15), stroke stays 2.
Pin with Playwright: a computed-stroke census per surface.

### WS-2 — Login restyle (F2)

`login-screen.tsx` shell rewrite (state logic untouched): the gradient
page + p-4, the overflow-hidden/blur/gradient-bar card, responsive
padding, the centered column, the group + blur-halo logo (chip spec
unchanged — keeps the ring-4/shadow-lg geometry the auth spec pins),
the 20px Google glyph in its `-ml-4` wrapper, the absolute-line "or"
divider, 16px input glyphs, and the sm:flex-row footer with the
combined "Need an account? Sign up" button. The signup/forgot states
keep their headings inside the same centered column.

### WS-3 — Mobile app bar (F3)

`orbital-app.tsx` header: `rounded-b-[20px] p-[14px_20px]` replacing
`h-[62px] px-5` (content-driven height — the Log In pill drives 56.5,
the user pill 62, matching the live), brand textContent "ORBITAL".

### WS-4 — The 768 pill nav (F4 + F7-part)

`orbital-app.tsx`: the brand wrapper gains `border-r
border-[rgba(160,143,126,0.18)]`; every PILL_TABS anchor wraps an inner
chip span (`flex flex-col items-center gap-[3px] rounded-[12px] px-3
py-2 transition duration-150 min-w-[52px]`) that carries the ACTIVE
well treatment (bg-orb-well + the 0.75/0.32 inset pair) and the label
coloring; the nav moves to `z-[100]`.

### WS-5 — goal-edit close removal (F5)

`goal-edit-dialog.tsx` passes `showCloseButton={false}` to its
DialogContent.

### WS-6 — User menu (F6)

`user-menu.tsx`: pill `rounded-[12px]` + name `text-[12px]
text-[#6E6E6E]`; popover `rounded-[12px]`; `LogOut size={14}`.

### WS-7 — Sheet z-index (F7)

The MORE sheet's SheetContent gets `z-[201]` (over the dialogs' z-50,
mirroring the live's 201-over-200 order).

### WS-8 — Inset-shadow custom class (F8, scoped)

`globals.css` gains `.orb-inset` (the standard 3px 0.68/0.24 inset
well pair, plain declaration); the input / textarea / select-trigger /
date-picker-trigger primitives and both user pills swap their
`shadow-[inset…]` utilities for it where the pair matches byte-for-byte
(the odd one-offs stay).

### WS-9 — Verification

1. RED first: `tests/e2e/v29-parity.spec.ts` — the computed-stroke
   census (1.5 on sidebar/tab/pill/feed/meta/empty-state glyphs; 2 on
   the plus/pencil/trash/chevron-down/close set; 1.8 back-chevron;
   1.6 wizard bot), the app-bar radius/brand/height, the pill-nav
   divider + chip min-width + width 494 + z, the goal-edit no-close,
   the login gradient/centering/20px Google glyph/16px input glyphs,
   the user-popover 14px LogOut. All fail on the current build.
2. Update the retired v2.6/v2.7 stroke pins (mobile-navigation:74,
   v26-parity:21/45, v27-parity:248) from 2 → the measured values.
3. Full gate after GREEN: lint → typecheck → unit (138) → build →
   smoke (30) → e2e (73 + the v29 pins).
4. Re-probe every changed surface against the live with computed
   styles (stroke censuses at three widths, app bar, pill nav, login,
   dialogs, user menu).
5. VLM sanity pass on regenerated screenshots.

### WS-10 — Screenshots + docs + ship

1. Regenerate the affected `docs/screenshots/*.png` (login 14, the
   mobile chrome, tablet dashboard, goals view, dashboard).
2. README / AGENTS.md / CLAUDE.md (the re-split stroke doctrine with
   the attribute-vs-computed lesson, the login redesign spec, the app
   bar/pill/user-menu specs, gate counts), PAD v2.9 revision block,
   SKILL.md lesson, `docs/session_29.md`, worklog; mark this plan
   EXECUTED.
3. Conventional Commit on `main`, push via `docs/ssh_git_wrapper_v3.py`,
   verify remote == local HEAD, shred the key.

## Execution record (2026-09-23)

All work streams executed (plus a survey-late addition: F5 grew to
cover the live's NATIVE dialog selects — add-task/task-edit/goal-edit
status/assignee controls are native `<select>` elements on the live,
216×35, bg #EBE7E2, r10, 13px, while the clone used shadcn button
triggers; converted via the `.orb-select` custom class. The SETTINGS
selects keep their shadcn triggers — their chevron-downs are measured
live at stroke 2). Final gate: lint 0 · typecheck 0 · 138/138 unit ·
build clean · 30/30 smoke · 91/91 Playwright (73 prior + 18 net-new
v29 pins: the computed-stroke censuses at three widths, the 2px
exception set, the 1.8 back-chevron, the 1.6 bot, the app-bar
radius/brand/height, the pill-nav divider + chip min-width + z, the
goal-edit no-close, the native-select spec, the login gradient/
centering/20px glyph/16px input glyphs, the user-menu geometry).
Re-probes EXACT on every changed surface (see docs/session_29.md).
One execution note: the first RED run's login pins tripped two
measured quirks — Tailwind v4 serializes slate gradients as lab()
coordinates (the live, same Tailwind, serializes identically) and the
shadcn Button base forces 16px on child svgs unless they carry a
size-* class (the Google glyph needed `size-5`, the documented trap);
and the v26 goal-detail stroke pin needed glyph+size disambiguation
(calendar@11 renders 1.5 but calendar@13 stays 2; the ADD TASK plus@12
and the Back-to-Goals arrow@14 stay 2).
