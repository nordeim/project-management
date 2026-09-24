# Session 35 — v2.11: closing F13 (the authenticated /login drift)

Task ID: v2.11-session-35. Session 33 shipped v2.10 and recorded F13
(the live's `/login` renders for authenticated visitors; the clone
redirected). Session 34 (the operator's log upload) confirmed the ship.
This session pulled `ef91267`, re-surveyed the live, and closed F13.

## What this session found and did

1. **Baseline**: pulled `ef91267` (session-34 log update; the root
   `parity-remediation-v2.10.md` retired into `docs/`). Full gate GREEN
   on the pulled state: lint 0 · typecheck 0 · 138/138 unit · build
   clean · 30/30 smoke · 115/115 Playwright. Infra re-verified: `.env`
   `DATABASE_URL="file:../db/custom.db"` (repo db re-seeded 3/31/36 —
   the shell `DATABASE_URL` parent-workspace trap neutralized again with
   explicit per-command overrides), `db/` at the repo root, vitest +
   playwright configs functional, `.env.example` current.
2. **Live survey (authenticated, 390/768/1440)**:
   - **F13 re-confirmed**: `/login` while authenticated → the URL stays
     on `/login` and the full card renders (heading, Google, Email/
     Password, Sign in, Forgot, Sign up — byte-identical to the
     logged-out card). Signing in from that state lands on `/`.
   - **Mobile navigation (the operator's named focus) re-verified
     byte-identical**: the 390 tab census (nav [0,770.5,390,73.5], z 100,
     radius 20 20 0 0; four anchors 73.2×53.5 at computed stroke 1.5 +
     MORE 81.2), the MORE sheet (overlay 200 / panel 201, [0,541,390,
     303], r24, rows → /tasks /team /settings) opening and navigating,
     and the 768 pill nav (494.3×70.5, z 100, r20, six chips min-w 52
     r12). No Tailwind v4 regressions anywhere in the chrome.
   - No other drift: the desktop anchor census, all six view h1s, the
     activity pill ([dot 7][Online 38][· 36 18.6] pad 7/12 gap 6), the
     wizard deep link (auto-open, scrim z-100 0.3 flex), the app-bar
     pill, and the New Goal pill (132.3×40 r12) all measured equal.
   - **New finding F14 (recorded, NOT fixed)**: the live's desktop user
     pill is a plain inline-styled DIV (pad 11/16, `var(--radius-button)`,
     well bg, the 0.68/0.24 inset pair, cursor pointer, user-select
     none — a Base44 platform artifact) wrapping a 22×22 r50% avatar and
     a 12/500 `#6E6E6E` name span. The clone's Radix
     `PopoverTrigger` `<button>` computes byte-equal geometry — kept as
     a deliberate a11y deviation (the same class of keep as
     `aria-current="page"`).
3. **TDD (red → green)**: RED — rewrote `auth.spec.ts:52` from the
   redirect pin to the live's behavior (authenticated visit → URL stays
   `/login` + the card renders; form re-sign-in → lands on `/`);
   verified it fails on the unmodified build (1 failed, 4 passed).
   GREEN — `src/app/login/page.tsx` drops `getSessionUser()` +
   `redirect()` (the page renders `LoginCard` unconditionally;
   `safeFromUrl` + `force-dynamic` stay; the client flow needed no
   change). The stale v30 login-block comment updated in passing (its
   storageState opt-out stays — those pins measure the logged-out card).
4. **Full gate GREEN**: lint 0 · typecheck 0 · 138/138 unit · build
   clean · 30/30 smoke · **115/115 Playwright** (the inverted pin
   included).
5. **Paired re-probe of the changed surface**: the standalone server
   (explicit env) on :3000 — authenticated `/login` renders the card on
   the clone exactly as on the live (URL stays; re-sign-in lands on `/`
   with the sidebar + greeting). Behavioral parity closed.
6. **Screenshots**: all 16 regenerated from the production build
   (`capture-screenshots.mjs` + `capture-wizard.sh` with a real AI plan;
   the scratch goal cleaned; db pristine 3/31/36). VLM sanity still
   unavailable (non-multimodal endpoint) — size/dimension checks + the
   115 green pins stand in (the behavioral change is invisible in a
   static shot; the pin lives in auth.spec).
7. **Docs aligned**: README (v2.11 paragraph + architecture sentence +
   auth bullet), AGENTS (the `/login` fact), CLAUDE (the route mention),
   PAD (v2.11 revision block + F13 marked RESOLVED + §6.3 + file
   table), SKILL (sessions 1–35, §8, lesson 20), `session_35.md`, the
   worklog, and `parity-remediation-v2.11.md` marked EXECUTED.

## The DATABASE_URL shell trap (still active)

The sandbox shell exports `DATABASE_URL=file:/home/z/my-project/db/custom.db`
(parent workspace) into every command — `unset` does not survive between
tool invocations. Every prisma/seed/server command this session pinned
`DATABASE_URL="file:../db/custom.db"` explicitly; the standalone server
and the Playwright webServer carry their own explicit values.
