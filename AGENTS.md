# AGENTS.md — ORBITAL

Single Next.js 16 app (App Router) that clones the reference PM workspace: a workspace page (view paths like `/goals` and `/goals/<id>` are rewritten onto it) plus a real `/login` route, client-side view switching, Prisma/SQLite persistence, cookie-session auth, and a server-side AI task planner with a clarifying-questions step. Clone remote: `https://github.com/nordeim/project-management.git`; pushes go to the SSH remote via `docs/ssh_git_wrapper_v3.py`.

## Commands

| Task | Command |
|------|---------|
| Install | `bun install` (or `npm install`) |
| Dev server (port 3000) | `bun run dev` |
| Production build | `bun run build` |
| Production server | `bun run start` |
| Lint | `bun run lint` |
| Type check | `bun run typecheck` |
| Unit tests (85 checks) | `bun run test` |
| Prisma client after schema change | `bunx prisma generate` |
| Recreate DB from schema | `bun run db:push` |
| Seed demo workspace | `bun run db:seed` |
| End-to-end smoke suite | `./scripts/smoke-test.sh` (needs `bun run build` first) |

**Gate order before every push:** `bun run lint` → `bun run typecheck` → `bun run test` → `bun run build` → `./scripts/smoke-test.sh` (30 checks, all must pass). There is no hosted CI; the local gate is the only gate. `next.config.ts` sets `ignoreBuildErrors` — the explicit `typecheck` step is what catches type errors; never skip it.

First-run setup: `bun install && cp .env.example .env && bun run db:push && bun run db:seed && bun run dev`. Demo login: `demo@orbital.app` / `Demo1234!`.

## Architecture facts you would otherwise guess wrong

