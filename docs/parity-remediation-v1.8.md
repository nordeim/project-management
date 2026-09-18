# ORBITAL Parity Remediation Plan v1.8

Evidence: fresh live-app crawl 2026-09-18 (`research/live-capture-s10/` + `research/clone-capture-s10/`
with `scripts/par-capture.sh` probe harness — 20+ named computed-style probes under `scripts/probes/`,
run side-by-side on the live app and the clone's production build at 1440×900 and 390×844, two
authenticated agent-browser sessions; VLM screenshot comparisons used only as visual cross-checks —
computed styles are ground truth, and several VLM readings were disproven by measurement).
Data-driven deltas (live account activity text, goal counts, timestamps) are excluded.

Seven systemic findings drive this round:

1. **The desktop dashboard is a VIEWPORT-FILLING layout.** The live app's desktop shell is
   `h-screen` (no page scroll); the dashboard's `tablet-grid` renders rows `180px 1fr` so the
   bottom row (Agent Activity + Goals panels) stretches to the bottom of the viewport, and the
   activity panel renders **ALL feed entries** inside an `overflow:hidden` rows container
   (measured: 20 rows in the DOM, 5-6 visible, clipped). The clone ships content-height panels
   (462px) with a 5-entry preview slice and empty space below — the page ends ~50px early.

2. **The stat columns carry a taller inner rhythm the clone lacks.** Live column: block link
   ~157px tall (taller than the panel's 140px content box, centered by the flex row) wrapping an
   inner flex-col (`pad 10px 8px`): label (11px/600, **margin-bottom 10px**) → the numeral inside
   an **88px-tall flex-centered box** (104px on mobile) → sub (mt 4px). The clone packs
   label/number/sub at the top with no wrapper — the number sits 11px higher and the sub 28px
   higher than live. Mobile (390px): live renders **104px-wide columns with a 104px number box**
   in one 176px-tall card; the clone renders 89px columns with a wrapped 2-line label, no
   wrapper, in a 153px card.

3. **The canvas glow MOVED.** Live paints `radial-gradient(600px at 59.1667% 29.8889%,
   rgba(201,179,245,0.35) 0%, rgba(0,0,0,0) 70%)` on a fixed full-viewport div (upper-middle-
   right, visible on Team/Settings where the canvas is bare). The clone still paints the v1.5
   position (87.44% 95.38% bottom-right) — measurably visible at the clone's bottom edge where
   live is flat.

4. **Fonts drift: DM Sans 300 is missing and the brand uses Archivo.** The live app loads DM Sans
   weight 300 (the light 50.4px numerals measure genuinely light: "18" = 38px wide vs the clone's
   44px — the clone synthesizes 300 from the 400 file) and **Archivo 600** for the sidebar
   "ORBITAL" brand text. Also every non-dashboard h1 on live tracks −0.28px (normal); the clone
   ships `tracking-tight` (−0.7px) on goals/my-tasks/activity/team/settings/goal-detail.

5. **Activity feed structure differs.** Live date-group rows are PLAIN rows on the canvas —
   `pad 14px 18px`, `border-bottom 1px rgba(160,143,126,0.15)` dividers, **no card wrapper** —
   while the hero keeps the deeper-tier card (r14, pad 14/18, mb 24). The clone wraps every group
   in an `.orb-row-card`. The hero's icon is a **fixed `Search` glyph** (16px in the 36px purple
   circle), not the entry-type icon; and `goal_analyzed` rows render a **`Target`** glyph (purple)
   while `task_assigned` keeps `SquareCheckBig` (purple) and `tasks_generated` `SquareCheckBig`
   (green). The dashboard panel's rows use the same divider color.

