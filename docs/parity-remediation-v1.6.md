# ORBITAL Parity Remediation Plan v1.6

Evidence: fresh live-app crawl 2026-09-17 (`research/live-capture-s8/`, 20+ captures + programmatic
computed-style probes run side-by-side on the live app and the clone's production build via two
parallel browser sessions; VLM cross-checks; re-authenticated twice with the reference account).
Every item below traces to a measured style value or a captured DOM structure. Four systemic
findings drive this round:

1. **The reference has THREE card tiers, and the clone only ships one.** Measured on live:

   | Tier | Shadow pair | Radius | Used for (live) |
   |------|-------------|--------|-----------------|
   | Standard | `-5px -5px 10px 0.78` / `5px 5px 12px 0.27` | 10–16 | buttons, pills, date square |
   | Deeper row | `-5px -5px 10px 0.92` / `5px 5px 12px 0.36` | 14–16 | goal cards, task cards, activity feed cards |
   | Large panel | `-8px -8px 16px 0.78` / `8px 8px 18px 0.31` | 16 | dashboard 4 panels, settings cards, goal-detail stat cards |

   The clone renders nearly everything with the standard pair — the reference reads visibly
   "deeper/more embossed" (VLM flagged it on every view). `.orb-raised-lg` already carries the
   large pair but at radius 20 (sidebar).

2. **The reference sidebar is STICKY.** `position: sticky; top: 0; height ≈ viewport − 40px` with
   the clock/TASKS STATUS block pinned via `mt-auto` — always visible. The clone's sidebar
   stretches with the page: on a 900px viewport the clock sits at y≈1957 (below the fold).

3. **The reference task rows are flat, compact, and radius 14 — with the action icons OUTSIDE the
   shadowed card.** Live: card `1072×98–117, radius 14, deeper shadow, p 14px 18px` containing only
   [status chip (gray 11px/500 + 8px dot) | title 14px/500 (coral when blocked) | description 12px
   1-line clamp | meta 11px with 11px lucide icons]; the pencil/trash buttons (26×26, radius 7,
   small raised pair, 11px icon, `#9A9A9A`) live in a sibling div pinned at the row's top-right.
   The clone wraps everything in a button, uses 36px well squares, 15px/600 titles, colored status
   labels, radius 16 (a cascade bug: `orb-card rounded-[14px]` loses to the custom class).

4. **Mobile is a different chrome on the reference:** a floating app bar (ORBITAL logo + user pill,
   390×62, `#EEEAE6`, bottom shadow `0 4px 16px rgba(160,143,126,0.18)`, p 14px 20px) replaces the
   desktop greeting header (no greeting, no NEW GOAL in the bar); the date card + ring sit
   side-by-side even at 390px; the bottom tab bar is a FLOATING pill (rounded ≈24, drop shadow,
   inset margins, active tab gets a gray highlight pill). The clone renders the desktop header
   stacked, stacks date+ring, and ships a full-width flat tab bar.

Other measured finds (all verified programmatically): dashboard grid gap is **20px** (clone 16);
the ring card carries `p 6px` so the CSS circle is 156px (clone 168); the stats panel is
`p 20px 24px` with `p 10px 8px` columns (clone `p-1` panel / `p-20` columns); the activity panel
card is `p 0` with full-width rows (`p 14px 18px`, 30px solid icon circles `#C9B3F5`/`#2ECC8A`
with a 13px dark `square-check-big` glyph) and the NPA well inset by 14px margins; the goals panel
is `p 20px 18px 0px` with goal rows as INSET WELLS (`p 12px 14px`, 490×84) and 60px SVG rings; the
goals-view cards split into a 952px left column (`p 18px 20px`) + 120px right column (`p 18px 16px`)
holding a **42px/500 percentage**, with flat gray 29×23 action buttons (`p 5px 8px`, radius 8,
`#B3B3B3`, no shadow); the activity FEED view groups rows under uppercase 10px/600 date labels
inside one big radius-14 deeper card, with the most recent entry as a standalone hero card and an
"Online · 36" indicator (count only); the Team buttons are radius-12 rectangles (35px, `p 9px 18px`,
11px/600) — not round pills — and the AI-Agents empty state sits in an inset well card
(`p 32px 24px`, radius 16); Settings cards use the large tier with `p 22px 24px`, inputs are 38px
tall with 13px text, the "Active Window" label is 12px/600 Title Case above the description, and
card headers are 13px/600 (clone 15px); the task AI badge is a solid `#EEEAE6` chip (radius 6,
`p 1px 5px`, 10px/500 `#996CE4`, no icon); activity icons are SOLID circles, not tinted.

