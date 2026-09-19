# ORBITAL Parity Remediation Plan v2.0 (Session 12)

Evidence: fresh side-by-side crawl 2026-09-19 (~01:00–02:30, night phase) — two
authenticated agent-browser sessions (`live` = `https://agent-pm-copy-15e23720.base44.app/`,
`clone` = production build on :3000) at 1440×900 and 390×844, computed-style probes under
`research/par-s12/` (per-view JSONs + targeted verify probes), VLM screenshot cross-checks
(dashboard, wizard, mobile, MORE sheet, date picker). Computed styles are ground truth;
VLM readings were again disproven twice by measurement (team empty icons ARE #B3B3B3 via
SVG `stroke` attr — the probe's `.color` read the inherited text color; the mobile tab
icon "darker purple" claim is false — both #C9B3F5 30px circles).

Data-driven deltas (user names, activity text, task counts, timestamps, goal descriptions)
excluded. Probe-noise exclusions unchanged (rounded-full ≡ 33554432px ≡ 50%; flattened
shadow cascades; markup-tag choices). Verified-clean this session: dashboard (VLM
"visually identical"), my-tasks (0 deltas), team list/empty states/invite buttons,
sidebar, mobile app bar + tab bar, wizard wrapper/avatar/bubble/close, activity group
labels/type tags/separators, online pill, settings left card.

Baseline gate on the v1.9 code (313ad50): lint 0 · typecheck 0 · 122/122 unit ·
build clean · 30/30 smoke — the v1.9 claims hold; this plan closes the residual deltas.

## Systemic findings (v2.0)

1. **v1.9's goal-card "pad-top 23" was a mis-read.** Today's computed style on the live
   first card: inner column `padding: 18px 20px` (uniform), height 165.75 vs the clone's
   171.75 (`p-[23px_20px_18px]`). All content rows inside are positionally identical
   (title lands at the same y in both), so the fix is purely the padding (plus the chip-row
   mb 12 and track mb 8 / meta mt 0 rhythm — the clone splits the 10px as track mb 0 +
   meta mt 2.5).

2. **The goal-detail header + section rhythm drifts low.** Live margins: chip → h1 8,
   h1 mb 6 → subtitle, subtitle mb 0, Target mt 8; stats row bottom → TASKS row 23.
   Clone: subtitle mt 8, Target mt 12, TASKS mt 8 (32) → content sits 3/7/9px lower.

3. **The activity feed micro-rhythm is 2–3px short per row.** Live hero message has
   mb 2 (hero 68 vs 66) and each group row's message→detail gap is 3px (row 89 vs 86).
   Everything else in the feed (label mb 14, tag mt 4, separators, borders) matches.

4. **Standard form dialogs (add-task, goal-edit, task-edit) use a DIFFERENT button and
   panel system than the wizard.** Live measured: panel 500px, pad 28/28/24, radius 20;
   heading 15px/600; Cancel 34px/8/18 12px/500 normal-case #6E6E6E on #EBE7E2 with the
   raised -3px pair; submit 34px/8/20 12px/600 normal-case #3A3A3A with NO shadow;
   inputs 36px pad 8/12; close square 30px r8. The v1.9 base (r16, p-24, 11px/600/0.88
   UPPERCASE buttons) matches the live **wizard only** — the wizard keeps its own classes;
   the standard dialogs need a second button pair. (The invite dialog is a third variant:
   h2 16/500, labels 12px/500 normal-case, buttons 36px 13px/400–500; the check-in is the
   448px r16 exception as documented.)

5. **The wizard's vertical rhythm is 51px short.** Live: bubble row mb 24 → form panel
   (417px tall); form internals carry 15px (input→Description), 23px (textarea→Target),
   22px (date→buttons) inter-block gaps, label mb 7, date trigger 37.5px fs 13
   (clone: 44px fs 14), Continue pad 9/18 gap 6 (clone: pad 9/12 gap 8). The Post Update
   pill is `pad 0 12px` (121px wide), not 0 20px (133px).

6. **The login card's internal rhythm is 12px short** (746 vs 734): labels are 14px/16
   (clone 13px), logo block mb 32 (clone 28), OR→label 28 (clone 24), label→input 10
   (clone 8), block gaps 20 (clone 16), footer links line-height 20 (clone 21).

7. **The date picker renders 6 rows and flips upward.** The live calendar renders only
   the weeks a month needs (Sep 2026 = 5 rows, popover 269px; the clone's "6-row
   invariant" = 42 cells, 309px) and its popover opens CENTERED under the trigger,
   downward, overflowing the dialog (clone: left-anchored, flips up). Popover pad is
   16/18; nav chevrons are raised #EEEAE6 circles (clone: flat black/4%).

8. **The mobile MORE sheet drifts.** Live: r24, pad 20/20/40, upward shadow
   `0 -8px 32px rgba(160,143,126,0.28)`, 4px #CCC7C0 handle, 32px r10 raised close,
   brand = 9px six-dot mark + "ORBITAL" 12px/600/ls 2.16 #2F2823, rows = plain 16px/400
   #2F2823 links (h 49, 8px gaps, list-todo/users/settings 20px icons). Clone: r28,
   pad 8/0/16+safe, downward shadow, 6px black/12% handle, 40px round close, 15px/700
   brand + 26px mark, pill rows 15px/500 with check-square icons.

9. **Settings AI-Assistant card: select→AI-Tone gap is 18px live, 10px clone** (card
   242 vs 233). Check-in modal: h2 lh 16 (clone 22), "Post Status Update" label 12px/600/
   ls 0.96/lh 18/mb 12 (clone .orb-label 11/1.1/16.5 + mb 8). Goals filter chips land 2px
   low (mt 24 → 22). Team view: NO icon delta (stroke artifact — dropped).

## WS-1 Pure seams (TDD — red first) — HIGH

- **1.1** `src/lib/calendar.ts` — `monthGrid` drops the fixed 6-week loop and renders
  `Math.ceil((firstDayOffset + daysInMonth) / 7)` weeks. RED first in
  `src/lib/calendar.test.ts`: Sep 2026 → 5 rows / 35 cells; Aug 2026 → 6 rows / 42 cells;
  Jan 2027 (offset 5 + 31 = 36 → 6 rows); Feb 2024 (leap, offset 3 + 29 = 32 → 5 rows);
  the last cell of the last row still ends the grid; inMonth flags unchanged.
  **Keep the existing leap-February and formatLongDate specs.**

## WS-2 Goals view (HIGH)

- **2.1** `views/goals-view.tsx` GoalCard: `p-[23px_20px_18px]` → `p-[18px_20px]`;
  chip row `mb-[11px]` → `mb-[12px]`; progress track div + `mb-2`; meta `mb-1 mt-2.5`
  → `mb-1` (track's mb supplies the 8px).
- **2.2** Filter chips row `mt-6` → `mt-[22px]`.
- **2.3** Goal-detail `views/goal-detail-view.tsx`: subtitle `mt-2` → `mt-[6px]`;
  Target `mt-3` → `mt-[8px]`; TASKS section `mt-8` → `mt-[23px]`.

## WS-3 Activity feed (HIGH)

- **3.1** `views/activity-view.tsx` hero message `p` + `mb-[2px]`.
- **3.2** FeedRow detail `p` + `mt-[3px]`.

## WS-4 Standard dialog system (HIGH)

- **4.1** `ui/dialog.tsx` DialogContent base: `rounded-[16px] … p-6` →
  `rounded-[20px] … p-[28px_28px_24px]`; the built-in close button → 30×30 r8
  `bg-orb-well` raised `-4px 0.82 / 4px 0.28` pair (was the shadcn ghost). The check-in
  (448/r16/p24) and the wizard (680/r24) keep their own `className` overrides — verify.
- **4.2** `globals.css` new classes: `.orb-btn-submit` (h 34, pad 8/20, 12px/600
  normal-case, bg var(--orb-heading), #F1F1F0 text, r10, NO shadow) and
  `.orb-btn-cancel-std` (h 34, pad 8/18, 12px/500, #6E6E6E text, bg #EBE7E2, r10,
  the -3px 0.78 / 3px 0.27 raised pair).
- **4.3** Apply to add-task / goal-edit / task-edit dialogs (replace orb-btn-dark /
  orb-btn-raised-cancel there); headings `text-[16px] font-semibold` →
  `text-[15px] font-semibold`.
- **4.4** `ui/input.tsx`: `h-[38px] px-3.5` → `h-[36px] px-3 py-2` (standard dialogs).
- **4.5** Dialog select triggers in add-task/goal-edit/task-edit: 36px pattern
  (h-[36px] pad 8/12) — verify on re-probe (live pattern; direct select measurement
  was cut short).
- The wizard KEEPS `.orb-btn-dark` + `.orb-btn-raised-cancel` (11/600/0.88 uppercase —
  live-verified) and the invite dialog KEEPS its current style (live: 36px 13px buttons,
  12/500 labels — verify on re-probe; only the base panel pad/radius changes flow in).

## WS-5 Wizard (HIGH)

- **5.1** `dialogs/new-goal-dialog.tsx`: form `mt-4` → `mt-6` (bubble mb 24).
- **5.2** Form internals: Description block + `mt-[15px]`; Target block + `mt-[23px]`;
  buttons row `pt-2` → `mt-[22px]`; label `space-y-2` → `space-y-[7px]`.
- **5.3** Wizard-only Input override: `h-auto py-[9px]` (37.5px, pad 9/14 — differs from
  the standard-dialog Input).
- **5.4** Date trigger (`ui/date-picker.tsx`): `h-11` → `h-auto py-[9px]`;
  `text-[14px]` → `text-[13px]`.
- **5.5** `.orb-btn-dark` gap 8 → 6 (live Continue gap 6; width 118).
- **5.6** `.orb-btn-post` padding `0 20px` → `0 12px` (Post Update 121px).

## WS-6 Check-in modal (MEDIUM)

- **6.1** `dialogs/task-detail-dialog.tsx` h2: + `leading-[16px]` (lh 16 not 22).
- **6.2** "Post Status Update" label: `.orb-label` → inline `text-[12px] font-semibold
  tracking-[0.96px] leading-[18px] text-orb-muted mb-[12px]` (drop the wrapper mb 8).

## WS-7 Login (MEDIUM)

- **7.1** `login-screen.tsx`: field labels `text-[13px]` → `text-[14px]`; logo block
  `mb-7` → `mb-8`; OR divider stays `my-6` but the form's first field block + `mt-1`
  (OR→label 28); `space-y-2` → `space-y-[10px]` (label→input); `space-y-4` →
  `space-y-5` (block gaps 20); footer links + `leading-5` (lh 20).

## WS-8 Settings (MEDIUM)

- **8.1** `views/settings-view.tsx` AI Tone block `mt-[10px]` → `mt-[18px]`.

## WS-9 Date picker (HIGH)

- **9.1** WS-1 covers the grid rows.
- **9.2** `PopoverContent`: `align="start"` → `align="center"` +
  `avoidCollisions={false}` (centered under the trigger, opens downward, overflows the
  dialog like the live).
- **9.3** Popover `p-4` → `p-[16px_18px]`.
- **9.4** Month nav buttons: `bg-black/[0.04]` flat → `bg-orb-raised` + raised pair
  `-3px 0.82 / 3px 0.28` (28px circles stay).

## WS-10 Mobile MORE sheet (HIGH)

- **10.1** `orbital-app.tsx` SheetContent: `rounded-t-[28px] px-0
  pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-2` → `rounded-t-[24px]
  p-[20px_20px_40px] pb-[calc(env(safe-area-inset-bottom)+40px)]`; sheet shadow →
  `shadow-[0_-8px_32px_rgba(160,143,126,0.28)]` (upward only — override the sheet
  component's downward shadow).
- **10.2** Handle: `h-1.5 w-10 bg-black/[0.12] mb-1` → `h-1 w-10 bg-[#CCC7C0] mb-4`.
- **10.3** Close: `h-10 w-10 rounded-full text-orb-muted` → `h-8 w-8 rounded-[10px]
  bg-orb-raised text-orb-body` + the `-4px 0.78 / 4px 0.28` pair.
- **10.4** Brand: `LogoMark size={26}` + "Orbital" `text-[15px] font-bold
  tracking-[0.18em]` → `LogoMark size={9}` + "ORBITAL" `text-[12px] font-semibold
  tracking-[2.16px] text-orb-body`.
- **10.5** Rows: wrapper `px-3` → `px-5`; row buttons `rounded-xl px-3 py-3.5
  text-[15px] font-medium gap-3` → `h-[49px] gap-3 text-[16px] font-normal
  text-orb-body` with `space-y-[8px]`; icons `CheckSquare size={18}` →
  `ListTodo size={20}` (users/settings 18 → 20); keep hover affordance.
- **10.6** Sheet overlay: `bg-black/50` → `bg-[rgba(0,0,0,0.2)] backdrop-blur-[4px]`
  (live measured: 20% black + 4px blur at z 200 under the z-201 sheet).
- **10.7** The clone renders TWO close buttons (ui/sheet.tsx's built-in ghost X +
  the custom one). Add `showCloseButton={false}` support to SheetContent and use the
  single 32px r10 raised square.

## WS-11 Verification

- **11.1** Full gate: lint → typecheck → test (122, calendar spec updated) → build →
  smoke (30).
- **11.2** Re-probe every changed surface at 1440×900 + 390×844 (goals, goal-detail,
  activity, add-task, goal-edit, check-in, wizard, login, settings, date picker, MORE
  sheet); every delta closed or data-driven.
- **11.3** Screenshot regeneration for changed views; VLM sanity pass.

## WS-12 Documentation

- **12.1** README / AGENTS.md / CLAUDE.md: dialog two-system spec (standard r20 28/28/24
  + 12px buttons vs wizard 11px uppercase), goal-card 18/20, dynamic calendar rows,
  centered popover, MORE sheet spec, unit count.
- **12.2** PAD v2.0 revision block; session_12 log; worklog update.
