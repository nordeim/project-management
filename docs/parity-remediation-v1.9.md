# ORBITAL Parity Remediation Plan v1.9 (Session 11 — resumed final verification)

Evidence: fresh side-by-side crawl 2026-09-18 evening (resuming the interrupted session-11
final pass) — two authenticated agent-browser sessions (`live` =
`https://agent-pm-copy-15e23720.base44.app/`, `clone` = production build on :3000) at
1440×900 and 390×844, ~20 computed-style probes saved under `research/par-s11/`
(plus the prior session's `research/par-s10/`), VLM screenshot cross-checks only where
noted. Computed styles are ground truth; several VLM readings were disproven by
measurement (team empty-state icons ARE #B3B3B3 via SVG stroke; agents-empty text IS
centered — flex vs text-align mechanism only).

Data-driven deltas (user names, activity text, task counts, clock hand angles) excluded.
Probe-measurement noise excluded: Tailwind v4 `rounded-full` computes to 33554432px
(≡ 50% on a square), and shadow lists with leading transparent layers are the flattened
cascade of custom-class + utility pairs (the visible pairs match). Markup-tag choices
(`a` vs `button`, `p` vs `h2`) are not visual deltas.

Baseline gate on the v1.8 code (commit d047b0f): lint 0 · typecheck 0 · 107/107 unit ·
build clean · 30/30 smoke — the v1.8 claims hold; this plan closes the residual deltas.

## Systemic findings (v1.9)

1. **The date-card photo ROTATES BY TIME OF DAY.** The live bundle (index-ByL25mP3.js,
   function `XF`) maps hours → four images from `media.base44.com`:
   `5–11 → dba8cc82e_Day_A.png`, `11–17 → 90666cf4c_Day_B.jpg`,
   `17–21 → 724625b99_Day_C.png`, else `c5956c00e_Day_D.png`. All four are the same
   rolling-hills artwork under different lighting (day/dusk/night — verified by VLM).
   The crawl ran at ~22:50, showing the NIGHT variant while the clone ships a static
   day image — this is why earlier crawls (v1.5, daytime) read "bright day photo".

2. **Relative timestamps are date-fns `formatDistanceToNow` long form.** The live bundle
   embeds the full date-fns locale table (`xMinutes: "1 minute / {{count}} minutes"`,
   `aboutXHours`, `xDays`, `xMonths`, `aboutXYears`, `overXYears`, `almostXYears`) and
   the distance algorithm (extracted: minutes `x`; `x<45 → "X minutes"`, `x<90 → "about
   1 hour"`, `x<1440 → "about X hours"`, `x<2520 → "1 day"`, `x<43200 → "X days"`,
   `x<86400 → "about X months"`, then calendar-months `S`: `S<12 → "X months"`, else
   `k=S%12,b=floor(S/12)`: `k<3 → "about b years"`, `k<9 → "over b years"`, else
   `"almost (b+1) years"`; `x<1 → "less than a minute"`; suffix " ago"). The live feed
   shows "2 months ago" — the clone's abbreviated "3m ago / 2h ago / 5d ago" is a
   format delta on every row (dashboard + activity feed).

3. **The greeting switches at hour 5, not midnight.** Live `QF()`: `5–12 → "Good
   morning"`, `12–18 → "Good afternoon"`, else `"Good evening"`. The clone's
   `greetingFor` says "Good Morning." from 00:00–11:59 — between 00:00 and 04:59 the
   live says "Good evening" while the clone says "Good Morning."

4. **The New Goal wizard is a CONVERSATIONAL WRAPPER + FORM PANEL (the v1.8 plan's
   "remove the bot-intro" reading is wrong for the current live app).** Measured: a
   680×552 radius-24 wrapper panel (bg #EEEAE6, pad 28/28/24) containing (a) a 32px
   bot-avatar circle (bg #EEEAE6, purple-tinted light shadow
   `rgba(227,213,245,0.698) -4px -4px 10.22px` + dark pair, 16px Bot glyph), 12px gap,
   (b) the intro bubble [400×59, radius `0 14px 14px 14px` (top-LEFT square — the
   avatar side), pad 10/16, bg #EEEAE6, shadow `-4px/-4px/8px 0.82 / 4px/4px/8px 0.28`]
   with 13px/400 #3A3A3A text "Tell me about your goal. What do you want to achieve?
   I'll ask a few questions before creating a plan.", and directly below (c) the form
   panel (624px, radius 16, pad 22/24, the -8px panel shadow pair, "Goal Details"
   13px/600, labels 12px/600 #6E6E6E **ls 0.48px**, inputs 37.5px pad 9/14 with the
   0.22-alpha inset, textarea **88px** pad 10/14 fs 13, CANCEL (raised #EEEAE6,
   11px/600/ls 0.88 uppercase, #3A3A3A) + ✨ CONTINUE (dark #3A3A3A pill) grouped left).
   A 32px radius-9 close square (bg #EBE7E2, raised pair) sits in the wrapper's
   top-right. The live dialog overlay = `rgba(46,42,38,0.3)` + **backdrop-blur 12px**;
   the check-in modal's overlay = `rgba(46,42,38,0.25)` + blur 12px (a body-level
   sibling — standard dialogs 0.25). The clone currently renders a 624px r20 panel
   with no wrapper, no bubble, a `bg-black/50` un-blurred overlay, ls-normal labels, a
   64px textarea, inset-well CANCEL, and a drop shadow the live form panel lacks.

5. **The login page still drifts.** Live: **white page** (body #FFF — the beige canvas
   is the app's, not the login route's), card rgba(255,255,255,0.95) r16 with
   `rgba(0,0,0,0.25) 0 25px 50px -12px` shadow, inner block pad **48/40/40**; the logo
   is the reference's actual `Frame24.svg` — a WHITE ROUNDED SQUARE (rx 98/1200 ≈ 7.8px
   at 96px, not a circle) with six #996CE4 circles (r 82.66/1200) in the 1-2-3 pyramid;
   title 30px/700 #0F172A ls **−0.75px**; subtitle 16px/500 #64748B; Google btn h54
   r12; inputs r**12** h48 pad `8/12/8/40`; Sign in r12 fw 500; footer row
   justify-between with "Forgot password?" 14px/500 #64748B left and "Need an account?
   Sign up" 14px/500 #334155 right. Clone deltas: beige page bg, circle logo, r20
   controls, ls −0.3px, 14px/400 centered subtitle, no card shadow, 32px card pad.

6. **Micro-deltas across measured surfaces** (all computed-style verified):
   activity icon glyph color `#2A2A2A` (clone #2F2823); message line-height 19.5px
   (13px × 1.5 — clone hard-codes 20px); feed group rows gap **14px** (clone 12px);
   type-tag tracking 1px + mt 4px (clone 0.8px/2px); online pill pad 7/12 gap 6, no
   top margin (y=48 h1-aligned), "· N" at 11px/400 #767676 (clone one 600-weight run);
   hero card inner row `items-center` gap 14 (clone items-start gap 12); group label →
   first row = 14px (clone 8px); goals/my-tasks h1 still `tracking-tight` (−0.7px vs
   live −0.28px — the v1.8 WS-1.3 fix missed these two files); goal-card left column
   pad-top **23px** (clone 18px); progress track color **#DDD8D2** (clone #DDD8D0);
   goal-detail DELETE py 11px (clone h-10 py-0), ADD TASK py 7px (clone h-31 py-0);
   blocked-stat 64px well radius **12** (clone renders 10 — the `.orb-well` custom
   class out-cascades `rounded-[12px]`); task-card action squares translate-y **10px**
   (clone 14px); status→title gap 5px (clone 4px); settings selects **36px** pad 8/12
   (clone 38px/8/14); "Active Window" tracking 0.48px; settings spacing rhythm
   (heading mb 17px, label→hint 2px, hint→controls 8px, label→select 13px, right-card
   select→label 10px); team members-empty top offset (circle at header-bottom+100px —
   clone 48px), in-section Invite Member py 9px, AI-Agents subtitle 13px (clone
   13.5px); sidebar brand row: mark at content-x+10 with an **8px** text gap (clone
   content-x + 10px gap); mobile app bar brand = 9px mark (3px dots) + "ORBITAL"
   **Archivo 12px/600 ls 2.16px** #2F2823 (clone: 24px SVG + 15px/700 DM Sans), app
   bar pad 14/20; mobile user pill **r10** pad 7/12 gap 7, avatar 20px, name 11px/500
   #6E6E6E (clone r20, 12px/500 #3A3A3A); AvatarBubble text **#5A5350** (clone white).

## WS-1 Pure seams (TDD — red first) — HIGH

- **1.1** `src/lib/orbital.ts` — rewrite `relativeTime(iso)` to the extracted
  date-fns distance algorithm (minutes path + calendar-months path with the Feb-27
  edge rule), long-form strings with singular/plural ("1 minute", "about 2 hours",
  "over 2 years"). New spec `src/lib/relative-time.test.ts` (~14 checks: <1min, 1min,
  5min, 44/46min, 100min, 26h, 3d, 45d, 70d, 2 months, ~2y, 2.5y, 359d, 12 months+).
- **1.2** `src/lib/orbital.ts` — `greetingFor`: morning starts at hour 5
  (5–12 morning, 12–18 afternoon, else evening). Update `greeting.test.ts` boundaries
  (04:59 → evening; 05:00 → morning).
- **1.3** New seam `src/lib/day-image.ts` — `dayImageFor(date)` →
  `/day-hills-morning.jpg | /day-hills-noon.jpg | /day-hills-dusk.jpg |
  /day-hills-night.png` (5/11/17/21 boundaries, mirroring the live `XF`). Download all
  four reference images into `public/`. Spec `day-image.test.ts` (~5 checks:
  4 boundaries + one interior). **107 → ~126 unit checks.**

## WS-2 Dashboard + activity glyphs (HIGH)

- **2.1** `DateCard` consumes `dayImageFor(new Date())` (per-render, like the live
  `XF` call). Keep 0.8 opacity + aria label.
- **2.2** `activity-icon.tsx` + the hero icon: glyph color `#2A2A2A`.
- **2.3** Dashboard + feed + hero message line-height `leading-[19.5px]` (message p).
- Files: `views/dashboard-view.tsx`, `views/activity-icon.tsx`,
  `views/activity-view.tsx`.

## WS-3 Goals + goal-detail + task cards (HIGH)

- **3.1** `goals-view.tsx` + `my-tasks-view.tsx`: h1 `tracking-tight` →
  `tracking-[-0.01em]`.
- **3.2** Goal card left column `p-[18px_20px]` → `p-[23px_20px]`.
- **3.3** `globals.css` `--orb-track` `#DDD8D0` → `#DDD8D2` (goals + goal-detail
  progress tracks).
- **3.4** Goal-detail DELETE button: `py-[11px]` (h auto); ADD TASK: `py-[7px]`
  (drop the fixed heights).
- **3.5** Blocked-stat well: replace `orb-well … rounded-[12px]` (cascade trap —
  renders 10px) with explicit inset styles r12.
- **3.6** `task-card.tsx`: action squares `translate-y-[10px]`; status row `mb-[5px]`.
- Files: `views/goals-view.tsx`, `views/my-tasks-view.tsx`,
  `views/goal-detail-view.tsx`, `task-card.tsx`, `globals.css`.

## WS-4 Activity feed (HIGH)

- **4.1** Online pill: `py-[7px] px-3 gap-[6px]` (h ~30.5 auto), remove the header
  `mt-1` (aligns y=48); split text runs — "Online" 11px/600 #3A3A3A, "· N"
  11px/400 #767676.
- **4.2** Hero card: inner row `items-center gap-[14px]`; hero message
  `leading-[19.5px]`.
- **4.3** Group rows: `gap-[14px]` (was gap-3).
- **4.4** Type tag: `tracking-[0.1em] mt-[4px]`.
- **4.5** Group label: label→row gap 14px (drop `mb-2`, add `mb-[14px]` equivalent —
  measured label-bottom → row-top = 14px).
- Files: `views/activity-view.tsx`.

## WS-5 Team + Settings (MEDIUM)

- **5.1** Team: members empty state top offset — circle lands 100px below the header
  block bottom (net `mt-5` on the section + `pt-[80px]`-equivalent inside); in-section
  Invite Member `py-[9px]` (h auto); AI-Agents subtitle 13px; section `mt-[35px]`.
- **5.2** Settings: selects `h-[36px]` pad `8px 12px`; "Active Window" adds
  `tracking-[0.04em]`; rhythm: card headings mb 17px (mt-5 → mt-[17px]), label→hint
  2px, hint→controls 8px (left) / 16px (right), label→select 13px, select→label 10px.
- Files: `views/team-view.tsx`, `views/settings-view.tsx`.

## WS-6 Dialogs (HIGH)

- **6.1** `ui/dialog.tsx`: overlay → `bg-[rgba(46,42,38,0.25)] backdrop-blur-[12px]`;
  base content radius 16 (drop the extra drop-shadow layer — live panels carry only
  the neumorphic pair); keep the 448px check-in exception.
- **6.2** Wizard (`new-goal-dialog.tsx`): 680px r24 wrapper (pad 28/28/24) + 32px bot
  avatar (purple-tinted pair) + intro bubble (r `0 14 14 14`, pad 10/16, 13px/400
  #3A3A3A, bubble width ≤ 400px) + form panel (624px r16 pad 22/24); labels
  `tracking-[0.04em]`; textarea 88px pad 10/14 fs 13; inputs py 9/14; CANCEL raised
  #EEEAE6 (not inset); close = 32px r9 raised square top-right of the wrapper;
  overlay alpha 0.3 for the wizard. Restore the bot-intro copy above.
- Files: `ui/dialog.tsx`, `dialogs/new-goal-dialog.tsx`.

## WS-7 Login page (HIGH)

- **7.1** `app/login/page.tsx` + `login-screen.tsx`: white page bg; card shadow
  `0 25px 50px -12px rgba(0,0,0,0.25)`; inner pad 48/40/40; logo = rounded square
  (r ≈ 7.8px at 96px) carrying the pyramid (adjust `LogoPyramid` backing + geometry
  tests); title `tracking-[-0.03em]`-equivalent −0.75px at 30px → `tracking-[-0.025em]`;
  subtitle 16px/500 #64748B left-aligned; inputs + Sign in + Google r12; inputs pad
  `8px 12px 8px 40px`; Sign in fw 500; footer justify-between (Forgot left #64748B,
  signup right #334155, both 14px/500).
- Files: `login-screen.tsx`, `logo.tsx`, `logo-geometry.test.ts` (backing-shape
  expectation).

## WS-8 Sidebar + mobile chrome + avatar (MEDIUM)

- **8.1** Sidebar brand row: mark at content-x + 10px, text gap 8px (mark x=50,
  text x=69 on a 24-wide panel at x=24).
- **8.2** Mobile app bar: brand = 9px six-dot mark (3px dots) + "ORBITAL" Archivo
  12px/600 ls 2.16px #2F2823 gap 8; app bar `py-[14px]`-equivalent centering
  (measured content y=22).
- **8.3** Mobile user pill: r10, pad 7/12, gap 7; name 11px/500 #6E6E6E.
- **8.4** `AvatarBubble`: text #5A5350 (from white).
- Files: `sidebar.tsx`, `orbital-app.tsx`, `user-menu.tsx`, `widgets.tsx`,
  `logo.tsx`.

## WS-9 Verification

- **9.1** Full gate: lint → typecheck → test (107 + ~19 new) → build → smoke (30).
- **9.2** Browser re-measurement: re-run the `research/par-s11` probe set on every
  changed surface at 1440×900 + 390×844; every delta closed or data-driven.
- **9.3** Placeholder sweep; regenerate README screenshots for changed views
  (dashboard incl. night photo at the current hour, wizard, login).

## WS-10 Documentation

- **10.1** README: time-rotating date photo, long-form relative time, greeting
  boundaries, wizard wrapper spec, login white page, dialog overlay spec, unit count.
- **10.2** AGENTS.md / CLAUDE.md: same facts, compact form.
- **10.3** PAD → v1.9 revision block + §1/§5/§7/§11 updates.
- **10.4** Replace `docs/session_10.md` and `docs/session_11.md` raw transcripts with
  proper session logs; keep this plan as `docs/parity-remediation-v1.9.md`.
