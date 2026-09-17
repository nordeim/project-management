# ORBITAL Parity Remediation Plan v1.2

Evidence: fresh live-app crawl 2026-09-17 (`research/live-capture-s3/`, 21 captures + VLM analyses) + reference `docs/project-management-dashboard.png`. Every item below traces to a capture. TDD applies at the pure seams; everything else is verified by the gate (lint → 43+ unit → build → 27 smoke) + browser verification.

## WS-1 Sidebar parity (clock + desktop collapse)

- **1.1** New `src/components/orbital/sidebar-clock.tsx`: neumorphic analog clock (SVG face, thin black hour/minute hands, no numerals, white face, soft inner shadow). Updates every 15s. Sits LEFT of the TASKS STATUS card in a horizontal row (live: clock + status side by side at sidebar bottom).
- **1.2** Desktop collapse: chevron button bottom-center of sidebar (rotates 180° when collapsed). Collapsed = icon-only rail: labels hidden, section headers (WORKSPACE/MANAGEMENT) hidden, TASKS STATUS hidden, clock visible, logo mark visible. State in `localStorage` ("orbital-sidebar"). `orbital-app.tsx` aside width 264px ↔ ~76px.
- Files: `sidebar.tsx`, `orbital-app.tsx`, new `sidebar-clock.tsx`.

## WS-2 Logo redesign

- **2.1** `logo.tsx` LogoMark → 8 purple dots arranged in a ring (constellation), matching live mark. Update `public/orbital-logo.svg` + `public/logo.svg` (favicon) to match.

## WS-3 Dashboard visual parity

- **3.1** Stats: ONE unified card with three columns (ACTIVE GOALS / BLOCKED TASKS / COMPLETED TASKS), columns separated by whitespace (no dividers), each column clickable as before.
- **3.2** DONE card: large "84%" + "DONE" text with a FAINT ring (subtle track, no bold green fill).
- **3.3** Panel headers uppercase: "AGENT ACTIVITY" and "GOALS"; Goals panel link → "Full log" (not "View all").
- **3.4** NEW GOAL button (dashboard + goals): white bg, subtle border, dark text (not solid dark pill).
- **3.5** Next planned action copy: `Resolve blocker on "<task title>"` when a blocked task exists (from activity/stats), else ping copy.
- Files: `dashboard-view.tsx`, `progress-ring.tsx` (variant), `globals.css` (`.orb-pill-outline`).

## WS-4 Goals page card redesign

- **4.1** Card layout: status row top-left (ACTIVE · 2 BLOCKED ›, uppercase); title; horizontal green progress bar (rounded, ~67% fill); bottom-left meta "8/12 tasks · 67%" + date; right column: large "67%" with "8/12" beneath; edit/delete outline icon buttons always visible bottom-right.
- **4.2** Filter chips: active = plain strong text (no solid fill), inactive = lavender tint bg. Verify exact colors against capture 05.
- Files: `goals-view.tsx`.

## WS-5 Goal detail parity

- **5.1** Stats row → 2 cards: PROGRESS ("8/12 tasks done" + big %) and BLOCKED (count). "12 total" moves into the TASKS section header row ("TASKS" + count + ADD TASK inline right).
- **5.2** ADD TASK: inline with TASKS header, white-outline pill.
- **5.3** DELETE (header): white/light style with border (not coral fill).
- **5.4** Task cards: assignee shown with person-outline glyph (not colored initials bubble); edit/delete buttons always visible (top-right inside card).
- Files: `goal-detail-view.tsx`, `task-card.tsx`, `widgets.tsx`.

## WS-6 Team dialogs (functional parity)