TDD applies at the new pure seam (activity date grouping). Everything else is verified by the
gate (lint → typecheck → unit → build → smoke) + browser verification with side-by-side captures.

## WS-1 Card-tier tokens + global spacing (HIGH — systemic)

- **1.1** `globals.css`: add `.orb-panel` (radius 16, bg raised, LARGE pair) and `.orb-row-card`
  (radius 14, bg raised, deeper pair) next to the existing primitives; re-scope `.orb-task-blocked`
  to be the coral inset ring ONLY (it now composes with `.orb-row-card`, which already carries the
  deeper pair — keep source order: declare after both).
- **1.2** `goals-view.tsx` goal card: switch `orb-card` → dedicated deeper tier (radius 16); grid
  gap on dashboard sections 16 → 20 (`gap-5`).
- **1.3** Sweep: dashboard panels, settings cards, goal-detail stats → `.orb-panel`; task cards and
  activity feed cards → `.orb-row-card`.
- Files: `src/app/globals.css`, all views below.

## WS-2 Dashboard panels (HIGH)

- **2.1** Ring card: add `p-[6px]` (inner circle then measures 156px); card → `.orb-panel`.
- **2.2** Stats panel: `.orb-panel` + `p [20px 24px]`; columns `p [10px 8px]` (drop `p-5`),
  keep the 44px numerals.
- **2.3** Activity panel: card `p 0`; header row carries its own `px-[18px] pt-[14px]`; NPA well
  gets 14px side margins + `p [12px 14px]`; rows go full width with `p [14px 18px]`, 30px solid
  icon circles (`#C9B3F5` purple / `#2ECC8A` green for `tasks_generated`, `square-check-big`
  13px glyph `#2F2823`), lh 24px.
- **2.4** Goals panel: `p [20px 18px 0px]`; goal rows become inset wells (`orb-well`-family,
  `p [12px 14px]`) with the ring at 60px (stroke circles 54px).
- Files: `views/dashboard-view.tsx`, `progress-ring.tsx` (ring size props stay).

## WS-3 Task cards (HIGH)

- **3.1** Structure: row wrapper = [card div (`.orb-row-card` `p [14px 18px]`) | actions div pinned
  top-right]; the card content is a single flat button (status chip → title → description → meta)
  — no nested flex column around the actions.
- **3.2** Status chip: label `11px/500` UPPERCASE **gray `#6E6E6E` for every status** (dot keeps
  the status color, 8px); drop `semibold` + status-colored text.
- **3.3** Title `14px/500` (coral when blocked); description `12px` **1-line clamp**; meta `11px`
  with lucide `User/Calendar/Clock` at 11px.
- **3.4** Actions: `26×26`, radius 7, bg raised, small raised pair (`-2px -2px 5px 0.78` /
  `2px 2px 5px 0.24`), 11px lucide icons, `#9A9A9A` idle → hover states; the inline
  delete-confirm pair stays (swaps in place of the icons).
- **3.5** AI badge: solid `#EEEAE6`, radius 6, `p [1px 5px]`, `10px/500` `#996CE4`, text "AI"
  (no sparkle icon); position stays next to the status chip.
- Files: `task-card.tsx`, `widgets.tsx` (AiBadge), `views/goal-detail-view.tsx`,
  `views/my-tasks-view.tsx` (consumers re-pass sizes).

## WS-4 Goals view card (HIGH)

- **4.1** Card → deeper tier (radius 16); two-column padding: left `p [18px 20px]` (chip row,
  title, 6px inset track, meta, date) + right column `w-[120px] p [18px 16px]` with the
  percentage at `42px/500` and fraction at `12px`.
- **4.2** Actions: flat gray buttons 29×23 (`p [5px 8px]`, radius 8, `#B3B3B3`, no bg/shadow) —
  replace the 36px well squares; inline Delete/Cancel pair unchanged.
- Files: `views/goals-view.tsx`.

