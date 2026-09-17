---
IMPORTANT: File is read fresh for every conversation. Be brief and practical.
project_type: nextjs
version: 1.0.0
framework_version: "16.1"
last_updated: 2026-09-17
---

# ORBITAL — AI Project Management Workspace

Self-hosted project management workspace where teams define goals and an AI agent drafts their task plans. Single-page Next.js application with cookie-session auth, Prisma/SQLite persistence, and a typed JSON API. Maintained by Pete A (`pete@pop-os`).

**Tech Stack**: Next.js 16.1 (App Router, standalone output), React 19, TypeScript 5 (strict), Tailwind CSS 4, shadcn/ui (Radix), Zustand 5, Prisma 6 + SQLite, z-ai-web-dev-sdk (server-side LLM), Vitest 5 (unit tests), lucide-react.

## Core Identity & Purpose

ORBITAL is a faithful clone of the reference Base44 project-management app, rebuilt as one deployable Next.js unit. The domain model is deliberately small — Goals → Tasks → TaskUpdates, with People/TeamMembers for assignment, an ActivityLog that narrates every mutation, and singleton WorkspaceSettings. The product promise: describe a goal, get a planned, assigned, scheduled task list, then track it to done through check-ins.

## Foundational Principles

### Meticulous Approach (Six-Phase Workflow)

1. **ANALYZE** — Read the existing view/dialog/route you are touching plus its store action. The Zustand store is the single source of client truth; changes ripple through refresh calls.
2. **PLAN** — Map the change across the four layers it will touch: schema (`prisma/schema.prisma`) → route handler (`src/app/api/…`) → domain types (`src/lib/orbital.ts` / pure lib modules) → store action + view/dialog.
3. **VALIDATE** — Confirm the plan preserves the API envelope and the activity-feed invariant before coding. Pure logic goes in `src/lib/*.ts` with a Vitest test — write the failing test first.
4. **IMPLEMENT** — One layer at a time; keep the build green (`bun run build`) between layers.
5. **VERIFY** — Run the full gate: `bun run lint && bun run typecheck && bun run test && bun run build && ./scripts/smoke-test.sh` (61 unit + 30 smoke checks required).
6. **DELIVER** — Conventional Commit on `main`, push via the SSH wrapper runbook.

### Project-Specific Principles

- **The SPA stays single-page with path URLs.** View switching is client-side; `/goals/<id>`, `/my-tasks`, … are rewrites onto the one page (`src/lib/router.ts`) — never add per-view routes or change the URL shape.
- **Every mutation narrates itself.** An API change without its `ActivityLog` write is incomplete.
- **The AI features may degrade, never fail.** `clarify` (wizard questions) and `generate-tasks` fall back to deterministic outputs; preserve that guarantee when touching them.
- **No new state libraries.** Server state flows through the Zustand store's refresh pattern.
- **Test at the pure seams.** Router mapping, clarify questions, plan sanitization, check-in mapping, auth rate limiting and team-form normalization live in `src/lib/*.ts` with Vitest specs — TDD (red → green) is the default for changes there.
- **Auth endpoints are rate-limited; auth navigation uses `router.refresh()`.** 10 attempts/IP/15 min on login + register (`429 RATE_LIMITED`); login success and Log Out swap the shell via a server session re-resolve, never `window.location` assignments.

## Implementation Standards

### Next.js 16 Specifics

- App Router; `src/app/page.tsx` is the only page and is `force-dynamic` (session check server-side, then client handoff). The view paths (`/goals`, `/goals/:goalId`, `/my-tasks`, `/activity`, `/team`, `/settings`) are `rewrites()` in `next.config.ts` onto `/` — keep them in sync with `src/lib/router.ts`.
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

- App palette = `orb-*` utilities, defined as CSS variables in `src/app/globals.css` (`--orb-canvas`, `--orb-card`, `--orb-green`, `--orb-purple`, `--orb-coral`, …) and mapped via `@theme inline`.
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

- **Unit layer** (`bun run test`, Vitest): 61 checks pinning the pure domain seams — `src/lib/router.test.ts` (view ↔ path mapping incl. legacy `?view=` links), `clarify.test.ts` (wizard questions: fallback + LLM bounds), `domain.test.ts` (plan sanitizer, template fallback, check-in status mapping), `rate-limit.test.ts` (fixed-window buckets, eviction, retry-after), `team.test.ts` (email → display-name derivation, agent-field normalization).
- **End-to-end smoke suite** (`scripts/smoke-test.sh`): boots the production standalone server and runs 30 checks — health, auth (valid/invalid/unauthenticated), all read endpoints, task create, invalid-status rejection, check-in round-trip (status flip + update recorded), delete, logout invalidation, page render, path-route serving (`/goals`, `/goals/<id>`, `/my-tasks`, `/activity`, `/team`, `/settings` + 404 guard), the clarify endpoint (3 questions + validation), team validation (invalid email, agent without name), and the login rate limit (429 `RATE_LIMITED`). Exits non-zero on failure.
- **Pre-push gate** (mandatory, no CI exists): `bun run lint && bun run typecheck && bun run test && bun run build && ./scripts/smoke-test.sh`.
- Manual QA matrix: every changed dialog must be exercised in both desktop and mobile layouts (bottom tab bar + MORE sheet below `lg`).

## Code Quality Standards

```bash
bun run lint        # must exit 0 with no errors
bun run typecheck   # must exit 0 (the build won't catch type errors)
bun run test        # 61 unit checks must pass
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
