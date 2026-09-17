# ORBITAL Parity Remediation Plan v1.3

Evidence: fresh live-app crawl 2026-09-17 (`research/live-capture-s4/`, 24 captures + programmatic pixel analysis + VLM analyses), session re-authenticated against the reference app. Every item below traces to a capture or a pixel-level measurement. TDD applies at the pure seams (next-action derivation, logo geometry); everything else is verified by the gate (lint → typecheck → 61+ unit → build → 30 smoke) + browser verification.

## WS-1 Next-planned-action derivation bug (HIGH — visible text corruption)

- **1.1** Bug: `dashboard-view.tsx` derives the NEXT PLANNED ACTION with
  `blocked.message.replace(/ checked in on "(.+?)"/, "$1")` — `replace` swaps only the
  matched span for the capture, leaving the person prefix in place, so the dashboard renders
  `Resolve blocker on "Shelly GenosarReview Q3 project milestones"` instead of
  `Resolve blocker on "Review Q3 project milestones"`.
- **1.2** Fix (TDD): extract the derivation into a pure seam `src/lib/next-action.ts`
  (`nextPlannedAction(activity): string`), write the failing test first
  (`next-action.test.ts`: name-prefix regression, blocked extraction, fallback copy),
  then implement with `String.match`.
- Files: new `src/lib/next-action.ts` + `next-action.test.ts`; `dashboard-view.tsx` consumes it.

## WS-2 Logo dot geometry (measured, not guessed)

Pixel-level connected-component analysis of the live captures:
- **2.1** Sidebar mark = **6 dots in a hexagonal ring** (12/2/4/6/8/10 o'clock, 60° apart) —
  not the 8-dot ring shipped in v1.2 (VLM miscount then; programmatic count now: live 6 vs clone 8).
  `logo.tsx` LogoMark → 6 points on the circle.
- **2.2** Login mark = **6 dots in a 1-2-3 pyramid** inside a white circle with a light border —
  a distinct mark from the sidebar's ring. Add `LogoPyramid` export; `login-screen.tsx` uses it.
- **2.3** Unit-test the geometry (dot count + angle positions) at the pure seam.
- Files: `logo.tsx`, `login-screen.tsx`, new `logo.test.ts` (co-located with a pure dots helper).

## WS-3 Login screen copy & styling

- **3.1** Field labels sentence case: "Email" / "Password" (clone renders uppercase via `orb-label`).
- **3.2** Submit button Title Case "Sign in" — drop the `uppercase tracking` styling (live: "Sign in",
  dark navy pill).
- **3.3** Divider "OR" (clone: "or").
- **3.4** Email placeholder `you@example.com` (clone: `you@team.com`).
- **3.5** Envelope + padlock icons inside the email/password inputs (live has them).
- Files: `login-screen.tsx`.

## WS-4 Task card polish

- **4.1** Blocked task titles render in the coral/red text color (live: blocked card title is
  red `~#E53E3E`, all other statuses dark) — status-aware title color.
- **4.2** Edit/delete icon buttons carry a light-gray rounded-square background at rest
  (live: always-visible soft squares, not transparent-until-hover).
- Files: `task-card.tsx`.

## WS-5 Dialog header parity

- **5.1** Add Task / Edit Task titles: plain bold text, no leading icon-in-circle embellishment
  (live headers are plain "Add Task" / "Edit Task" with the circular X close button).
- Files: `add-task-dialog.tsx`, `task-edit-dialog.tsx`.

## WS-6 Inline delete confirmations (the reference pattern — no modals)

All three delete surfaces in the live app confirm INLINE, replacing the action icons:
- **6.1** Goal card (Goals view): bottom-right icons swap to "Delete" (solid red/coral pill,
  white text) + "Cancel" (ghost text button).
- **6.2** Goal header (Goal detail): DELETE swaps to "Delete goal & all tasks?" (grey text) +
  "Yes, Delete" (deep-red solid) + "Cancel" (ghost outline).
- **6.3** Task card (Goal detail): top-right icons swap to "Delete?" (small dark-grey label) +
  "Yes" (small red pill) + "No" (ghost text).
- Remove the three `AlertDialog` confirm modals; keep the same store `deleteGoal` / `deleteTask`
  actions and busy handling. Keyboard/ESC semantics: confirming is a click; the icons return on
  cancel.
- Files: `goals-view.tsx`, `goal-detail-view.tsx`, `task-card.tsx` (confirm state lifted to parent).

## WS-7 Task-detail modal copy

- **7.1** Assignee line: plain "Assigned to: Name" text (live has no avatar bubble in the modal).
- Files: `task-detail-dialog.tsx`.

## WS-8 Mobile tab bar icons

- **8.1** HOME → `LayoutGrid` (four squares; clone ships `LayoutDashboard`), MORE → `Menu`
  (three lines; clone ships `MoreHorizontal` dots). GOALS/MY TASKS/AGENT already match.
- Files: `orbital-app.tsx`.

## WS-9 Verification

- **9.1** Full gate: lint → typecheck → test (61 + new checks) → build → smoke (30).
- **9.2** Browser verification against the running standalone build: dashboard next-action copy,
  logo counts (programmatic), login screen, task card states, all three inline confirms
  (open + cancel), dialog headers. Side-by-side captures in `research/clone-capture-s4/`.
- **9.3** Placeholder/TODO/mock sweep.

## WS-10 Documentation alignment

- AGENTS.md / CLAUDE.md / README.md / PAD → v1.3 revision block (inline confirms, logo
  geometry, next-action seam + tests, login copy), §11 line counts re-measured,
  `docs/session_4.md` session log.
