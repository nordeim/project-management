# Session 18 — mobile-nav parity re-measure + infrastructure hardening (v2.3)

Continuing from session_17 (v2.2 shipped at df3fb67; session_17 log +
env-example commit 23ae338 followed). Workspace re-cloned at 23ae338.

Core docs re-read (AGENTS/CLAUDE/README/PAD v2.2 + sessions 15–17), skills
catalog consulted (tdd, agent-browser, clone-app-pat-pro, nextjs16-tailwind4
§9 mobile-nav failure taxonomy + §10 Tailwind v4 visual debugging,
distill-codebase-skill, to-distill-project-into-skill).

**Baseline gate GREEN in the fresh clone** — lint 0 · typecheck 0 · 122/122
unit · build clean · 30/30 smoke.

**Environment hardening first (user-mandated):** `.env` set to
`DATABASE_URL="file:../db/custom.db"` with `db/` at the repo root (seeded:
3 goals · 31 tasks · 10 people · 22 activity). Two traps found and fixed:

- The sandbox shell exports an ABSOLUTE `DATABASE_URL` that overrides
  `.env` everywhere (dotenv never overrides existing process env) — all
  commands run with `env -u DATABASE_URL`.
- **The committed `.env.example` (23ae338) referenced four artifacts that
  did not exist**: `src/lib/db-path.ts`, `tests/db-path.test.ts`,
  `docs/DEPLOYMENT.md` §4, and a `NEXT_PUBLIC_SITE_URL` no code read.

**Live-app crawl (two authenticated agent-browser sessions, 390/768/1440):**
mobile chrome, all views at mobile + desktop, goal detail, login, date
picker, dialogs, and the full functional flows (wizard with REAL AI
clarify + 8-task generation, check-in + activity narration, inline delete,
MORE-sheet navigation). 8 VLM misreads disproven by computed styles
(login input backgrounds "differ" — identical rgba(248,250,252,0.5);
login card shadow "differs" — same shadow-2xl; the red "2 issues" badge is
the Next dev-tools indicator, dev-only).

**v2.3 findings (all computed-style verified on both apps):**

- F1 **Mobile bottom-nav ACTIVE tab carries an inset-well chip** (the
  v1.7 "color-only active state" reading no longer matches the live):
  every tab wraps icon+label in a flex-column chip (gap 4, pad 8/4, r14);
  active = `.orb-nav-active` bright inset pair; MORE never welled.
- F2 Team INVITE label is RESPONSIVE: "INVITE" (w96) below sm /
  "INVITE MEMBER" (w150) from sm (`hidden sm:inline` / `sm:hidden` spans).
- F3 Goal-card "· N blocked" renders body-case + normal tracking (w55.9;
  the clone's uppercase/0.88px-tracking chip inheritance was wrong).
- F4 Seed goal order: live = Product Onboarding → Launch → Q3; seed's
  sortOrder 2/3 were swapped.
- F5 Team headers never wrap: NEW AGENT stays inline right (x243.3) at 390;
  the clone's `flex-wrap` dropped it below.
- F6 Login logo is a CIRCULAR chip (rounded-full + ring-4 ring-white/50 +
  shadow-lg, 80/96px responsive) — retires the v1.9 rounded-square reading.

**db-path extraction (TDD, the deepest fix of the session):** wrote
`tests/db-path.test.ts` red → implemented `src/lib/db-path.ts` → refactored
`db.ts` to delegate. The first version still failed in the standalone
build — root-caused with runtime instrumentation to the **Next standalone
`server.js` `process.chdir(__dirname)` trap**: by module-init time cwd is
`.next/standalone`, the tracer has copied `prisma/schema.prisma` INTO it,
and the plain CWD rule resolves relative URLs against the BUILD OUTPUT
(`.next/standalone/db/…` → SQLite error 14). Worse, Turbopack rewrites
`import.meta.url` into a VIRTUAL `<standalone>/src/lib/db-path.ts`. Fix:
anchor order = standaloneRepoRoot(cwd) FIRST (detector: basename
"standalone" + server.js + grandparent schema), then the module root
VALIDATED by the source file existing on disk (the virtual path fails this
check), then the CWD. 15 db-path checks; unit suite 122 → 137.

**Playwright layer added (26 checks, `bun run test:e2e`):** config boots
the production standalone server on :3100 against an isolated `db/e2e.db`
(global setup pushes + seeds it). A setup project signs the demo user in
ONCE and shares the cookie via storageState — per-test API logins tripped
the 10/IP/15min rate limiter mid-suite (learned the hard way). Specs pin:
login round-trip (incl. the circular logo chip), SPA path routes +
back/forward + 404, goals surface (seed order, blocked typography,
add-task dialog validation, inline delete), and the mobile + 768 navigation
chrome (active-tab inset well, MORE sheet, pill nav). Playwright-specific
traps solved en route: sandbox thread limits (close extra Chromium
sessions before runs), `hasTouch` for `.tap()`, `devices["iPhone 13"]`
switching to webkit, multi-subtree strict-mode (`.filter({ visible: true })`),
Tailwind v4 computed-value quirks (`rounded-full` → 33554432px,
`ring-white/50` → oklab()).

**Site metadata wired:** `metadataBase` from `NEXT_PUBLIC_SITE_URL` +
`src/app/sitemap.ts` + `docs/DEPLOYMENT.md` (§4 = database location) — the
`.env.example` contract is now fully true.

**Verification:** full gate green — lint 0 · typecheck 0 · **137/137 unit**
· build clean · **30/30 smoke** · **26/26 Playwright** — plus computed-style
re-probes of every changed surface (tab chip exact; INVITE x276.4 y102
w95.6 exact; NEW AGENT x243.3 inline exact; blocked span w55.9 ls-normal
exact after adding `tracking-normal`; login chip 96px circular) and a VLM
sanity pass: NEAR-IDENTICAL on all four changed mobile surfaces.

**Docs aligned (WS-9):** README (mobile-nav bullet, login logo, Playwright
layer, env table, troubleshooting, the retired `.orb-pill-outline-sm`
reference replaced with `.orb-nav-active`), AGENTS.md (commands + gate
order + db-path fact + mobile bullet + seam list), CLAUDE.md (testing
strategy + counts + login logo), PAD v2.3 revision block, `.env.example`
verified truthful, `project-management_SKILL.md` distilled (20 sections +
appendices per the distill skills), screenshots regenerated from the
PRODUCTION build (no dev badge), session_18 + worklog written, the v2.3
plan marked executed.

**Suggested next steps:** none required — the changed chrome is pinned by
Playwright now. Optional: crawl the remaining logged-OUT states above 1024
(login at 768), and re-run the gate in a fresh clone after pulling.
