# Session 29 — v2.9 the stroke-system + login-redesign pass

Continuing from session_27/28 (v2.8 shipped at 6ea6b1a; upstream added
the session_28 transcript log at 377008d). Workspace refreshed with
`git pull` → 377008d. The v2.8 state was confirmed against the
codebase (the cursor rule, the chrome-shadow custom classes, the chip
radius pins, the anchor guard, the .env/db contract, the
vitest/playwright layers — all present) and the baseline gate ran
GREEN on the pulled state: lint 0 · typecheck 0 · 138/138 unit ·
build clean · 30/30 smoke · 73/73 Playwright. (The shell's absolute
`DATABASE_URL` override trap re-confirmed — every command ran with
`env -u DATABASE_URL`; the clone's `db/custom.db` re-seeded to the
pristine 3/31/36 after the smoke residue.)

**Live re-crawl (fresh authenticated agent-browser sessions at
390/768/1440, paired against the production clone on :3000):** the
operator's two named concerns led again. The MOBILE NAVIGATION MENU
verified working as expected on both apps (the 390 tab-bar census
EXACT — five tabs + MORE, hrefs, glyphs, active-well chip, shadow and
radius strings identical; the MORE sheet geometry/rows/hrefs
byte-identical, navigation functional on both). The TailwindCSS v4
hunt exposed the session's biggest finding — a METHODOLOGY artifact
in the icon-stroke doctrine. Findings (docs/parity-remediation-v2.9.md),
all computed-style verified on BOTH apps:

- F1 (HIGH, systemic) — the live's icons render at computed **1.5px**:
  every lucide svg carries an inline `style="stroke-width: 1.5"`
  while the presentation attribute stays "2" (CSS beats presentation
  attributes). The v2.6 "universal stroke 2" census read the
  ATTRIBUTE and missed the inline override. Censuses: 390 30/31@1.5
  · 768 28/29@1.5 · 1440 16/17@1.5 · /activity 44/44. The measured
  2px exception set: NEW GOAL plus, card action squares (pencil 13 /
  trash 14 goals-view; pencil/trash 11 task cards), goal-detail
  DELETE + Target calendar (13), Team plus buttons (12/14), Settings
  chevron-downs (16) + save (14), dialog close Xs, check-in Send,
  wizard X + sparkles, date-picker chevrons, login mail/lock, the
  popover LogOut. Specials: the 768 back-strip chevron-left @1.8 and
  the wizard bot @1.6 (the v2.4 values, never actually gone).
- F2 (HIGH, visual) — the login page was REDESIGNED on the live:
  slate gradient page background, a card top gradient bar (4px) +
  backdrop-blur + overflow-hidden, responsive padding (32/40/48), a
  CENTERED heading column, a blurred gradient halo behind the 80/96px
  logo chip, a 20px Google glyph in a -ml-4 wrapper, 16px input
  glyphs, and a sm:flex-row footer with a combined "Need an account?
  Sign up" button.
- F3 (MEDIUM) — the mobile app bar: rounded bottom corners
  (0 0 20 20), pad 14/20 with a CONTENT-DRIVEN height (56.5
  logged-out / 62 authenticated), and the literal ORBITAL brand
  string (the clone rendered "Orbital").
