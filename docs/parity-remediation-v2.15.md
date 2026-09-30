# Parity & Infrastructure Remediation — v2.15 (verification pass + docs-count repair)

Session 43 plan. Survey executed 2026-09-30 against the live reference
(`https://agent-pm-copy-15e23720.base44.app/`, authenticated as
`sepnetflix2023@outlook.com`) with agent-browser (live) at 390 / 768 /
1440 plus the self-contained paired clone probe
(`scripts/paired-probe-v214.mjs` — boots the production standalone
server as a child process, signs the demo user in once, re-measures
every pinned surface). Session 41 shipped v2.14 (the infrastructure
hardening) at `9237449`; `b9167d5` (session 42) added only the
operator's log upload — no code delta since the v2.14 build.

Baseline gate before any change (cloned at `b9167d5`): lint 0 ·
typecheck 0 · 138/138 unit · build clean · 30/30 smoke **from the
trap-carrying shell with no per-command override** (the v2.14 G-1 fix
re-verified: the sandbox exports an absolute `DATABASE_URL` into a
parent-workspace path that does not exist) · 115/115 Playwright.
Infra re-verified: `.env` `DATABASE_URL="file:../db/custom.db"`
(`db/` at the repo root), prisma generate + `db:push` + `db:seed`
(explicit env per the documented shell trap), vitest + playwright
configs functional out of the box, `.env.example` tracked and current.

## Findings

### N-1 (NONE): the live remains byte-stable — fourth consecutive clean survey

Every pinned surface re-measured EQUAL on the live (390 / 768 / 1440,
authenticated), then paired-probed on the clone's production build:

- **Mobile navigation (the operator's named focus — WORKING AS
  EXPECTED on BOTH apps)**: the 390 tab census byte-identical (nav
  [0, 770.5, 390, 73.5], z 100, radius `20px 20px 0px 0px`, pad
  8/8/12, upward shadow `rgba(160,143,126,0.22) 0 -4px 20px`; four
  anchors 73.2×53.5 at computed stroke 1.5 — `/`, `/goals`,
  `/my-tasks`, `/activity` — with labels Home/Goals/My Tasks/Agent,
  glyphs at 20px; the MORE button 81.2×53.5; the active chip carries
  the inset-well pair at r 14); the MORE sheet opens (overlay z 200
  `rgba(0,0,0,0.2)`, panel z 201 at [0, 541, 390, 303], radius
  `24px 24px 0px 0px`, pad 20/20/40, upward-only shadow, close
  32×32 r 10) and its rows carry the real hrefs `/tasks` · `/team` ·
  `/settings` and navigate (both apps probed: URL → `/tasks`, h1
  "Tasks"); the 768 pill nav (494.3×70.5 at [136.9, 937.5], z 100,
  r 20, pad 10/16, gap 4, six anchor chips, chip min-w 52, chip r 12
  — the clone's 494.9 at [136.5] is the documented
  self-hosted-DM-Sans-vs-system-ui font-advance artifact).
- **Desktop (1440)**: the sidebar census (aside [24,24,240,860]
  sticky top-0 height 860, six h39 nav rows, computed stroke 1.5,
  16px glyphs), the New Goal pill (132.3×40, r 12, pad 11/20, bg
  `#EEEAE6`, the standard raised pair), the greeting h1 ("Good
  Evening."), and the F14 user pill (inline-styled DIV on the live vs
  the clone's semantic `<button>` — the documented deliberate a11y
  keep, height/pad/radius byte-equal).
