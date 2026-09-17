# ORBITAL — AI Project Management Workspace

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-6-2d3748?logo=prisma)
![SQLite](https://img.shields.io/badge/DB-SQLite-003b57?logo=sqlite)

A production-grade project management workspace where humans and AI agents plan goals together — a faithful, self-hosted clone of the reference app, rebuilt as a single Next.js application with cookie-session auth, an AI task planner, and a full activity feed.

## Overview

ORBITAL lets a team describe **goals** in natural language, then generates a concrete **task plan** for each goal — assigned across the team, spread over the timeline, and tracked through status check-ins. Every action lands in an **agent activity feed**, so the workspace itself narrates what the plan is doing. The app is a single-route SPA (like the original): one page, client-side view switching, deep-linkable URLs, with all persistence behind typed JSON API routes and a Prisma/SQLite store.

## Key Features

| Feature | Description |
|---------|-------------|
| 🎯 **Goals with AI task planning** | Three-step conversational wizard: describe the goal → answer the agent's clarifying questions → get a 6–9 task plan (LLM via `z-ai-web-dev-sdk`, deterministic fallback — never hard-fails) |
| ✅ **Task lifecycle** | Five task statuses (pending / in progress / blocked / need help / done), deadlines, assignees, estimated hours, AI-attribution badge |
| 💬 **Status check-ins** | Post on-track / blocked / need-help / done updates with notes; updates history on every task |
| 📊 **Dashboard** | Greeting + date card, unified stats card, progress ring with faint done state, tasks-status panel, recent agent activity |
| 👥 **Team of humans + AI agents** | Invite members by email with a role toggle, or configure AI agents with name, description and instructions; person directory drives assignment |
| 📜 **Agent activity feed** | Every mutation logs a typed, human-readable activity entry with full log view |
| 🔐 **Cookie-session auth** | scrypt password hashing + HMAC-signed sessions, per-IP rate limiting on login/register (429 with `Retry-After`), zero external auth dependencies |
| 🧭 **Path-based deep links** | Real URLs — `/goals/<id>`, `/my-tasks`, `/activity` — with working browser back/forward (single-page app under the hood) |
| 📱 **Responsive SPA** | Collapsible desktop sidebar with live analog clock; mobile bottom tab bar (Home / Goals / My Tasks / Agent / More) with a More sheet |
| 🌱 **One-command demo data** | Idempotent seed mirrors the reference workspace (3 goals, 31 tasks, 22 activity entries) |

## Screenshots

| Dashboard | Goals |
|:---:|:---:|
| ![Dashboard](docs/screenshots/01-dashboard.png) | ![Goals](docs/screenshots/02-goals.png) |

| Goal detail (AI-generated plan) | Task check-in |
|:---:|:---:|
| ![Goal detail](docs/screenshots/03-goal-detail.png) | ![Task dialog](docs/screenshots/04-task-dialog.png) |

| My Tasks | Agent activity |
|:---:|:---:|
| ![My Tasks](docs/screenshots/07-my-tasks.png) | ![Activity](docs/screenshots/08-activity.png) |

| Team | Settings |
|:---:|:---:|
| ![Team](docs/screenshots/09-team.png) | ![Settings](docs/screenshots/10-settings.png) |

<details>
<summary>Mobile</summary>

| Dashboard | Goals | Menu |
|:---:|:---:|:---:|
| ![Mobile dashboard](docs/screenshots/13-mobile-dashboard.png) | ![Mobile goals](docs/screenshots/11-mobile-goals.png) | ![Mobile menu](docs/screenshots/12-mobile-menu.png) |

</details>

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Web framework | Next.js (App Router) | 16.1 | Server page shell + 16 API route handlers |
| UI runtime | React | 19 | Component model |
| Language | TypeScript | 5 (strict) | Type safety end-to-end |
| Styling | Tailwind CSS | 4 | Utility styling + design tokens |
| Components | shadcn/ui on Radix | — | Accessible primitives (dialog, select, radio, …) |
| State | Zustand | 5 | Single client store; server state via fetch + refresh |
| Unit tests | Vitest | 5 | Pure domain seams: router, clarify questions, plan sanitizer, check-in mapping, rate limiter, team forms |
| ORM | Prisma | 6 | Schema, client, `db push`, seed |
| Database | SQLite | — | Zero-config local persistence (`db/custom.db`) |
| Auth | Node `crypto` (scrypt + HMAC) | — | Cookie sessions, no external auth service |
| AI | z-ai-web-dev-sdk | 0.0.x | Server-side task-plan generation |
| Icons | lucide-react | 0.5.x | Icon set |
| Runtime | Bun (or Node ≥ 20) | — | Dev server, scripts, TS execution |

## Architecture

```mermaid
flowchart LR
    B[Browser<br/>single-page app] -->|GET / · /goals · /my-tasks …| P["Next.js page (server component)<br/>session check — view paths rewritten to /"]
    P -->|user| B
    B -->|fetch JSON| A["API route handlers<br/>/api/* (16 routes)"]
    A -->|Prisma Client| D[("SQLite<br/>db/custom.db")]
    A -->|server-side| Z[z-ai-web-dev-sdk<br/>clarify questions + task plans]
    B -->|Zustand store| B
```

The page at `/` resolves the session once and hands off to the client app. All data flows through the Zustand store, which calls the API routes and unwraps the `{ ok, data } | { ok, error }` envelope. Views live at **real paths** (`/goals`, `/goals/<id>`, `/my-tasks`, `/activity`, `/team`, `/settings`) — Next.js rewrites map them onto the single page, and the store syncs view state with the History API (`src/lib/router.ts`), so every screen is deep-linkable and browser back/forward works. Same SPA architecture as the reference app.

## File Hierarchy

```
📂 prisma/
  📄 schema.prisma          # 8 models: User, Person, TeamMember, Goal, Task, TaskUpdate, ActivityLog, WorkspaceSetting
  📄 seed.ts                # Idempotent demo workspace seed
📂 public/
  📄 orbital-logo.svg       # Brand mark
  📄 dusk-hills.jpg         # Login/dashboard backdrop (OSS)
📂 scripts/
  📄 smoke-test.sh          # 30-check E2E suite + unit tests via `bun run test` (boots prod server)
📂 src/
  📂 app/
    📄 page.tsx             # Single route: session check → OrbitalApp | LoginScreen
    📄 layout.tsx           # DM Sans / DM Mono fonts, global styles
    📄 globals.css          # Tailwind 4 tokens + ORBITAL color palette
    📂 api/                 # 16 route handlers (auth, goals, tasks, team, activity, stats, settings, health)
  📂 components/
    📂 orbital/             # The application
      📄 orbital-app.tsx    # Authenticated shell: sidebar + view switcher + mobile tab bar
      📄 login-screen.tsx   # Sign-in / sign-up
      📄 store.ts           # Zustand store: all server state + actions
      📄 sidebar.tsx        # Desktop navigation (collapsible; clock + tasks status)
      📄 sidebar-clock.tsx  # Neumorphic analog clock (SVG, 15s tick)
      📄 sidebar-collapse.ts# Collapse state: useSyncExternalStore + localStorage
      📄 user-menu.tsx      # Avatar popover with Log Out
      📂 views/             # dashboard, goals, goal-detail, my-tasks, activity, team, settings
      📂 dialogs/           # new-goal (3-step wizard), goal-edit, add-task, task-edit, task-detail, invite-member
    📂 ui/                  # shadcn/ui component library
  📂 lib/
    📄 orbital.ts           # Domain types, DTOs, status metadata (labels + colors)
    📄 router.ts            # View ↔ path mapping (parseUrl / toPath) — unit tested
    📄 clarify.ts           # Wizard clarifying questions: LLM sanitizer + fallback — unit tested
    📄 plan-sanitizer.ts    # AI task-plan bounds + template fallback — unit tested
    📄 checkin.ts           # Check-in → task-status mapping — unit tested
    📄 rate-limit.ts        # Fixed-window per-IP auth throttling — unit tested
    📄 team.ts              # Invite/agent form normalization — unit tested
    📄 api.ts               # ok()/fail() envelope helpers + session guard
    📄 auth.ts              # scrypt hashing, HMAC session tokens, cookie handling
    📄 db.ts                # Prisma client + SQLite URL normalization
    📄 utils.ts             # cn() class merge
📄 docs/
  📂 screenshots/           # App screenshots used by this README
```

## Quick Start

Requires **Bun** (recommended) or **Node.js ≥ 20** with npm.

```bash
# 1. Install dependencies
bun install                # or: npm install

# 2. Configure environment
cp .env.example .env       # defaults are correct for local use

# 3. Create + seed the database
bun run db:push            # or: npx prisma db push
bun run db:seed            # or: npx tsx prisma/seed.ts

# 4. Start the dev server
bun run dev                # or: npm run dev
```

Open <http://localhost:3000> and sign in with the seeded demo account:

| Email | Password |
|-------|----------|
| `demo@orbital.app` | `Demo1234!` |

### Verify Setup

```bash
curl http://localhost:3000/api/health
# {"status":"ok","app":"orbital","ts":"…"}

# Full end-to-end verification (30 checks: auth, CRUD, validation, routing, rate limit, logout)
./scripts/smoke-test.sh    # builds must exist: run `bun run build` first
```

### Production

```bash
bun run build              # next build + standalone assembly
bun run start              # serves .next/standalone/server.js on :3000
```

## Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | SQLite connection string. Relative `file:` paths resolve against `prisma/` (CLI) and are normalized to absolute by `src/lib/db.ts` (runtime). | `file:../db/custom.db` |
| `AUTH_SECRET` | Production | HMAC secret for session cookies. Generate with `openssl rand -hex 32`. Falls back to an insecure dev constant when unset. | — |

## API Reference

All endpoints return `{ "ok": true, "data": … }` or `{ "ok": false, "error": { "code", "message" } }`. 🔒 = requires session cookie.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Liveness probe |
| `/api/auth/register` | POST | Create account (name, email, password) — rate-limited |
| `/api/auth/login` | POST | Sign in, sets session cookie — rate-limited (10 attempts/IP/15 min, then `429 RATE_LIMITED`) |
| `/api/auth/logout` | POST | Clear session |
| `/api/auth/me` | GET | Current user |
| `/api/stats` 🔒 | GET | Dashboard stats (totals, completion rate) |
| `/api/goals` 🔒 | GET / POST | List / create goals |
| `/api/goals/clarify` 🔒 | POST | Wizard step: AI clarifying questions for a goal draft (3 questions, deterministic fallback) |
| `/api/goals/[id]` 🔒 | GET / PATCH / DELETE | Goal detail (with tasks) / update / delete |
| `/api/goals/[id]/generate-tasks` 🔒 | POST | AI-generate a task plan for an empty goal (409 if already planned; accepts optional clarifying `answers`) |
| `/api/tasks` 🔒 | GET / POST | List (filters: `assignee=me\|<personId>`, `status`, `goal`) / create |
| `/api/tasks/[id]` 🔒 | GET / PATCH / ⚠️ DELETE | Task detail / update / delete |
| `/api/tasks/[id]/updates` 🔒 | POST | Post a status check-in (flips task status, logs activity) |
| `/api/team` 🔒 | GET / POST | People + members / invite member (email + role) or create AI agent (name + description + instructions) |
| `/api/activity` 🔒 | GET | Activity feed (latest 50) |
| `/api/settings` 🔒 | GET / PATCH | Workspace settings (name, working hours, ping frequency, AI tone) |

## Design System

| Token | Hex | Usage |
|-------|-----|-------|
| `--orb-canvas` | `#EBE7E2` | Page canvas behind the app panel |
| `--orb-surface` | `#F0EDE8` | App panel background |
| `--orb-card` | `#F8F5F1` | Elevated cards |
| `--orb-body` | `#2F2823` | Primary text |
| `--orb-muted` | `#6E6E6E` | Secondary text |
| `--orb-green` | `#2ECC8A` | Success / done / active |
| `--orb-purple` | `#996CE4` | In-progress / AI accents |
| `--orb-coral` | `#FF8077` | Blocked / destructive |

Typography: **DM Sans** (UI) and **DM Mono** (numeric/date accents), loaded via `next/font`. Status dots and text pair each palette color with a deeper accessible variant (`--orb-*-deep`).

## Testing

```bash
bun run test              # unit tests — 61 checks on the pure domain seams
./scripts/smoke-test.sh   # E2E — 30 checks against the production build
```

The unit layer (Vitest) pins the pure logic: path routing (`src/lib/router.ts`), the wizard's clarifying questions (`src/lib/clarify.ts`), the AI plan sanitizer + fallback (`src/lib/plan-sanitizer.ts`), the check-in status mapping (`src/lib/checkin.ts`), the auth rate limiter (`src/lib/rate-limit.ts`), and the team-form normalization (`src/lib/team.ts`).

The smoke suite boots the production standalone server, then runs **30 checks**: health, login (valid + wrong password + unauthenticated rejection), all six read endpoints, task creation, invalid-status rejection (400), status check-in round-trip (task status flips + update recorded), deletion, logout invalidation, page render, **path-route serving** (`/goals`, `/goals/<id>`, `/my-tasks`, `/activity`, `/team`, `/settings` — plus a 404 guard on unknown paths), the **clarify endpoint** (3 questions + validation), **team validation** (invite with invalid email, agent without a name), and the **login rate limit** (rapid-fire attempts earn `429 RATE_LIMITED`). It exits non-zero on any failure and cleans up after itself.

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `Error code 14: Unable to open the database file` | Server started from a directory other than the project root | Start via `bun run start` / `bun run dev` (npm scripts always run from the root) |
| `Is port 3000 in use?` | Stale dev/prod server | `pkill -f "next dev"` or `pkill -f "standalone/server.js"` |
| Login loops back to the sign-in screen | `AUTH_SECRET` changed between server restarts | Keep `AUTH_SECRET` stable in production |
| Login suddenly returns 429 | Per-IP rate limit engaged (10 attempts / 15 min) | Wait for the window to reset (see `Retry-After`) or restart the server to clear in-memory buckets |
| Prisma `P1003` / missing tables | Database not initialized | `bun run db:push && bun run db:seed` |
| AI generation returns a generic 8-step plan | SDK unavailable/malformed output — deterministic fallback engaged | Expected behavior; configure the SDK environment to get LLM plans |

## License

No license file is present in this repository; all rights are reserved by default. Add an explicit license before redistributing.
