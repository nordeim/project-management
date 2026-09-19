# Session 11 — v1.9 parity remediation (resumed final pass)

**Date:** 2026-09-18/19 · **Scope:** Resume the interrupted session-11 final verification pass; close the residual deltas; align docs; ship.

## Goal

Session 11 had implemented the v1.8 plan and committed `d047b0f`, but was interrupted mid-verification (WS-10.2) with docs still at v1.7 and the session logs as raw transcripts. This session resumed exactly there: finish the side-by-side verification, fix what it found (v1.9), run the full gate, regenerate screenshots, align all docs, and push.

## What happened

1. **Resume + baseline** — Fresh clone at `d047b0f`; full baseline gate green (lint 0 · typecheck 0 · 107/107 unit · build · 30/30 smoke) — the v1.8 code state held.
2. **Final verification pass (the interrupted step)** — Two authenticated agent-browser sessions at 1440×900 + 390×844; ~20 computed-style probes (new harness `probe-both.sh` + probes under the workspace `scripts/probes/`), results in `research/par-s11/`. Probe-noise rules applied (Tailwind v4 `rounded-full` computes to 33554432px ≡ 50%; shadow lists with leading transparent layers are flattened cascades; markup-tag choices are not visual deltas; VLM icon-color readings were disproven — the SVG stroke attribute is the truth).
3. **Key findings → `docs/parity-remediation-v1.9.md`**:
   - The date-card photo **rotates by time of day** (live bundle `XF()`: 4 lighting variants at the 5/11/17/21 hour boundaries) — earlier crawls read a static "bright day photo" because they ran in daylight.
   - Timestamps are **date-fns `formatDistanceToNow` long form** — the live bundle's full distance algorithm extracted and re-implemented.
   - The greeting starts at hour **5**, not midnight.
   - The wizard is a **680px conversational wrapper** (avatar + speech bubble + form panel) — correcting the v1.8 "no bot intro" reading; all dialogs share a **blurred warm scrim**.
   - The login logo is the reference's `Frame24.svg` — a white **rounded square**, not a circle; plus a ~40-item micro-delta sweep.
4. **TDD (red → green)** — `relative-time.test.ts` (12 specs), `greeting.test.ts` boundary updates, `day-image.test.ts` (3 specs) + `src/lib/day-image.ts`; the four day-hill assets downloaded and optimized. **107 → 122 unit checks.**
5. **Implementation** — Dashboard (rotating photo, row rhythm, glyph color), activity feed (pill/hero/rows/tags), goals + goal-detail + task cards, team + settings rhythm, dialog base (scrim + r16), wizard wrapper, login page, sidebar brand, mobile chrome, avatar text.
6. **Verification** — Full gate green (lint 0 · typecheck 0 · 122/122 unit · build clean · 30/30 smoke); re-probes closed the goals view to 0 deltas and the rest to probe-noise/≤2-6px content offsets; README screenshots regenerated (14 files).

## Outcome

- The clone now matches the reference on every measured surface (styles verified; positions within content-height rounding); three new time-aware behaviors (photo rotation, long-form timestamps, greeting boundaries) extracted from the reference's bundle and pinned by tests.
- Docs aligned to v1.9 (README, AGENTS.md, CLAUDE.md, PAD revision blocks); session logs rewritten as proper logs.

## Artifacts

- `docs/parity-remediation-v1.9.md` · `src/lib/day-image.ts` + `day-image.test.ts` · `src/lib/relative-time.test.ts` · `public/day-hills-{morning,noon,dusk,night}.jpg` · refreshed `docs/screenshots/*.png`