- F4 (MEDIUM) — the 768 pill nav: the brand wrapper carries a 1px
  right divider (rgba(160,143,126,0.18)); every tab is an anchor
  wrapping a CHIP div (min-width 52, r12, pad 8/12) with the ACTIVE
  well on the chip; z-100 (the clone was 40, active-on-anchor,
  no chip → 490 vs the live's 494 wide).
- F5 (MEDIUM) — the goal-edit dialog: NO close square on the live
  (only the status control + Cancel + Save), a plain 15px/600
  heading (no icon circle), and the STATUS CONTROL IS A NATIVE
  `<select>` (216×35, bg #EBE7E2, r10, 13px) — as are add-task's and
  task-edit's status/assignee selects (settings keeps its shadcn
  triggers — its chevron-downs are measured live at stroke 2).
- F6 (MEDIUM) — the user menu: pill radius 12 (the clone's
  rounded-xl hit the shadcn --radius 20px trap), name 12px/500
  #6E6E6E, popover radius 12 + 8px offset, LogOut glyph 14px (24).
- F7 (LOW) — z-index: the MORE sheet computes 201, the pill nav 100.
- F8 (LOW, systemic) — the remaining `shadow-[inset…]` utilities
  compose four zero-alpha prefixes (inputs, selects, the user pills)
  where the live renders clean declarations.

Non-findings re-confirmed equal: the whole mobile-nav chrome (the
operator's focus), the 768 pill geometry/hrefs/labels/shadow, the
dashboard activity card (20-row cap + NPA), the add-task/task-edit/
check-in/wizard dialog geometry and buttons, the date picker
(262×271, chevrons at 2), the LOG IN pill at both widths, the login
card core geometry, the seed workspace (3/31/36), and every
goal-card action-square stroke (2 on both).

**TDD execution (the plan validated against the codebase first):**

- RED: 18 new Playwright assertions in `tests/e2e/v29-parity.spec.ts`
  (the computed-stroke censuses at three widths, the 2px exception
  set, the 1.8 back-chevron, the 1.6 bot, the app-bar radius/brand/
  height, the pill-nav divider + chip min-width + z, the goal-edit
  no-close, the native-select spec, the login gradient/centering/
  20px glyph/16px input glyphs, the user-menu geometry) — all 17
  test cases failed as expected (the 18th pass was the auth setup).
- WS-1 strokes: ~45 sites across 15 files moved to
  `strokeWidth={1.5}`; the action set keeps the lucide default 2;
  the back-strip chevron 1.8; the wizard bot 1.6; the wizard
  calendar trigger 1.5.
- WS-2 login: the full presentational rewrite (gradient page,
  gradient-bar card + blur, responsive pad, centered column, group
  halo, 20px Google glyph via the size-5 opt-out from the shadcn
  Button svg trap, absolute-line "or" divider, 16px glyphs,
  sm:flex-row footer).
- WS-3 app bar: `rounded-b-[20px] p-[14px_20px]` (content-driven
  height) + the literal ORBITAL brand.
- WS-4 pill nav: the brand divider, the chip-wrapped tabs
  (min-w-[52px], active styles on the chip), z-[100].
- WS-5 goal-edit: `showCloseButton={false}`, the plain heading, the
  pencil-circle icon removed.
- WS-6 user menu: rounded-[12px] pill (py-[11px]) + 12px #6E6E6E
  name, the popover rounded-[12px] + sideOffset 4 (8px total), the
  LogOut glyph 14px.
- WS-7/8: the sheet `z-[201]`; `.orb-inset` (the 3px 0.68/0.24 well
  pair) + `.orb-select` (the native dialog selects) + `.orb-pop-shadow`
  custom classes in globals.css; the four form primitives and both
  user pills swapped; the dialog selects converted to native
  elements (goal-edit status, add-task status/assignee, task-edit
  status/assignee).
- GREEN hardening: the retired v2.6/v2.7 stroke pins updated (the
  computed 1.5 truth, the 2px exception set with the glyph+size
  disambiguation — calendar@11 is 1.5 but calendar@13 stays 2, and
  the ADD TASK plus@12 / Back-to-Goals arrow@14 stay 2); the
  mobile-navigation active-chip assertion moved to the inner chip;
  the login-gradient pin asserts Tailwind v4's lab() serialization
  (both apps serialize identically).
- **FINAL GATE GREEN: lint 0 · typecheck 0 · 138/138 unit · build
  clean · 30/30 smoke · 91/91 Playwright** (73 prior + 18 net-new).

**Re-probe (computed styles, both apps): EXACT on every changed
surface** — the stroke censuses 30/30 at 1440 (29@1.5+1@2 both),
29/29 at 768, and 27/27 at 390 (sheet-adjusted); the app bar
radius/pad/height/brand identical; the pill nav 494 wide with the
divider, chips, and z identical; the back-chevron 1.8 both; the
wizard icon set byte-identical (x@14:2, bot@16:1.6, calendar@14:1.5,
sparkles@13:2); the goal-edit buttons/svgs identical; the LogOut row
identical (14px@2, pad 12/16, #BD3228); the sheet z 201 with the
clean shadow; the user pill and the native selects render clean
inset declarations. The login VLM check confirmed the restyle landed
(background, centered heading, Google glyph, divider, footer — the
remaining VLM flags disproven by computed measurement).

**Artifacts:** 15 screenshots regenerated from the final build
(05/06 wizard shots unchanged — the flow is byte-stable) + VLM
sanity (dashboard, mobile, login — PASS ×3). `.env.example`
re-verified truthful. Docs aligned: README (the v2.9 pass, 91 e2e),
AGENTS/CLAUDE (the computed-stroke doctrine with the
attribute-vs-computed lesson, the native dialog selects, the login
spec, the app-bar/pill/user-menu specs, gate counts), PAD v2.9
revision block, SKILL.md (lesson 17 — the presentation-attribute
trap), this log, the worklog, and the v2.9 plan marked EXECUTED.

**Suggested next steps:** none required — every changed surface is
pinned by 91 Playwright checks and re-probed EXACT. The next drift
watch: the live's icon system has now been measured three ways in
six sessions (attribute 2 → computed 1.5); any future stroke census
must read COMPUTED styles. The v29 stroke pins will fail loudly if
the live changes its inline-style system again.
