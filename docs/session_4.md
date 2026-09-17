# Session 4 — v1.3 Parity Remediation

Session start: workspace at `/home/z/my-project/project-management` clean and in sync with the remote (`main` @ `3f2eb76` — the v1.2 push verified live on GitHub via `git ls-remote`). Re-read all four docs (AGENTS, CLAUDE, README, PAD v1.2) and validated `docs/session_3.md` against the codebase by re-running the full gate: lint 0 · typecheck 0 · 61/61 unit · build clean (16 API routes) · 30/30 smoke — every claim held.

Fresh live-app crawl (`research/live-capture-s4/`, 24 captures, re-authenticated with the reference account): this round targeted the surfaces the earlier sessions had not yet captured — the Edit Task and Add Task dialogs, the task-detail modal, all three delete flows, the mobile inner views (goals, my-tasks, activity, team, settings, MORE sheet), the desktop team and my-tasks pages, and the login screen. Where VLM counts looked suspect (logo dots: 6, 7, 8, 9 across readings), I switched to programmatic pixel analysis — connected-component counting of purple blobs on high-resolution crops. That settled the facts:

- **Sidebar mark = six dots in a hexagonal ring** (12/2/4/6/8/10 o'clock). v1.2's "8-dot constellation" was a VLM miscount.
- **Login mark = six dots in a 1-2-3 pyramid** inside a white circle — a different arrangement from the sidebar's.
- The clone shipped 8 dots in both places.

Two more finds from the crawl: the reference app confirms every delete **inline** (goal card icons swap for "Delete / Cancel"; the goal-detail header swaps DELETE for "Delete goal & all tasks? · Yes, Delete | Cancel"; task card icons swap for "Delete? | Yes | No") — the clone was using centered `AlertDialog` modals on all three surfaces. And blocked task titles render in the alert red on the reference, with edit/delete icons on always-visible soft squares.

The crawl also surfaced a genuine text bug in the clone: the dashboard's NEXT PLANNED ACTION derived its copy with `String.replace(/ checked in on "(.+?)"/, "$1")`, which swaps only the matched span for the capture and leaves the person prefix in place — the dashboard literally read `Resolve blocker on "Shelly GenosarReview Q3 project milestones"`. Seeded data made it reproducible; the fix went in TDD-style: `src/lib/next-action.ts` (`nextPlannedAction`) with `next-action.test.ts` written red first (six checks incl. the name-prefix regression), then green with `String.match`.

Remediation plan v1.3 (`docs/parity-remediation-v1.3.md`), executed in full:

- **WS-1** next-action seam + regression spec (61 → 67 checks).
- **WS-2** logo geometry as pure helpers (`ringDotPositions` / `pyramidDotPositions`) with `logo-geometry.test.ts` (67 → 71); `LogoPyramid` for the login card; `public/orbital-logo.svg` + `logo.svg` regenerated as 6-dot rings.
- **WS-3** login copy: sentence-case labels, in-field envelope/padlock icons, "Sign in" Title Case submit, "OR" divider, `you@example.com` placeholder.
- **WS-4** task card: coral blocked titles; icon buttons on soft rounded squares.
- **WS-5** Add/Edit Task dialog headers stripped to plain titles.
- **WS-6** all three delete flows rebuilt as inline confirms (modals removed; the now-unconsumed vendored `alert-dialog.tsx` deleted — 12 → 11 ui primitives). The goals grid was also restructured so the clickable card area is a proper button (the old markup nested buttons inside buttons).
- **WS-7** task-detail modal assignee line simplified to plain "Assigned to: Name".
- **WS-8** mobile tab icons: HOME → `LayoutGrid`, MORE → `Menu`.

Verification: full gate green (lint 0 · typecheck 0 · **71/71** unit · build clean · 30/30 smoke), placeholder/mock sweep clean, and browser verification against the production standalone build with programmatic confirmation where it matters — the clone's sidebar logo now counts **6** dots and the login pyramid **6** (1-2-3), both matching the reference measurements; the dashboard reads `Resolve blocker on "Review Q3 project milestones"`; all three inline confirms render and cancel correctly (goal header buttons confirmed at mixed case "Yes, Delete / Cancel", matching a zoomed capture of the reference); blocked task title renders coral; mobile tab icons match (grid, target, checkbox, pulse, hamburger). Zero console errors across the flows.

Documentation aligned: AGENTS.md (71 checks, inline-confirm and brand-mark conventions), CLAUDE.md (VERIFY gate, seam list, inline-delete principle), README.md (features row, testing counts, lib entries), PAD → v1.3 (revision block, §3.2 tree incl. `next-action.ts`, §5.3/§5.4 corrected to the real 11 primitives and the v1.2 prune state, §7 testing at 7 files/71 checks, §10 unchanged, §11 line counts re-measured, glossary gains "Inline confirm").

Delivered as two commits on `main` (`:art: feat:` code + `:memo: docs:` docs), pushed through the SSH wrapper (`docs/ssh_git_wrapper_v3.py`) per the runbook in `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`.
