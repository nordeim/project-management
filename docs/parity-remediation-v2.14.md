# Parity & Infrastructure Remediation — v2.14

Session 41 plan. Survey executed 2026-09-25/26 against the live reference
(`https://agent-pm-copy-15e23720.base44.app/`, authenticated as
`sepnetflix2023@outlook.com`) with agent-browser at 390 / 768 / 1440 plus a
paired clone probe (`scripts/paired-probe-v214.mjs` — self-contained: boots
the production standalone server as a child process, signs in once, re-
measures every pinned surface). Session 39 shipped v2.13 (the second
verification pass) at `1dc196f`; `b0ce1d9` (session 40) added only the
operator's log upload — no code delta since the v2.13 build.

Baseline gate before any change (pulled at `b0ce1d9`): lint 0 ·
typecheck 0 · 138/138 unit · build clean · 30/30 smoke (after pinning
`DATABASE_URL` for the smoke server — see G-1) · 115/115 e2e on re-run
(the first run hit 1/114 on the v2.6 check-in pin — see G-2). Infra
re-verified: `.env` `DATABASE_URL="file:../db/custom.db"` (`db/` at the
repo root, seeded pristine 3/31/36), vitest + playwright configs
functional, `.env.example` tracked and current.

## Findings

### N-1 (NONE): the live remains byte-stable — third consecutive clean survey

Every pinned surface re-measured EQUAL on the live (390 / 768 / 1440,
authenticated), then paired-probed on the clone's production build:

- **Mobile navigation (the operator's named focus — WORKING AS EXPECTED
  on BOTH apps)**: the 390 tab census byte-identical (nav [0, 770.5, 390,
  73.5], z 100, radius `20px 20px 0px 0px`; four anchors 73.2×53.5 at
  computed stroke 1.5 — `/`, `/goals`, `/my-tasks`, `/activity` — plus the
  MORE button 81.2×53.5; labels Home/Goals/My Tasks/Agent; glyphs
  layout-dashboard/target/square-check-big/activity at 20px; active chip
  inset-well r14); the MORE sheet opens (overlay z 200 `rgba(0,0,0,0.2)`,
  panel z 201 at [0, 541, 390, 303], radius `24px 24px 0px 0px`, pad
  20/20/40, close 32×32 r10) and its rows carry the real hrefs `/tasks` ·
  `/team` · `/settings` and navigate (both apps probed: URL → `/tasks`,
  h1 "Tasks"); the 768 pill nav (494.3×70.5 z 100, r 20, pad 10/16, gap
  4, six anchor chips, chip min-w 52, chip r 12 — the clone's 494.9/136.5
  x-delta is the documented self-hosted-DM-Sans-vs-system-ui font-advance
  artifact, structure identical).
- **Desktop (1440)**: the sidebar census (aside [24,24,240,860] sticky,
  six h39 nav rows, brand pl10/mb32, TASKS STATUS widget h80, clock 80px
  r50%), the New Goal pill (132.3×40, r 12, pad 11/20, 12px/600 — clone
  131.7×40 same specs), the greeting h1, and the F14 user pill
  (inline-styled DIV on the live vs the clone's semantic `<button>`
  99×44 — height/pad 11/16/r12 byte-equal; the width delta is
  content-driven: the account name `sepnetflix2023` vs the demo user —
  data, not chrome).
- **Views/dialogs**: all six view h1s (Goals / My Tasks / Tasks / Agent
  Activity / Team / Settings); the activity pill (DIV ~100×30.5, pad
  7/12, gap 6, [dot][Online][· N] — the clone's "· 40" vs the live's
  "· 36" is P-2: the smoke run's round-trip rows; structure pinned, count
  is a floor); the wizard deep link (`/goals?new=true` auto-opens; scrim
  z 100 `rgba(46,42,38,0.3)` flex; panel [380, 174, 680, 552] r 24, pad
  28/28/24 — the clone's 175/551 is the documented zoom-in-95 mid-
  animation artifact); the add-task dialog (clone panel 500 r 20 pad
  28/28/24, scrim z 200 `rgba(46,42,38,0.3)` flex); the login card
  (448×746, r 16, blur(4px)); the F13 surface (authenticated `/login`
  renders the card, URL stays on `/login`).
- **Tailwind v4 audit (code-level)**: no regressions — the global
  `button, [role="button"] { cursor: pointer }` base rule is in place;
  the filter chips keep literal `rounded-[9999px]`; the chrome shadows
  stay plain-declaration custom classes; the remaining `shadow-[…]`
  compositions carry fully-qualified rgba values (byte-clean); the
  circle-semantics `rounded-full` sites (avatars, dots) are not
  byte-compared surfaces; v30 settles animation-affected reads with
  `.poll()` — except the one site G-2 fixes below.

### N-2 (non-finding, re-confirmed): the live's Team view empty state

"0 team members", "No team members yet", "No agents yet" — the reference
account's DATA state, documented since v1.7/session 19, NOT chrome drift
(re-confirmed this session; the three copies are the documented
three-state DOM subtrees).

### G-1 (REAL, infra): smoke-test.sh does not pin DATABASE_URL for its server