- **Views/dialogs**: all six view h1s (Goals / My Tasks / Tasks /
  Agent Activity / Team / Settings); the activity pill (DIV
  99.7×30.5, pad 7/12, gap 6, [dot 7×7][Online 38][· 36 18.6] — the
  live still carries 36 entries; the clone's 40 is P-2: this
  session's smoke + probe round-trip rows); the wizard deep link
  (`/goals?new=true` auto-opens; scrim z 100 `rgba(46,42,38,0.3)`
  flex center, pad 24/16; panel [380, 174, 680, 552], r 24, pad
  28/28/24 — the clone's 175/551 is the documented zoom-in-95
  mid-animation artifact); the add-task dialog (clone panel 500,
  r 20, pad 28/28/24, scrim z 200 `rgba(46,42,38,0.3)` flex); the
  login card (448×746, r 16, blur(4px)); the F13 surface
  (authenticated `/login` renders the card, URL stays on `/login`).
- **Tailwind v4 audit (code-level, five checks)**: no regressions —
  the global `button, [role="button"] { cursor: pointer }` base rule
  is in place (`globals.css:179`); the filter chips keep literal
  `rounded-[9999px]` (tasks/goals/my-tasks views + task-detail radio
  circles); every remaining `rounded-full` site is circle-semantics
  only (logo chips, avatars, the ping halo, the sheet handle, the
  clock face — none are byte-compared pill surfaces); the remaining
  `shadow-[…]` compositions carry fully-qualified rgba values; the
  mobile shell keeps the fixed mobile spec through 767 (no `sm:`
  growth in `orbital-app.tsx`).

### N-2 (non-finding, re-confirmed): the live's Team view empty state

"0 team members", "No team members yet", "No agents yet" — the
reference account's DATA state, documented since v1.7/session 19,
NOT chrome drift (re-confirmed this session; the clone seeds its own
12-person demo workspace and renders the identical empty-state
structure when its team table is empty).

### Code-quality sweep (Mode C audit — all clean)

No `TODO`/`FIXME`/placeholder text, no `console.log` leaks, no `any`
in `src/`, no skipped/`.only` tests, no hand-edited manifests; the
security seams verify (scrypt + `timingSafeEqual` + HMAC, the
fixed-window rate limiter at 10/15min); 16 route handlers as
documented; `next.config.ts` rewrites ↔ `router.ts` in sync;
`.gitignore` covers `.env` / `*.key` / `db/*.db`; the 16 committed
screenshots are current for the shipped tree (docs-only delta since
the v2.14 regeneration).

### G-1 (REAL, LOW, docs drift): stale "six rewrites" claims — `/tasks` made it seven in v2.7

Four doc spots still claim SIX view paths/rewrites while the actual
`next.config.ts` `rewrites()` list carries SEVEN entries (`/tasks`
was added in v2.7 for the all-tasks view). AGENTS.md, CLAUDE.md, and
README.md were all corrected in their v2.7/v2.10-era edits — the PAD
and the SKILL were missed, and the v2.14 docs pass (which fixed four
OTHER stale spots) did not catch these:

1. `Project_Architecture_Document.md:287` — ADR-001 Decision: "The
   six view paths (`/goals`, `/goals/:goalId`, `/my-tasks`,
   `/activity`, `/team`, `/settings`) are mapped onto `/`" → the
   list omits `/tasks` and the count is wrong.
2. `Project_Architecture_Document.md:390` — §2 Application layer:
   "one Node process serving the page (plus its six view-path
   rewrites) and 16 API routes" → stale count.
3. `project-management_SKILL.md:67` — §1 philosophy #5: "One
   workspace page, six path rewrites, zero per-view routes."
4. `project-management_SKILL.md:113` — §3 config notes: "the six
   path rewrites (`/goals`, `/goals/:goalId`, `/my-tasks`,
   `/activity`, `/team`, `/settings` → `/`)" → omits `/tasks`.

**Fix (WS-1):** all four spots corrected to "seven" with `/tasks`
added to the two parenthetical lists; ADR-001's History line gains
the v2.7 note so the count change is traceable.

### G-2 (REAL, LOW, process): `db/custom.db` activity rows drifted 36 → 40

This session's smoke run + paired probe each appended their
documented round-trip activity rows (P-2 pattern from session 37).
Not a code bug — but the pre-ship contract requires the shipped tree
to verify pristine 3/31/36. **Fix (WS-3):** reseed with the explicit
env pin, then verify via `scripts/check-db-state.mjs`.

### G-3 (REAL, LOW, docs): SKILL frontmatter/session-count is one session behind

