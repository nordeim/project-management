Session 16 — sub-lg/sub-xl parity crawl + the three-state chrome (v2.2)

Continuing from session_15's suggested next steps: (1) baseline gate in a fresh clone, (2) the ~700px tablet range never crawled against the live. Workspace re-cloned at 2be0fb6.

Core docs re-read (AGENTS/CLAUDE/README/PAD v2.1 + session_14/v2.1 plan/session_15), v2.1 changes validated present in code.

**Baseline gate GREEN in the fresh clone** — lint 0 · typecheck 0 · 122/122 unit · build clean · 30/30 smoke. The pushed v2.1 standalone build is healthy.

Two authenticated agent-browser sessions (live + clone production server) set up for the uncrawled widths: 450–1023 and 1024–1279.

**Crawl discoveries (all computed-style ground truth; VLM claims cross-checked — one "sidebar at 768" reading disproven by the DOM):**

- At 768 the live renders a **hybrid**: desktop greeting + a centered floating pill nav — no sidebar, no app bar. Bisected: mobile < 768, MIDDLE state 768–1023, desktop ≥ 1024.
- The live renders **three separate DOM subtrees** (`md:hidden` / `hidden md:block lg:hidden` / `hidden lg:block`). The clone jumps mobile → desktop at `lg` — the middle state was missing entirely.
- The live's content components switch at **`md`, not `sm`** — the clone's `sm:` transitions fired 128px early (wells, labels, ring, stats panel, goal cards, settings grid).
- Mobile stat wells are **fluid squares** (104→199px), not fixed 104. Mobile main pad stays 16/6/90 through 767 — the clone's `sm:px-7 sm:pt-6` was wrong in 640–767.
- The md+ numeral floor is **28** (clamp(28,3.5vw,52px)/300); mobile fixed 30/400.
- Desktop grid tracks are **asymmetric below 1280** — `minmax(0,1fr) / minmax(438px,1fr)` — the date card starves to 2px at 1024 and clips invisible; the clone's `lg:grid-cols-2` was equal at every width.
- Goal-detail stats are **always 2-col** (209+97 even at 390) — the clone stacked below `sm`.
- The canvas glow is **centered at every breakpoint** — proven by an isolated-layer technique (hide every off-chain sibling, screenshot, centroid): live disc centered, clone at (852,269). The documented `87.44% 95.38%` and `59.17% 29.89%` were content-pollution artifacts.
- Nav glyphs: all three live navs use lucide `square-check-big` (clone: `CheckSquare`); sidebar icons 16px (clone: 17).

v2.2 plan written (`docs/parity-remediation-v2.2.md`, F1–F11, WS-1–WS-7) and validated against the code before execution.

**WS-1 shell middle state**: glow centered; app bar + tab bar `md:hidden`; `SquareCheckBig` glyphs; main drops the `sm:` overrides and gains `md:` middle-state pads; NEW 52px "Dashboard" back strip on list views; NEW floating pill nav (brand mr-1 + six desktop tabs, active = inset well chip, reuses the tested `tabActive` helper).

**WS-2 dashboard**: `md:` content transitions (greeting header, date card 200px, ring 180px, stats panel 20/24, full labels, 88px wells, clamp floor 28); fluid `aspect-square` mobile wells; asymmetric `lg:grid-cols-[minmax(0,1fr)_minmax(438px,1fr)]`.

**WS-3/WS-4/WS-5**: view roots `md:px-7`; goals card variants at `md`; settings 2-col at `md`; goal-detail stats always 2-col; sidebar glyphs 16px.

**Verification-fix cycles** (each measured against the live): pill label line-height 13.5px, brand tracking 0.18em + Archivo, dashboard New Goal pill 132×40 (`.orb-pill-outline-lg`), back button as a raised r10 pill, fluid mobile wrapper `3vw 4vw`, stats gap 8, hero cards `flex 1 1 50%` (equal halves), `lg:flex-1` + vestigial-padding removal on the date card (starves to 2px at 1024 exactly like the live), goal-detail root `px-7` (content x34), header `mt-6` no-gap/no-wrap with title `flex-1 min-w-0` (Delete stays beside: 220 = 322−102 at 390), chip at +5px (the old 10px reading double-counted chip air), desc mt 5, Target line renders (13px `#767676` + CalendarDays 13), demo avatar seeded `#FFCBDE`.