- **Single-page workspace with path URLs, not per-view routes.** `src/app/page.tsx` resolves the session server-side and passes a **nullable user** to `OrbitalApp` (client) — the shell renders for unauthenticated visitors too (reference behavior): empty states + a LOG IN header button; the store skips data fetches while `user` is null. Views switch inside Zustand; `next.config.ts` rewrites `/goals`, `/goals/:goalId`, `/my-tasks`, `/activity`, `/team`, `/settings` onto the page, and `src/lib/router.ts` (`parseUrl` / `toPath`) maps view state ↔ `location.pathname` via `pushState` + a `popstate` listener (browser back/forward works). Legacy `?view=…` links still resolve. Do not add `app/` routes per view and do not change the URL shape.
- **`/login` is a real route, not a rewrite.** `src/app/login/page.tsx` renders the `LoginCard` (`login-screen.tsx`) with three states — sign-in, sign-up, forgot-password — and `?from_url=` return handling; authenticated visits redirect to `/`. "Continue with Google" is rendered for parity but degrades to an explanatory toast (no OAuth credentials in a self-hosted clone; same doctrine as the AI fallbacks). Reads/mutations stay session-gated — the reference's public-read behavior is a Base44 platform artifact and a documented deviation.
- **All server state lives in one Zustand store** (`src/components/orbital/store.ts`) — no React Query, no SWR, no server actions. Actions call the API, then refresh affected slices. Keep that pattern.
- **API envelope is `{ ok, data } | { ok, error: { code, message } }`** — build it with `ok()` / `fail()` from `src/lib/api.ts`; the store's `call()` helper is the only sanctioned client for it.
- **Auth is hand-rolled** (`src/lib/auth.ts`): scrypt password hashes + HMAC-signed stateless cookie (`orbital_session`, 7-day TTL). `requireSession()` guards every route handler. No NextAuth, no JWTs, no middleware. Auth routes are rate-limited (`src/lib/rate-limit.ts`): 10 attempts/IP/15 min fixed window → `429 RATE_LIMITED` with `Retry-After`; per-process only (single-node deploy).
- **Auth navigation uses `router.refresh()`, not `window.location`** — login success and Log Out re-resolve the session server-side (`page.tsx` is `force-dynamic`); the header swaps UserMenu ↔ LOG IN without a full reload. Keep that pattern; ESLint flags `window.location.href` assignments.
- **The visual system is neumorphic, built from measured tokens** (v1.4/v1.5): canvas `#EBE7E2`, raised surfaces `#EEEAE6` (dual embossed shadows), inset wells `#EBE7E2` (inverted pair), progress track `#DDD8D0`. Primitive classes live in `globals.css` under `@layer utilities`: `.orb-raised` / `.orb-raised-lg` (panels), `.orb-raised-btn` (buttons), `.orb-well` / `.orb-well-pill` (insets), `.orb-card` (alias), `.orb-task-blocked` (blocked-task coral ring), `.orb-btn-dark` / `.orb-btn-post` (dark in-dialog primary submits), `.orb-btn-cancel` (dialog secondary), `.orb-pill-round` (Team's round buttons). **Cascade warning:** custom classes in that layer are emitted AFTER Tailwind's generated utilities, so an arbitrary `shadow-[…]`/`rounded-*`/`h-*` utility on an element that also carries `.orb-card`/`.orb-raised`/`.orb-btn-*` LOSES — style overrides as dedicated custom classes (that's why `.orb-task-blocked` and `.orb-btn-post` exist). Pairing `bg-orb-well` (a color utility) with `shadow-[…]` is fine.
- **In-dialog primary submits are DARK pills, not neumorphic** (v1.5): "Post Update" (`#2F2823`, radius 14, 32px, literal Title Case + Send icon), "Continue" / "Add Task" / "Save" (`#3A3A3A` bg, `#F1F1F0` text, radius 10). Page-level actions (NEW GOAL, ADD TASK, DELETE, Team's Invite/New Agent round pills) stay neumorphic raised. **Dialogs are 500px neumorphic panels** (radius 20, `#EEEAE6`): the base `DialogContent` in `ui/dialog.tsx` carries `sm:max-w-[500px] rounded-[20px]` — the single exception is the task-detail (check-in) modal, which overrides to 448px / radius 16 (measured).
- **The main content is a clamped 1200px column on a glowing canvas** (v1.5): `orbital-app.tsx` wraps every view in `max-w-[1200px]` and paints a fixed purple radial gradient (`radial-gradient(600px at 87.44% 95.38%, rgba(201,179,245,0.35), transparent 70%)`, pointer-events none) under the content. Don't add per-view max-widths — the shell owns the clamp.
- **The dashboard is a 2×2 grid** (v1.5): top-left cell = date card (bright `day-hills.jpg` photo, 0.8 opacity, raised date square radius 12) beside a 180×180 ring card holding a plain CSS inset circle (NO SVG ring; `clamp(28px,3.5vw,52px)` fw-300 numerals); top-right = the three-column stats panel; bottom = Agent Activity + Goals at equal widths. The greeting is 28px at every breakpoint.
- **The date picker is a custom component** (`ui/date-picker.tsx`): well-style trigger → raised `#EEEAE6` popover (260px, radius 16; Su–Sa headers, 7×6 grid, today in bold purple). Grid math and the long trigger format (`"September 20th, 2026"`) live in the pure seam `src/lib/calendar.ts` (`monthGrid`, `isSameDay`, `formatLongDate`).
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
- **Validation is hand-rolled in route handlers** (trim, length caps, enum membership, referential checks). No schema library — zod and the other template extras were pruned in v1.2; follow the existing manual style.
- **Every mutation writes an `ActivityLog` row** (type, message, detail, task/goal ids). New endpoints must keep the feed complete. (`goal_analyzed` is logged by the clarify endpoint — an AI action, not a mutation.)
- **AI features degrade, never fail:** `POST /api/goals/clarify` (wizard questions) and `generate-tasks` both fall back to deterministic outputs when the SDK is down.
- **Pure domain seams are unit-tested** (`src/lib/router.ts`, `clarify.ts`, `plan-sanitizer.ts`, `checkin.ts`, `rate-limit.ts`, `team.ts`, `next-action.ts`, `calendar.ts` + the logo geometry helpers in `logo.tsx`, all with Vitest `*.test.ts` — 85 checks). Route handlers import these modules instead of inlining the logic — extend the tests when you extend the logic.
- **Deletes confirm INLINE, never in a modal** (reference pattern): the goal card swaps its icons for a "Delete / Cancel" pair, the goal-detail header swaps DELETE for "Delete goal & all tasks? · Yes, Delete | Cancel", and task cards swap their icons for "Delete? | Yes | No". Don't reintroduce `AlertDialog` confirms.
- **The brand marks are two different dot arrangements** (pixel-measured): sidebar/logo mark = six dots in a hexagonal ring; login card = six dots in a 1-2-3 pyramid inside a white circle. Geometry lives as pure helpers in `logo.tsx` with a spec — don't hand-place dots.
- **Sidebar carries a live analog clock and collapses on desktop** (`sidebar-clock.tsx` + `sidebar-collapse.ts`, a `useSyncExternalStore` store persisted to localStorage `orbital-sidebar-collapsed`). Don't reintroduce `useState`-in-`useEffect` patterns for it — React 19's lint rules reject them; use external stores.
- **AI agents are TeamMembers with `description`/`instructions`** (schema extended in v1.2); the New Agent dialog and `/api/team` POST share the `src/lib/team.ts` seams.
- **My Tasks ships five filter tabs** (All / Pending / In Progress / Blocked / Done — no "Need Help" tab, matching the reference; the `need_help` status itself remains in the vocabulary). Empty states render directly on the canvas — no card wrapper.
- **Mobile navigates with a bottom tab bar** (HOME / GOALS / MY TASKS / AGENT / MORE + a bottom Sheet with Tasks / Team / Settings) — not a hamburger slide-over. Desktop keeps the sidebar.
- **ESLint ignores `skills/`** (the operator's skill catalog, not app code) plus build output dirs — don't remove those ignores.

## Git

- **`main` only.** No feature branches.
- Conventional Commits with emoji prefixes: `:art: feat: …`, `:memo: docs: …`, `:bug: fix: …`.
- Never commit `.env`, `*.key`, `db/*.db`, or `node_modules/` (all gitignored).
- Push through the SSH wrapper from the repo root: `python3 docs/ssh_git_wrapper_v3.py --key-file <key outside repo> --remote git@github.com:nordeim/project-management.git` — runbook: `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`.