`project-management_SKILL.md` frontmatter still reads
`last_updated: 2026-09-26` / "distilled from 41 build/remediation
sessions" / "Distilled from sessions 1–41 (v1.0 → v2.14)" — but the
repo now carries 43 sessions (session 42 = the operator's transcript
upload; session 43 = this one). **Fix (WS-2):** frontmatter
`last_updated` → 2026-09-30, sessions 1–43, description count → 43,
header quote updated, and §12 gains lesson 23 (the multi-doc
count-drift lesson this session surfaced — see below).

### G-4 (routine): this session's documentation set

Every session ships its log + worklog entries + revision notes: a
new `docs/session_43.md`, the worklog plan/execution entries, the
PAD v2.15 revision block + header bump, and a README v2.15 paragraph.
No source changes are warranted by the survey (parity complete,
gate green, audit clean) — the source tree stays untouched, so the
full gate re-verify after the edits is the fast lane (lint +
typecheck + unit; build/e2e already proven on this exact tree).

## Plan

**WS-1 — the four G-1 doc edits** (PAD:287 ADR-001 Decision +
History note; PAD:390 §2; SKILL:67 §1; SKILL:113 §3). Pure docs —
validated against the actual `next.config.ts` rewrites list (7
entries) and `src/lib/router.ts` (the `/tasks` mapping, pinned by
`src/lib/router.test.ts`).

**WS-2 — the G-3 SKILL refresh** (frontmatter `last_updated`,
session counts 1–43, header quote, description count) + lesson 23:
"When a count changes, grep EVERY doc for the old number in the same
commit" — the four 'six' spots survived three docs passes because
each pass only checked the docs it was editing.

**WS-3 — the G-2 reseed + pristine verify** (explicit env; 3/31/36
via `scripts/check-db-state.mjs`).

**WS-4 — the G-4 session documentation** (`docs/session_43.md` in
the structured format, worklog plan/execution entries, PAD v2.15
revision block + header, README v2.15 paragraph, this plan's
EXECUTED record).

**WS-5 — gate + ship.** Fast-gate re-verify on the edited tree
(lint → typecheck → unit; the build/e2e runs that opened this
session already prove the source tree), `git status` review (no
`.env`/`*.db` staged), Conventional Commit `:memo: docs:` on `main`,
push via `docs/ssh_git_wrapper_v3.py` (key outside the repo,
shredded after), remote HEAD verification.

## Execution record (completed 2026-09-30)

- [x] WS-1 executed — all four spots corrected ("seven" + `/tasks` in
  both parenthetical lists), ADR-001 History noted ("v2.7 added
  `/tasks` … doc count claims updated to match in v2.15"); repo-wide
  grep re-run: zero stale "six" claims remain in the doc set.
- [x] WS-2 executed — SKILL frontmatter (`last_updated` 2026-09-30,
  description "43 build/remediation sessions", header quote
  "sessions 1–43 (v1.0 → v2.15)") + §12 lesson 23 added.
- [x] WS-3 executed — DB reseeded (explicit env pin); pristine
  3/31/36 verified via `scripts/check-db-state.mjs`.
- [x] WS-4 executed — `docs/session_43.md` (structured log), worklog
  plan/execution entries, PAD v2.15 revision block + header bump,
  README v2.15 paragraph, this EXECUTED record.
- [x] WS-5 executed — fast-gate green on the edited tree (lint 0 ·
  typecheck 0 · 138/138 unit; the session's opening full gate — 30/30
  smoke from the trap shell, 115/115 e2e — already proves the
  untouched source tree); `git status` clean of `.env`/`*.db`;
  Conventional Commit `:memo: docs:` on `main`; push via
  `docs/ssh_git_wrapper_v3.py`; remote HEAD verified == local.

**Result:** v2.15 shipped as a docs-only verification pass — parity
complete (fourth consecutive clean paired survey), the stale
rewrite-count claims repaired at every site, SKILL lesson 23
distilled, gate green, DB pristine. No source changes were warranted.
