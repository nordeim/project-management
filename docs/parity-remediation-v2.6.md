# Parity & Infrastructure Remediation — v2.6 — EXECUTED

Session 23 plan. Survey executed 2026-09-23 against the live reference
(`https://agent-pm-copy-15e23720.base44.app/`, authenticated as
`sepnetflix2023@outlook.com`) and the clone (production standalone server on
:3000, freshly re-seeded `db/custom.db`) with paired agent-browser sessions
(live + clone, plus fresh LOGGED-OUT sessions) at 390 / 768 / 1440. Every
finding below is computed-style verified on BOTH apps.

Baseline gate before any change (pulled at b6bfb35): lint 0 · typecheck 0 ·
137/137 unit · build clean · 30/30 smoke · 36/36 Playwright. The v2.5 push is
healthy — this session is another drift-correction pass: the live was
re-deployed since v2.5 and reverted its icon system plus several layout
seams.

## Findings

### A. Visual / functional parity deltas (live vs clone)

- **F1 (HIGH) — Icon stroke REVERSION: the live now renders EVERY icon at
  the lucide default 2.** The v2.4 two-class system (chrome 1.5 / content 2)
  is gone. Verified by named-glyph census on both apps:
  - Mobile TABS ×4 (20px @1.5→2), MORE sheet rows ×3 (20), pill tabs ×6
    (18), sidebar nav ×6 (16) + collapse chevron (14), 768 back-strip
    chevron (15, was 1.8 — v2.4 deliberately kept it; now the live is 2),
    MORE button Menu (20).
  - Dashboard activity glyphs (target / square-check-big, 13px),
    "Full log" ArrowRight ×2 (12px), activity-view hero Search (16px) +
    row glyphs.
  - Task-card meta icons: User / Calendar / Clock (11px) — the live is 2
    on goal-detail (verified census: user/clock/calendar 11@2 vs clone
    11@1.5).
  - AI chip Zap (9px @2 vs clone 1.5); date-picker trigger Calendar (14px
    @2 vs clone 1.5).
  - ~33 sites across 13 files carry strokeWidth 1.5/1.8/1.6 in the clone.
  - Confirmed unchanged: all content icons already at 2 (pencils, trash,
    plus, login Mail/Lock, wizard Sparkles, wizard Bot — Bot 1.6→2 per the
    live's current rendering).
- **F2 (HIGH) — Dashboard activity panel rows: gap 12 + the detail WRAPS.**
  Live rows: `flex items-start gap-[12px] px-[18px] py-[14px]`; the detail
  sub-line wraps naturally (no truncate) — the first row (long detail)
  renders 86.5 tall (2 lines). Clone: gap 14 + `truncate` (row 68.5).
  Divider (border-bottom rgba(163,163,163,0.18) on all but last) verified
  EQUAL — the border-top #D8D4CF reading was an inert declaration.
- **F3 (HIGH) — Activity view: each date group's rows are wrapped in ONE
  big radius-14 card with the DEEPER pair (rgba(255,250,244,0.92)
  -5px -5px 10px / rgba(160,143,126,0.36) 5px 5px 12px).** The v1.9
  "plain rows on the canvas, no card wrapper" reading is retired. The card
  spans the full content width (1072 at 1440); rows inside keep pad 14/18,
  gap 14, border-bottom rgba(160,143,126,0.15) dividers (verified equal).
- **F4 (MEDIUM) — Activity view date-label block: line-height 24px wrap +
  10px margin-bottom.** Live: the label is an inline SPAN (10px/600/1.2
  #767676 uppercase, lh 15) inside a DIV with `line-height: 24px` and
  `margin: 0 0 10px` — the label text sits 7px lower and the group card
  starts 5px lower than the clone's block P (lh 15, mb 14). Hero→label gap
  23px verified equal.
- **F5 (MEDIUM) — Desktop goal-card chip: the blocked count renders
  UPPERCASE with 0.88 tracking** (the v2.3 "normal-case tracking-normal"
  reading is retired for the DESKTOP chip — live inner span 73px vs clone
  56px; same 11px/500 #BD3228). The MOBILE goal card's blocked count stays
  normal-case (verified equal — live mobile leaf 11/500/normal #BD3228).
- **F6 (MEDIUM) — Date picker: weekday headers 11px/700 #9A9A9A on a 25px
  row** (clone: 11px/500 #6E6E6E, 21px row) and the popover is 4px taller
  on the clone (275 vs 271). Chevron icons verified at 2 on both; day
  cells 32×32 r16, today 700 #996CE4, outer/inner cards verified equal.
- **F7 (MEDIUM) — Check-in modal: inner spacing is margin-top 16 (not
  margin-bottom 8) and the radio labels are CONTENT-WIDTH blocks.** Live:
  radio row (48px, grid gap 8) → textarea mt 16 → Post Update mt 16;
  panel 448×353. Clone: radio (50) mb 8 → textarea mb 8 → button; panel
  448×322. Radio labels: live block labels 59/52/69/34 wide (input as
  sibling); clone fixed 196-wide flex labels. Post Update button, sub
  label, h2, assigned-to line, note textarea, panel card spec all
  verified EQUAL.
- **F8 (LOW) — Mobile goal-card pct chip letter-spacing −0.13px** (live
  13px/500/−0.13 vs clone normal; 45.3 vs 45.7 wide).

### B. Non-findings (verified equal — do not touch)

Mobile chrome: tab bar 390×74 @y771 r20-top pad 8/8/12, tab census
[73×4, 81] with full-width chips 73×54 (active `#EBE7E2` + the inset pair,
pad 8/4 r14; MORE color-only with own pad), 9px labels (active 600
#3A3A3A / inactive 400 #767676), MORE sheet 390×303 r24 pad 20/20/40 rows
h49 16px/400 #2F2823; mobile dashboard (ring 166×150 r16 -8px pair, stat
wells 104 r10 #EBE7E2 + 3px inset pair, numerals 30px/400, hero cards);
mobile goal card (card 136, bare status 11/600/0.88 uppercase + normal-case
blocked count, pct well chip r8 pad 3/10 13px/500, title 16/500); 768 pill
nav (495×71 r20 pad 10/16, 6 tabs 18px, inset-well active chip) + back
strip (112×34 r10 13px/500 #6E6E6E, pad 7/14/7/10, -3px pair — only the
chevron stroke drifted); desktop dashboard (greeting 28/400/−0.28
[316,48,335,34], date card 330×180 r16 -8px pair + photo (live = div
background-image `…Day_D.png` at 0.8 opacity, cover; clone = img — same
box), date square 115×80 r12 standard pair, ring panel 180×180 p6, stat
columns 149×157 pad 10/8, numerals 50.4/300, NPA text + well, 20-row cap,
goals panel wells 490×84 p 12/14 with 60px rings); desktop goal cards
(r16 deeper pair, chip 11/600/0.88 pad 4/12 #EBE7E2, title 20/500, pct
42/500); goal-detail task rows (1072×98 r14 pad 14/18 — identical height
to the decimal); my-tasks (h1, five-tab chips 12/600/0.72 pad 7/14,
"0 tasks assigned to you"); team + settings; login page (h1 30/700
[536,253,368,72], inputs 368×48 14px bg rgba(248,250,252,0.5) r12, Sign in
368×48 #0F172A r12 14/500, Google 368×54 r12, logo 96×96); LOG IN pill
(1440: 85×40 r12 pad 11/20 12/600/0.96 + standard pair; 390 app bar:
69×29 r10 pad 6/14 11/600/0.88 + small pair — a 3px app-bar y-alignment
residual is probe-noise); the wizard (form panel 624×417 r16 pad 22/24
#EEEAE6, scrim 0.3 + blur 12, inputs 37.5px pad 9/14 13px r10 + well
pair); the app bar (sticky 62px, shadow rgba(160,143,126,0.18) 0 4px 16).

## Work streams

### WS-1 — Icon stroke reversion (F1)

Set every chrome icon from 1.5/1.8/1.6 → 2 (the lucide default; the
simplest durable convention — delete the strokeWidth props so the default
applies). Files: `orbital-app.tsx` (TABS, PILL_TABS, MORE_TABS, Menu,
back-strip ChevronLeft, collapse ChevronRight), `sidebar.tsx` (nav ×6),
`task-card.tsx` (User/Calendar/Clock), `date-picker.tsx` (trigger
Calendar), `new-goal-dialog.tsx` (Bot 1.6→2), `widgets.tsx` (Zap),
`dashboard-view.tsx` (ArrowRight ×2), `activity-icon.tsx` (glyph),
`activity-view.tsx` (hero Search), `goal-detail-view.tsx` + `goals-view.tsx`
+ `my-tasks-view.tsx` + `team-view.tsx` (empty-state icons). Update the
AGENTS/CLAUDE icon convention notes. Pin with Playwright: mobile tab icon
stroke 2 (relax the v2.4 1.5 assertion).

### WS-2 — Dashboard ActivityRow: gap 12 + wrapping detail (F2)

`dashboard-view.tsx` ActivityRow: `gap-[14px]` → `gap-[12px]`; detail
`truncate` → wrap (keep mt 2, 12px/18px lh). Pin with Playwright: the
dashboard panel's first row height grows (86.5 ≈ two-line detail with the
seed) — assert the row's detail element has no `text-overflow: ellipsis`.

### WS-3 — Activity view: group card + label block (F3 + F4)

`activity-view.tsx`: wrap each group's `<ul>` in an `.orb-row-card` div
(r14, deeper pair — the existing primitive); the date label becomes an
inline span inside a `div` with `leading-6` (24px) and `mb-[10px]` (retire
the P + mb-14). Pin with Playwright: the group card element carries the
deeper shadow pair; the label block height is 24.

### WS-4 — Goal-card chip blocked count (F5)

`goals-view.tsx` desktop chip: remove the `normal-case tracking-normal`
classes from the blocked-count span (desktop variant only — the mobile
card's span keeps them). Pin with Playwright: the desktop blocked span
computes `text-transform: uppercase`.

### WS-5 — Date picker weekday headers (F6)

`date-picker.tsx`: weekday header row → 11px/700 `#9A9A9A` with the row at
25px (lh/padding); the popover height collapses 4px to match. Pin with
Playwright: the "Su" header computes fontWeight 700 + color #9A9A9A.

### WS-6 — Check-in modal spacing + radio labels (F7)

`task-detail.tsx` (check-in): radio grid mb 8 → remove; textarea mt 16;
button mt 16 (net +16 inner height). Radio labels: content-width labels
with the input as a sibling (grid columns auto) instead of fixed 196px
flex labels. Pin with Playwright: the modal panel height 353 ± 4 and the
radio label width < 100 (content-width).

### WS-7 — Mobile goal-card pct letter-spacing (F8)

`goals-view.tsx` mobile pct chip: add `tracking-[-0.01em]` (−0.13px at
13px). LOW priority; fold into WS-4's file.

### WS-8 — Verification

1. Full gate: lint → typecheck → unit (137) → build → smoke (30) → e2e
   (36 — update the four stroke assertions + add the new pins).
2. Re-probe every changed surface against the live with computed styles
   (stroke census, dashboard rows, activity groups, chip, picker headers,
   check-in modal).
3. VLM sanity pass on stitched before/after pairs.

### WS-9 — Screenshots + docs

1. Regenerate affected `docs/screenshots/*.png` from the production build.
2. README (icon note, activity group card, chip note), AGENTS.md (icon
   convention rewrite — single-class stroke 2; activity feed bullet;
   goal-chip bullet), CLAUDE.md (same), PAD v2.6 revision block, SKILL.md
   (stroke lesson), session_23 log, worklog; mark this plan executed.

### WS-10 — Ship

Conventional Commit on `main`, push via `docs/ssh_git_wrapper_v3.py`,
verify the remote ref equals local HEAD, shred the key.

## Execution record (2026-09-23)

All work streams executed. Final gate: lint 0 · typecheck 0 · 137/137
unit · build clean · 30/30 smoke · 44/44 Playwright (the 36 v2.5 checks +
8 net-new v26 pins; the four v2.4-era stroke assertions were rewritten to
the stroke-2 spec in place — new pins cover the group card, the dashboard
row wrap, the desktop chip, the picker headers, and the check-in modal
spacing). Re-probes EXACT on every changed surface. See docs/session_23.md.