- **6.1** Invite Member → Email (required) + Role Member/Lead toggle buttons; Send Invite disabled until valid email. Display name derived from email local part (pure seam).
- **6.2** New Agent → "Create AI Agent" title; NAME* / DESCRIPTION / INSTRUCTIONS (textarea); Create Agent. Schema: TeamMember += `description String?`, `instructions String?` (db push, no migrations). API `/api/team` POST accepts them; DTO + store extended; agent cards show description under name.
- **6.3** TDD seams: `src/lib/team.ts` — `deriveDisplayName(email)` + agent-field validation/normalization (red → green; extend `domain.test.ts` or new `team.test.ts`).
- Files: `invite-member-dialog.tsx`, `team-view.tsx`, `prisma/schema.prisma`, `src/app/api/team/route.ts`, `src/lib/orbital.ts`, `store.ts`.

## WS-7 Wizard copy + layout

- **7.1** Step-2 bubble: "Great! Before I break this into tasks, I have a few questions:" + "Clarifying Questions" label above the question list.
- **7.2** Footer buttons: CANCEL left-aligned, CONTINUE/GENERATE TASKS right (justify-between).
- **7.3** Avatar icons in wizard bubbles → Bot glyph (white circle w/ bot icon).
- Files: `new-goal-dialog.tsx`.

## WS-8 Settings layout

- **8.1** Two-column grid (lg+): left = Workspace card + Working Hours card; right = AI Assistant card. Save bar below.
- **8.2** White input backgrounds w/ subtle inner shadow; Title Case labels; "AI will only send pings during these hours" on its own line.
- Files: `settings-view.tsx`, `globals.css` if needed.

## WS-9 Code quality (PAD §10)

- **9.1** Rate limiting on `/api/auth/login` + `/api/auth/register` (HIGH): pure `src/lib/rate-limit.ts` (fixed-window per IP, in-memory) + Vitest spec FIRST; wire into both handlers (429 envelope `RATE_LIMITED`). Docs note: per-instance only (single-node deploy).
- **9.2** Prune unused deps (LOW): grep-verify each candidate (zod, framer-motion, @tanstack/react-query, @dnd-kit/*, next-auth, recharts, react-hook-form + resolvers, @mdxeditor/editor, react-markdown, react-syntax-highlighter, embla-carousel-react, input-otp, react-resizable-panels, sonner, vaul, next-intl, next-themes, @reactuses/core, uuid, date-fns, @tanstack/react-table, react-day-picker, sharp …) against `src/` usage (incl. shadcn `ui/` imports); remove only the truly unreferenced; `bun install` to regen lock; full gate after.
- **9.3** `prefers-reduced-motion` media query in `globals.css` (disable animations/transitions).

## WS-10 Docs alignment (after gate green)

- README (features, screenshots refs, stack table, endpoint notes if TeamMember fields change), AGENTS.md (facts: clock/collapse, rate limit, pruned deps, new test counts), CLAUDE.md (standards + seams list), PAD (v1.2 revision block, ADR-005/-008 notes, §10 statuses, §11 line counts). Smoke suite extended if new endpoints/behaviors warrant (rate-limit 429 check on rapid-fire login attempts).

## Execution order (dependencies)

1. WS-9.1 rate-limit seam (TDD) → wire handlers → smoke check
2. WS-6.3 team seam (TDD) → 6.1/6.2 dialogs + schema/API/DTO/store
3. WS-2 logo → WS-1 sidebar (clock + collapse) → WS-3 dashboard → WS-4 goals cards → WS-5 goal detail → WS-7 wizard → WS-8 settings
4. Full gate (lint/test/build/smoke) + browser re-verification + fresh screenshots
5. WS-9.2 dep prune → gate again
6. WS-10 docs → commits (`:art: feat:` code, `:memo: docs:` docs) → SSH-wrapper push

## Validation checklist (plan ↔ codebase, done before execution)

- [x] store.ts has `inviteMember` action to extend; members DTO in orbital.ts
- [x] sidebar.tsx/orbital-app.tsx are the only layout files for collapse wiring
- [x] globals.css owns `.orb-pill` / `.orb-card` primitives for new variants
- [x] schema.prisma TeamMember model is the single schema source (db push flow)
- [x] auth login/register handlers are thin — rate-limit guard slots in cleanly
- [x] dashboard/goals/goal-detail/settings views match the file map in PAD §11