Reproduced this session: booted from the sandbox shell (which exports
`DATABASE_URL=file:/home/z/my-project/db/custom.db` — an absolute path
into the parent workspace that does not exist), the standalone server
inherits it, `resolveProcessDatabaseUrl` passes absolute URLs through
untouched, and every authenticated endpoint fails ("Error code 14:
Unable to open the database file") → 12/30 smoke failures. Prior
sessions neutralized the trap per-command; the script itself never
pinned it, so any operator running `./scripts/smoke-test.sh` from a
trap-carrying shell reproduces the failure. **Fix: the script pins
`DATABASE_URL="file:../db/custom.db"` explicitly before booting the
server** (same explicit-value discipline as the Playwright webServer,
which is why e2e was never affected). The 30-check suite itself is the
regression test: it must pass 30/30 with the trap active in the parent
shell.

### G-2 (REAL, test flake): v2.6 check-in panel height is a one-shot animation read

Reproduced this session: first full e2e run failed 1/114 at
`v26-parity.spec.ts:209` ("16px inner spacing grows the panel to
~353px"); an immediate re-run passed 115/115 — the classic zoom-in-95
mid-animation artifact (the modal's ~200ms scale animation makes a
one-shot height read land at ~0.97× when the evaluate races the
animation). The v2.10/v2.12 passes converted every animation-affected
read in v30 to `expect.poll`; this v2.6-era pin kept a bare `evaluate`.
**Fix: wrap the height read in `expect.poll`** (pin value unchanged).
Stability evidence: repeated single-test runs before/after the fix.

### G-3..G-6 (docs drift, four stale spots)

- **G-3**: README Testing code block says "73 browser checks" — every
  other location (and reality) says 115.
- **G-4**: SKILL §18 z-map still shows the pre-v2.10 system (tab bar 40,
  sheet/dialogs 50, toasts 100) — the shipped system is 100 (tab bar) ·
  200/201 (sheet overlay/panel) · 200 (form dialogs) · 100 (wizard) ·
  50 (check-in) · 210 (date picker).
- **G-5**: PAD §4.1 seed table says 22 ActivityLog rows — the v2.5
  regenerated seed writes 36.
- **G-6**: SKILL frontmatter description says "35 build/remediation
  sessions" — the header says sessions 1–39 (now 1–41).

### G-7 (robustness, tooling): screenshot capture assumes an external server

`capture-screenshots.mjs` and `capture-wizard.sh` both target
`localhost:3000` expecting an externally-started server. In this sandbox
(background processes are reaped between shell invocations) the capture
pass dies unless the server and the captures share one invocation.
**Fix: `scripts/capture-all.sh` — one wrapper that boots the standalone
server with the pinned env, waits for health, runs
`capture-screenshots.mjs`, then `capture-wizard.sh` +
`wizard-cleanup.mjs`, reseeds, and shuts down.** The paired probe
(`scripts/paired-probe-v214.mjs`) already demonstrates the
child-process pattern; the wrapper mirrors it for the agent-browser
leg. `paired-probe-v214.mjs` is kept as the session's paired-survey
artifact (research tooling — but unlike `research/` scratch, it is the
reusable survey probe; tracked under `scripts/` per the existing probe
family).

## Work streams

### WS-1 — source fixes (TDD where a seam exists)

1. **G-1**: `scripts/smoke-test.sh` — pin `DATABASE_URL` before the
   server boot. Verify: run the suite from the trap-carrying shell
   WITHOUT a per-command override → 30/30.
2. **G-2**: `tests/e2e/v26-parity.spec.ts:209` — convert the panel-
   height read to `expect.poll(...)` (pin value unchanged). Verify:
   repeated runs green; full e2e 115/115.

### WS-2 — artifacts refresh

1. `db/custom.db` reseeded to pristine 3/31/36 after the gate (P-2).
2. All 16 screenshots regenerated from the current production build via
   the new `scripts/capture-all.sh` (server + captures in one
   invocation; wizard pair with a real AI plan; scratch goal cleaned).
3. `.env.example` verified (tracked, matches the codebase).

### WS-3 — documentation alignment

G-3..G-6 fixes (README 115, SKILL z-map, PAD 36 rows, SKILL frontmatter
sessions), `docs/session_41.md`, this plan's EXECUTED record,
`worklog.md` (session-41 entries), `project-management_SKILL.md`
(§header sessions 1–41; the G-1/G-2 lessons appended — lesson 22: pin
the env inside the script, not per-command; the G-2 note rides the
existing poll-settle lesson). AGENTS/CLAUDE verified accurate — the
smoke-script fix changes no command contract (AGENTS' gate table
unchanged).

### WS-4 — verification + ship

1. Full gate on the fixed tree: lint → typecheck → 138 unit → build →
   smoke (30/30 from the trap-carrying shell) → e2e 115/115.
2. Paired re-probe of the changed surfaces (smoke server env — implicit
   in the 30/30; check-in pin — implicit in the 115/115).
3. Conventional Commit on `main`, push via `docs/ssh_git_wrapper_v3.py`,
   verify remote == local HEAD, shred the operator key.

## Execution record (2026-09-26) — PLAN EXECUTED

- Baseline gate GREEN at `b0ce1d9` (G-1/G-2 caveats above).
- Paired live/clone survey: every surface in N-1 re-measured EQUAL on
  both apps; mobile navigation (operator focus) confirmed byte-identical
  and functional on both; N-2 re-confirmed as the documented data delta.
- WS-1 executed: G-1 smoke-script env pin (30/30 from the trap shell,
  no per-command override); G-2 check-in pin converted to expect.poll
  (10/10 repeated single-test runs green; full e2e 115/115).
- WS-2 executed: db reseeded pristine 3/31/36; 16/16 screenshots
  regenerated via `scripts/capture-all.sh` (one invocation: server +
  shots + wizard pair + cleanup + reseed); dimensions verified (mobile
  390×844, tablet 768×1024, login 1280×800 by design, rest 1440×900);
  `.env.example` verified tracked + current.
- WS-3 executed: README (115 browser checks), SKILL (z-map → the v2.10
  system, frontmatter sessions, §header 1–41, lesson 22), PAD (§4.1 36
  activity rows), session_41.md, this record, worklog entries.
- WS-4 executed: full gate green on the shipped tree; Conventional
  Commit on `main`; push via the SSH wrapper verified (remote HEAD ==
  local).