## WS-5 Activity feed view (HIGH — TDD)

- **5.1** New pure seam `src/lib/activity-groups.ts`: `groupActivityByDate(entries)` →
  `[{ key, label ("Thu Jul 16 2026"), entries[] }]` newest-first + `isToday` handling (today's
  group label "Today"). RED tests first in `activity-groups.test.ts` (grouping order, label
  formatting, empty input, boundary dates — 85 → ~93 checks).
- **5.2** View restructure: header row ("Agent Activity" + subtitle + `Online · {n}` — count
  only); the most recent entry renders as a standalone hero card (`.orb-row-card`); each date
  group renders its label (`10px/600`, ls 0.12em, `#767676`, uppercase) above ONE big
  `.orb-row-card` wrapping that day's rows (dividers between rows); rows keep the 30px solid
  icon circles from WS-2.3.
- Files: `src/lib/activity-groups.ts` (new), `activity-groups.test.ts` (new),
  `views/activity-view.tsx`.

## WS-6 Team + Settings (MEDIUM)

- **6.1** Team buttons: radius-12 rectangles (h 35, `p [9px 18px]`, 11px/600 uppercase + lucide
  `Plus`) — replace the round `.orb-pill-round`; the empty-state action renders "Invite Member"
  Title Case 13px/500.
- **6.2** AI-Agents empty state: wrap in an inset well card (radius 16, `p [32px 24px]`).
- **6.3** Settings: cards → `.orb-panel` `p [22px 24px]`; card headers 15px → 13px/600; inputs
  44px → 38px tall, 14px → 13px text; "Active Window" label → 12px/600 Title Case, positioned
  ABOVE the "AI will only send pings…" description.
- Files: `views/team-view.tsx`, `views/settings-view.tsx`, `ui/input.tsx`.

## WS-7 Shell: sticky sidebar + mobile chrome (HIGH)

- **7.1** Sidebar: `aside` → `lg:sticky lg:top-0 lg:h-[calc(100vh-3rem)]` (measured: sticky,
  top 0, height = viewport − 40px) so the clock/TASKS STATUS/collapse stay pinned while main
  scrolls; the inner panel keeps `flex-col` + `mt-auto` bottom block.
- **7.2** Mobile app bar (new `MobileTopBar` in `orbital-app.tsx`): visible `<lg`, `h-[62px]`
  bg raised, bottom shadow `0 4px 16px rgba(160,143,126,0.18)`, `p [14px 20px]`, holds the
  ORBITAL logo mark + `UserMenuOrLogin` pill; the dashboard header (greeting + NEW GOAL) hides
  below `lg` (greeting `hidden lg:block`; NEW GOAL moves into the app bar's right side on mobile).
- **7.3** Mobile tab bar: floating pill — `mx-3 mb-3 rounded-[24px]` raised panel with drop
  shadow; active tab gets an inset well pill behind icon+label.
- **7.4** Mobile dashboard: date card + ring side-by-side at all breakpoints
  (`flex-row`, ring `w-[44%]`); stats/activity/goals stack as today.
- Files: `orbital-app.tsx`, `sidebar.tsx`, `views/dashboard-view.tsx`.

## WS-8 Verification

- **8.1** Full gate: lint → typecheck → test (85 + grouping checks) → build → smoke (30).
- **8.2** Browser verification against the production build with the two-session side-by-side
  probe (`scripts/par-probe.sh`): card tiers on every view, task-card spec, goal-card spec,
  activity feed grouping, sticky sidebar (clock y < viewport), mobile app bar + floating tab bar
  + side-by-side hero. Captures in `research/clone-capture-s8/`.
- **8.3** Placeholder/TODO/mock sweep; README screenshots regenerated for changed views.

## WS-9 Documentation

- **9.1** README: card-tier design-system table update, sticky sidebar, mobile chrome (app bar +
  floating tab bar), activity date groups, 9x unit checks.
- **9.2** AGENTS / CLAUDE / PAD: v1.6 revision blocks (tier tokens, sticky sidebar, mobile
  chrome facts, task-card spec, activity-groups seam); §11 line counts re-measured.
- **9.3** `docs/session_8.md`: replace the accidentally-committed raw transcript with a proper
  Session 8 log (the transcript content duplicates session_7.md — no information lost).
