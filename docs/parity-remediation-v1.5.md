# ORBITAL Parity Remediation Plan v1.5

Evidence: fresh live-app crawl 2026-09-17 (`research/live-capture-s7/`, 21 captures + programmatic
computed-style dumps on both the live app and the clone's production build, side-by-side, plus VLM
analyses; re-authenticated with the reference account). Every item below traces to a measured style
value or a captured DOM structure. Three systemic findings drive this round:

1. **The reference's primary action buttons are dark, not neumorphic.** Every primary submit —
   the check-in modal's "Post Update", the wizard's "Continue", the Add Task dialog's "Add Task" —
   renders `#3A3A3A` (or `#2F2823`) with near-white text `#F1F1F0`, radius 10–14, 11–12px fw 600.
   Secondary buttons ("Cancel") are the neumorphic raised/well style. The clone ships raised
   buttons everywhere — the dark-primary pattern is the reference's actual hierarchy.

   | Button (live, measured) | bg | text | radius | h | fs/fw |
   |------------------------|----|------|--------|---|-------|
   | Post Update (check-in) | `#2F2823` | white | 14 | 32 | 12/500 + Send icon |
   | Continue (wizard) | `#3A3A3A` | `#F1F1F0` | 10 | 35 | 11/600 |
   | Add Task (dialog) | `#3A3A3A` | `#F1F1F0` | 10 | 34 | 12/600 |
   | Cancel (dialogs) | `#EBE7E2` well | `#6E6E6E`–`#3A3A3A` | 10 | 34 | 11–12 |

2. **The reference main content is a clamped 1200px column on a glowing canvas.** The live shell
   wraps all main content in `max-width: 1200px` with padding `24px 28px 12px` (content ≈1128px at
   a 1440 viewport; the clone renders 1072px unclamped), and paints a fixed decorative purple
   radial gradient — `radial-gradient(600px at 87.44% 95.38%, rgba(201,179,245,0.35) 0%,
   transparent 70%)` — over the canvas bottom-right (pointer-events: none, z-0).

3. **The dashboard is a 2×2 grid, not a 3-across row.** Live top row (180px tall): one 526px cell
   holding `flex[gap 16]` of the date card (330×180) + the ring card (180×180), beside a 526px
   stats panel (three 149×157 columns); bottom row: Agent Activity and Goals panels at equal 526px.
   The ring card is a **plain CSS inset circle** (`calc(100% - 12px)`, no SVG) with "84%" at
   `clamp(28px, 3.5vw, 52px)` fw 300. The date card's photo is a **bright day-hills image**
   (`Day_B.jpg`, 1024×576, opacity 0.8) — not the dusk-hills watercolor.

TDD applies at the pure seams (date formatting). Everything else is verified by the gate
(lint → typecheck → unit → build → smoke) + browser verification with side-by-side captures.

## WS-1 Dark primary buttons + button tokens (HIGH — systemic)

- **1.1** `globals.css`: add `.orb-btn-dark` (bg `#3A3A3A`, text `#F1F1F0`, radius 10, fs 11–12,
  fw 600, hover `#2F2823`, subtle raised shadow) next to the existing primitives.
- **1.2** Apply to the primary submits: task-detail "Post Update" (dark `#2F2823`, radius 14,
  h 32, 12/500, `Send` lucide icon, literal Title Case text — no uppercase transform), wizard
  "Continue", add-task "Add Task", edit-task "Save", goal-edit "Save", invite-member submit.
  Secondary "Cancel" buttons → well style (`bg #EBE7E2`, text `#6E6E6E`, radius 10).
- Files: `src/app/globals.css`, `dialogs/task-detail-dialog.tsx`, `new-goal-dialog.tsx`,
  `add-task-dialog.tsx`, `task-edit-dialog.tsx`, `goal-edit-dialog.tsx`, `invite-member-dialog.tsx`.

## WS-2 Shell: 1200px clamp + purple glow (HIGH — systemic)

- **2.1** `orbital-app.tsx` main area: content wrapper `max-w-[1200px]` + padding
  `24px 28px 12px` (desktop; mobile keeps fluid padding), so view containers inherit the clamp
  instead of per-view widths.
- **2.2** Decorative overlay div in the shell: `position: fixed; inset: 0; pointer-events: none;
  z-index: 0; background: radial-gradient(600px at 87.4359% 95.3791%, rgba(201,179,245,0.35) 0%,
  transparent 70%)`; main content sits at `z-index: 1; position: relative`.
- Files: `src/components/orbital/orbital-app.tsx`.

## WS-3 Dashboard restructure (HIGH)

- **3.1** Grid: `lg:grid-cols-2` (2×2); top-left cell = `flex gap-4` [DateCard `flex-1` |
  ring card 180×180]; top-right = stats panel; bottom = activity + goals at equal `1fr`.
  Top-row cards 180px tall (was 210).
- **3.2** Ring card: 180×180 raised; inner circle = `calc(100% - 12px)` inset well (existing
  shadows); **remove the FaintRing SVG**; "84%" `clamp(28px, 3.5vw, 52px)` fw 300 ls -0.03em
  `#3A3A3A`; "done" label below (11px caps `#6E6E6E`).
- **3.3** Date card: bright day image — ship the extracted `public/day-hills.jpg` (1024×576,
  `Day_B.jpg` from the reference), `object-cover` + `opacity-80`; date square `#EEEAE6` raised
  radius 12 padding 8/12 bottom-left; "17" `clamp(28px, 3.5vw, 52px)` fw 300 `#2E2A26`;
  "September 2026" 9px fw 600 ls 0.12em uppercase `#7A7470`.
