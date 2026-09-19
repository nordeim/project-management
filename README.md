# ORBITAL — AI Project Management Workspace

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-6-2d3748?logo=prisma)
![SQLite](https://img.shields.io/badge/DB-SQLite-003b57?logo=sqlite)

A production-grade project management workspace where humans and AI agents plan goals together — a faithful, self-hosted clone of the reference app, rebuilt as a single Next.js application with cookie-session auth, an AI task planner, and a full activity feed.

## Overview

ORBITAL lets a team describe **goals** in natural language, then generates a concrete **task plan** for each goal — assigned across the team, spread over the timeline, and tracked through status check-ins. Every action lands in an **agent activity feed**, so the workspace itself narrates what the plan is doing. The app is a two-route SPA (like the original): a workspace page with client-side view switching and deep-linkable URLs, plus a real `/login` route — unauthenticated visitors browse the workspace shell with a **LOG IN** button in the header, and all persistence sits behind typed JSON API routes and a Prisma/SQLite store.

## Key Features

| Feature | Description |
|---------|-------------|
| 🎯 **Goals with AI task planning** | Three-step conversational wizard in a 680px chat-style wrapper (bot avatar + speech bubble above the form panel): describe the goal → answer the agent's clarifying questions → get a 6–9 task plan (LLM via `z-ai-web-dev-sdk`, deterministic fallback — never hard-fails) |
| ✅ **Task lifecycle** | Five task statuses (pending / in progress / blocked / need help / done), deadlines, assignees, estimated hours, AI-attribution badge |
| 💬 **Status check-ins** | Post on-track / blocked / need-help / done updates with notes; updates history on every task |
| 📊 **Dashboard** | 2×2 viewport-filling grid: date card (photo rotates by time of day — morning/noon/dusk/night) + inset DONE circle beside the stats panel, Agent Activity and Goals panels below — centered stat columns with big light 50px numerals, large-tier embossed cards on a 1200px clamped canvas with a soft purple glow |
| 🪝 **Sticky desktop sidebar** | The sidebar pins to the viewport (top 0, height viewport−40px) — the compact brand, analog clock and TASKS STATUS block stay visible while the main content scrolls |
| 👥 **Team of humans + AI agents** | Invite members by email with a role toggle, or configure AI agents with name, description and instructions; person directory drives assignment |
| 📜 **Agent activity feed** | Every mutation logs a typed, human-readable activity entry with date-fns-style long-form relative timestamps ("3 minutes ago", "2 months ago"); the full view groups entries under date labels ("Thu Jul 16 2026") as plain rows with hairline dividers, the latest entry as a hero card with a "Last agent action" caption, per-row type tags and an inset "Online · N" status pill |
| 🎨 **Neumorphic design system** | Measured three-tier token system from the reference — beige canvas `#EBE7E2`, standard/deeper/large embossed shadow pairs for buttons, row cards and view panels, inset wells for inputs/chips/clock, `#DDD8D0` progress tracks, a two-tier uppercase label typography (11px/600 panel labels, 10px/600 small labels), coral inset ring on blocked task cards and the darker `#BD3228` destructive red |
| 🔐 **Cookie-session auth** | scrypt password hashing + HMAC-signed sessions, per-IP rate limiting on login/register (429 with `Retry-After`), zero external auth dependencies |
| 🚪 **Reference auth flow** | Unauthenticated visits render the workspace shell with a LOG IN header button; `/login` is a real white-page route (slate card, rounded-square dot-pyramid logo) with sign-in / sign-up / forgot-password states and `?from_url=` return handling — "Continue with Google" renders for parity and degrades to an explanatory toast (no OAuth credentials in a self-hosted clone) |
| 🗑 **Inline delete confirms** | Deletes confirm in place — goal cards, the goal-detail header and task cards swap their action icons for confirm pairs (no modal interruption) |
| 🧭 **Path-based deep links** | Real URLs — `/goals/<id>`, `/my-tasks`, `/activity` — with working browser back/forward (single-page app under the hood) |
| 📱 **Responsive SPA** | Sticky collapsible desktop sidebar (240px ⇄ 64px icon rail) with live analog clock; mobile mirrors the reference's full-bleed chrome — a top app bar (logo + user pill), side-by-side date/ring hero cards at 150px, and a full-width bottom-attached tab bar (rounded top corners, upward shadow) with a MORE sheet |
| 🗓 **Custom date picker** | "Pick a deadline" well-style trigger opening a raised popover calendar (month chevrons, Su–Sa headers, 7×6 grid, today in bold purple) with the reference's long date format ("September 20th, 2026") — grid math and formatting live in a pure, unit-tested seam |
| 🕐 **Time-aware chrome** | The greeting switches at 05:00/12:00/18:00 (the small hours still say "Good Evening.") and the dashboard date card rotates its landscape photo across four lighting variants (morning/noon/dusk/night) — both boundaries extracted from the reference's bundle and unit-tested |
| ⚫ **Dark primary actions** | In-dialog submits (Post Update, Continue, Add Task, Save) are charcoal `#3A3A3A` pills with near-white text — the reference's action hierarchy; page-level actions stay neumorphic |
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

| Team | Settings | Login |
|:---:|:---:|:---:|
| ![Team](docs/screenshots/09-team.png) | ![Settings](docs/screenshots/10-settings.png) | ![Login](docs/screenshots/14-login.png) |

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
| Unit tests | Vitest | 5 | Pure domain seams: router, clarify questions, plan sanitizer, check-in mapping, rate limiter, team forms, next-action, logo geometry, calendar grid, date-fns distance time, greeting boundaries, day-image rotation |
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

The page at `/` resolves the session and hands a **nullable user** to the client app — the workspace shell renders either way (reference behavior); when unauthenticated it shows empty states and a LOG IN header button, and the store skips data fetches until a session exists. `/login` is a real Next.js route (excluded from the SPA rewrites) that redirects authenticated visitors back to `/`. All data flows through the Zustand store, which calls the API routes and unwraps the `{ ok, data } | { ok, error }` envelope. Views live at **real paths** (`/goals`, `/goals/<id>`, `/my-tasks`, `/activity`, `/team`, `/settings`) — Next.js rewrites map them onto the single page, and the store syncs view state with the History API (`src/lib/router.ts`), so every screen is deep-linkable and browser back/forward works. Same SPA architecture as the reference app.

## File Hierarchy

```
📂 prisma/
  📄 schema.prisma          # 8 models: User, Person, TeamMember, Goal, Task, TaskUpdate, ActivityLog, WorkspaceSetting
  📄 seed.ts                # Idempotent demo workspace seed
📂 public/
  📄 orbital-logo.svg       # Brand mark
  📄 day-hills-morning.jpg # Dashboard date-card backdrop — rotates by hour
  📄 day-hills-noon.jpg    # (11:00–16:59) with the reference's artwork
  📄 day-hills-dusk.jpg    # (17:00–20:59)
  📄 day-hills-night.jpg   # (21:00–04:59)
  📄 dusk-hills.jpg         # Legacy landscape (unused, kept as an OSS asset)
📂 scripts/
  📄 smoke-test.sh          # 30-check E2E suite + unit tests via `bun run test` (boots prod server)
📂 src/
  📂 app/
    📄 page.tsx             # Workspace route: session → OrbitalApp (nullable user)
    📄 layout.tsx           # DM Sans / DM Mono fonts, global styles
    📄 globals.css          # Tailwind 4 tokens + neumorphic primitive classes
    📂 login/               # Real /login route — auth card (3 states, from_url)
    📂 api/                 # 16 route handlers (auth, goals, tasks, team, activity, stats, settings, health)
  📂 components/
    📂 orbital/             # The application
      📄 orbital-app.tsx    # App shell (nullable user): sidebar + views + mobile tab bar
      📄 login-screen.tsx   # LoginCard — the /login auth card (3 states)
      📄 store.ts           # Zustand store: all server state + actions
      📄 sidebar.tsx        # Desktop navigation (collapsible; clock + tasks status)
      📄 sidebar-clock.tsx  # Neumorphic analog clock (SVG, 15s tick)
      📄 sidebar-collapse.ts# Collapse state: useSyncExternalStore + localStorage
      📄 user-menu.tsx      # UserMenuOrLogin: avatar popover w/ Log Out, or LOG IN button
      📂 views/             # dashboard, goals, goal-detail, my-tasks, activity, team, settings
      📂 dialogs/           # new-goal (3-step wizard + date picker), goal-edit, add-task, task-edit, task-detail, invite-member
    📂 ui/                  # shadcn/ui primitives + date-picker
  📂 lib/
    📄 orbital.ts           # Domain types, DTOs, status metadata (labels + colors)
    📄 router.ts            # View ↔ path mapping (parseUrl / toPath) — unit tested
    📄 clarify.ts           # Wizard clarifying questions: LLM sanitizer + fallback — unit tested
    📄 plan-sanitizer.ts    # AI task-plan bounds + template fallback — unit tested
    📄 checkin.ts           # Check-in → task-status mapping — unit tested
    📄 rate-limit.ts        # Fixed-window per-IP auth throttling — unit tested
    📄 team.ts              # Invite/agent form normalization — unit tested
    📄 calendar.ts          # Month-grid math for the date picker — unit tested
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

Measured from the reference app (v1.7) — a soft-beige neumorphic system with **three card tiers**: raised surfaces carry dual embossed shadows (light `rgba(255,250,244,…)` top-left, dark `rgba(160,143,126,…)` bottom-right) at standard depth for buttons, deeper alpha for row cards (goals/tasks/activity), and a large `-8px` pair for view panels (dashboard, settings, stats); inset wells carry the same pair inverted. Main content sits in a 1200px clamped column over a canvas washed with a soft purple radial glow bottom-right; every in-dialog primary submit is a charcoal pill (`#3A3A3A` bg, `#F1F1F0` text); the desktop sidebar is sticky (top 0, height viewport−40px) with a compact brand, plain TASKS STATUS block and two-tier uppercase label typography (11px/600 panel labels, 10px/600 small labels); mobile is full-bleed with an app bar and a full-width bottom-attached tab bar.

| Token | Hex / Value | Usage |
|-------|-------------|-------|
| `--orb-canvas` | `#EBE7E2` | Page canvas (24px padding, no outer panel) |
| `--orb-raised` | `#EEEAE6` | Raised surfaces: sidebar, cards, dialogs, buttons |
| `--orb-well` | `#EBE7E2` | Inset wells: inputs, chips, clock face, icon squares |
| `--orb-track` | `#DDD8D2` | Progress track behind the green fill |
| `--orb-body` | `#2F2823` | Primary text |
| `--orb-heading` | `#3A3A3A` | Headings / button text |
| `--orb-muted` | `#6E6E6E` | Secondary text |
| `--orb-green` | `#2ECC8A` | Success / done / active |
| `--orb-purple` | `#996CE4` | In-progress / AI accents |
| `--orb-coral` | `#FF8077` | Blocked / destructive (deep `#BD3228`; blocked cards add a coral inset ring `rgba(255,128,119,0.18)`) |

Primitive classes in `globals.css`: `.orb-raised` / `.orb-raised-lg` (panels), `.orb-panel` (large-tier view panels), `.orb-row-card` / `.orb-goal-card` (deeper-tier row cards), `.orb-raised-btn` (buttons), `.orb-well` / `.orb-well-pill` (insets), `.orb-task-blocked` (blocked-card ring), `.orb-btn-dark` / `.orb-btn-post` (dark primary submits), `.orb-btn-cancel` (dialog secondary), `.orb-pill-round` (team action buttons), `.orb-pill-outline-sm` (35px mobile NEW GOAL variant), the label tiers `.orb-label` / `.orb-label-sm`, plus the `.orb-pill` family for page-level actions. Typography: **DM Sans** (UI) and **DM Mono** (numeric/date accents), loaded via `next/font`. Status dots and text pair each palette color with a deeper accessible variant (`--orb-*-deep`).

## Testing

```bash
bun run test              # unit tests — 122 checks on the pure domain seams
./scripts/smoke-test.sh   # E2E — 30 checks against the production build
```

The unit layer (Vitest) pins the pure logic: path routing (`src/lib/router.ts`), the wizard's clarifying questions (`src/lib/clarify.ts`), the AI plan sanitizer + fallback (`src/lib/plan-sanitizer.ts`), the check-in status mapping (`src/lib/checkin.ts`), the auth rate limiter (`src/lib/rate-limit.ts`), the team-form normalization (`src/lib/team.ts`), the dashboard's next-planned-action derivation (`src/lib/next-action.ts`), the logo dot geometry (`logo.tsx`), the date-picker calendar grid + long date format (`src/lib/calendar.ts`), the activity feed's date grouping (`src/lib/activity-groups.ts`), the activity type-tag mapping (`src/lib/activity-tags.ts`), the dashboard greeting boundaries (`greetingFor`), the date-fns long-form distance (`formatDistance`/`relativeTime`), and the date-card photo rotation (`src/lib/day-image.ts`) — **122 checks**.

The smoke suite boots the production standalone server, then runs **30 checks**: health, login (valid + wrong password + unauthenticated rejection), all six read endpoints, task creation, invalid-status rejection (400), status check-in round-trip (task status flips + update recorded), deletion, logout invalidation, page render, **path-route serving** (`/goals`, `/goals/<id>`, `/my-tasks`, `/activity`, `/team`, `/settings` — plus a 404 guard on unknown paths), the **clarify endpoint** (3 questions + validation), **team validation** (invite with invalid email, agent without a name), and the **login rate limit** (rapid-fire attempts earn `429 RATE_LIMITED`). It exits non-zero on any failure and cleans up after itself.

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `Error code 14: Unable to open the database file` | Server started from a directory other than the project root | Start via `bun run start` / `bun run dev` (npm scripts always run from the root) |
| `Is port 3000 in use?` | Stale dev/prod server | `pkill -f "next dev"` or `pkill -f "standalone/server.js"` |
| Login loops back to the sign-in page | `AUTH_SECRET` changed between server restarts | Keep `AUTH_SECRET` stable in production |
| "Continue with Google" shows a toast instead of signing in | Expected — the self-hosted clone carries no OAuth credentials (documented deviation) | Configure an OAuth provider + adapt `login-screen.tsx` if you need real Google sign-in |
| Login suddenly returns 429 | Per-IP rate limit engaged (10 attempts / 15 min) | Wait for the window to reset (see `Retry-After`) or restart the server to clear in-memory buckets |
| Prisma `P1003` / missing tables | Database not initialized | `bun run db:push && bun run db:seed` |
| AI generation returns a generic 8-step plan | SDK unavailable/malformed output — deterministic fallback engaged | Expected behavior; configure the SDK environment to get LLM plans |

## License

No license file is present in this repository; all rights are reserved by default. Add an explicit license before redistributing.
