---
IMPORTANT: File is read fresh for every conversation. Be brief and practical.
project_type: nextjs
version: 1.0.0
framework_version: "16.1"
last_updated: 2026-09-17
---

# ORBITAL — AI Project Management Workspace

Self-hosted project management workspace where teams define goals and an AI agent drafts their task plans. Two-route Next.js SPA (workspace page + `/login`) with cookie-session auth, Prisma/SQLite persistence, and a typed JSON API. Maintained by Pete A (`pete@pop-os`).

**Tech Stack**: Next.js 16.1 (App Router, standalone output), React 19, TypeScript 5 (strict), Tailwind CSS 4, shadcn/ui (Radix), Zustand 5, Prisma 6 + SQLite, z-ai-web-dev-sdk (server-side LLM), Vitest 5 (unit tests), lucide-react.

## Core Identity & Purpose

ORBITAL is a faithful clone of the reference Base44 project-management app, rebuilt as one deployable Next.js unit. The domain model is deliberately small — Goals → Tasks → TaskUpdates, with People/TeamMembers for assignment, an ActivityLog that narrates every mutation, and singleton WorkspaceSettings. The product promise: describe a goal, get a planned, assigned, scheduled task list, then track it to done through check-ins.

## Foundational Principles

### Meticulous Approach (Six-Phase Workflow)

1. **ANALYZE** — Read the existing view/dialog/route you are touching plus its store action. The Zustand store is the single source of client truth; changes ripple through refresh calls.
2. **PLAN** — Map the change across the four layers it will touch: schema (`prisma/schema.prisma`) → route handler (`src/app/api/…`) → domain types (`src/lib/orbital.ts` / pure lib modules) → store action + view/dialog.
3. **VALIDATE** — Confirm the plan preserves the API envelope and the activity-feed invariant before coding. Pure logic goes in `src/lib/*.ts` with a Vitest test — write the failing test first.
4. **IMPLEMENT** — One layer at a time; keep the build green (`bun run build`) between layers.
5. **VERIFY** — Run the full gate: `bun run lint && bun run typecheck && bun run test && bun run build && ./scripts/smoke-test.sh` (122 unit + 30 smoke checks required).
6. **DELIVER** — Conventional Commit on `main`, push via the SSH wrapper runbook.

### Project-Specific Principles

