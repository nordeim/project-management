# Session 41 — v2.14: infrastructure hardening (parity holds, third clean survey)

Task ID: v2.14-session-41. Session 39 shipped v2.13 (the second
verification pass) at `1dc196f`; session 40 (`b0ce1d9`) added only the
operator's log upload. This session pulled `b0ce1d9`, re-ran the full
gate, executed a third fresh paired live/clone survey of every pinned
surface (the operator's mobile-navigation focus first), audited the
code for Tailwind v4 regressions, then — with parity confirmed complete
— hardened the infrastructure instead of touching pixels: the smoke
suite's env trap, the last unpolled animation read, and the screenshot
capture flow's sandbox fragility.

## What this session found and did

1. **Baseline**: cloned `b0ce1d9` (docs-only delta since v2.13). Infra
   rebuilt from scratch: `.env` created from `.env.example` with
   `DATABASE_URL="file:../db/custom.db"` (`db/` at the repo root),
   `bun install` (480 pkgs), prisma generate, `db:push` + `db:seed`
   (pristine 3/31/36 — explicit env per the documented shell trap).
   Vitest + Playwright configs verified functional out of the box.
2. **Baseline gate**: lint 0 · typecheck 0 · 138/138 unit · build clean
   · smoke **12/30 until `DATABASE_URL` was pinned per-command**
   (G-1 — the script itself never pinned it; the inherited absolute
   parent-workspace path booted the server against a non-existent
   database: "Error code 14") · e2e **114/115 on the first run** (G-2 —
   the v2.6 check-in panel-height pin read the modal mid-animation;
   an immediate re-run was 115/115, confirming the flake class).
3. **Paired live/clone survey (authenticated, 390/768/1440)** — live
   via agent-browser, clone via the new self-contained
   `scripts/paired-probe-v214.mjs` (boots the production server as a
   child process; the sandbox reaps background servers between shell
   invocations, so the probe and the server must share one process
   tree). Every pinned surface measured EQUAL:
   - **Mobile navigation (the operator's named focus): WORKING AS
     EXPECTED, byte-identical on both apps.** The 390 tab census (nav
     [0, 770.5, 390, 73.5], z 100, radius `20px 20px 0px 0px`; four
     anchors 73.2×53.5 at computed stroke 1.5 — `/`, `/goals`,
     `/my-tasks`, `/activity`, labels Home/Goals/My Tasks/Agent — plus
     the MORE button 81.2×53.5; active chip inset-well r14); the MORE
     sheet (overlay z 200 `rgba(0,0,0,0.2)`, panel z 201
     [0, 541, 390, 303], radius `24px 24px 0px 0px`, pad 20/20/40,
     close 32×32 r10) opens and its rows carry the real hrefs and
     navigate (both apps: URL → `/tasks`, h1 "Tasks"); the 768 pill
     nav (494.3×70.5 z 100, r 20, pad 10/16, gap 4, six anchor chips,
     chip min-w 52, chip r 12).
   - **Desktop**: sidebar census (aside [24,24,240,860] sticky, six
     h39 rows, TASKS STATUS h80, clock 80 r50%), New Goal pill
     132.3×40 r12 pad 11/20 (clone 131.7 — the documented DM-Sans
     font-advance artifact), greeting h1, F14 user pill unchanged
     (inline DIV on the live vs the semantic button on the clone;
     height/pad/radius byte-equal — the width delta is the account
     name vs the demo user, data not chrome).
   - **Views/dialogs**: all six h1s; the activity pill (pad 7/12, gap
     6, [dot][Online][· N] — the clone's 40 vs the live's 36 is P-2,
     the smoke round-trip rows); the wizard deep link (scrim z 100
     `rgba(46,42,38,0.3)` flex, panel [380, 174, 680, 552] r 24 pad
     28/28/24; clone 175/551 = the zoom-in-95 artifact); the add-task
     dialog (clone panel 500 r 20 pad 28/28/24, scrim z 200); the
     login card (448×746, r 16, blur 4px); F13 (authenticated
     `/login` renders the card on both).
   - **N-2 re-confirmed**: the live's Team view empty state — the
     reference account's data, documented since v1.7, not drift.
   - **Tailwind v4 audit**: no regressions (cursor rule in the base
     layer; filter chips on literal 9999px; chrome shadows as plain
     declarations; remaining `shadow-[…]` compositions fully
     qualified; the circle-semantics `rounded-full` sites are not
     byte-compared surfaces).
4. **Remediation plan** (`docs/parity-remediation-v2.14.md`): with
   parity complete, five genuine gaps — G-1 (smoke env pin), G-2
   (check-in pin poll), G-3..G-6 (four stale doc spots), G-7
   (self-contained captures). Every fix site validated against
   source before execution.
5. **Fixes (TDD where a seam exists)**:
   - G-1: `smoke-test.sh` pins `DATABASE_URL="file:../db/custom.db"`
     before the server boot. RED: 12/30 from the trap-carrying shell
     with no override. GREEN: 30/30 from the same shell, no override.
   - G-2: the check-in panel-height read converted to `expect.poll`
     (the v30 settle pattern; pins unchanged). Stability: 10/10
     repeated single-test runs green; full e2e 115/115.
   - G-7: `scripts/capture-all.sh` — reseed → boot (pinned env) →
     14 standard shots → wizard pair (real AI plan) → scratch cleanup
     → pristine verify → shutdown, all in ONE invocation;
     `capture-wizard.sh` re-asserts its viewport after the first
     `open` (the implicit browser launch could drop the racing
     resize — first capture pass produced 1280×577 wizard shots;
     after the fix, 1440×900 as committed).
6. **Artifacts**: 16/16 screenshots regenerated (dimensions verified:
   mobile 390×844, tablet 768×1024, login 1280×800 by design, rest
   1440×900); DB pristine 3/31/36 after the pass; `.env.example`
   verified tracked + current.
7. **Docs**: README (v2.12/v2.13 verification notes + the v2.14
   paragraph + the 115 count fix), PAD (v2.14 + v2.13/v2.12 revision
   blocks, §4.1 36 rows, header v2.14), SKILL (sessions 1–41, lesson
   22, §18 z-map → the v2.10 system, frontmatter), AGENTS (the
   smoke/screenshot command rows), this file, the v2.14 plan's
   EXECUTED record, `worklog.md`.
8. **Full gate on the fixed tree**: lint 0 · typecheck 0 · 138/138
   unit · build clean · 30/30 smoke (trap shell, no override) ·
   115/115 Playwright.
9. **Ship**: Conventional Commit on `main`, push via
   `docs/ssh_git_wrapper_v3.py` (key saved outside the repo, shredded
   after), remote HEAD verified == local.
