# Session 12 — v2.0 parity remediation (fresh full-surface audit)

**Date:** 2026-09-19 · **Scope:** Re-crawl every surface against the live reference, close the residual deltas found, align docs, ship.

## Goal

v1.9 had closed the measured surfaces, but the verification had been probe-based with known blind spots (dialog interiors, the date-picker popover state, the mobile MORE sheet internals). This session ran a fresh authenticated side-by-side crawl at 1440×900 + 390×844 with per-element computed-style probes on every dialog, sheet, and rhythm, then fixed what drifted.

## What happened

1. **Baseline** — `git pull` (already at 313ad50); gate green on the v1.9 code (lint 0 · typecheck 0 · 122/122 unit · build clean · 30/30 smoke).
2. **Fresh crawl** — two authenticated agent-browser sessions; ~35 probe evaluations across goals, goal-detail, activity, add-task, goal-edit, task-edit, invite, check-in, wizard (+ date picker open state), login, settings, team, dashboard, mobile chrome, MORE sheet. Results under `research/par-s12/`.
3. **Key findings → `docs/parity-remediation-v2.0.md`**:
   - v1.9's goal-card "pad-top 23" was a mis-read — the live computes `padding: 18px 20px` (card 165.75px both sides after the fix).
   - The live's standard form dialogs (add-task/goal-edit/task-edit) are radius-20/pad-28/28/24 with 12px normal-case buttons — a SECOND button system distinct from the wizard's 11px uppercase pills; the invite dialog is a third variant (384px, 36px/13px).
   - The live calendar renders only the weeks a month needs (5 rows for Sep 2026) and its popover opens centered/downward; the clone padded to 6 rows and flipped upward.
   - The mobile MORE sheet measured precisely: r24, pad 20/20/40, upward shadow, 32px r10 close, 9px brand + Archivo 12px ORBITAL, plain 16px/400 rows, 20% + 4px-blur scrim — the clone's r28/pill-row/downward-shadow sheet (with a duplicate built-in close) rebuilt to match.
   - Micro-rhythms: wizard form gaps 15/23/22, check-in h2 lh 16 + 12px/0.96 label, login 14px labels + 20px block gaps, settings AI-Tone gap 18, activity hero mb 2 / row detail mt 3.
   - Two VLM readings disproven by computed styles (team empty icons ARE #B3B3B3 via SVG stroke; mobile tab icons match) — the noise rules held.
4. **TDD (red → green)** — `calendar.test.ts` rewritten first (dynamic rows: Sep 2026 = 5×7, Aug 2026 = 6×7, Jan 2027, leap Feb 2024); then `monthGrid` changed to `ceil((offset + days)/7)` weeks. 122/122 held (one spec replaced).
5. **Implementation** — WS-1..WS-10 of the plan: calendar, goals + goal-detail + activity rhythms, the dialog two-system split (base r20 + `.orb-btn-submit`/`.orb-btn-cancel-std` + 30px r8 close; goal-edit 480; invite 384), the shared Input at 36px, wizard rhythm + `px-[18px]!` (the Button base's `:has()` specificity bump beats custom classes), check-in label/h2/Post-Update, login rhythm, settings gap, date-picker popover (centered/downward/16-18 pad/raised chevrons), MORE sheet rebuild (+ `showCloseButton`/`overlayClassName` props on SheetContent).
6. **Verification** — full gate green (lint 0 · typecheck 0 · 122/122 unit · build clean · 30/30 smoke); re-probes closed every touched surface to 0–2px: goals card 166=166px, wizard wrapper 551 vs 552, date picker 5 rows = 5 rows centered-downward, MORE sheet [0,541,390,303] identical, add-task panel/butttons/inputs identical, login card 746=746, check-in label 12/0.96/18/12 exact, footer y 763=763. 14 README screenshots regenerated; VLM sanity pass run (its "card width" claim disproven by the probe — both 1072px at x=316).

## Outcome

- Every measured surface now matches the live reference within 0–2px (content-height rounding or sub-pixel), with the dialog/button/date-picker/MORE-sheet systems rebuilt on fresh measurements.
- Docs aligned to v2.0 (README, AGENTS.md, CLAUDE.md, PAD revision block); this log; the plan kept as `docs/parity-remediation-v2.0.md`.

## Artifacts

- `docs/parity-remediation-v2.0.md` · updated `src/lib/calendar.ts` + `calendar.test.ts` (dynamic rows) · `ui/dialog.tsx` / `ui/sheet.tsx` / `ui/input.tsx` / `ui/date-picker.tsx` (base systems) · `globals.css` (`.orb-btn-submit` / `.orb-btn-cancel-std`, `.orb-btn-dark` gap 6, `.orb-btn-post` pad 0/12) · view + dialog rhythm fixes across `goals-view` / `goal-detail-view` / `activity-view` / `settings-view` / `new-goal-dialog` / `task-detail-dialog` / `login-screen` / `add-task` / `goal-edit` / `task-edit` / `invite-member` / `orbital-app` (MORE sheet) · refreshed `docs/screenshots/*.png`
