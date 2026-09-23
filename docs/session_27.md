# Session 27 — v2.8 the Tailwind-v4 affordance + artifact pass

Continuing from session_25/26 (v2.7 shipped at c6ce9cf; upstream added
the session_26 transcript log at a7d427e). Workspace refreshed with
`git pull` → a7d427e. The v2.7 state was confirmed against the
codebase (anchor census, /tasks view, wizard deep link, the Tailwind
v4 CSS-first setup with no `@config` directive — the vestigial
`tailwind.config.ts` is inert; the validation report matches).

**Baseline gate GREEN on the pulled state** — lint 0 · typecheck 0 ·
138/138 unit · build clean · 30/30 smoke · 60/60 Playwright. (The
shell's absolute `DATABASE_URL` override trap re-confirmed — every
command ran with `env -u DATABASE_URL`; the clone's `db/custom.db`
was re-seeded to the pristine 3 goals / 31 tasks / 36 entries after
the smoke suite's residue; re-seeding invalidates the browser
session cookie — re-login required, both documented behaviors.)

**Live re-crawl (fresh authenticated agent-browser sessions at
390/768/1440, paired against the production clone on :3000):** the
operator's two named concerns drove the survey. The MOBILE
NAVIGATION MENU verified working as expected on both apps (tab-bar
census EXACT; the MORE sheet geometry/rows/hrefs identical; clicking
sheet rows navigates on both; VLM: IDENTICAL ×2). The TailwindCSS v4
hunt found two real artifact classes plus one functional regression.
Findings (docs/parity-remediation-v2.8.md), every one computed-style
verified on BOTH apps:

- F1 (HIGH, systemic) **Button cursor**: the live's global CSS ships
  `button, [role="button"] { cursor: pointer }` (read out of its
  CSSOM); the clone's buttons rendered the UA arrow on EVERY surface
  (census at 1440: live 17A/2B pointer vs clone 17A/2B default —
  then confirmed across goals/my-tasks/activity/team/settings, the
  add-task dialog, the MORE trigger/close). Tailwind v4's preflight
  sets no pointer (verified against tailwindcss@4.3.3) — the classic
  v4-migration affordance loss.
- F2 (HIGH, functional regression since v2.7) **Mobile goal-card
  actions broken**: the edit/delete squares sit inside the card
  anchor; their clicks bubbled into navigate → clicking edit
  NAVIGATED to the goal detail instead of opening the dialog (the
  live stays + opens the dialog). Unpinned by any e2e — silent for a
  full cycle.
- F3 (MEDIUM) **MORE-sheet close shadow**: the live renders the
  3px/6px 0.78/0.27 pair; the clone carried the stale v2.0
  4px/8px/0.28 pair.
- F4 (MEDIUM, v4 artifact) **Shadow-var composition**: every
  `shadow-[…]` utility emits `box-shadow: var(--tw-inset-shadow),
  …` — unset vars serialize as four `rgba(0,0,0,0) 0px 0px 0px 0px`
  prefixes in front of the real shadow (app bar, tab bar, sheet,
  pill, close squares). Invisible (VLM IDENTICAL) but a
  computed-style parity gap.
- F5 (LOW, v4 artifact) **`rounded-full` → calc(infinity·1px)** =
  33554432px in Chrome vs the live's literal 9999px on the chips.
- F6 (LOW) **Anchor coverage/nesting**: the live's card anchor wraps
  the WHOLE card (1072 incl. the stats/action column; the clone's
  covered 952); the dashboard goal wells are bare anchors wrapping
  inner well divs (the clone's anchor WAS the well).
- F7 (LOW) **Brand strings**: the live renders literal "ORBITAL"
  textContent (with a redundant text-transform: uppercase — the
  transform is a no-op); the clone rendered "Orbital" + uppercase,
  and the sidebar anchor carried pl-2.5/rounded-xl (hit area 101.3
  vs 91.3).

Non-findings re-confirmed equal: the whole mobile-nav chrome (tab
census + MORE sheet + navigation), the 768 pill (an earlier
"inactive chip" reading was a probe error — the two sessions sat on
different views), the desktop sidebar anchor map, all list-view
h1/counts, /tasks (31 rows, inert clicks — still their WIP), the
add-task dialog, the stroke census (all 2), the user-pill popover,
and the live's goal-card edit dialog (an earlier "dead" reading was
a `role="dialog"` selector miss — their dialog has no role attr).

