# Session 37 — v2.12: the verification pass (parity complete, no drift)

Task ID: v2.12-session-37. Session 35 shipped v2.11 (F13 closed) at
`5758062`; session 36 (the operator's log upload) added only
`docs/session_36.md` at `964ed32`. This session pulled `964ed32`,
re-ran the full gate, executed a fresh paired live/clone survey of
every pinned surface (the operator's mobile-navigation focus first),
audited the code for Tailwind v4 regressions, regenerated the
screenshot set, and shipped the verification record. **No source
changes were warranted — parity is complete and the live is stable.**

## What this session found and did

1. **Baseline**: pulled `964ed32` (docs-only delta since v2.11). Full
   gate GREEN: lint 0 · typecheck 0 · 138/138 unit · build clean ·
   30/30 smoke · 115/115 Playwright. Infra re-verified: `.env`
   `DATABASE_URL="file:../db/custom.db"` with `db/` at the repo root
   (the shell `DATABASE_URL` parent-workspace trap still active —
   every DB command pinned explicitly), vitest + playwright configs
   functional, `.env.example` current and tracked.
2. **Paired live/clone survey (authenticated, 390/768/1440)** — every
   surface re-measured on BOTH apps and compared:
   - **Mobile navigation (the operator's named focus): WORKING AS
     EXPECTED, byte-identical on both apps.** The 390 tab census
     (nav [0, 770.5, 390, 73.5], z 100, radius `20px 20px 0px 0px`;
     four anchors 73.2×53.5 at computed stroke 1.5 — `/`, `/goals`,
     `/my-tasks`, `/activity` — + MORE 81.2×53.5); the MORE sheet
     (overlay z 200, panel z 201 [0, 541, 390, 303], radius
     `24px 24px 0px 0px`, rows → `/tasks` `/team` `/settings`) opens
     and navigates on both; the 768 pill nav (494.3×70.5, z 100,
     r 20, six chips, chip min-w 52 r 12). The live's closed sheet
     keeps a `translateY(100%)` mounted panel — same Radix keep as
     the clone.
   - **Desktop**: sidebar anchor census (brand + six h39 rows +
     TASKS STATUS), New Goal pill 132.3×40 r12, the F14 user pill
     (inline DIV 149×44 pad 11/16 r12 — unchanged, deliberate a11y
     keep), greeting h1.
   - **Views/dialogs**: all six view h1s; the activity pill (99.7×30.5,
     pad 7/12, gap 6, [dot 7][Online 38][· 36 18.6]); the wizard deep
     link (scrim z 100 `rgba(46,42,38,0.3)` flex, panel 680 r24 pad
     28/28/24, auto-opens); the **add-task dialog paired-probed for
     the first time since v2.10** (panel 500 r20 pad 28/28/24, scrim
     z 200, input heights 35.5 / textarea 72 / select 35 / date 37.5 —
     the clone's raw reads differ by ≤3px only mid-animation; the
     settled `expect.poll` pins are green); the login card (448×746,
     r 16, blur(4px)); the F13 surface (authenticated `/login`
     renders the card on both apps; re-sign-in lands on `/`).
   - **No new drift. F1–F13 closed; F14 remains the only recorded
     finding** (a deliberate a11y deviation, geometry byte-equal,
     pinned at `v30:523`).
3. **Tailwind v4 code audit (no regressions)**: the login's remaining
   `space-y-*` classes are the documented v3-mirror sites
   (`login-screen.tsx` comments at 142/164/197/242/320/345); the
   `rounded-xl` uses carry the shadcn `--radius` trap comments
   (`user-menu.tsx:37/59`); the v30 spec settles every
   animation-affected read with `.poll()` (129/151/208/336). The v4
   bug classes fixed in v2.8–v2.10 (space-y direction flip, zero-alpha
   composed shadows, literal chip radius, dialog animation artifacts)
   all stay pinned and green.
4. **Artifacts**: `db/custom.db` reseeded to pristine 3/31/36 (the
   smoke run had left 4 activity rows — process note P-2); all 16
   screenshots regenerated from the current production build
   (`capture-screenshots.mjs` + `capture-wizard.sh` with a real AI
   plan — 12 tasks generated, scratch goal + its 12 activity entries
   cleaned, DB re-verified pristine); the login shot's 1280×800
   viewport is the script's deliberate choice. `.env.example`
   verified to match the codebase.
5. **Process notes recorded (not code bugs)**: **P-1** — `db:seed`
   invalidates existing browser sessions (fresh user ids), so
   pre-reseed logged-in contexts render empty views until re-login
   (observed: "All (0)" with a stale cookie while the DB held 3
   goals); **P-2** — the smoke suite's round-trips persist in
   `db/custom.db`'s activity feed (36 → 40). Both added to SKILL
   lesson 21 for the next sessions.
6. **Docs**: `docs/parity-remediation-v2.12.md` (the verification-pass
   plan + execution record), this file, SKILL.md (sessions 1–37,
   lesson 21), `worklog.md`. README/PAD/AGENTS/CLAUDE verified
   accurate against the code — unchanged.
7. **Fast gate re-verified on the shipped tree**: lint 0 · typecheck
   0 · 138/138 unit (source untouched since the 115/115 e2e run).
8. **Ship**: Conventional Commit on `main`, push via
   `docs/ssh_git_wrapper_v3.py` (key saved outside the repo, shredded
   after), remote HEAD verified == local.

## The DATABASE_URL shell trap (still active)

The sandbox shell exports
`DATABASE_URL=file:/home/z/my-project/db/custom.db` (parent
workspace) into every command — `unset` does not survive between tool
invocations. Every prisma/seed/server command this session pinned
`DATABASE_URL="file:../db/custom.db"` explicitly; the standalone
server and the Playwright webServer carry their own explicit values.
