# AGENTS.md — ORBITAL

Single Next.js 16 app (App Router) that clones the reference PM workspace: one page (view paths like `/goals` and `/goals/<id>` are rewritten onto it), client-side view switching, Prisma/SQLite persistence, cookie-session auth, and a server-side AI task planner with a clarifying-questions step. Clone remote: `https://github.com/nordeim/project-management.git`; pushes go to the SSH remote via `docs/ssh_git_wrapper_v3.py`.

## Commands

| Task | Command |
|------|---------|
| Install | `bun install` (or `npm install`) |
| Dev server (port 3000) | `bun run dev` |
| Production build | `bun run build` |
| Production server | `bun run start` |
| Lint | `bun run lint` |
| Unit tests (43 checks) | `bun run test` |
| Prisma client after schema change | `bunx prisma generate` |
| Recreate DB from schema | `bun run db:push` |
| Seed demo workspace | `bun run db:seed` |
| End-to-end smoke suite | `./scripts/smoke-test.sh` (needs `bun run build` first) |

**Gate order before every push:** `bun run lint` → `bun run test` → `bun run build` → `./scripts/smoke-test.sh` (27 checks, all must pass). There is no hosted CI; the local gate is the only gate.

First-run setup: `bun install && cp .env.example .env && bun run db:push && bun run db:seed && bun run dev`. Demo login: `demo@orbital.app` / `Demo1234!`.

## Architecture facts you would otherwise guess wrong

- **Single-page app with path URLs, not per-view routes.** `src/app/page.tsx` resolves the session server-side, then renders `OrbitalApp` (client). Views switch inside Zustand; `next.config.ts` rewrites `/goals`, `/goals/:goalId`, `/my-tasks`, `/activity`, `/team`, `/settings` onto the page, and `src/lib/router.ts` (`parseUrl` / `toPath`) maps view state ↔ `location.pathname` via `pushState` + a `popstate` listener (browser back/forward works). Legacy `?view=…` links still resolve. Do not add `app/` routes per view and do not change the URL shape.
- **All server state lives in one Zustand store** (`src/components/orbital/store.ts`) — no React Query, no SWR, no server actions. Actions call the API, then refresh affected slices. Keep that pattern.
- **API envelope is `{ ok, data } | { ok, error: { code, message } }`** — build it with `ok()` / `fail()` from `src/lib/api.ts`; the store's `call()` helper is the only sanctioned client for it.
- **Auth is hand-rolled** (`src/lib/auth.ts`): scrypt password hashes + HMAC-signed stateless cookie (`orbital_session`, 7-day TTL). `requireSession()` guards every route handler. No NextAuth, no JWTs, no middleware.
- **SQLite path normalization:** the Prisma CLI resolves relative `file:` URLs against `prisma/`, the runtime engine against CWD. `src/lib/db.ts` normalizes to an absolute path before the first client is built — always import `db` from `@/lib/db`, never construct `PrismaClient` directly.
- **Standalone server must start from the project root** (`output: "standalone"`; `outputFileTracingRoot` is pinned in `next.config.ts`). npm/bun scripts guarantee this; running `server.js` from elsewhere breaks the SQLite path.
- **Schema changes use `db push`, not migrations** (`prisma/migrations/` does not exist). `bun run db:seed` is idempotent — it wipes and reseeds domain tables.

## Conventions that differ from defaults

- **Three distinct status vocabularies** (don't mix them):
  - Task: `pending | in_progress | blocked | need_help | done`
  - Goal: `active | done | draft | paused`
  - Check-in update: `on_track | blocked | need_help | done`
  - Canonical labels/colors: `TASK_STATUS_META` / `GOAL_STATUS_META` / `UPDATE_STATUS_META` in `src/lib/orbital.ts`.
- **Tailwind 4 hybrid config:** tokens are CSS variables in `src/app/globals.css` (`--orb-*` palette, `@theme inline` mapping); the legacy `tailwind.config.ts` exists only for shadcn/ui HSL tokens and `tailwindcss-animate`. Use `orb-*` color utilities for app styling.
- **TypeScript is strict except `noImplicitAny: false`** (sandbox default; kept intentionally).
- **Validation is hand-rolled in route handlers** (trim, length caps, enum membership, referential checks). Zod is in `package.json` but unused — don't claim it or half-adopt it; follow the existing manual style.
- **Every mutation writes an `ActivityLog` row** (type, message, detail, task/goal ids). New endpoints must keep the feed complete. (`goal_analyzed` is logged by the clarify endpoint — an AI action, not a mutation.)
- **AI features degrade, never fail:** `POST /api/goals/clarify` (wizard questions) and `generate-tasks` both fall back to deterministic outputs when the SDK is down.
- **Pure domain seams are unit-tested** (`src/lib/router.ts`, `clarify.ts`, `plan-sanitizer.ts`, `checkin.ts` + Vitest `*.test.ts`). Route handlers import these modules instead of inlining the logic — extend the tests when you extend the logic.
- **Mobile navigates with a bottom tab bar** (HOME / GOALS / MY TASKS / AGENT / MORE + a bottom Sheet with Tasks / Team / Settings) — not a hamburger slide-over. Desktop keeps the sidebar.
- **ESLint ignores `skills/`** (the operator's skill catalog, not app code) plus build output dirs — don't remove those ignores.

## Git

- **`main` only.** No feature branches.
- Conventional Commits with emoji prefixes: `:art: feat: …`, `:memo: docs: …`, `:bug: fix: …`.
- Never commit `.env`, `*.key`, `db/*.db`, or `node_modules/` (all gitignored).
- Push through the SSH wrapper from the repo root: `python3 docs/ssh_git_wrapper_v3.py --key-file <key outside repo> --remote git@github.com:nordeim/project-management.git` — runbook: `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`.