6. **The sidebar is richer than v1.7 read.** The Tasks Status block IS an inset well (118×80,
   r10, flex gap 8, pad 0 12px) sitting flush with the 80px clock (both at y=746) — the v1.7
   "plain link, no well" reading was wrong. The active nav item carries a BRIGHTER inset pair
   (`rgba(255,252,248,0.75) −3px −3px 6px inset / rgba(180,165,150,0.32) 3px 3px 6px inset`) than
   the standard well. Nav rows are full content width (x=40, w=208, pad 9px 14px) with a 4px
   gap; the clone insets them (x=36, w=216, pad 0 12px, 2px gap). The clock renders THREE hands
   filling the full 80px face — hour 2.5px/19px `#5A5A5A`, minute 1.8px/26px `#8A8A8A`, second
   1px/30px `#B8B4B0` — while the clone draws a 58px face with two dark hands.

7. **The login page and the New Goal wizard drifted hard.** Live login: **white page** (`#FFF`),
   card `rgba(255,255,255,0.95)` with a **96px white-circle logo** (6 purple dots 1-2-3, 13px,
   `#996CE4`), title **30px/700 `#0F172A`**, slate controls (Google + inputs + Sign in:
   `#E2E8F0` 1px borders, r12, Sign in bg `#0F172A`), signup link `#334155`. Clone: beige page,
   neumorphic controls (r20 pills), 22px title, tiny pale logo, purple signup link, plus a demo-
   credentials line the live lacks. Live wizard step 1: **624px dialog, radius 16, pad 22/24,
   NO bot-intro and NO title** — it opens directly on "Goal Details" (13px/600 `#3A3A3A`, Title
   Case labels 12px/600 `#6E6E6E`), CANCEL + CONTINUE (with a 13px sparkles icon) **grouped
   left**. The clone opens with a bot bubble + "Create a new goal" sr-title, uppercase labels,
   spread buttons, no icon, 500px/r20 dialog.

Other measured finds (all verified programmatically): NPA well needs `margin: 14px 14px 0` (clone
`0 14px`) and a 19.5px value line-height (clone 21.1); activity-panel header container is 38px
tall + 14px bottom margin (clone 54px padded); dashboard goals rows pitch 90px (well 84 + 6) vs
clone 94 (mb 10); goal cards start content 5px lower (pad-top ≈23 vs 18); NEW GOAL is 11px/600
ls 0.88px pad 9px 18px (34.5px tall, aligned to h1 top y=48) — the clone ships 12px, pad 11/20,
40px, y=57; goal-detail header sits 4px lower with the date row at 13px `#767676` (clone 13.5px
`#6E6E6E`); the blocked stat count wraps in a **64px inset-well square** (r12, flex-centered);
the tasks header shows "12 total" **right-aligned beside ADD TASK** (clone: left, after TASKS);
task-card status row needs `mb-1.5` (6px status→title gap; clone 0); the **AI chip is a bordered
pill with a 9px sparkles glyph** (`#996CE4` text+icon, border `1px rgba(160,143,126,0.2)`, gap 2,
pad 1px 5px — clone: text-only `#6B4BBF`, no border); Team's empty states put the icon in a
**52px inset-well circle** (members: Users 22px `#B3B3B3`) or a `neu-inset` well (agents:
**Sparkles**, not Bot); Settings field labels track **0.48px**, section headings are 13px/600
`#3A3A3A` ls 0.52px, time selects are **full column width (234px) at 36px** (clone 89px/38px),
and inputs carry a `0.22`-alpha dark inset (clone 0.24); the activity view's online pill aligns
to the h1 top (y=48; clone 62); check-in modal assigned line is 12px `#767676` (clone 13.5px
`#6E6E6E`) and Post Update text is `#F2F2F2` (clone `#FFF`); the add-task dialog keeps 500px but
buttons are right-aligned with a 12px Title-Case Cancel; all dialogs are **radius 16** (clone
base r20); mobile content starts 28px below the app bar (clone 40px).

TDD applies where new pure logic is introduced (the activity icon mapping seam). Everything else
is verified by the gate (lint → typecheck → unit → build → smoke) + browser re-measurement with
the par-capture probe harness.

## WS-1 Fonts + global tokens (HIGH — systemic)

