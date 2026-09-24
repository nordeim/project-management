# Parity & Infrastructure Remediation — v2.13 (verification pass)

Session 39 plan. Survey executed 2026-09-24 against the live reference
(`https://agent-pm-copy-15e23720.base44.app/`, authenticated as
`sepnetflix2023@outlook.com`) with paired agent-browser sessions
(`live` / `clone`) at 390 / 768 / 1440. Session 37 shipped v2.12 (the
first verification pass) at `cc0e8ca`; `aebf989` (session 38) added
only the operator's log upload — no code delta since the v2.12 build.

Baseline gate before any change (pulled at `aebf989`): lint 0 ·
typecheck 0 · 138/138 unit · build clean · 30/30 smoke · 115/115
Playwright. Infra re-verified: `.env` `DATABASE_URL="file:../db/custom.db"`
(`db/` at the repo root, re-seeded 3/31/36 after the smoke run), vitest
+ playwright configs functional, `.env.example` matches the codebase
and is tracked.

## Findings

### N-1 (NONE): the live remains byte-stable — second consecutive clean survey

Every pinned surface re-measured EQUAL on the live (390 / 768 / 1440,
authenticated), then paired-probed on the clone's production build:

- **Mobile navigation (the operator's named focus — WORKING AS
  EXPECTED on BOTH apps)**: the 390 tab census byte-identical (nav
  [0, 770.5, 390, 73.5], z 100, radius `20px 20px 0px 0px`; four
  anchors 73.2×53.5 at computed stroke 1.5 — `/`, `/goals`,
  `/my-tasks`, `/activity` — plus the MORE button 81.2×53.5); the MORE
  sheet opens (overlay z 200 `rgba(0,0,0,0.2)`, panel z 201 at
  [0, 541, 390, 303], radius `24px 24px 0px 0px`) and its rows carry
  the real hrefs `/tasks` · `/team` · `/settings` and navigate (both
  apps probed: URL → `/tasks`, h1 "Tasks"); the 768 pill nav
  (494.3×70.5 at [136.9, 937.5], z 100, r 20, six anchor chips,
  chip min-w 52, chip r 12).
- **Desktop (1440)**: the sidebar anchor census (brand → `/`, six
  nav rows h39, TASKS STATUS widget h80 → `/my-tasks`), the New Goal
  pill (132.3×40, r 12), the greeting h1, and the F14 user pill
  (inline-styled DIV, 149×44, pad 11/16, r 12, cursor pointer).
- **Views**: all six view h1s (Goals / My Tasks / Tasks / Agent
  Activity / Team / Settings — Team renders three h1 copies across
  the documented three-state DOM subtrees `md:hidden` /
  `hidden md:block lg:hidden` / `hidden lg:block`, expected); the
  activity pill (DIV 99.7×30.5, pad 7/12, gap 6, [dot 7][Online 38]
  [· 36 18.6]); the wizard deep link (`/goals?new=true` auto-opens;
  scrim z 100 `rgba(46,42,38,0.3)` flex; panel 680 wide at [380, 174,
  680, 552], r 24, pad 28/28/24); the add-task dialog (panel 500,
  r 20, pad 28/28/24, scrim z 200, input heights 35.5 / textarea 72 /
  select 35 / date 37.5 — clone settled-identical; the sub-pixel
  number-input delta is the documented zoom-in-95 animation artifact,
  pinned via `expect.poll` in v30); the login card (448×746, r 16,
  blur(4px)); the F13 surface (authenticated `/login` renders the
  card, URL stays on `/login`); the mobile app bar (390×62, radius
  `0px 0px 20px 20px`, pad 14/20) and its user pill (129.1×34,
  pad 7/12, r 10).
- **Tailwind v4 audit (code-level, unchanged since v2.12)**: no
  regressions — the login's `space-y-*` classes remain the documented
  v3-mirror sites, `rounded-xl` uses carry the shadcn `--radius` trap
  comments, and v30 settles every animation-affected read with
  `.poll()`.

