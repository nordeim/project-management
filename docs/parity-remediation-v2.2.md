# ORBITAL Parity Remediation Plan v2.2 (Session 16)

Evidence: fresh side-by-side crawl 2026-09-19 (~15:00-16:20) — two
authenticated agent-browser sessions (`live` = `https://agent-pm-copy-15e23720.base44.app/`,
`clone` = production build on :3000) across the **previously uncrawled
widths**: 450–1023 (mobile range above 390, the md–lg middle state, and the
lg–xl desktop range). Computed styles are ground truth; VLM readings used
only as leads (and each was cross-checked — one "left sidebar at 768" claim
was disproven by the DOM; a glow-layer isolation technique was built to
separate the glow from content pixel pollution).

## The live app has a THREE-state chrome; the clone has two

Breakpoint map (bisected exactly):

- **< 768 (`md`)** — mobile: app bar (62px) + full-width bottom tab bar
  (h74, five tabs + MORE). Main pad `16px 6px 90px` at EVERY width through
  767 (verified at 700: no `sm:` growth). Stat wells are FLUID SQUARES
  (104 at 390 → 165 at 640 → 199 at 700); numerals fixed 30px/400; ring
  card ~48%; "New Goal" pill label swaps "New" → "New Goal" at 640 (`sm`).