**TDD execution (plan validated against the codebase first):**

- RED: 14 new Playwright assertions in `tests/e2e/v28-parity.spec.ts`
  (the cursor census across surfaces, the mobile pencil → dialog
  WITHOUT navigation, the full-card anchor width, the well nesting,
  the five exact chrome-shadow strings, the close-square pair, the
  chip radius, the brand textContent) — all 13 test cases failed as
  expected (the 14th "pass" was the auth setup project).
- WS-1 cursor: the base layer in `globals.css` gains the live's
  exact `button, [role="button"] { cursor: pointer }`.
- WS-2 goal cards: both anchors gain the button-origin guard — the
  first draft returned early WITHOUT preventDefault and made things
  WORSE (the browser followed the href as the DEFAULT action — full
  page load); the guard is `closest("button") → preventDefault() →
  return`. The desktop anchor restructures to the full-card flex row
  (the inner text column takes the 18/20 padding; the 120px
  stats/action column moves inside the anchor).
- WS-3 dashboard wells: bare `<a>` wrapping the inner well div.
- WS-4/WS-5 chrome shadows: five plain-declaration classes
  (`.orb-appbar-shadow` / `.orb-tabbar-shadow` / `.orb-sheet-shadow`
  / `.orb-pill-nav-shadow` / `.orb-sheet-close`) byte-match the
  live's computed strings; the sheet brand renders literal ORBITAL.
- WS-6 chips: `rounded-[9999px]` on the goals/my-tasks/tasks filter
  chips.
- WS-7 sidebar brand: literal ORBITAL + the redundant uppercase
  transform (re-measured: the LIVE's span carries
  text-transform:uppercase on the already-uppercase string — the
  first draft dropped it; the pin was corrected to match) + the
  anchor drops pl-2.5/rounded-xl (91.3 hit area).
- GREEN hardening: the pill-nav test needed an unambiguous locator
  (`nav.orb-pill-nav-shadow` — both navs carry aria-label
  "Primary"); the mobile-navigation spec's sheet-brand assertion
  updated to the literal ORBITAL.
- **FINAL GATE GREEN: lint 0 · typecheck 0 · 138/138 unit · build
  clean · 30/30 smoke · 73/73 Playwright** (59 prior + 14 net-new).

**Re-probe (computed styles, both apps): EXACT on every changed
surface** — the cursor census 17A/pointer + 2B/pointer IDENTICAL;
the goal wells 490×84 with anchor-shadow `none` + the inner-well
inset pair IDENTICAL; the desktop card anchors [316, 1072, 166]
IDENTICAL (full-card coverage); the chips 9999px + pointer
IDENTICAL; the app bar / tab bar / sheet / close shadow strings
byte-IDENTICAL; the brand ORBITAL + uppercase + pad-0 IDENTICAL;
the mobile pencil stays on /goals and opens the Edit Goal dialog.

**Artifacts:** all 15 screenshots regenerated from the final build
(05/06 wizard shots unchanged from session_24) + VLM sanity (the
dashboard, the MORE sheet, the goals view — PASS ×3).
`.env.example` re-verified truthful. Docs aligned: README (the v2.8
pass, 73 e2e), AGENTS/CLAUDE (the cursor rule, the anchor guard,
the shadow/radius serialization notes, gate counts), PAD v2.8
revision block, SKILL.md (lessons 15 + 16 — the v4
computed-serialization audit, the anchor-child guard with the
preventDefault trap), this log, the worklog, and the v2.8 plan
marked EXECUTED.

**Suggested next steps:** none required — every changed surface is
pinned by 73 Playwright checks and re-probed EXACT. The next drift
watch: the live's navigation semantics have flipped twice in three
deploys; the anchor-census + cursor + shadow probes in
v27/v28-parity.spec.ts will catch the next change loudly. If the
live wires up its dead ring or /tasks rows, the v27 dead-seam pins
will fail — re-measure before relaxing them.
