# ORBITAL Parity Remediation Plan v1.7

Evidence: fresh live-app crawl 2026-09-17/18 (`research/live-capture-s9/`, `research/clone-capture-s9/`
+ programmatic computed-style probes via `scripts/par-probe2.sh` run side-by-side on the live app and the
clone's production build, two parallel agent-browser sessions, re-authenticated as needed). Every item
below traces to a measured style value or captured DOM structure on the LIVE app at 1440×900 and 390×844.
Deltas that are purely data-driven (live account has 0 team members, 0 assigned tasks, 36 activity
entries vs the clone's demo seed) are excluded.

Six systemic findings drive this round:

1. **The live app ships a strict label typography hierarchy the clone approximates inconsistently.**

   | Tier | Live spec | Used for |
   |------|-----------|----------|
   | Panel/field label | `11px / 600 / ls 1.1px / uppercase / #6E6E6E` | "AGENT ACTIVITY", "GOALS", stat-column labels, "PROGRESS", goal-detail status chip text, "TASKS" header |
   | Small label | `10px / 600 / ls 1.2px / uppercase / #767676` | sidebar "WORKSPACE"/"MANAGEMENT", NPA label, activity date labels, sidebar "TASKS STATUS" |
   | NPA variant | `10px / 600 / ls 1px / uppercase / #767676` | "NEXT PLANNED ACTION" |

   The clone's `.orb-label` renders `11px / 500 / ls 0.88px` and several views override to `12px/600/0.96px`.
   Live field labels in Settings are `12px/600 #6E6E6E` with `11px/400 #9A9A9A` descriptions — the clone uses
   `13px/500 #2F2823` labels and `13px #6E6E6E` descriptions.

2. **The mobile tab bar is a FULL-WIDTH bottom-attached bar, not a floating pill.** Measured at 390×844:
   `[0, 771, 390, 74]`, `position: fixed; bottom: 0`, `border-radius: 20px 20px 0 0` (top corners only),
   bg `#EEEAE6`, shadow `0 -4px 20px rgba(160,143,126,0.22)` (upward), pad `8px 8px 12px`. Tabs: 20px icons,
   `9px/600/ls 0.45px/uppercase` labels, active = darker color only (`#3A3A3A` vs `#767676`) — NO inset
   highlight pill. The v1.6 "floating rounded-24 pill with inset active highlight" was a misread. The mobile
   shell is also full-bleed: content side padding ≈ 22px (the clone keeps the `p-6` shell → 40px), and the
   mobile hero cards are 150px tall (clone 180px).

3. **Dashboard stats-panel columns are CENTER-ALIGNED with big light numerals.** Live columns are links
   with NO padding wrapping an inner block (`pad 10px 0`, content centered both axes): label
   `11px/600/1.1px`, number `50.4px/300/ls -1.5px #3A3A3A` (the same clamp face as the date card / ring),
   sub `12px/400 #665F57`; column gap 16px. The clone renders left-aligned `justify-between` buttons with
   `44px/400` numerals, `13px` subs, `gap-1`.

4. **The sidebar is a tighter, quieter component than the clone's.** Live: brand row at y=52 — "ORBITAL"
   `13px/600/ls 2.34px/#2F2823` with an ~11px six-dot mark (4px dots); section labels `10px/600/1.2px
   #767676`; nav items 39px tall, inactive `14px/400` (not 500); the Tasks Status block is a PLAIN link
   (no well) with `11px/700` numbers and `11px/400 #767676` captions beside the 80px clock; the sticky
   panel pins `top: 0` with `height: calc(100vh - 40px)` (clone: `top-6`, `calc(100vh-3rem)`).

5. **The red accent is darker on live: `#BD3228`** (blocked task titles, "· N blocked" counts). The clone
   uses `--orb-coral-deep #C9574E`.

6. **h1 line-height is 1.2 on every live view** (33.6px) and the greeting is Title Case ("Good Evening.").
   The clone's non-dashboard views ship default leading (42px) and sentence case.

Other measured finds (all verified programmatically): grid gap p→grid 20px (clone mt-6 = 24px); date
square has NO gap between day and month (80px tall vs clone 84px); ring card "done" label `10px/400/0.6px
#767676` (clone 11px/600); activity header pt 20px + mb 14px (clone pt 14px, m-0); live dot 7px (clone
6px); activity rows: icon gap 12px (clone 18px), message lh 20px / detail lh 18px (clone leading-6 = 24px),
timestamp sits INSIDE the message flex row, and every non-hero row ends with a type tag
(`10px/600 #B3B3B3 uppercase`, e.g. "TASK ASSIGNED") the clone lacks entirely; dashboard goals-panel rows:
title `13px/500` (clone 14px/600), meta `11px/400 #767676` (clone 12px), row gap 10px (clone 16px), ring
pct `14px/500` (clone 11px/600), header mb 20px; the activity-feed hero uses a 36px icon and its second
line is the caption "Last agent action" (not the entry detail); the online indicator is an inset well pill
(dot 7px + "Online · 36" 11px/600) vs the clone's plain 13.5px text; goal cards: title→track gap 14px
(clone 8px), chip well pair `-2px -2px 5px 0.8/0.24 inset` (clone -3px/-3px/6px 0.68), pip 7px (clone 6px),
right column content vertically CENTERED with 8px gaps and a centered fraction (clone justify-between,
right-aligned fraction); goal-detail: "Back to Goals" 13px/400 (clone 13.5px/500), DELETE radius 12 (clone
20), blocked-stat content centered in a 64px block (clone justify-between), "Tasks" header is the small
label style + "12 total" 13px (clone 16px h2), task-card action buttons 2px apart (clone 8px), status chip
text GRAY on live (clone paints it in the status color); goals-view filter chips: ls 0.72px, 600 weight on
all states, pad 7px 14px (clone ls normal, inactive 500, pad 0 16px); My-Tasks empty title 15px/400 (clone
15px/600); check-in modal h2 16px/500 (clone 17px/600) with a 16px Send icon (clone 14px); add-task
description textarea 72px/13px (clone 64px/14px); Settings select triggers 36px (clone 38px).

TDD applies where new pure logic is introduced (greeting Title Case, activity row type tags). Everything
else is verified by the gate (lint → typecheck → unit → build → smoke) + browser re-measurement with the
side-by-side probe.

## WS-1 Global tokens + label typography (HIGH — systemic)

- **1.1** `globals.css`: retune `.orb-label` to the live panel-label spec (`11px/600/ls 1.1px/#6E6E6E
  uppercase`); add `.orb-label-sm` (small tier: `10px/600/ls 1.2px/#767676 uppercase`) for sidebar
  sections, NPA, date labels, sidebar TASKS STATUS; retire the ad-hoc `!text-[12px] !font-semibold`
  overrides in `dashboard-view.tsx` (Agent Activity / Goals headers) in favor of the corrected `.orb-label`.
- **1.2** `globals.css`: `--orb-coral-deep: #C9574E` → `#BD3228` (blocked titles, "· N blocked").
- **1.3** All view h1s (goals, my-tasks, activity, team, settings, goal-detail) get `leading-[1.2]` —
  matches live's 33.6px; dashboard already compliant.
- **1.4** Greeting → Title Case: `src/lib/orbital.ts` already exports a Title Case `greetingFor`
  ("Good Morning." / "Good Afternoon." / "Good Evening.") — `dashboard-view.tsx` ships a local
  sentence-case duplicate. Fix = import the shared seam; add TDD specs in `src/lib/greeting.test.ts`
  (morning/afternoon/evening boundaries, 11:59/12:00/17:59/18:00 edges).

- Files: `src/app/globals.css`, `src/lib/greeting.test.ts` (new), `views/*.tsx`.

## WS-2 Dashboard (HIGH)

- **2.0** Validation note: `.orb-live-dot` is already 7px in `globals.css` (an earlier 6px probe
  reading was mid-pulse animation) — no change needed there.

- **2.1** Stats panel: columns → centered layout — inner block `pad 10px 0`, flex-col items-center,
  label `.orb-label`, number `text-[clamp(28px,3.5vw,52px)] font-light tracking-[-0.03em]` (50.4px/300
  at 1440), sub `12px/400 #665F57`; panel `gap-4` (16px); drop the button padding (content pads itself).
- **2.2** Ring card "done": `10px/400/ls 0.6px/#767676`. Date square: remove the `mt-1` on the month
  (day and month stack flush → square 80px tall like live).
- **2.3** Activity panel: header `px-[18px] pt-[20px]` + `mb-[14px]`; live dot 7px (`.orb-live-dot`);
  NPA label → `.orb-label-sm`-variant text "Next Planned Action" (10px/600/1px/#767676), value
  `13px/400 #3A3A3A`.
- **2.4** Activity rows (panel + feed): icon gap `12px`; message lh `[20px]`, detail lh `[18px]`;
  timestamp moves INSIDE the message flex row (shrink-0, top-aligned); row pad stays `14px 18px`.
- **2.5** Goals panel: header `mb-5` (20px); rows: title `13px/500`, meta `11px/400 #767676`, row gap
  `10px`, ring pct text `14px/500`; rows container `pb-[18px]`.
- **2.6** Grid spacing: hero section `mt-6` → `mt-5` (20px like live).
- Files: `views/dashboard-view.tsx`, `src/components/orbital/widgets.tsx` (if AiBadge/fonts touched).

## WS-3 Sidebar (HIGH)

- **3.1** Shell: `aside` → `lg:top-0` + `lg:h-[calc(100vh-40px)]` (live: sticky top 0, height
  viewport − 40px); keep `orb-raised-lg` inner panel filling it.
- **3.2** Brand: mark shrinks to the measured 6-dot arrangement at ~14px box (4px dots) +
  "ORBITAL" `13px/600/ls 2.34px/#2F2823`; brand row sits flush at panel pad top (drop the extra `pt-5`).
- **3.3** Section labels: `.orb-label-sm` (10px/600/1.2px/#767676) at the measured positions
  (`px-5` + `pt-6 pb-2` cadence, first label at y≈97 from panel top).
- **3.4** Nav items: `min-h-[39px]` (was 44), inactive `font-normal` (400), keep active `font-medium`
  + well.
- **3.5** Tasks Status: plain layout (NO well): "TASKS STATUS" `.orb-label-sm`, rows `dot 6px +
  number 11px/700 #3A3A3A + caption 11px/400 #767676`, block bottom-anchored beside the clock with
  10px gap; clock stays 80px inset circle.
- Files: `orbital-app.tsx`, `sidebar.tsx`, `logo.tsx` (brand mark size prop), `globals.css`.

## WS-4 Goals view + goal cards (HIGH)

- **4.1** Filter chips (goals + my-tasks tabs share the style): `ls 0.72px`, all states `600`,
  `py-[7px] px-[14px]` (active keeps the inset-well bg; inactive transparent, `#6E6E6E`).
- **4.2** Card internals: title→track gap `14px` (mt-3.5), chip-row→title gap `11px` (mt-[11px]);
  chip well inset pair `-2px -2px 5px rgba(255,250,244,0.8) / 2px 2px 5px rgba(160,143,126,0.24)`;
  pip 7px; blocked count uses the new `#BD3228`.
- **4.3** Right column: content vertically centered as a group (flex-col justify-center, `gap-2`),
  fraction centered under the pct.
- Files: `views/goals-view.tsx`, `views/my-tasks-view.tsx` (chip styles), `globals.css` (chip class
  if added).

## WS-5 Goal detail + task cards (HIGH)

- **5.1** Header: "Back to Goals" `13px/400`; status chip text GRAY `#6E6E6E` (dot keeps the status
  color, 7px) — align with the live pattern (clone currently paints the text in the status color).
- **5.2** DELETE button → radius 12 (matches every measured live pill button).
- **5.3** Stat cards: blocked panel content centered (label + count in a centered block, count
  `26px/400 #FF7043`); progress panel label `.orb-label` + "8/12 tasks done" `13px/400 #6E6E6E`;
  panels keep `.orb-panel` 20/24 and 20/16 pads.
- **5.4** "Tasks" header → small-label style + "12 total" `13px #6E6E6E` (replaces the 16px h2);
  ADD TASK keeps the 11px/600 pill.
- **5.5** Task-card action squares: 2px gap between the two buttons (live: [1322→1350], clone 8px);
  blocked title color → `#BD3228`.
- Files: `views/goal-detail-view.tsx`, `task-card.tsx`, `src/lib/orbital.ts` (status-meta text color
  if centralized).

## WS-6 Activity feed view (HIGH — TDD)

- **6.1** New pure seam `src/lib/activity-tags.ts`: `activityTypeTag(type)` → the live's tag strings,
  verified as the type with underscores → spaces (live shows "task assigned", "tasks generated",
  "goal analyzed" for types `task_assigned` / `tasks_generated` / `goal_analyzed`). RED tests first
  (~4 specs: known types, underscore replacement, unknown passthrough). 93 → ~97 unit checks.
- **6.2** Header: online indicator becomes an inset well pill (`h-[31px]`, dot 7px, "Online · {n}"
  11px/600 #3A3A3A).
- **6.3** Hero card: 36px icon circle; second line = caption "Last agent action" `12px/400 #767676`
  (replaces the entry detail); no timestamp on the hero; hero `mb-6`.
- **6.4** Group rows: WS-2.4 row spec (gap 12, lh 20/18, timestamp in-row) + the new type-tag line
  (`10px/600 #B3B3B3 uppercase`, mt ~2px) after the detail; date labels → `.orb-label-sm`.
- Files: `src/lib/activity-tags.ts` (new), `activity-tags.test.ts` (new), `views/activity-view.tsx`,
  `dashboard-view.tsx` (ActivityIcon reuse for the 36px hero variant).

## WS-7 Team + Settings (MEDIUM)

- **7.1** Team: buttons already match (Invite Member 13px/500 Title Case r12, New Agent 11px/600
  uppercase r12 — verified); h2 "AI Agents" `16px/500` (clone 18px/600); agents empty well keeps
  `p 32/24 r16` but holds ONLY icon + two lines (NO inner New Agent button — live measured);
  `EmptyState` restyle: plain icon (no 56px circle), `#B3B3B3` color, title `15px/400`, sub
  `13px/400 #767676` (My Tasks uses a 28px icon, Team 22px).
- **7.2** Settings: field labels `12px/600 #6E6E6E`; descriptions `11px/400 #9A9A9A`; "Start"/"End"
  labels `11px/500 #9A9A9A`; select triggers 36px (FIELD `h-[36px]`); description textarea in dialogs
  72px/13px where 64px/14px ships.
- Files: `views/settings-view.tsx`, `views/team-view.tsx`, `ui/input.tsx`/`ui/textarea.tsx` (base
  sizes), `dialogs/add-task-dialog.tsx`.

## WS-8 Mobile chrome (HIGH)

- **8.1** Shell full-bleed below `lg`: outer shell drops its `p-6` at mobile (`p-0 lg:p-6`); main
  horizontal padding ~22px at mobile (`px-[22px] lg:px-7`); app bar already full-bleed — keep.
- **8.2** Tab bar: full-width bottom-attached — `fixed inset-x-0 bottom-0 rounded-t-[20px]` (no bottom
  radius), shadow `0 -4px 20px rgba(160,143,126,0.22)` (upward), pad `8px 8px 12px` (+safe-area);
  tabs: 20px icons, `9px/600/ls 0.45px uppercase` labels, active = `#3A3A3A` color only (remove the
  inset well highlight), inactive `#767676`.
- **8.3** Mobile hero: date card + ring `h-[150px]` (from 180); ring `w-[44%]`; stats panel stacks
  (already does); mobile bottom padding clears the 74px bar + 12px (`pb-[98px]`-ish, tune to live).
- Files: `orbital-app.tsx`, `views/dashboard-view.tsx`.

## WS-9 Dialogs (MEDIUM)

- **9.1** Check-in modal: h2 `16px/500`; Send icon 16px; re-verify vertical rhythm (live 408px tall
  vs clone 430 — tighten paddings by the ~22px aggregate).
- **9.2** Add-task dialog: description textarea 72px/13px.
- Files: `dialogs/task-detail-dialog.tsx`, `dialogs/add-task-dialog.tsx`.

## WS-10 Verification

- **10.1** Full gate: lint → typecheck → test (93 + ~6 new) → build → smoke (30).
- **10.2** Browser re-measurement with `scripts/par-probe2.sh` on every view (desktop + 390×844):
  label typography, stats columns, sidebar metrics, activity rows, tab bar, hero cards; captures in
  `research/clone-capture-s9/` (post-fix).
- **10.3** Placeholder/TODO sweep; README screenshots regenerated for changed views.

## WS-11 Documentation

- **11.1** README: label hierarchy, stats numerals, mobile chrome correction, activity type tags,
  9x unit-check count, refreshed screenshots.
- **11.2** AGENTS.md / CLAUDE.md: same facts in operator/agent-contract form (mobile tab bar spec
  REPLACES the v1.6 floating-pill claim; stats column spec; sidebar spec; label tiers).
- **11.3** PAD → v1.7 revision block + affected sections (§5 design system, §7 test counts, §11
  line counts re-measured).
- **11.4** `docs/session_9.md`: replace the accidentally-committed raw transcript with a proper
  Session 9 log (transcript content duplicates session_8.md — no information lost).
