# Parity & Infrastructure Remediation — v2.12 (verification pass)

Session 37 plan. Survey executed 2026-09-24 against the live reference
(`https://agent-pm-copy-15e23720.base44.app/`, authenticated as
`sepnetflix2023@outlook.com`) with paired agent-browser sessions
(`live` / `clone`) at 390 / 768 / 1440. Session 35 shipped v2.11 (F13
closed) at `5758062`; `964ed32` (session 36) added only the operator's
log upload — no code delta since the v2.11 build.

Baseline gate before any change (pulled at `964ed32`): lint 0 ·
typecheck 0 · 138/138 unit · build clean · 30/30 smoke · 115/115
Playwright. Infra re-verified: `.env` `DATABASE_URL="file:../db/custom.db"`
(`db/` at the repo root, re-seeded 3/31/36 after the smoke run), vitest
+ playwright configs functional, `.env.example` matches the codebase.

## Findings

### N-1 (NONE): the live is byte-stable since session 35 — no parity gap opened

Every pinned surface re-measured EQUAL on the live (390 / 768 / 1440,
authenticated), then paired-probed on the clone's production build:

- **Mobile navigation (the operator's named focus — WORKING AS
  EXPECTED on BOTH apps)**: the 390 tab census byte-identical (nav
  [0, 770.5, 390, 73.5], z 100, radius `20px 20px 0px 0px`; four
  anchors 73.2×53.5 at computed stroke 1.5 — `/`, `/goals`,
  `/my-tasks`, `/activity` — plus the MORE button 81.2×53.5); the MORE
  sheet opens (overlay z 200 `rgba(0,0,0,0.2)`, panel z 201 at
  [0, 541, 390, 303], radius `24px 24px 0px 0px`, bg `rgb(238,234,230)`)
  and its rows carry the real hrefs `/tasks` · `/team` · `/settings`
  and navigate (both apps probed: URL + h1 "Tasks"); the 768 pill nav
  (494.3×70.5 at [136.9, 937.5], z 100, r 20, six anchor-wrapped chips,
  chip min-w 52, chip r 12). The closed sheet's `translateY(100%)`
  mounted panel on the live matches the clone's Radix keep.
- **Desktop (1440)**: the sidebar anchor census (brand ORBITAL → `/`,
  six nav rows h39 — Dashboard/Goals/My Tasks/Agent Activity/Team/
  Settings — + TASKS STATUS widget → `/my-tasks`), the New Goal pill
  (132.3×40, r 12), the greeting h1, and the F14 user pill (inline-styled
  DIV, 149×44, pad 11/16, r 12, cursor pointer) all re-measured equal.
- **Views + dialogs**: all view h1s (Goals / My Tasks / Tasks / Agent
  Activity / Team / Settings), the activity pill (DIV 99.7×30.5, pad
  7/12, gap 6, [dot 7][Online 38][· 36 18.6]), the wizard deep link
  (`/goals?new=true` auto-opens; scrim z 100 `rgba(46,42,38,0.3)` flex;
  panel 680 wide, r 24, pad 28/28/24), the add-task dialog (panel 500
  wide, r 20, pad 28/28/24, scrim z 200, inputs 35.5/72/35/37.5/35 —
  the clone's settled reads identical; the 0.5–3px raw-read deltas are
  the documented zoom-in-95 mid-animation artifact, pinned via
  `expect.poll` in v30), the login card (448×746, r 16, blur(4px)),
  and the F13 surface (authenticated `/login` renders the card, URL
  stays; re-sign-in lands on `/`).
- **Tailwind v4 audit (code-level)**: no regressions — the login's
  remaining `space-y-*` classes are the documented v3-mirror sites
  (comments in `login-screen.tsx`), the `rounded-xl` uses carry the
  shadcn `--radius` trap comments (`user-menu.tsx`), and the v30 spec
  settles every animation-affected read with `.poll()`. The v4 bugs
  (space-y direction flip, zero-alpha composed shadows, chip radius,
  dialog animation artifacts) were all fixed and pinned in v2.8–v2.10.