- **The workspace stays a single-page app with path URLs; `/login` is the only other route.** View switching is client-side; `/goals/<id>`, `/my-tasks`, … are rewrites onto the one page (`src/lib/router.ts`) — never add per-view routes or change the URL shape. Unauthenticated visits render the shell with a LOG IN header button (nullable-user pattern); `/login` is a real route (excluded from rewrites) with sign-in / sign-up / forgot states and `?from_url=` return handling.
- **Every mutation narrates itself.** An API change without its `ActivityLog` write is incomplete.
- **The AI features may degrade, never fail.** `clarify` (wizard questions) and `generate-tasks` fall back to deterministic outputs; preserve that guarantee when touching them.
- **No new state libraries.** Server state flows through the Zustand store's refresh pattern.
- **Test at the pure seams.** Router mapping, clarify questions, plan sanitization, check-in mapping, auth rate limiting, team-form normalization, the dashboard's next-planned-action derivation, the logo dot geometry, the date-picker calendar grid + long date format (`formatLongDate`), the activity feed's date grouping (`groupActivityByDate`), the activity type-tag mapping (`activityTypeTag`), the dashboard greeting boundaries (`greetingFor` — 05:00/12:00/18:00), the date-fns long-form distance (`formatDistance`/`relativeTime`), and the date-card photo rotation (`dayImageFor` in `src/lib/day-image.ts` — 5/11/17/21 hour boundaries) live in `src/lib/*.ts` (or `logo.tsx`/`orbital.ts`) with Vitest specs — TDD (red → green) is the default for changes there.
- **Deletes confirm inline, not in modals.** Goal cards, the goal-detail header, and task cards swap their action icons for inline confirm pairs ("Delete / Cancel", "Yes, Delete / Cancel", "Delete? Yes / No") — the reference pattern; `AlertDialog` confirms were removed in v1.3.
- **Auth endpoints are rate-limited; auth navigation uses `router.refresh()`.** 10 attempts/IP/15 min on login + register (`429 RATE_LIMITED`); login success and Log Out swap the header (UserMenu ↔ LOG IN) via a server session re-resolve, never `window.location` assignments. "Continue with Google" renders for parity but degrades to a toast — no OAuth credentials in a self-hosted clone (documented deviation).
- **The visual system is neumorphic (measured, v1.4–v1.7) with THREE card tiers.** Tokens and primitive classes in `globals.css`: `.orb-raised` / `.orb-raised-lg` / `.orb-raised-btn` / `.orb-well` / `.orb-well-pill` / `.orb-task-blocked` / `.orb-btn-dark` / `.orb-btn-post` / `.orb-btn-cancel` / `.orb-pill-round` / `.orb-pill-outline-sm` / `.orb-row-card` (deeper r14) / `.orb-goal-card` (deeper r16) / `.orb-panel` (large r16). Tiers (measured on the live app): standard pair `-5px 0.78` (buttons), deeper pair `-5px 0.92` (row cards), large pair `-8px 0.31` (view panels). **Labels are a two-tier system (v1.7): `.orb-label` 11px/600/ls 1.1px `#6E6E6E`; `.orb-label-sm` 10px/600/ls 1.2px `#767676`. The destructive red is `#BD3228`. Never pair an arbitrary `shadow-[…]`, `rounded-*`, or `h-*` utility with a custom class that sets that property** (`.orb-card`/`.orb-raised`/`.orb-btn-*`/`.orb-pill-*`) on the same element — custom layer classes are emitted after generated utilities and win the cascade; use a dedicated custom class for overrides (`.orb-task-blocked`, `.orb-btn-post`, `.orb-pill-outline-sm` exist for exactly this).
- **In-dialog primary submits are dark charcoal pills** (`#3A3A3A`/`#2F2823` bg + near-white text, pad 9/18, r10); page-level actions stay neumorphic raised. Dialogs sit on a blurred warm scrim (`rgba(46,42,38,0.25)` + 12px backdrop blur — the wizard's is 0.3); base panels are radius 16 with ONLY the neumorphic pair; the New Goal wizard is a 680px r24 conversational wrapper (32px bot avatar + speech bubble above the 624px r16 form panel, 32px r9 close square). The shell clamps all main content to `max-w-[1200px]` over a canvas washed with a fixed purple radial glow; don't add per-view max-widths. The dashboard is a 2×2 grid (date card + 180px CSS-circle ring card (p-6) | stats panel with CENTERED columns (pad-10 inner blocks, 50.4px/300 numerals, 12px `#665F57` subs, 16px gap); activity + goals below — 20px gaps, `.orb-panel` tier, activity card p-0 with full-width rows (30px solid icon circles, 12px icon gap, lh 20/18, timestamp in-row) and the 10px small-label "Next Planned Action" + 13px value, goals card p 20/18/0 with header mb 20, inset-well rows (13px/500 titles, 11px meta, 14px/500 ring pct) + 60px rings); the greeting is 28px/leading-1.2 Title Case with a period. The check-in modal is 448px/radius 16 while form dialogs stay 500px/radius 20 (h2 16px/500, 16px Send icon). Task cards are flat radius-14 deeper-tier rows (p 14/18, gray 11px status chip + dot, 14px/500 titles (`#BD3228` when blocked), 12px one-line descriptions, 11px meta, solid AI chip) with 26px action squares pinned outside the card, 2px apart. My Tasks ships five filter tabs (no Need Help; ls 0.72px 600-weight chips, pad 7/14); empty states render directly on the canvas with a plain `#B3B3B3` icon and 15px/400 title. The desktop sidebar is STICKY (aside top-0, height viewport−40px; the `.orb-raised-lg` panel owns the padding; compact 13px/600 brand, `.orb-label-sm` sections, 39px nav rows, plain Tasks Status link with 11px/700 numbers beside the 80px clock). The activity feed carries an inset-well "Online · N" pill, a 36px-icon hero card with the "Last agent action" caption, and 10px/600 `#B3B3B3` type tags on every group row. Mobile is FULL-BLEED below `lg` (no canvas padding, content ~22px): app bar (logo + user pill, 62px) + a FULL-WIDTH bottom-attached tab bar (`rounded-t-[20px]`, upward shadow, 20px icons, 9px/600 labels, color-only active state — NOT the v1.6 floating pill) + side-by-side 150px hero cards.

## Implementation Standards

### Next.js 16 Specifics

- App Router; `src/app/page.tsx` (force-dynamic) passes a **nullable user** to the client shell — the workspace renders for unauthenticated visitors with empty states + LOG IN; `src/app/login/page.tsx` is a real route rendering the `LoginCard`. The view paths (`/goals`, `/goals/:goalId`, `/my-tasks`, `/activity`, `/team`, `/settings`) are `rewrites()` in `next.config.ts` onto `/` — keep them in sync with `src/lib/router.ts`; `/login` must stay excluded from the rewrites.
- All server logic lives in route handlers under `src/app/api/`; there are no server actions.
- Client components are explicit: `orbital-app.tsx`, all views, dialogs, and the store carry `"use client"`.
- `next/font` loads DM Sans / DM Mono; do not import fonts any other way.
- `next.config.ts` pins `outputFileTracingRoot` — keep it; standalone deploys depend on it.
- Background/decorative images use plain `<img>` with `alt=""` + `aria-hidden` (deliberate; ESLint rule is off for this case).

### TypeScript Standards

- `strict: true` with `noImplicitAny: false` (intentional sandbox default).
- Domain types and DTOs are centralized in `src/lib/orbital.ts` — add new ones there, not ad-hoc in components.
- Route handlers cast parsed bodies to typed shapes and validate manually (trim, length caps, enum membership, existence checks). Follow that style; do not introduce Zod halfway.

### Tailwind CSS 4 + shadcn/ui

- App palette = `orb-*` utilities, defined as CSS variables in `src/app/globals.css` (neumorphic tokens: `--orb-canvas` `#EBE7E2`, `--orb-raised` `#EEEAE6`, `--orb-well` `#EBE7E2`, `--orb-track` `#DDD8D0`, plus the status colors) and mapped via `@theme inline`.
- `tailwind.config.ts` is legacy support for shadcn/ui HSL tokens and `tailwindcss-animate` — extend the CSS variables, not new config keys.
- Use shadcn primitives from `src/components/ui/` before writing bespoke UI; bespoke styling is the exception.

## Development Workflow

### Environment Setup

```bash
bun install
cp .env.example .env
bun run db:push
bun run db:seed
bun run dev          # http://localhost:3000 — demo@orbital.app / Demo1234!
```

### Build Commands

| Command | Purpose |
|---------|---------|
| `bun run dev` | Development server (port 3000, logs to `dev.log`) |
| `bun run build` | Production build + standalone assembly |
| `bun run start` | Serve the standalone build (must run from repo root) |
| `bun run lint` | ESLint (flat config) |
| `bun run typecheck` | `tsc --noEmit` — the build sets `ignoreBuildErrors`, so this is the type gate |
| `bunx prisma generate` | Regenerate client after schema edits |
| `bun run db:push` | Apply schema to SQLite (no migrations folder) |
| `bun run db:seed` | Idempotent demo data reset |

## Testing Strategy

- **Unit layer** (`bun run test`, Vitest): 122 checks pinning the pure domain seams — `src/lib/router.test.ts` (view ↔ path mapping incl. legacy `?view=` links), `clarify.test.ts` (wizard questions: fallback + LLM bounds), `domain.test.ts` (plan sanitizer, template fallback, check-in status mapping), `rate-limit.test.ts` (fixed-window buckets, eviction, retry-after), `team.test.ts` (email → display-name derivation, agent-field normalization), `next-action.test.ts` (dashboard next-planned-action extraction incl. the name-prefix regression), `logo-geometry.test.ts` (six-dot ring + 1-2-3 pyramid geometry), `calendar.test.ts` (month-grid math: boundaries, leap February, 6-row invariant, `isSameDay`; `formatLongDate` ordinals: 1st/2nd/3rd, 11th–13th, 21st/22nd/23rd, all twelve months), `activity-groups.test.ts` (feed date grouping: order, labels, midnight boundaries, "Today"), `activity-tags.test.ts` (feed type-tag mapping: underscores → spaces, unknown passthrough), `greeting.test.ts` (dashboard greeting: Title Case strings, 05:00/12:00/18:00 boundaries — the small hours greet evening), `relative-time.test.ts` (date-fns long-form distance: minute/hour/day/month/year bands, calendar-months path, singular/plural), `day-image.test.ts` (date-card photo rotation: four lighting variants, 5/11/17/21 boundaries, small hours = night).
- **End-to-end smoke suite** (`scripts/smoke-test.sh`): boots the production standalone server and runs 30 checks — health, auth (valid/invalid/unauthenticated), all read endpoints, task create, invalid-status rejection, check-in round-trip (status flip + update recorded), delete, logout invalidation, page render, path-route serving (`/goals`, `/goals/<id>`, `/my-tasks`, `/activity`, `/team`, `/settings` + 404 guard), the clarify endpoint (3 questions + validation), team validation (invalid email, agent without name), and the login rate limit (429 `RATE_LIMITED`). Exits non-zero on failure.
- **Pre-push gate** (mandatory, no CI exists): `bun run lint && bun run typecheck && bun run test && bun run build && ./scripts/smoke-test.sh`.
- Manual QA matrix: every changed dialog must be exercised in both desktop and mobile layouts (full-width bottom tab bar + app bar + MORE sheet below `lg`).

## Code Quality Standards

```bash
bun run lint        # must exit 0 with no errors
bun run typecheck   # must exit 0 (the build won't catch type errors)
bun run test        # 101 unit checks must pass
bun run build       # must compile clean
```

- No `TODO`/`FIXME`/placeholder text in shipped code (form `placeholder=` attributes are fine).
- Comments explain *why*, especially in `db.ts` (URL normalization) and `generate-tasks` (fallback logic).

## Git & Version Control

- **Branching**: `main` only — no feature branches.
- **Commits**: Conventional Commits with emoji prefixes — `:art: feat: …`, `:memo: docs: …`, `:bug: fix: …`. Atomic, one logical change each.
- **Identity**: `Pete A <pete@pop-os>`.
- **Push**: SSH wrapper from repo root — `python3 docs/ssh_git_wrapper_v3.py --key-file <key-outside-repo> --remote git@github.com:nordeim/project-management.git` (runbook: `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`).
- **Never commit**: `.env`, `*.key`, `db/*.db`, screenshots of the reference app beyond `docs/screenshots/`.

## Error Handling & Debugging

- **Server**: every handler returns the envelope — `ok(data, status)` or `fail(code, message, status)`. Never throw across a handler boundary.
- **Client**: the store's `call()` converts failures into destructive toasts and returns `null`; actions treat `null` as "abort silently" — never re-throw into render.
- **Debugging**: `bun run dev` tails `dev.log`; production logs to `server.log`. Prisma queries log in dev, errors only in production (`src/lib/db.ts`).
- **Common failure**: `Error code 14: Unable to open the database file` = server started outside the repo root. Restart via npm scripts.

## Communication & Documentation

- `README.md` = user-facing entry; `Project_Architecture_Document.md` = engineering reference; this file = agent contract; `AGENTS.md` = compact operator notes.
- Update `src/lib/orbital.ts` metadata (labels/colors) whenever a status vocabulary changes, and reflect API changes in the README endpoint table.

## Project-Specific Standards

### Architecture

Four layers, strictly downward: schema → route handlers → domain types/DTOs + pure lib modules → store + views. Views never fetch directly; they read the store and call its actions. Pure domain logic (routing, clarify, sanitization, check-in mapping) lives in `src/lib/*.ts` with unit tests — route handlers stay thin DB wrappers.

### API Design

REST-ish resource routes under `/api` (auth, goals, clarify, tasks, team, activity, stats, settings, health). Filters via query params (`assignee=me`, `status=`, `goal=`). Validation is manual and returns `400` with a specific code; unknown ids return `404`; auth gaps return `401`. Generating tasks for an already-planned goal returns `409 ALREADY_PLANNED`. The wizard's clarify endpoint accepts a goal draft (`title`, optional `description`) and returns three questions; `generate-tasks` accepts optional `answers` from that step to sharpen the plan.

### Data Layer

Prisma + SQLite at `db/custom.db` (gitignored; recreate with `db:push` + `db:seed`). Eight models; `Task.goal` cascades on goal delete; `Task.assignee` nulls on person delete. `TeamMember` carries optional `description`/`instructions` for AI agents (v1.2). `WorkspaceSetting` is a fixed `singleton` row.

### Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | SQLite file; relative paths resolve against `prisma/` | `file:../db/custom.db` |
| `AUTH_SECRET` | HMAC session secret — **required in production** | `openssl rand -hex 32` |

## Anti-Patterns to Avoid

- Adding per-view `app/` routes or changing the URL shape (breaks the SPA contract; the rewrite list in `next.config.ts` and `src/lib/router.ts` must stay in sync).
- Bypassing the store with ad-hoc `fetch` in components.
- Constructing `PrismaClient` anywhere but `src/lib/db.ts`.
- Letting `clarify` or `generate-tasks` hard-fail when the SDK is unavailable.
- Skipping the `ActivityLog` write in a mutating endpoint.
- Mixing the three status vocabularies (task vs goal vs check-in).
- Inlining logic that belongs in a tested `src/lib` seam.
