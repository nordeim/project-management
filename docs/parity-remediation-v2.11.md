# Parity & Infrastructure Remediation — v2.11

Session 35 plan. Survey executed 2026-09-24 against the live reference
(`https://agent-pm-copy-15e23720.base44.app/`, authenticated as
`sepnetflix2023@outlook.com`) with paired agent-browser sessions at 390 /
768 / 1440. The session closes F13 — the one open finding session 33
recorded — and re-verifies the operator's mobile-navigation focus.

Baseline gate before any change (pulled at `ef91267`, the v2.10 shipped
state): lint 0 · typecheck 0 · 138/138 unit · build clean · 30/30 smoke ·
115/115 Playwright.

## Findings

### F13 (HIGH, behavioral — the session's headline): the LIVE's `/login`
renders the login card for AUTHENTICATED visitors

- Re-verified twice this session (fresh login → navigate `/login`): the
  URL STAYS on `/login` and the full card renders — heading "Welcome to
  Project Management App", Continue with Google, Email/Password inputs,
  Sign in, Forgot password?, Need an account? Sign up — byte-identical
  to the logged-out card (no "already signed in" variant).
- Signing in from that authenticated state POSTs and lands on the
  workspace `/` (the `?from_url=` flow unchanged).
- The clone redirects authenticated visitors to `/` (implemented in
  `src/app/login/page.tsx` since v1.4, pinned by `auth.spec.ts:52`, and
  documented in README/AGENTS/PAD/CLAUDE). A verified behavioral drift.
- **Fix**: drop `getSessionUser()` + `redirect()` from the page — it
  renders the `LoginCard` for every visitor (the page becomes
  session-independent; `safeFromUrl` + `force-dynamic` stay). The client
  flow (`POST /api/auth/login` → `router.replace(fromUrl)` +
  `router.refresh()`) already matches the live's land-on-workspace
  behavior for authenticated re-sign-ins — no client change needed.
- **Specs**: invert `auth.spec.ts:52` (authenticated visits render the
  card; re-sign-in lands on the workspace) and update the v30 login
  block's stale comment (its storageState opt-out STAYS — those pins
  measure the logged-out card).
- **Docs**: README (§architecture ¶105), AGENTS (the `/login` fact),
  CLAUDE (the `/login` route mention), PAD (§6.3 + the file table +
  this revision block), plus session_35/worklog/this plan.

### F14 (LOW, recorded — NOT fixed): the live's desktop user pill is a
plain DIV with inline styles

- Live: `<div class="flex items-center gap-2.5" style="padding: 11px
  16px; border-radius: var(--radius-button); background: rgb(235,231,
  226); box-shadow: rgba(255,250,244,0.68) -3px -3px 6px inset,
  rgba(160,143,126,0.24) 3px 3px 6px inset; cursor: pointer;
  user-select: none; transition: background 0.15s">` wrapping a 22×22
  r50% avatar (bg rgb(255,203,222), letter 10px/600 rgb(90,83,80)) and a
  12px/500 `#6E6E6E` name span (no truncation at this data — max-width
  none, overflow visible).
- Clone: a Radix `PopoverTrigger` **`<button>`** whose computed geometry
  is byte-equal (r12 · pad 11/16 · well bg `#EBE7E2` · the same
  0.68/0.24 inset pair · 12/500 `#6E6E6E` name · 22px avatar).
- Delta class: Base44 platform artifact (the live renders custom
  triggers as inline-styled divs). The clone keeps the semantic
  `<button>` as a **deliberate a11y deviation** — the same class of keep
  as `aria-current="page"` (documented since v2.7). Recorded here, not
  fixed; the popover spec (`v30:524`) continues to pin the geometry +
  the 8px gap.

### Non-findings (verified equal — the live is stable since session 33)

- **Mobile navigation (the operator's named focus — WORKING AS
  EXPECTED)**: the 390 tab-bar census byte-identical (nav [0, 770.5,
  390, 73.5], z 100, radius `20px 20px 0px 0px`; four anchors 73.2×53.5
  at computed stroke 1.5 — /, /goals, /my-tasks, /activity — plus the
  MORE button 81.2×53.5); the MORE sheet opens (overlay z 200, panel
  z 201 at [0, 541, 390, 303], radius `24px 24px 0px 0px`) and its rows
  carry the real hrefs /tasks · /team · /settings and navigate; the 768
  pill nav (494.3×70.5, z 100, r 20, six anchor-wrapped chips, min-w 52,
  chip r 12).
