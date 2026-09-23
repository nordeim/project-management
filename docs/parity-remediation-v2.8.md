# Parity & Infrastructure Remediation — v2.8 — EXECUTED

Session 27 plan. Survey executed 2026-09-23 against the live reference
(`https://agent-pm-copy-15e23720.base44.app/`, authenticated as
`sepnetflix2023@outlook.com`) and the clone (production standalone server on
:3000, re-seeded `db/custom.db` 3/31/36) with paired agent-browser sessions
(live + clone) at 390 / 768 / 1440. Every finding below is computed-style
verified on BOTH apps unless noted.

Baseline gate before any change (pulled at a7d427e, v2.7 state): lint 0 ·
typecheck 0 · 138/138 unit · build clean · 30/30 smoke · 60/60 Playwright.
The v2.7 push is healthy — this session is another drift-correction pass,
this time focused on the operator's two named concerns: the mobile
navigation menu (verified working as expected on both apps) and
**TailwindCSS v4-related bugs** (two verified artifact classes found).

## Findings

### A. Functional / visual parity deltas (live vs clone)

- **F1 (HIGH, systemic) — Every button on the clone renders the ARROW
  cursor; the live renders the pointing hand.** The live's global
  stylesheet carries exactly `button, [role="button"] { cursor: pointer }`
  (read out of its CSSOM). The clone sets nothing, so buttons fall back to
  the UA default (`cursor: default`). Tailwind v4's preflight does NOT
  restore the pointer (verified against the installed `tailwindcss@4.3.3`
  `preflight.css` — no cursor rule), which makes this the canonical
  "migrated to v4 and lost the affordance" regression the operator asked
  us to look for. Verified deltas across surfaces on BOTH apps:
  dashboard (sidebar collapse bar + NEW GOAL), goals view (NEW GOAL +
  5 filter chips + card action squares), my-tasks + /tasks (5 filter
  chips each), activity / team / settings (all buttons), the add-task
  dialog (close square, Cancel, Add Task, select triggers), the MORE
  trigger, the MORE-sheet close square, and the user pill (the clone's
  is a `<button>`, the live's is a `cursor: pointer` div — v2.7
  documented the type difference; the CURSOR was the missing part).
  Element census at 1440 on the dashboard: live 17 anchors/pointer +
  2 buttons/pointer; clone 17 anchors/pointer + 2 buttons/default.
- **F2 (HIGH, functional regression since v2.7) — The mobile goal-card
  action squares are BROKEN on the clone: clicking edit/delete NAVIGATES
  to the goal detail instead of opening the dialog.** The v2.7 anchor
  conversion wrapped the whole compact mobile card — including the
  action buttons — in `<a href="/goals/<id>">`, and the buttons' clicks
  bubble to the anchor's `navigate("goal-detail")`. Measured: clone
  pencil click → `location.pathname` becomes `/goals/<id>`, no dialog;
  live pencil click (full click event) → stays on `/goals`, a fixed
  z-200 scrim + dialog renders. The desktop card is unaffected (its
  actions sit OUTSIDE the anchor in the right column). Not pinned by
  any e2e test — silent for a full session cycle.