**Final verification sweep** (fresh builds, both sessions): 390 mobile spec exact (wells 104/30-400 numerals, app bar 62, hero 165/166, goal-detail pixel-exact: header y146, title 220, Target y332±1); 700 exact (wells 199, main 6px, tab bar 74, numerals 30/400); 768 middle state exact (greeting y47/48, date 672×200, main pads, strip + back button, h1 y88, cards 672×166, goal-detail h1 y161/back y88/strip, pill nav geometry — total width within ~5px of a live-side sub-pixel quirk on one tab chip); 1024 (198/438 tracks, sidebar 240), 1200 (374/438), 1440 (equal 526, goal-detail header exact) — all identical both apps. Glow regression: centered disc, exact.

**VLM sanity pass**: NEAR-IDENTICAL at 768 and 390 (differences data-only: user initials, activity content, timestamps).

**Full gate**: lint 0 · typecheck 0 · 122/122 unit · build clean · 30/30 smoke.

**Docs aligned (WS-7)**: AGENTS/CLAUDE/README updated with the three-state chrome map, `md` transitions, fluid wells, asymmetric tracks, centered glow, always-2-col goal stats, 16px glyphs, `square-check-big`, phantom `.orb-pill-outline-sm` retired; PAD bumped to v2.2 with the revision block; screenshots regenerated (01 dashboard, 03 goal-detail, 13 mobile) + NEW 15-tablet-dashboard (middle state) added to the README gallery; `.env.example` re-verified matching (DATABASE_URL + AUTH_SECRET — the only env vars the code reads); session_16 log written.

---

**The v2.2 parity remediation is complete**: the clone now mirrors the live app's three-state chrome — mobile below 768, the middle state (greeting header + Dashboard back strip + floating pill nav over desktop content) at 768–1023, and the sticky-sidebar desktop at ≥1024 with asymmetric grid tracks below 1280.

**What this session delivered:**

1. **Crawled the previously-uncrawled widths** (450–1023, 1024–1279) with two authenticated browser sessions and bisected every breakpoint exactly; built the isolated-layer glow analysis to separate the glow from content pixel pollution (both prior documented glow positions were artifacts).

2. **Implemented the v2.2 plan** (WS-1–WS-5): the shell middle state (back strip + floating pill nav with the inset-well active chip), the `sm:` → `md:` transition corrections, fluid mobile stat squares, the 28px numeral floor, asymmetric desktop grid tracks, always-2-col goal-detail stats, `square-check-big` glyphs at 16px, and the centered glow.

3. **Closed every verification delta found along the way** — pill internals (label line-height, brand tracking/font/margin), the 132×40 dashboard pill, the raised back button, the fluid mobile wrapper, equal hero halves, the date-card starve mechanics (`lg:flex-1` + vestigial padding removal), and the goal-detail header geometry (title block beside the Delete pill, chip at +5px, Target line).

4. **Quality gates stayed green throughout** (lint 0 · typecheck 0 · 122/122 · clean build · 30/30 smoke) with every changed surface re-probed at 390/700/768/1024/1200/1440 against the live app and a VLM sanity pass confirming NEAR-IDENTICAL rendering.

5. **Docs aligned**: README/AGENTS/CLAUDE carry the three-state chrome map; PAD v2.2 revision block; the tablet screenshot added to the gallery; `.env.example` verified.

**Suggested next steps:** none required for parity — the three chrome states, all view surfaces, and the full API surface are verified against the live. Optional polish: crawl the remaining app states while logged out (login page above 1024), and re-run the full gate in a fresh clone after pulling.