- **768–1023 (`md`–`lg`)** — the MIDDLE STATE (missing in the clone): no
  sidebar, no app bar; the desktop greeting header renders (greeting
  x48/y47 + subtext + user pill + New Goal 132×40 r12); list views carry a
  52px strip with a "Dashboard" back button (chevron-left 15px `#9A9A9A` +
  "Dashboard" 13px/500 `#6E6E6E`, 112×34, strip pad 18/20/0); main pad
  `12px 20px 100px` (list) / `24px 20px 100px` (dashboard, no strip);
  `.page-container` pad 24/28 max-w 1200 (content x48); navigation = a
  FLOATING CENTERED PILL (fixed, bottom 16px, left 50% translateX(-50%),
  495×71, pad 10/16, gap 4, bg #EEEAE6, r20, the LARGE panel shadow pair)
  holding the brand (9×9 dot mark + gap 6 + "ORBITAL" 11px/600/ls 1.98px
  #2F2823) and SIX tabs (Home/Goals/Tasks/Activity/Team/Settings — the
  desktop nav set, 16px labels, 18px icons). The ACTIVE tab is an inset
  WELL chip: bg #EBE7E2, r12, pad 8/12, flex col center gap 3px, shadow
  `rgba(255,252,248,0.75) -3px -3px 6px inset / rgba(180,165,150,0.32)
  3px 3px 6px inset`, icon+label #3A3A3A, label 9px/600/ls 0.36px
  UPPERCASE; inactive = transparent, #767676, label 400.
  Content = the DESKTOP components: desktop goal cards (672×166), full stat
  labels, stats panel pad 20/24 with FIXED 88px wells r12 and numerals
  clamp(28,3.5vw,52)/300 → 28px at 768; settings 2-col (328px columns);
  goal-detail stats 2-col.
- **≥ 1024 (`lg`)** — desktop: sticky sidebar (240px). **Grid tracks are
  ASYMMETRIC below 1280**: `minmax(0,1fr) / minmax(438px,1fr)` — at 1024
  the columns are 198/438 (the date card starves to 2px and is clipped
  invisible by overflow-hidden; Agent Activity panel 198px wide), at 1200
  374/438, ≥1280 equal halves (the minmax resolves to 1fr equality).

## Systemic findings (v2.2)

1. **F1 (HIGH) — the md–lg middle chrome state is missing entirely.** At
   768–1023 the clone shows mobile chrome (app bar + tab bar + mobile
   content); the live shows greeting header + back strip + floating pill
   nav + desktop content.
2. **F2 (HIGH) — the clone's `sm:` (640) content transitions fire at the
   wrong width.** The live switches its content components at `md` (768):
   stat wells 104→88, short→full labels, ring 48%→180px, stats panel
   10/14→20/24 padding, mobile→desktop goal cards, settings 1→2 col. In
   640–767 the live keeps the FULL mobile spec (main 16/6/90 constant —
   the clone's `sm:px-7 sm:pt-6` is wrong there).
3. **F3 (HIGH) — mobile stat wells are FLUID SQUARES, not fixed 104px.**
   Live: 104 (390) → 165 (640) → 199 (700). Clone: fixed `w-[104px]
   h-[104px] flex-none`.
4. **F4 (MEDIUM) — the md+ numeral floor is 28, not 30.** Live md+:
   clamp(28,3.5vw,52)/300 (28px at 768, 35.8 at 1024, 50.4 at 1440). Live
   mobile (<768): fixed 30px/400. The clone's single clamp(30,...) with
   `sm:font-light` is wrong in both 640–767 (weight) and 768–857 (floor).
5. **F5 (HIGH) — desktop grid tracks are asymmetric below 1280** (see the
   map above). The clone's `lg:grid-cols-2` gives equal columns at every
   ≥1024 width.
6. **F6 (MEDIUM) — md hero geometry**: date card 476×200 + ring 180×180
   top-aligned in a 200px row (the clone renders the 150px mobile hero).
7. **F7 (MEDIUM) — the canvas glow is CENTERED at every breakpoint.**
   Live (all three wrappers): `radial-gradient(600px, rgba(201,179,245,
   0.35) 0%, rgba(0,0,0,0) 70%)` — no `at` position (viewport center),
   verified by an isolated-layer pixel analysis. The clone renders it at
   `59.1667% 29.8889%` (a stale v1.8 mis-measurement; the AGENTS.md note
   "87.44% 95.38%" is doubly stale).
8. **F8 (MEDIUM) — goal-detail stats are ALWAYS 2-col (2.04fr:1fr)** —
   even at 390 (209+97 side by side, both h130). The clone stacks 1-col
   below `sm`.
9. **F9 (LOW) — the greeting header shows at `md`** (clone: `hidden
   lg:flex`).
10. **F10 (LOW) — nav glyphs**: every live nav (sidebar 16px, pill 18px,
    mobile tabs 20px) uses lucide `square-check-big` for My Tasks (the
    clone uses `CheckSquare`); the live sidebar icons are 16px (clone 17).
11. **F11 (LOW) — docs staleness**: the glow note, the mobile-shell spec
    (no middle state), the sm/md transition map, the grid track spec.

## WS-1 Shell middle state (orbital-app.tsx)

- **1.1** Glow → centered: `radial-gradient(600px, rgba(201, 179, 245,
  0.35) 0%, rgba(0, 0, 0, 0) 70%)` (drop the `at` clause).
- **1.2** App bar: `lg:hidden` → `md:hidden`.
- **1.3** Mobile tab bar: `lg:hidden` → `md:hidden`; swap `CheckSquare` →
  `SquareCheckBig` in `TABS` (all three live navs use it).
- **1.4** Main: `px-[6px] pb-[90px] pt-4 sm:px-7 sm:pt-6 lg:px-7 lg:pb-6
  lg:pt-6` → drop the `sm:` overrides, add `md:px-5 md:pt-3 md:pb-[100px]`
  (list case: strip 52 + 12 + root 24 → h1 y88; dashboard root adds its
  own md pt).
- **1.5** NEW back strip (md–lg, every view except dashboard): `hidden
  md:flex lg:hidden h-[52px] shrink-0 items-start pl-5 pt-[18px]` holding
  the "Dashboard" back button (ChevronLeft 15 `#9A9A9A` + 13px/500
  `#6E6E6E`, h34) → `navigate("dashboard")`.
- **1.6** NEW floating pill nav (md–lg): `hidden md:flex lg:hidden fixed
  bottom-4 left-1/2 z-40 -translate-x-1/2` with pad 10/16, gap 4, bg
  orb-raised, r20, the `.orb-panel` shadow pair; brand = `LogoMark 9` +
  "ORBITAL" 11px/600/ls 0.198em; six tabs (Home/Goals/Tasks/Activity/
  Team/Settings → dashboard/goals/my-tasks/activity/team/settings,
  LayoutGrid/Target/SquareCheckBig/Activity/Users/Settings 18px). Tab
  inner: flex col center gap 3px pad 8/12 r12; active = bg orb-well +
  `shadow-[inset_-3px_-3px_6px_rgba(255,252,248,0.75),inset_3px_3px_6px_rgba(180,165,150,0.32)]`,
  icon+label #3A3A3A, label 9px/600/ls 0.36px uppercase; inactive =
  transparent, #767676, label 400. `aria-current` on the active tab; the
  goals tab stays active on goal-detail (reuse `tabActive`).

## WS-2 Dashboard (dashboard-view.tsx)

- **2.1** Root: add `md:px-7 md:pt-9` (28 sides; 36 top + main pt 12 =
  greeting y48).
- **2.2** Greeting header: `hidden lg:flex` → `hidden md:flex`.
- **2.3** DateCard: add `min-w-0` (so it can starve at lg–xl like the
  live); height `h-[150px] md:h-[200px] lg:h-[180px]`.
- **2.4** Ring button: `w-[48%] sm:w-[180px]` → `w-[48%] md:w-[180px]`,
  add `md:h-[180px]` (ring 180×180 top-aligned in the 200px md row).
- **2.5** Stats panel: `sm:gap-4 sm:px-6 sm:py-5` → `md:` variants;
  `min-h-[150px] md:min-h-0 lg:min-h-[180px]`.
- **2.6** StatColumn: column `flex-1 min-w-0` (drop `w-[104px] flex-none`
  and `sm:min-w-0 sm:flex-1`); inner block `md:px-2 md:py-[10px]`; label
  mb `md:mb-[10px]`; label/sub span swaps `sm:` → `md:`; well →
  `aspect-square w-full rounded-[10px] … md:h-[88px] md:w-[88px]
  md:rounded-[12px] md:aspect-auto`; numeral → `text-[30px] font-normal …
  md:text-[clamp(28px,3.5vw,52px)] md:font-light`; sub mt `md:mt-[4px]`.
- **2.7** Grid: `lg:grid-cols-2` → `lg:grid-cols-[minmax(0,1fr)_minmax(438px,1fr)]`.

## WS-3 View roots (goals, goal-detail ×2, my-tasks, activity, team, settings)

- **3.1** `w-full px-3 pt-6 lg:px-0 lg:pt-0` → add `md:px-7` (content x48
  at md; mobile x18 unchanged).
- **3.2** goals-view card variants: mobile `lg:hidden` → `md:hidden`;
  desktop `hidden lg:flex` → `hidden md:flex`.
- **3.3** settings grid: `lg:grid-cols-[1fr_1fr]` → add `md:grid-cols-[1fr_1fr]`.

## WS-4 Goal-detail stats

- **4.1** `grid grid-cols-1 gap-4 sm:grid-cols-[2.04fr_1fr]` →
  `grid grid-cols-[2.04fr_1fr] gap-4` (always two columns — live measured
  2-col at every width incl. 390).

## WS-5 Sidebar glyphs

- **5.1** Icon size 17 → 16 on all six nav rows (live-measured).

## WS-6 Verification

- **6.1** Full gate: lint → typecheck → test (122) → build → smoke (30).
- **6.2** Re-probe at 700 (mobile range: main 6px, fluid wells 199, ring
  48%, short labels), 768 (middle state: strip 52, h1 y88, greeting y48,
  date 476×200, wells 88/28px, pill nav geometry + active well, settings
  2-col, goal cards 166), 1024 (asymmetric grid 198/438, date card
  starved), 1200 (374/438), 1440 (regression: equal grid, all prior v2.1
  targets), 390 (regression: full mobile spec intact).
- **6.3** Glow pixel-analysis regression (both apps, isolated layer):
  centered disc.
- **6.4** Screenshots + VLM sanity pass on the changed surfaces.

## WS-7 Documentation

- **7.1** README/AGENTS/CLAUDE: the three-state chrome map (middle state
  spec), the sm→md transition corrections, the fluid mobile wells, the
  asymmetric grid tracks, the centered glow, the always-2-col goal stats,
  the 16px sidebar glyphs, `square-check-big`.
- **7.2** PAD v2.2 revision block; session_16 log; worklog update;
  .env.example re-verify.

## TDD note

All changes are presentation-layer (class strings, one new nav component,
no new pure domain logic) — per the repo's established pattern they are
verified by the 30-check smoke suite + computed-style probes; the 122 unit
checks pin the logic seams and are unchanged. The pill nav reuses the
tested `tabActive` helper from the shell.