- **F3 (MEDIUM) — The MORE-sheet close square renders the WRONG shadow
  pair.** Live (re-measured this session):
  `rgba(255, 250, 244, 0.78) -3px -3px 6px 0px, rgba(160, 143, 126,
  0.27) 3px 3px 6px 0px` (the 3px/6px raised pair, radius 10, 32×32,
  bg #EBE7E2). Clone (stale v2.0 spec):
  `shadow-[-4px_-4px_8px_rgba(255,250,244,0.78),4px_4px_8px_rgba(160,
  143,126,0.28)]` — a 4px/8px/0.28 pair. Real (if subtle) shadow-size
  + opacity difference.
- **F4 (MEDIUM, Tailwind v4 artifact) — Shadow-variable composition
  pollutes the computed box-shadow string.** In Tailwind v4 every
  `shadow-[…]` utility compiles to `box-shadow: var(--tw-inset-shadow),
  var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow),
  var(--tw-ring-shadow), var(--tw-shadow)` — unset vars resolve to
  `0 0 #0000`, which Chrome serializes as `rgba(0, 0, 0, 0) 0px 0px
  0px 0px`. The clone's app bar, mobile tab bar, MORE sheet, 768 pill
  nav, and close squares therefore render computed strings with FOUR
  zero-alpha prefixes in front of the real shadow; the live renders
  clean single declarations (e.g. app bar exactly `rgba(160, 143,
  126, 0.18) 0px 4px 16px 0px`). Visually identical (zero-alpha
  shadows are invisible — VLM confirms IDENTICAL screenshots), but a
  computed-style parity gap on every chrome surface, and exactly the
  class of v4 rendering artifact the operator asked us to hunt. Fix
  via dedicated custom classes with plain declarations (the existing
  `.orb-*` primitive doctrine — custom classes already win the
  cascade).
- **F5 (LOW, Tailwind v4 artifact) — `rounded-full` serializes as
  `calc(infinity * 1px)`**, which Chrome computes to `33554432px`
  (2^25). The live's pill-radius surfaces render literal `9999px`
  (radius census at 1440 on /tasks: live `5× 9999 + 1× 50%`; clone
  `6× 3.35544e+07`). Invisible at chip sizes, but the computed strings
  diverge on every filter-chip row. Fix: `rounded-[9999px]` on the
  goals / my-tasks / /tasks filter chips (and the identical chip
  primitives they share).
- **F6 (LOW) — Goal-card anchor coverage: the live's `<a>` wraps the
  ENTIRE card (1072px incl. the 120px right stats/action column);
  the clone's desktop anchor covers only the 952px text region** —
  the far-right card area does not navigate on the clone. Same
  pattern on the dashboard goal wells: live = bare `<a>` wrapping an
  inner well `div`; clone = the `<a>` IS the well (the anchor itself
  carries `orb-well` + the inset shadow). Functionally equivalent
  (both navigate), but the hit areas and the anchor's computed styles
  differ.
- **F7 (LOW) — Brand strings render as transformed text.** The live's
  brand textContent is literal `ORBITAL` (no `text-transform`; the
  sidebar brand anchor is classless, pad 0, 91.3 wide). The clone
  renders `"Orbital"` + `uppercase` (textContent "Orbital") in both
  the sidebar and the MORE sheet, and the sidebar anchor carries
  `pl-2.5 rounded-xl` (hit area 101.3 vs 91.3). Visually identical;
  DOM-text and hit-area deltas.

### B. Non-findings (verified equal — do not touch)

**Mobile navigation menu (the operator's named focus — WORKING AS
EXPECTED on both apps):** the 390 tab-bar census is EXACT on both
sides (NAV [0,771,390,74]; four anchors 73.2×53.5 with hrefs `/`,
`/goals`, `/my-tasks`, `/activity`; glyphs layout-dashboard / target /
square-check-big / activity at stroke 2; the Home chip's active well
#EBE7E2 + the 0.75/0.32 inset pair; the MORE button 81.2×53.5 stays a
`<button>`). The MORE sheet opens on both (geometry [0,541,390,303],
r24 top, pad 20/20/40, handle, brand, 32×32 r10 close, rows
350×49 16px/400 #2F2823 with list-todo / users / settings glyphs),
its rows are anchors to `/tasks`, `/team`, `/settings` on both, and
CLICKING THEM NAVIGATES on both (verified: live → /tasks "31 total
tasks across all goals"; clone → identical). VLM comparison of the
tab bar and the open sheet: IDENTICAL. Browser back/forward, the 768
pill nav (geometry, hrefs, active-state chip after hard load — an
earlier "inactive" reading was a probe error: the two sessions sat on
different views), and the desktop sidebar anchor map (8 links ×
208×39, brand + TASKS STATUS widget included) all re-confirmed equal.
Stroke census: every icon still renders at the lucide default 2 on
both apps. All list views' h1 (28px/400) + button/anchor counts
match. The /tasks view: h1/sub/five chips (counts 31/2/1/2/26)/31
rows at 1072×117/inert row clicks — equal. The add-task dialog
(500px panel, r20, pad 28/28/24, no panel shadow, scrim 0.3, button
pads 8/18 + 8/22, dark submit) — equal. The live's goal-card edit
dialog opens correctly (z-200 overlay; the earlier "dead" reading was
a `role="dialog"` selector miss). The user pill popover works on
both. The live's /tasks rows remain inert (their WIP seam —
replicated).

## Work streams

### WS-1 — The button-cursor rule (F1)

`src/app/globals.css` base layer gains the live's exact rule:
`button, [role="button"] { cursor: pointer; }`. This is a one-line,
systemic fix that restores the hand cursor on every button surface
listed in F1. The existing `cursor: not-allowed` disabled styles (set
via classes) win the cascade over the element selector, so disabled
affordances keep their arrow-cross. Pin with Playwright: computed
cursor === "pointer" on the NEW GOAL button, a filter chip, the MORE
trigger, the dialog Cancel, and the sheet close square.

### WS-2 — Goal-card anchor guard + full-card coverage (F2 + F6)

- `goals-view.tsx`: both card anchors' click handlers gain the guard
  `if (e.target instanceof Element && e.target.closest("button"))
  return;` BEFORE the modified-key check — clicks that originate on
  (or inside) a button belong to the button (edit / delete /
  confirm pairs), everything else navigates. This fixes the F2
  mobile regression and prevents the same bubbling when the desktop
  structure changes.
- The DESKTOP card restructures to the live's shape: the anchor
  becomes the full-width flex row (`hidden w-full items-stretch
  md:flex`) wrapping BOTH the padded text column (the current
  anchor's children move into `min-w-0 flex-1 p-[18px_20px]`) and
  the existing 120px right column (pct + fraction + actions). The
  anchor now covers the whole 1072px card exactly like the live.
  Geometry of the inner columns is UNCHANGED (pure wrapper move).
- Pin with Playwright: at 390, clicking the mobile card's pencil
  opens the edit dialog AND `location.pathname` STAYS `/goals`; the
  desktop card anchor's width equals the card's width (full
  coverage); card role=link + href assertions from v2.7 keep passing.

### WS-3 — Dashboard goal wells: anchor wraps the well (F6)

`dashboard-view.tsx`: the goal-well row becomes a bare `<a
href="/goals/<id>">` wrapping an inner `div` that carries the
`orb-well flex w-full items-center gap-[10px] p-[12px_14px] …`
classes (moved verbatim). Same click contract as the sidebar anchors
(plain left click → preventDefault + navigate; the row contains no
buttons, so no guard needed). Matches the live's A > DIV(well)
shape; the anchor's own computed style is clean.

### WS-4 — MORE-sheet close square + brand (F3 + F7 + F4-part)

`orbital-app.tsx` sheet block:
- Close square: `shadow-[-4px_-4px_8px_…]` → the live's exact pair
  via the new `.orb-sheet-close` custom class (see WS-5): plain
  `box-shadow: -3px -3px 6px rgba(255, 250, 244, 0.78), 3px 3px
  6px rgba(160, 143, 126, 0.27);` plus `cursor: pointer` comes free
  from WS-1.
- Brand span: drop `uppercase` + change the text to literal
  `ORBITAL` (textContent parity with the live).
- Pin: computed box-shadow on the close square equals the live's
  string exactly; the sheet brand's textContent is "ORBITAL".

### WS-5 — Chrome shadows as custom classes (F4)

`globals.css` `@layer utilities` gains plain-declaration classes
(the cascade-safe doctrine — these also kill the v4 zero-alpha
composition prefixes because they never touch the `--tw-*` vars):
- `.orb-appbar-shadow` → `box-shadow: 0 4px 16px rgba(160, 143,
  126, 0.18);` (mobile app bar header, orbital-app.tsx:174)
- `.orb-tabbar-shadow` → `box-shadow: 0 -4px 20px rgba(160, 143,
  126, 0.22);` (mobile tab bar, orbital-app.tsx:259)
- `.orb-sheet-shadow` → `box-shadow: 0 -8px 32px rgba(160, 143,
  126, 0.28);` (MORE sheet, orbital-app.tsx:365)
- `.orb-pill-nav-shadow` → `box-shadow: -8px -8px 16px rgba(255,
  250, 244, 0.78), 8px 8px 18px rgba(160, 143, 126, 0.31);` (768
  pill nav, orbital-app.tsx:316)
- `.orb-sheet-close` → F3's pair (the 32px r10 close square)
The five sites swap their `shadow-[…]` utility for the class; the
values are byte-identical to the measured live strings. Pin: the
computed box-shadow of each surface EQUALS the live's exact string
(no `rgba(0, 0, 0, 0)` prefixes).

### WS-6 — Filter-chip radius literal (F5)

The goals / my-tasks / tasks filter chips swap `rounded-full` →
`rounded-[9999px]` so the computed radius serializes exactly like
the live's chips (`9999px`, not 33554432px). Pin: computed
borderRadius on the "All" chip === "9999px".

### WS-7 — Sidebar brand parity (F7)

`sidebar.tsx`: brand anchor drops `pl-2.5` + `rounded-xl` (hit area
101.3 → 91.3, matching the live's classless pad-0 anchor) and the
span text becomes literal `ORBITAL` (drop the `uppercase` class).
Visual output unchanged (the text was already rendered uppercase).

### WS-8 — Verification

1. RED first: `tests/e2e/v28-parity.spec.ts` with the pins listed
   above (cursor census, the mobile-pencil dialog fix, full-card
   anchor coverage, well nesting, the five exact chrome shadow
   strings, the close-square pair, chip radius 9999px, brand
   textContent) — all fail on the current build.
2. Full gate after GREEN: lint → typecheck → unit (138) → build →
   smoke (30) → e2e (60 + the new v28 pins).
3. Re-probe every changed surface against the live with computed
   styles (cursor census, shadow strings, anchor censuses, chip
   radii, brand text).
4. VLM sanity pass on regenerated screenshots.

### WS-9 — Screenshots + docs + ship

1. Regenerate the affected `docs/screenshots/*.png` (mobile surfaces,
   goals view, dashboard).
2. README / AGENTS.md / CLAUDE.md (the button-cursor rule + the v4
   shadow/radius serialization notes + the anchor-guard convention),
   PAD v2.8 revision block, SKILL.md lesson, `docs/session_27.md`,
   worklog; mark this plan EXECUTED.
3. Conventional Commit on `main`, push via `docs/ssh_git_wrapper_v3.py`,
   verify remote == local HEAD, shred the key.

## Execution record (2026-09-23)

All work streams executed. Final gate: lint 0 · typecheck 0 · 138/138
unit · build clean · 30/30 smoke · 73/73 Playwright (59 prior + 14
net-new v28 pins: the cursor census, the mobile-pencil dialog fix,
the full-card anchor coverage, the well nesting, the five exact
chrome-shadow strings, the close-square pair, the chip radius, the
brand textContent). Re-probes EXACT on every changed surface (see
docs/session_27.md). One execution note: the first draft of the
button-origin guard returned WITHOUT preventDefault, which let the
browser follow the anchor's href as the default action — the guard
must suppress the default; and the sidebar brand's text-transform
is the live's redundant `uppercase` (the first pin assumed `none`
— corrected after measuring the live's span).