- **3.4** Greeting: 28px at every breakpoint (drop `sm:text-[32px]`), ls -0.01em, lh 1.2, mb 6px.
- **3.5** Stats panel: three equal columns (grid-cols-3) inside the 526px panel; label 11px caps
  `#6E6E6E`; value 32px fw 300; sub 12px `#767676`.
- Files: `views/dashboard-view.tsx`, `public/day-hills.jpg` (new; dusk-hills.jpg retired from the
  dashboard — stays for reference only or removed), `progress-ring.tsx` (FaintRing may become
  unused — check goal-card usage first).

## WS-4 Check-in (task-detail) modal (HIGH)

- **4.1** Size: 448px / radius 16 / padding 24 — a per-dialog override on `DialogContent`
  (form dialogs keep the 500/20 base).
- **4.2** Radio options: plain labels — `grid gap-2`, label 14px fw 500 `#2F2823` next to the
  Radix radio circle; remove the card wrappers/borders.
- **4.3** Note textarea: transparent bg, `border: 1px solid #D8D4CF`, radius 14, padding
  `8px 12px`, height 80px, 14px.
- **4.4** "Post Update" → `.orb-btn-dark` variant (bg `#2F2823`, radius 14, h 32, 12/500) with
  the `Send` icon; literal "Post Update" (no uppercase transform). Keep "POST STATUS UPDATE"
  section header (matches).
- Files: `dialogs/task-detail-dialog.tsx`.

## WS-5 Goals view card polish (MEDIUM)

- **5.1** Status chip: inset well pill (radius full, padding `4px 12px`, gap 5, 11px fw 600
  ls 0.08em uppercase `#6E6E6E`); pip = **light purple `#C9B3F5` for every status**; when
  blocked > 0 append `· N blocked` in red `rgb(189,50,40)` fw 500; suffix chevron `›`
  `#767676`.
- **5.2** Meta stacking: "8/12 tasks · 67%" (12px `#6E6E6E`, mb 4px) on line 1; "Sep 1"
  (12px `#767676`) on line 2.
- **5.3** Progress track: 6px `#DDD8D0` + inset well shadows (light/dark pair) — the reference
  track reads as pressed-in.
- **5.4** Card inner padding 18px 20px; title 20px fw 500 `#3A3A3A` mb 14px lh 1.2.
- Files: `views/goals-view.tsx`.

## WS-6 Date picker restyle + long date format (MEDIUM — TDD)

- **6.1** Pure seam `src/lib/calendar.ts`: add `formatLongDate(date)` → `"September 20th, 2026"`
  (full month, ordinal day, comma year). Write `calendar.test.ts` specs RED first (1st/2nd/3rd
  ordinals, 11th/12th/13th, 21st/22nd/23rd, month boundaries).
- **6.2** Popover: `#EEEAE6` raised panel radius 16, 260px; day cells 32×32 circular, 13px;
  today = purple `#996CE4` fw 700 text; month chevrons 28×28 circular; Su–Sa headers + grid
  224px inside.
- **6.3** Trigger label uses `formatLongDate` ("September 20th, 2026"), calendar icon leading.
- Files: `src/lib/calendar.ts`, `src/lib/calendar.test.ts`, `ui/date-picker.tsx`.

## WS-7 Empty states + view-level polish (MEDIUM)

- **7.1** `EmptyState`: render directly on the canvas — no `orb-card` wrapper, no border/shadow;
  keep icon circle + title + description + action centered.
- **7.2** My Tasks tabs: drop the "Need Help" filter (reference ships All / Pending /
  In Progress / Blocked / Done); active tab = inset well pill `#EBE7E2` text `#3A3A3A`,
  inactive transparent `#6E6E6E` (both radius full).
- **7.3** Team buttons: "Invite Member" and "New Agent" → pill radius-full raised white with the
  lucide `Plus` icon (replace user-plus / bot icons).
- **7.4** Settings: add the "Active Window" sub-header inside the Working Hours card (11px caps
  `#6E6E6E` above the time inputs).
- **7.5** User menu: Log Out icon 24×24 (lucide `LogOut`), keep 13px fw 500 red.
- Files: `empty-state.tsx`, `views/my-tasks-view.tsx`, `views/team-view.tsx`,
  `views/settings-view.tsx`, `user-menu.tsx`.

## WS-8 Verification

- **8.1** Full gate: lint → typecheck → test (80 + formatLongDate checks) → build → smoke (30).
- **8.2** Browser verification against the production build: dashboard grid (2×2, ring without
  SVG, day image), dark buttons across dialogs, check-in modal (448/16, plain radios, bordered
  textarea, dark Post Update), goal chips + stacked meta + inset track, date picker (260 raised,
  long date format), my-tasks tabs (5), team pill buttons, empty states on canvas, 1200px clamp +
  purple glow. Captures in `research/clone-capture-s7/`.
- **8.3** Placeholder/TODO/mock sweep.

## WS-9 Documentation

- **9.1** README: v1.5 feature/design-system updates (dark primary buttons, 1200px clamp +
  canvas glow, 2×2 dashboard, day-hills image, date-picker restyle + long format, 5 my-tasks
  tabs); screenshot refresh for changed views.
- **9.2** AGENTS / CLAUDE / PAD: v1.5 revision blocks (dark-primary hierarchy, shell clamp +
  glow, dashboard grid facts, check-in modal spec 448/16, goal-chip spec, formatLongDate seam);
  §11 line counts re-measured.
- **9.3** `docs/session_7.md` (session log per convention).