### N-2 (non-finding, re-confirmed): the live's Team view shows its empty state (0 members / 0 agents)

The live's Team view renders "0 team members", "No team members yet —
Invite your team to get started.", and "No agents yet — Create an AI
agent to automate project tasks." This is the reference account's DATA
state, documented since v1.7/session 19 as a data-driven delta ("live
account has 0 team members") — NOT chrome drift. The clone seeds its
own demo workspace (12 people) and renders the same empty-state
structure when its team table is empty; the invite/new-agent surface
labels were reconciled in v1.7 (the "INVITE" vs "INVITE MEMBER" label
delta session 19 spotted was fixed then). No action.

**Conclusion: parity remains COMPLETE.** F1–F13 closed; F14 (the
live's inline-styled DIV pill trigger vs the clone's semantic
`<button>`) remains the only recorded deviation — a deliberate a11y
keep, geometry byte-equal, documented in PAD §v2.11 and pinned at
`v30:523`.

### P-1/P-2 (process notes — carried from v2.12, both re-observed)

- **P-1**: `db:seed` invalidates existing browser sessions (fresh
  user ids) — re-login before probing after any reseed (SKILL lesson
  21).
- **P-2**: `./scripts/smoke-test.sh` persists its round-trip rows in
  `db/custom.db`'s activity feed (36 → 40) — reseed before
  regenerating screenshots (done this session: reseeded after the
  gate, before the capture pass).

## Work streams

### WS-1 — source changes: NONE (evidence documented)

The v2.12 tree is at full parity; `aebf989` changed only docs. No
code, config, schema, or spec edits are warranted — inventing work
would risk the green gate. This plan is the audit trail.

### WS-2 — artifacts refresh (executed 2026-09-24)

1. Re-seed `db/custom.db` (pristine 3/31/36) after the smoke run.
2. Regenerate all 16 screenshots from the current production build
   (`capture-screenshots.mjs` + `capture-wizard.sh` with a real AI
   plan; scratch goal cleaned via `wizard-cleanup.mjs`; DB re-verified
   3/31/36). Dimensions verified: mobile 390×844, tablet 768×1024,
   login 1280×800 (the script's deliberate choice), rest 1440×900.
3. Verify `.env.example` matches the codebase — unchanged, tracked.

### WS-3 — documentation alignment

`docs/session_39.md`, `worklog.md` (session-39 entries),
`project-management_SKILL.md` (§header sessions 1–37 → 1–39).
README/PAD/AGENTS/CLAUDE verified accurate — unchanged. This plan
marked EXECUTED with the appended record.

### WS-4 — verification + ship

1. Re-run the fast gate (lint · typecheck · unit 138) on the
   unchanged tree; the build + smoke + e2e results from the baseline
   stand (identical source).
2. Conventional Commit on `main` (docs + screenshots only), push via
   `docs/ssh_git_wrapper_v3.py`, verify remote == local HEAD, shred
   the operator key.

## Execution record (2026-09-24) — PLAN EXECUTED

- Baseline gate GREEN at `aebf989`: lint 0 · typecheck 0 · 138/138
  unit · build clean · 30/30 smoke · 115/115 Playwright.
- Paired live/clone survey: every surface in N-1 re-measured EQUAL on
  both apps; mobile navigation (operator focus) confirmed
  byte-identical and functional on both; N-2 re-confirmed as the
  documented data delta.
- Screenshots: 16/16 regenerated from the current build (wizard pair
  via the real AI plan; scratch goal + its 12 activity entries
  cleaned; DB pristine 3/31/36 verified after). Dimensions all OK.
- Docs: session_39.md written, SKILL.md sessions list → 1–39,
  worklog.md appended, this record appended. README/PAD/AGENTS/CLAUDE
  verified accurate — unchanged.
- Fast gate re-verified on the shipped tree: lint 0 · typecheck 0 ·
  138/138 unit. Source untouched since the 115/115 e2e run.
- Commit `:memo: docs: v2.13 verification pass …` on `main`; push via
  the SSH wrapper verified (remote HEAD == local).