**Conclusion: parity is COMPLETE.** F1–F13 are closed; F14 (the live's
inline-styled DIV pill trigger vs the clone's semantic `<button>`)
remains the only recorded finding — a deliberate a11y keep, geometry
byte-equal, documented in PAD §v2.11 and pinned at `v30:524`.

### P-1 / P-2 (process notes — recorded for future sessions, not code bugs)

- **P-1**: `bun run db:seed` wipes and re-creates the `user` table with
  fresh ids, so every browser session cookie logged in before a reseed
  goes stale (the views render empty: "All (0)"). Re-login after any
  reseed before probing the UI. Observed live this session (the
  pre-reseed agent-browser session showed 0 goals while
  `check-db-state.mjs` reported 3).
- **P-2**: `./scripts/smoke-test.sh` mutates `db/custom.db` (its task
  create / check-in / delete round-trips persist in the activity feed:
  36 → 40 entries). Reseed before regenerating screenshots. Both
  behaviors are pre-existing (sessions 31–35 reseeded after gates);
  recorded here so the next session doesn't misread them as data bugs.

## Work streams

### WS-1 — source changes: NONE (evidence documented)

The v2.11 build (`5758062`) is at full parity; `964ed32` changed only
docs. No code, config, schema, or spec edits are warranted this
session — inventing work would risk the green gate. This plan is the
audit trail for that decision.

### WS-2 — artifacts refresh (executed 2026-09-24)

1. Re-seed `db/custom.db` (pristine 3/31/36) — done.
2. Regenerate all 16 screenshots from the current production build
   (`capture-screenshots.mjs` + `capture-wizard.sh` with a real AI
   plan; scratch goal cleaned via `wizard-cleanup.mjs`; DB re-verified
   3/31/36). The login shot's 1280×800 viewport is the script's
   deliberate choice (session 33). — done.
3. Verify `.env.example` matches the codebase (`DATABASE_URL
   "file:../db/custom.db"`, `db/` at repo root, `AUTH_SECRET` empty in
   the example) — done, unchanged and tracked.

### WS-3 — documentation alignment

`docs/session_37.md` (this session's record), `worklog.md` (the
session-37 entries), `project-management_SKILL.md` (§header sessions
1–35 → 1–37, §8 unchanged, §12 lesson 21: the reseed-invalidates-
sessions trap P-1), README/PAD/AGENTS/CLAUDE unchanged (verified
accurate against the code this session — no code delta to document),
and this plan marked EXECUTED with the appended record.

### WS-4 — verification + ship

1. Re-run the fast gate (lint · typecheck · unit 138) on the unchanged
   tree to prove no accidental drift during the artifact refresh; the
   build + smoke + e2e results from the baseline stand (identical
   source).
2. Conventional Commit on `main` (docs + screenshots only), push via
   `docs/ssh_git_wrapper_v3.py`, verify remote == local HEAD, shred the
   operator key.

## Execution record (2026-09-24) — PLAN EXECUTED

- Baseline gate GREEN at `964ed32`: lint 0 · typecheck 0 · 138/138
  unit · build clean · 30/30 smoke · 115/115 Playwright (the smoke run
  left 4 activity rows in `db/custom.db` — reseeded per P-2 before the
  screenshot pass).
- Live survey + paired clone probes: every surface listed in N-1
  re-measured EQUAL on both apps; mobile navigation (operator focus)
  confirmed byte-identical and functional on both.
- Screenshots: 16/16 regenerated from the current build (wizard pair
  via the real AI plan, 12 tasks generated; scratch goal + its 12
  activity entries cleaned; DB pristine 3/31/36 verified after).
- Docs: session_37.md written, SKILL.md sessions list → 1–37 + lesson
  21 (P-1 trap) added, worklog.md appended, this record appended.
  README/PAD/AGENTS/CLAUDE verified accurate — unchanged.
- Fast gate re-verified on the shipped tree: lint 0 · typecheck 0 ·
  138/138 unit. Source untouched since the 115/115 e2e run.
- Commit `:memo: docs: v2.12 verification pass …` on `main`; push via
  the SSH wrapper verified (remote HEAD == local).
