# Parity & Infrastructure Remediation — v2.3 — EXECUTED

Session 18 plan. (Execution record: all ten work streams shipped 2026-09-22; gate 137/137 unit · 30/30 smoke · 26/26 Playwright; every changed surface re-probed exact against the live. See docs/session_18.md.) Survey executed 2026-09-22 against the live reference
(`https://agent-pm-copy-15e23720.base44.app/`, authenticated) and the clone
(production + dev servers) with two agent-browser sessions at 390 / 768 / 1440.
Every finding below is computed-style verified on both apps (VLM claims were
cross-checked; 8 VLM misreads disproven by measurement this session).

Baseline gate before any change: lint 0 · typecheck 0 · 122/122 unit · build
clean · 30/30 smoke. The v2.2 push is healthy.

## Findings

### A. Visual parity deltas (live vs clone)

- **F1 — Mobile bottom-nav ACTIVE tab (HIGH).** The live wraps EVERY tab's
  icon+label in a `flex column center gap-4px pad 8px/4px radius-14px`
  wrapper; the ACTIVE tab's wrapper gets the BRIGHT inset-well treatment
  (`bg #EBE7E2`, `inset -3px -3px 6px rgba(255,252,248,0.75)`, `inset 3px 3px
  6px rgba(180,165,150,0.32)` — the `.orb-nav-active` pair). Inactive wrappers
  stay transparent. The MORE tab never receives the well (its active state is
  text-color only). The clone renders tabs with color-only active state and no
  wrapper. The v1.7 "color-only active state" reading is retired — the live
  has changed (or was misread).
- **F2 — Team INVITE label is responsive (MEDIUM).** Live button markup:
  `<Plus 12/> <span class="hidden sm:inline">Invite Member</span><span
  class="sm:hidden">Invite</span>` → renders "INVITE" (w≈96) below sm,
  "INVITE MEMBER" (w≈150) from sm up. The clone renders "Invite Member" at
  every width (w≈152 at 390).
- **F3 — Goal-card blocked count renders UPPERCASE in the clone (LOW).** The
  "· N blocked" span inherits the chip's `text-transform: uppercase`; the live
  renders it lowercase (`text-transform: none`, w55.9 vs clone w73.1). Three
  occurrences in `goals-view.tsx` (mobile chip, desktop chip, list row).
- **F4 — Seed goal order differs (LOW).** Live: Product Onboarding Redesign →
  Launch new landing page → Q3 Content Marketing Campaign. Clone seed:
  sortOrder 2 = Q3 Content, 3 = Launch (swapped relative to the live). API
  orders by `sortOrder asc, createdAt desc`.
- **F5 — Team AI-Agents header wraps on mobile (MEDIUM).** The live header is
  a no-wrap `flex items-center justify-between` row (button `flex-shrink: 0`,
  inline at every width); the clone's `flex-wrap gap-3` drops the NEW AGENT
  button below the heading at 390 (y526 vs live y485, x18 vs live x243).
- **F6 — Login logo container (MEDIUM).** The live renders a 96px (sm+) /
  80px (below sm) CIRCULAR white disc — `rounded-full ring-4 ring-white/50
  shadow-lg` — carrying the purple 1-2-3 dot pyramid. The clone renders a
  flat white rounded square (rx≈8.2%) with no ring/shadow at a fixed 96px.
  (Login inputs and the card itself are identical — VLM misreads.)

### B. Repo-internal misalignments (code vs committed docs)

- **F7 — `.env.example` (commit 23ae338) references artifacts that do not
  exist:** `src/lib/db-path.ts`, `tests/db-path.test.ts`, `docs/DEPLOYMENT.md`
  §4, and a `NEXT_PUBLIC_SITE_URL` variable that no code reads (no
  metadataBase, no sitemap; robots.txt is static). Either implement the
  documented contract or the example lies to every fresh clone.
- **F8 — SQLite URL resolution is CWD-dependent.** `src/lib/db.ts` resolves
  relative `file:` URLs against `process.cwd()/prisma`. Starting the server
  outside the repo root opens (or creates) the wrong database file — the
  documented "Error code 14" failure. The `.env.example` contract promises
  schema-relative resolution "regardless of the process working directory".
- **F9 — No Playwright layer.** The user requires a Playwright suite wired
  through config files; only Vitest (unit) + smoke-test.sh (curl) exist. The
  mobile navigation — the highest-risk surface — has no browser-level
  regression test.
- **F10 — Docs stale relative to F1:** README/AGENTS/CLAUDE describe the
  mobile tab bar as "color-only active state" and the login logo as the
  "rounded-square" mark; both need revision after the fixes.

### C. Non-findings (verified equal — do not touch)