- **1.1** `src/app/layout.tsx`: add `"300"` to the DM_Sans weights (the light-numeral face);
  add `Archivo` (weight 600, variable `--font-archivo`) and map it as `font-archivo`.
- **1.2** `orbital-app.tsx`: retune the glow to the live value —
  `radial-gradient(600px at 59.1667% 29.8889%, rgba(201, 179, 245, 0.35) 0%, rgba(0, 0, 0, 0) 70%)`.
- **1.3** Remove `tracking-tight` from the goals / my-tasks / activity / team / settings /
  goal-detail h1s (live tracks −0.01em → −0.28px at 28px; the dashboard already matches).
- Files: `src/app/layout.tsx`, `src/components/orbital/orbital-app.tsx`, `views/*.tsx`.

## WS-2 Dashboard: viewport-fill + stats + panels (HIGH)

- **2.1** Viewport-fill: desktop shell `lg:h-screen lg:overflow-hidden`; `main` keeps
  `overflow-y-auto`; the dashboard root becomes `flex h-full min-h-0 flex-col` on lg with ONE
  grid `lg:grid-template-rows: 180px minmax(0,1fr)` (date+ring | stats // activity | goals),
  gap 20. The activity panel gets `min-h-0` + `overflow-hidden` and renders **all** activity
  entries (`activity.map`, no slice) in the rows container; the goals panel stretches. Below lg
  keep the current stacked layout (content-height). The greeting header stays in normal flow.
- **2.2** Stat columns: inner flex-col `pad 10px 8px`; label `mb-[10px]`; number wrapped in an
  `h-[88px] w-full flex items-center justify-center` box (mobile: `h-[104px]`, columns 104px);
  sub `mt-[4px]`; drop the per-span responsive label/sub duplicates in favor of single labels
  that fit both breakpoints (live renders "Active Goals" on one line at 390px) — keep the short
  subs only if they still fit live's wording.
- **2.3** Activity panel header: container `px-[18px] pt-5` height 38px + `mb-[14px]`; NPA well
  `mx-[14px] mt-0` with the header providing the 14px gap → net `margin: 14px 14px 0` geometry;
  NPA value `leading-[19.5px]` (drop leading-relaxed).
- **2.4** Activity rows (dashboard + feed): dividers `border-b border-[rgba(160,143,126,0.15)]`
  on all but the last row (replaces `divide-black/[0.04]`).
- **2.5** Dashboard goals rows: `space-y-[6px]` (90px pitch).
- **2.6** Date card: panel `p-[10px_12px]` flex-col items-start; date square `px-[12px] py-[8px]`
  (115px wide).
- Files: `views/dashboard-view.tsx`, `orbital-app.tsx`.

## WS-3 Sidebar (HIGH)

- **3.1** Brand: `LogoMark` at 11px + "ORBITAL" in **Archivo** `13px/600/ls 2.34px #2F2823`
  (lh 13px); mark at the panel's left pad + 10px, text 19px right of the mark.
- **3.2** Nav rows: full content width (`w-full` at the panel padding edge, x=40), `padding:
  9px 14px` (39px tall), container `gap-[4px]`; section labels keep `.orb-label-sm` at the
  measured cadence; first nav row lands 8px below the label text.
- **3.3** Active nav well: dedicated `.orb-nav-active` class with the brighter pair
  `inset -3px -3px 6px rgba(255,252,248,0.75), inset 3px 3px 6px rgba(180,165,150,0.32)`.
- **3.4** Tasks Status: inset well — `h-[80px] rounded-[10px] px-3 flex gap-2` beside the clock
  (10px gap, both bottom-anchored), label at the pad edge; 11px/700 numbers, 11px/400 captions.
- **3.5** Clock: SVG fills the full 80px face (viewBox 0 0 80 80, no inner 58px face); THREE
  hands — hour `2.5px × 19px #5A5A5A`, minute `1.8px × 26px #8A8A8A`, second `1px × 30px
  #B8B4B0` — 2.2px center dot `#2F2823`.
- Files: `sidebar.tsx`, `sidebar-clock.tsx`, `logo.tsx`, `globals.css`.

## WS-4 Goals view + goal detail + task cards (HIGH)

- **4.1** NEW GOAL / page-level pill buttons: `11px/600 ls 0.88px`, `pad 9px 18px` (≈34.5px
  tall) — retune `.orb-raised-btn` (or the pill variant in use) and align the header row so the
  button's top is y=48 (flush with the h1 top).
- **4.2** Goal cards: content pad-top 23px (chip row 5px lower than v1.7); keep the rest.
- **4.3** Goal-detail header: +4px top offset (content starts 5px into the header block);
  description `leading-[21px]`; date row 13px `#767676` with a 13px icon.
- **4.4** Blocked stat: wrap the count in a `64×64` inset-well square (r12, flex-centered,
  standard well pair) — count stays 26px/400 `#FF7043`.
- **4.5** Tasks header row: `TASKS` label left; `12 total` (13px `#6E6E6E`) + ADD TASK grouped
  right with a 12px gap.
- **4.6** Task cards: status row `mb-1.5` (6px gap to the title).
- **4.7** AI chip: sparkles glyph 9px + "AI" 10px/500, both `#996CE4`, `border 1px
  rgba(160,143,126,0.2)`, `bg #EEEAE6`, r6, `pad 1px 5px`, `gap 2px` (flex).
- Files: `views/goals-view.tsx`, `views/goal-detail-view.tsx`, `task-card.tsx`, `globals.css`.

## WS-5 Activity feed + icon mapping (HIGH — TDD)

- **5.1** New pure seam `src/lib/activity-icons.ts`: `activityIconFor(type)` →
  `{ icon: "square-check-big" | "target", tone: "purple" | "green" }` —
  `task_assigned` → square-check/purple, `tasks_generated` → square-check/green,
  `goal_analyzed` → target/purple, default square-check/purple. RED tests first (~4 specs:
  known types, default, unknown passthrough). 101 → ~105 unit checks.
- **5.2** Feed groups: remove the `.orb-row-card` wrapper — plain `<ul>` rows, `px-[18px]
  py-[14px]`, divider `border-b rgba(160,143,126,0.15)` between rows (not after the last).
- **5.3** Hero: keep the deeper-tier card; icon = fixed `Search` 16px in the 36px purple circle.
- **5.4** Dashboard + feed rows consume the seam (SquareCheckBig / Target + tone colors
  `#C9B3F5` / `#2ECC8A`); message `leading-[20px]`, timestamp `leading-[16.5px]`.
- **5.5** Online pill: header `items-start` so the pill top aligns with the h1 (y=48).
- Files: `src/lib/activity-icons.ts` (new), `activity-icons.test.ts` (new),
  `views/activity-view.tsx`, `views/dashboard-view.tsx`.

## WS-6 Team + Settings (MEDIUM)

- **6.1** Team: header row aligns Invite Member to the h1 top (y=48); members empty state =
  Users 22px `#B3B3B3` inside a **52px inset-well circle** (r50%, inset pair −4px 0.68 / 4px
  0.28, bg `#EBE7E2`), title 16px below the circle, desc 13px `#767676`; agents empty =
  **Sparkles** 22px `#B3B3B3` inside the existing `neu-inset` well.
- **6.2** Settings: field labels `tracking-[0.04em]` (0.48px); section headings ("Working
  Hours", "AI Assistant") 13px/600 `#3A3A3A` ls 0.52px; time selects full column width
  (`w-full`, 234px) at 36px; input inset dark alpha 0.22 (dedicated input pair — keep the
  generic `.orb-well` at 0.24).
- Files: `views/team-view.tsx`, `views/settings-view.tsx`, `empty-state.tsx`, `ui/input.tsx`.

## WS-7 Mobile (MEDIUM)

- **7.1** Content top offset: hero cards land 28px below the 62px app bar (main `pt-3` mobile +
  section `mt-4` — retune from the current 40px stack).
- **7.2** Mobile stats card: three 104px columns (see WS-2.2) in the 176px-tall card; labels on
  one line.
- Files: `orbital-app.tsx`, `views/dashboard-view.tsx`.

## WS-8 Login page (HIGH)

- **8.1** Page + card: white page bg; card `rgba(255,255,255,0.95)`, r16; content top block
  centered with the **96px logo** (white circle + six `#996CE4` dots in the 1-2-3 pyramid at
  13px — reuse the `LogoPyramid` geometry at size 96 with the white circle backing).
- **8.2** Title: `30px/700 #0F172A` ("Welcome to Project Management App"); subtitle slate gray.
- **8.3** Controls: Google button r12 `border #E2E8F0` h54; inputs h48 `bg rgba(248,250,252,0.5)`
  `border 1px #E2E8F0` r12; Sign in `bg #0F172A` r12 `#FFF`; footer links `#334155`;
  "Forgot password?" slate.
- **8.4** Remove the demo-credentials line (not on live).
- Files: `login-screen.tsx`, `logo.tsx`, `app/login/page.tsx`.

## WS-9 Dialogs (HIGH)

- **9.1** Dialog base radius: 16 (was 20) — `ui/dialog.tsx` `DialogContent`
  `sm:max-w-[500px] rounded-[16px]` (wizard overrides to 624px; check-in keeps 448px/16).
- **9.2** Wizard step 1: dialog 624px; **remove the bot-intro bubble**; open directly on
  "Goal Details" (13px/600 `#3A3A3A`, Title Case); field labels 12px/600 `#6E6E6E` Title Case;
  deadline trigger 13px `#9A9A9A`; actions grouped LEFT: CANCEL (orb-btn-cancel) + 10px gap +
  CONTINUE (`.orb-btn-dark` + 13px Sparkles icon, disabled keeps the dark fill).
- **9.3** Wizard step 2: intro text in a rounded bubble (`rounded-2xl rounded-tl-sm` well) with
  the bot avatar left; "Clarifying Questions" 13px/600 `#3A3A3A` Title Case; BACK +
  GENERATE TASKS grouped left.
- **9.4** Add-task / goal-edit dialogs: actions right-aligned; Cancel 12px Title Case.
- **9.5** Check-in modal: assigned line 12px `#767676`; Post Update text `#F2F2F2`; radio grid
  `gap-2` uniform (8px); target height ~408px.
- Files: `dialogs/new-goal-dialog.tsx`, `dialogs/add-task-dialog.tsx`,
  `dialogs/goal-edit-dialog.tsx`, `dialogs/task-detail-dialog.tsx`, `ui/dialog.tsx`.

## WS-10 Verification

- **10.1** Full gate: lint → typecheck → test (101 + ~4 new) → build → smoke (30).
- **10.2** Browser re-measurement with `scripts/par-capture.sh` on every changed surface
  (desktop 1440×900 + mobile 390×844): dashboard fill + stats columns, sidebar (nav/well/clock),
  goals + goal detail + task cards + AI chip, activity feed structure + icons, team + settings,
  login, wizard steps 1-2, mobile chrome. Target: every probe delta closed or data-driven.
- **10.3** Placeholder/TODO sweep; regenerate README screenshots for changed views.

## WS-11 Documentation

- **11.1** README: viewport-fill dashboard, stats rhythm, glow position, fonts (300 + Archivo),
  sidebar well + 3-hand clock, activity feed structure + icon seam, login restyle, wizard spec,
  unit-check count.
- **11.2** AGENTS.md / CLAUDE.md: same facts in operator/agent-contract form.
- **11.3** PAD → v1.8 revision block + affected sections (§1 stack fonts, §5 design system,
  §7 test counts, §11 line counts re-measured).
- **11.4** `docs/session_10.md`: replace the raw transcript with a proper Session 10 log.
