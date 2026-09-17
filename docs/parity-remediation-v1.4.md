# ORBITAL Parity Remediation Plan v1.4

Evidence: fresh live-app crawl 2026-09-17 (`research/live-capture-s5/`, 28 captures + programmatic
computed-style dumps + VLM analyses, re-authenticated with the reference account). Every item below
traces to a capture or a measured style value. Two systemic findings drive this round:

1. **The reference app is fully neumorphic.** Every surface is a soft beige panel
   (`#EEEAE6` raised / `#EBE7E2` inset) with dual-direction embossed shadows. The clone ships
   white cards with standard drop shadows on a big rounded surface panel — close at a glance,
   not the real system. Measured tokens:

   | Token | Value (measured) | Used by |
   |-------|------------------|---------|
   | Canvas | `#EBE7E2`, page padding 24px | page background (no outer surface panel) |
   | Raised surface | `#EEEAE6`, radius 16–20 | sidebar, cards, dialogs, buttons |
   | Inset well | `#EBE7E2`, radius 10–12 / full pill | inputs, chips, clock, status pills, progress track |
   | Progress track | `#DDD8D0` | goal-card bar |
   | Light shadow | `rgba(255,250,244, 0.68 / 0.78 / 0.92)` | small / medium / task-card raised |
   | Dark shadow | `rgba(160,143,126, 0.24 / 0.27 / 0.31 / 0.36)` | inset / buttons / big / task cards |
   | Body text | `#3A3A3A` · muted `#6E6E6E` · deep red `rgb(189,50,40)` | buttons / log out / delete |
   | Sidebar | 240px expanded / 64px collapsed, radius 20, raised | shell |
   | Buttons | raised rect, radius 12, fs 12–13 fw 600, `#3A3A3A` text | all primary actions |
   | Blocked task card | extra `inset 0 0 0 1px rgba(255,128,119,0.18)` ring | task cards |
   | Nav active | inset well pill, radius 10, `#3A3A3A` fw 500 | sidebar nav |

2. **The reference app's auth flow changed since v1.3.** Unauthenticated visits render the
   workspace shell with a **LOG IN** button in the header (where the user menu sits); login is a
   full-page `/login?from_url=…` route rendering a centered white card (448px, radius 16) with
   three states — sign-in ("Welcome to Project Management App" / "Sign in to continue" /
   "Continue with Google" / "OR" / Email+Password with in-field icons / "Sign in" /
   "Forgot password?" / "Need an account? Sign up"), sign-up ("Create your account" /
   Email+Password+Confirm / "Create account" / "Back to sign in"), and forgot-password
   ("Reset your password" / "Send reset link" / "Back to sign in"). The old full-screen
   dusk-hills login page is gone from the reference (the hills image now only lives on the
   dashboard date card).

TDD applies at the pure seams (calendar math). Everything else is verified by the gate
(lint → typecheck → unit → build → smoke) + browser verification with side-by-side captures.

## WS-1 Design tokens + neumorphic primitives (HIGH — systemic)

- **1.1** `globals.css`: add `--orb-raised: #EEEAE6`, `--orb-well: #EBE7E2`, `--orb-track: #DDD8D0`
  and the four shadow tokens; map through `@theme inline` (`orb-raised`, `orb-well`, …).
- **1.2** Component classes: `.orb-raised` (bg raised, radius 16, medium raised shadow),
  `.orb-raised-sm` (radius 12, button shadow), `.orb-well` (bg well, radius 10, inset shadow),
  `.orb-well-pill` (radius full, inset). Redefine `.orb-card` → `.orb-raised` semantics so the
  view migration is mostly mechanical; keep `.orb-pill`/`.orb-pill-outline` names but restyle to
  neumorphic raised (radius 12).
- Files: `src/app/globals.css`.

## WS-2 App shell (HIGH)

- **2.1** Remove the outer rounded surface panel + white sidebar wrapper. Canvas: `bg-orb-canvas`
  with 24px padding, fluid width (reference main is fluid, no max-width clamp at 1440).
- **2.2** Sidebar: 240px / 64px collapsed (from 268/92), `#EEEAE6` bg, radius 20, raised shadow,
  padding 28/16/16.
- **2.3** Collapse control: full-width neumorphic raised bar (radius 10, ~30px tall) with
  `ChevronRight` size 14 sw 1.5 rotated 180° while expanded — replacing the small ghost circle.
- **2.4** Main area: transparent, content max-widths per view (goals list ~1072px at 1440).
- Files: `src/components/orbital/orbital-app.tsx`.

## WS-3 Sidebar internals (HIGH)

- **3.1** Clock: 80×80 well (from 84px white), measured inset shadows
  (`-4px -4px 8px rgba(255,250,244,.8) inset, 4px 4px 8px rgba(160,143,126,.28) inset`).
- **3.2** Tasks Status card: inset well (radius 12) instead of raised; dots 6px coral/sand.
- **3.3** Nav items: active = inset well (radius 10, `#3A3A3A`, fw 500); inactive = transparent,
  `#6E6E6E`, fw 400.
- Files: `src/components/orbital/sidebar.tsx`, `sidebar-clock.tsx`.

## WS-4 Auth flow parity (HIGH — functional)

- **4.1** `src/app/login/page.tsx` (real route): centered auth card (448px, white, radius 16) with
  the three reference states and copy above; pyramid logo in white circle at top; from_url
  handling (`?from_url=` → return target; default `/`); already-authed visits redirect to `/`.
- **4.2** `page.tsx`: render `OrbitalApp` with a **nullable user** — the workspace shell is the
  unauthenticated experience (reference behavior). The store skips initial data fetches when
  `user` is null; views render their empty states.
