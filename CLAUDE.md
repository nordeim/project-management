---
IMPORTANT: File is read fresh for every conversation. Be brief and practical.
project_type: nextjs
version: 1.0.0
framework_version: "16.1"
last_updated: 2026-09-17
---

# ORBITAL — AI Project Management Workspace

Self-hosted project management workspace where teams define goals and an AI agent drafts their task plans. Single-page Next.js application with cookie-session auth, Prisma/SQLite persistence, and a typed JSON API. Maintained by Pete A (`pete@pop-os`).

**Tech Stack**: Next.js 16.1 (App Router, standalone output), React 19, TypeScript 5 (strict), Tailwind CSS 4, shadcn/ui (Radix), Zustand 5, Prisma 6 + SQLite, z-ai-web-dev-sdk (server-side LLM), lucide-react.

## Core Identity & Purpose

ORBITAL is a faithful clone of the reference Base44 project-management app, rebuilt as one deployable Next.js unit. The domain model is deliberately small — Goals → Tasks → TaskUpdates, with People/TeamMembers for assignment, an ActivityLog that narrates every mutation, and singleton WorkspaceSettings. The product promise: describe a goal, get a planned, assigned, scheduled task list, then track it to done through check-ins.

## Foundational Principles

### Meticulous Approach (Six-Phase Workflow)

1. **ANALYZE** — Read the existing view/dialog/route you are touching plus its store action. The Zustand store is the single source of client truth; changes ripple through refresh calls.
2. **PLAN** — Map the change across the four layers it will touch: schema (`prisma/schema.prisma`) → route handler (`src/app/api/…`) → domain types (`src/lib/orbital.ts`) → store action + view/dialog.
3. **VALIDATE** — Confirm the plan preserves the API envelope and the activity-feed invariant before coding.
4. **IMPLEMENT** — One layer at a time; keep the build green (`bun run build`) between layers.
5. **VERIFY** — Run the full gate: `bun run lint && bun run build && ./scripts/smoke-test.sh` (18/18 required).
6. **DELIVER** — Conventional Commit on `main`, push via the SSH wrapper runbook.

### Project-Specific Principles

- **The SPA stays single-route.** View switching is client-side with URL-synced state — never add per-view routes.
- **Every mutation narrates itself.** An API change without its `ActivityLog` write is incomplete.
- **The AI feature may degrade, never fail.** `generate-tasks` falls back to a deterministic template plan; preserve that guarantee when touching it.
- **No new state libraries.** Server state flows through the Zustand store's refresh pattern.

## Implementation Standards

### Next.js 16 Specifics

- App Router; `src/app/page.tsx` is the only page and is `force-dynamic` (session check server-side, then client handoff).
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
| `bunx prisma generate` | Regenerate client after schema edits |
| `bun run db:push` | Apply schema to SQLite (no migrations folder) |
| `bun run db:seed` | Idempotent demo data reset |

## Testing Strategy

- **End-to-end smoke suite** (`scripts/smoke-test.sh`): boots the production standalone server and runs 18 checks — health, auth (valid/invalid/unauthenticated), all read endpoints, task create, invalid-status rejection, check-in round-trip (status flip + update recorded), delete, logout invalidation, page render. Exits non-zero on failure.
- **Pre-push gate** (mandatory, no CI exists): `bun run lint && bun run build && ./scripts/smoke-test.sh`.
- Manual QA matrix: every changed dialog must be exercised in both desktop and mobile layouts (sidebar collapses to slide-over below `lg`).

## Code Quality Standards

```bash
bun run lint     # must exit 0 with no errors
bun run build    # must compile clean
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

Four layers, strictly downward: schema → route handlers → domain types/DTOs → store + views. Views never fetch directly; they read the store and call its actions.

### API Design

REST-ish resource routes under `/api` (auth, goals, tasks, team, activity, stats, settings, health). Filters via query params (`assignee=me`, `status=`, `goal=`). Validation is manual and returns `400` with a specific code; unknown ids return `404`; auth gaps return `401`. Generating tasks for an already-planned goal returns `409 ALREADY_PLANNED`.

### Data Layer

Prisma + SQLite at `db/custom.db` (gitignored; recreate with `db:push` + `db:seed`). Eight models; `Task.goal` cascades on goal delete; `Task.assignee` nulls on person delete. `WorkspaceSetting` is a fixed `singleton` row.

### Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | SQLite file; relative paths resolve against `prisma/` | `file:../db/custom.db` |
| `AUTH_SECRET` | HMAC session secret — **required in production** | `openssl rand -hex 32` |

## Anti-Patterns to Avoid

- Adding per-view `app/` routes (breaks the SPA contract).
- Bypassing the store with ad-hoc `fetch` in components.
- Constructing `PrismaClient` anywhere but `src/lib/db.ts`.
- Letting `generate-tasks` hard-fail when the SDK is unavailable.
- Skipping the `ActivityLog` write in a mutating endpoint.
- Mixing the three status vocabularies (task vs goal vs check-in).