- Desktop: the anchor census (sidebar ×6 + brand + TASKS STATUS, New
  Goal → `/goals?new=true`, stat wells, Full log ×2, goal cards, MORE
  rows), all six view h1s (Goals / My Tasks / Tasks / Agent Activity /
  Team / Settings), the activity pill (DIV · [dot 7][Online 38][· 36
  18.6] · pad 7/12 · gap 6), the wizard deep link (`/goals?new=true`
  auto-opens on hard load; scrim z 100 `rgba(46,42,38,0.3)` flex), the
  mobile app-bar pill (avatar S + email, 129.1×34), and the greeting
  header's New Goal pill (132.3×40, r 12) all re-measured equal.

## Work streams

### WS-1 — the source fix (F13)

`src/app/login/page.tsx`: remove the session resolve + the authenticated
redirect. The page renders `LoginCard` for every visitor; the header
comment rewritten to state the live's measured behavior (v2.11). Keep
`safeFromUrl` (from_url stays honored after sign-in) and
`export const dynamic = "force-dynamic"`.

### WS-2 — spec updates (TDD: RED first, then GREEN)

1. **RED**: rewrite `tests/e2e/auth.spec.ts:52` from the redirect pin to
   the inverted behavioral pin — an API login (cookie into the context),
   then `page.goto("/login")` asserts the URL STAYS `/login`, the
   heading renders, and a form re-sign-in lands on `/` (timeout 15s for
   the login round-trip). One extra auth attempt vs the old test — the
   suite's total stays ≤ 5 per IP against the limiter's 10/15min.
2. **GREEN**: apply WS-1; the inverted pin goes green with the rest of
   the suite untouched (no other spec asserts the redirect; the v30
   login block's storageState opt-out keeps measuring the logged-out
   card — its stale comment updated in passing).
3. Full gate: lint → typecheck → unit (138) → build → smoke (30) →
   e2e (115).

### WS-3 — documentation alignment

README (the `/login` redirect sentence in the architecture paragraph +
the auth-flow feature bullet if it repeats it), AGENTS (the `/login`
fact line), CLAUDE (the `/login` route mention + the auth-navigation
principle), PAD (a v2.11 revision block, §6.3's v1.4 auth-surface
paragraph, and the §file-table row for `login/page.tsx`),
SKILL (§sessions list + the F13 lesson: behavioral parity includes
AUTH-STATE routing — probe authenticated visits to every route, not
just the logged-out surface), `docs/session_35.md`, `worklog.md`, and
this plan marked EXECUTED.

### WS-4 — verification, screenshots, ship

1. Live re-probe of the changed surface: authenticated `/login` on BOTH
   apps (URL stays, card renders, re-sign-in lands on `/`).
2. Regenerate the screenshot set from the production build
   (`capture-screenshots.mjs` + `capture-wizard.sh`); `14-login.png`
   (the logged-out card) is unchanged by design — the behavioral change
   is invisible in a static shot, so the pin lives in auth.spec.
3. Re-verify `.env.example` matches the codebase (DATABASE_URL
   `file:../db/custom.db`, db/ at the repo root).
4. Conventional Commit on `main`, push via `docs/ssh_git_wrapper_v3.py`,
   verify remote == local HEAD, shred the operator key.

## Execution record (2026-09-24) — appended after the gate

## Execution record (2026-09-24) — PLAN EXECUTED

- **RED**: `auth.spec.ts:52` rewritten to the live's behavior
  (authenticated visit → URL stays `/login`, the heading renders, a
  form re-sign-in lands on `/`, timeout 15 s). Verified failing on the
  unmodified v2.10 build (1 failed / 4 passed — exactly the target).
- **GREEN**: `src/app/login/page.tsx` drops `getSessionUser()` +
  `redirect()` — the page renders the `LoginCard` unconditionally
  (26 → 20 lines; `safeFromUrl` + `force-dynamic` stay; no client
  change needed — `login-screen.tsx` already lands signed-in users on
  `fromUrl`). The v30 login-block comment updated (its storageState
  opt-out stays).
- **Full gate GREEN**: lint 0 · typecheck 0 · 138/138 unit · build
  clean · 30/30 smoke · **115/115 Playwright**.
- **Paired re-probe**: the standalone server on :3000 (explicit env) —
  authenticated `/login` renders the card on the clone exactly as on
  the live; re-sign-in lands on `/` with the sidebar + greeting.
  F13 closed with full behavioral parity.
- **Screenshots**: 16/16 regenerated from the production build (the
  wizard pair via the real AI plan; scratch goal cleaned; db pristine
  3/31/36). VLM sanity unavailable (non-multimodal endpoint) —
  size/dimension checks + the green pins stand in.
- **Docs**: README (v2.11 paragraph + architecture sentence + auth
  bullet), AGENTS (the `/login` fact), CLAUDE (the route mention), PAD
  (v2.11 revision block + F13 RESOLVED + §6.3 + file table), SKILL
  (sessions 1–35, §8, lesson 20), session_35, the worklog, this record.
- **F14** (the live's inline-styled DIV pill trigger) recorded in the
  plan findings + the PAD v2.11 block as a deliberate a11y keep.