Mobile chrome (app bar 62px, bottom bar 390×74 y770 r20-top, MORE sheet
390×303 y541 r24 + 20%/4px-blur scrim), the 768 middle state (pill nav
geometry + inset-well active chip; 4px residual = the live's Team-chip
rendering quirk, documented in session 17), desktop sidebar (240×860, 39px
rows, active well), goals/my-tasks/activity/settings views at both widths,
goal-detail at 1440, login inputs/card, date-picker two-layer popover
(262/r14/#ECEBE9 + 260/r16/#EEEAE6), and all functional flows exercised:
login, wizard (AI clarify + 8-task generation), check-in (status flip +
activity narration), inline delete, mobile MORE-sheet navigation.

## Work streams

### WS-1 — db-path extraction (TDD) [F7, F8]

1. RED: write `tests/db-path.test.ts` pinning the contract — default URL
   when env is empty (`<schemaRoot>/db/custom.db`), relative `file:` resolved
   against `<schemaRoot>/prisma` (the CLI rule), absolute POSIX + Windows
   drive-letter passthrough, non-SQLite passthrough, anchor selection (first
   anchor containing `prisma/schema.prisma` wins; CWD fallback when none),
   whitespace trimming.
2. GREEN: create `src/lib/db-path.ts` — pure `resolveDatabaseUrl(envUrl,
   anchors)` + thin `candidateRoots()` (`process.cwd()` first, then the
   module's repo root derived from `import.meta.url` behind a try/catch so
   bundled contexts degrade to today's behavior).
3. Refactor `src/lib/db.ts` to delegate to the seam (public surface
   unchanged: `db` + the env normalization side effect).
4. Update `vitest.config.ts` include to `["src/**/*.test.ts",
   "tests/**/*.test.ts"]`.
5. Commit `db/.gitkeep` so the repo-root `db/` folder exists in fresh clones.

### WS-2 — Mobile tab-bar active well (F1)

Wrap each tab's icon+label in the live's wrapper structure; active tabs
(excluding MORE) get `.orb-nav-active`-pair inset well at radius 14
(pad 8/4, gap 4). Verify computed styles against the live at 390 on
dashboard (Home active) and goals (Goals active + MORE unchipped on team).

### WS-3 — Team view labels + headers (F2, F5)

Responsive INVITE label (`hidden sm:inline` / `sm:hidden` pair, aria-label
"Invite Member"), no-wrap headers with `shrink-0` buttons on both the Team
h1 header and the AI-Agents section header.

### WS-4 — Goal card + seed (F3, F4)

`normal-case` on the three "· N blocked" spans; seed sortOrder swap
(Launch new landing page → 2, Q3 Content Marketing Campaign → 3).

### WS-5 — Login logo (F6)

`LogoPyramid` becomes the circular chip: `rounded-full ring-4 ring-white/50
shadow-lg`, 80px below sm / 96px from sm (responsive at the login call
site), purple pyramid dots unchanged. Unit-test coverage of the geometry
helpers stays green (positions unchanged).

### WS-6 — Site URL wiring [F7]

`metadataBase` from `NEXT_PUBLIC_SITE_URL` in `layout.tsx` (fallback
`http://localhost:3000`), plus `src/app/sitemap.ts` exposing the public
routes — makes the `.env.example` claim true. Create `docs/DEPLOYMENT.md`
with §4 recommending an absolute `DATABASE_URL` in production.

### WS-7 — Playwright suite (F9)

1. `bun add -d @playwright/test` (package manager only — never hand-edit
   package.json).
2. `playwright.config.ts`: testDir `tests/e2e`, chromium project,
   `use.baseURL http://localhost:3100`, webServer = the standalone
   production server on a scratch port with a scratch DB (isolated from the
   dev DB), `test:e2e` script. Playwright specs use `.spec.ts` so the
   Vitest include never picks them up.
3. Specs: login round-trip, dashboard render + stat numerals, mobile
   navigation (bottom-bar tabs + MORE sheet open/navigate + ACTIVE well
   present — the F1 regression), 768 pill-nav presence, goals list + inline
   delete confirm, add-task dialog + validation, activity feed render.
4. `docs/DEPLOYMENT.md` notes how to run the suite.

### WS-8 — Verification

1. Full gate: lint → typecheck → unit (122 + new db-path checks) → build →
   smoke (30).
2. Playwright suite green against the production build.
3. Re-probe every changed surface against the live at 390/768/1440 with
   computed styles (the probe scripts live in `research/`, excluded from
   commits per repo convention).
4. VLM sanity pass on stitched before/after pairs.

### WS-9 — Screenshots + docs (F10)

1. Regenerate `docs/screenshots/*.png` from the PRODUCTION build (no dev
   tools badge) at 1440/768/390: dashboard, goals, goal detail, my-tasks,
   activity, team, settings, login, mobile set (dashboard / goals / MORE
   sheet), tablet dashboard.
2. README: mobile-nav bullet (active well chip), INVITE responsive label,
   blocked-count case, login logo, test section (+ Playwright), env table
   (NEXT_PUBLIC_SITE_URL now real), db-path note.
3. AGENTS.md: commands table (+ `test:e2e`), mobile bullet rewrite,
   db-path fact.
4. CLAUDE.md: testing strategy (+ Playwright), visual-system bullet updates.
5. `Project_Architecture_Document.md`: v2.3 revision block.
6. `docs/session_18.md` + `docs/worklog.md` entries; mark this plan executed.
7. `project-management_SKILL.md` distilled per `skills/distill-codebase-skill`
   + `skills/to-distill-project-into-skill`.

### WS-10 — Ship

Conventional Commit on `main` (no feature branches), push via
`docs/ssh_git_wrapper_v3.py` with the operator key held outside the repo,
verify the remote ref equals local HEAD, shred the key.