- **4.3** `user-menu.tsx` → `UserMenuOrLogin`: authenticated = neumorphic inset trigger
  (avatar 22px + email prefix, radius 12) opening a raised 160px card whose only row is a
  full-width red "Log Out" (rgb(189,50,40), 13px, fw 500) — the identity row (name/email) is
  removed per the reference. Unauthenticated = **LOG IN** button (neumorphic raised, radius 12)
  linking to `/login?from_url=<current path>`.
- **4.4** Logout keeps `router.refresh()` (shell stays; header swaps to LOG IN).
- **4.5** "Continue with Google": rendered for parity; click degrades to an explanatory toast
  (self-hosted clone has no OAuth credentials) — same degrade-not-fail doctrine as the AI
  features. Documented in PAD + README.
- **4.6** Security model preserved: reads/mutations stay session-gated (PAD §6.1; smoke suite
  pins unauthenticated rejection). The reference's public-read behavior is a Base44 platform
  artifact — documented as a deliberate deviation.
- Files: `src/app/login/page.tsx` (new), `src/app/page.tsx`, `src/components/orbital/user-menu.tsx`,
  `store.ts`, `next.config.ts` (no rewrite for `/login` — real route), `login-screen.tsx` (retired,
  replaced by the login page).

## WS-5 View + dialog migration (HIGH — systemic)

- **5.1** Dashboard: DateCard raised + inset white date square; ring card raised with a **156px
  inset circle**; stats panel raised; Agent Activity + Goals panels raised; NEXT PLANNED ACTION
  sub-card inset well.
- **5.2** Goals: cards raised radius 16; filter chips (active inset pill / inactive ghost,
  fs 12); goal-card status chip inset pill; progress track `#DDD8D0`.
- **5.3** Goal detail: stat blocks raised radius 16; DELETE/ADD TASK neumorphic (DELETE keeps
  red text); task cards raised radius 14; **blocked card coral inset ring**.
- **5.4** Task card: edit/delete icon buttons on inset well squares.
- **5.5** My Tasks / Activity / Team / Settings: cards, chips, selects migrated; inputs → well
  style (bg well, radius 10, inset shadow, no border — measured 444×36).
- **5.6** Dialogs: `DialogContent` → raised bg, radius 20; in-dialog inputs + textareas well;
  submit buttons neumorphic raised.
- **5.7** Mobile tab bar + MORE sheet keep current structure (verified matching).
- Files: all `views/*.tsx`, `dialogs/*.tsx`, `task-card.tsx`, `widgets.tsx`, `empty-state.tsx`,
  `progress-ring.tsx`, `ui/dialog.tsx`, `ui/input.tsx`, `ui/textarea.tsx`, `ui/select.tsx`.

## WS-6 Date picker (MEDIUM — new component, TDD)

- **6.1** Pure seam `src/lib/calendar.ts`: `monthGrid(year, month)` → 6×7 cells
  `{ date, inMonth }` (leading/trailing fill from adjacent months), `isSameDay`. Write
  `calendar.test.ts` RED first (month boundaries, leap February, 6-row invariant).
- **6.2** `date-picker.tsx`: "Pick a deadline" well-style trigger (calendar icon + label or the
  chosen date) opening a Popover calendar — white card, radius ~16, month header + chevrons in
  circular buttons, `Su Mo Tu We Th Fr Sa` headers, 7×6 grid, out-of-month days muted, today
  highlighted, click-to-select-and-close.
- **6.3** Wizard step 1 consumes it (replaces the native `<input type="date">`).
- Files: new `src/lib/calendar.ts` + `calendar.test.ts`, new
  `src/components/ui/date-picker.tsx`, `dialogs/new-goal-dialog.tsx`.

## WS-7 Copy + micro-parity (MEDIUM)

- **7.1** Task-detail (check-in) modal: remove the "Goal: …" and "Deadline: …" lines (reference
  shows only "Assigned to: Name" + description); label "Post Status Update" (Title Case).
- **7.2** My Tasks empty copy: "Tasks will show up here once goals are created and assigned."
  (drop "to you").
- **7.3** Mobile stat cards: shortened labels/subs ("31 tasks", "26 done", "84% total";
  "BLOCKED" / "COMPLETED" labels shorten on mobile).
- **7.4** Mobile goal-card meta includes blocked count ("8/12 tasks · 2 blocked 67%").
- Files: `dialogs/task-detail-dialog.tsx`, `views/my-tasks-view.tsx`, `views/dashboard-view.tsx`,
  `views/goals-view.tsx` (GoalCard).

## WS-8 Verification

- **8.1** Full gate: lint → typecheck → test (71 + calendar checks) → build → smoke (30).
- **8.2** Browser verification against the production build: shell + sidebar (widths, collapse
  bar), dashboard side-by-side, goals/detail/task cards (incl. blocked ring), auth flow
  (LOG IN → /login → sign-in → shell; logout → LOG IN), date picker, user menu popover,
  mobile spot checks. Captures in `research/clone-capture-s5/`.
- **8.3** Placeholder/TODO/mock sweep.

## WS-9 Documentation

- **9.1** README: fix the duplicated "Inline delete confirms" feature row (v1.3 defect); v1.4
  feature/testing updates; login route in the hierarchy.
- **9.2** AGENTS / CLAUDE / PAD: v1.4 revision blocks; new architecture facts (neumorphic token
  system, `/login` real route + nullable-user shell, Google degrade, calendar seam, measured
  tokens table); §11 line counts re-measured; glossary gains "Neumorphic" + "Well".
- **9.3** `docs/session_5.md`.
