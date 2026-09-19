# Session 10 — v1.8 parity remediation (evidence + build)

**Date:** 2026-09-18 · **Scope:** Fresh live-app crawl, delta analysis, the v1.8 remediation plan, and the v1.8 code changes.

## Goal

Resume the parity program against `https://agent-pm-copy-15e23720.base44.app/`: crawl the live reference with computed-style probes, write the v1.8 remediation plan, and implement it.

## What happened

1. **Workspace + review** — Cloned the repo at `4952446` (v1.7 state); read AGENTS.md, CLAUDE.md, README, PAD v1.7 and the session logs; baseline gate green on v1.7 (lint 0 · typecheck 0 · 93→101 unit · build · 30/30 smoke).
2. **Live crawl (evidence)** — Two authenticated agent-browser sessions (live + clone, 1440×900 and 390×844); built `scripts/par-capture.sh` + 12 named probes under `scripts/probes/`, results in `research/par-s10/`; VLM screenshot cross-checks (several VLM readings disproven by computed styles — computed styles remain ground truth).
3. **Plan** — `docs/parity-remediation-v1.8.md`: 7 systemic findings (viewport-fill dashboard, stat rhythm, glow position, DM Sans 300 + Archivo, activity feed structure, sidebar well + 3-hand clock, login/wizard drift) + ~40 micro-deltas across 11 work streams.
4. **Implementation (v1.8)** — All code changes committed as `d047b0f` ("session 11" commit): fonts (DM Sans 300 via the variable font with the opsz axis — the 38px "18" numeral width now matches exactly — plus Archivo for the wordmark), viewport-filling dashboard, stat columns with 88/104px number boxes, sidebar re-spec (Tasks Status inset well, 3-hand clock), activity-icons seam (TDD), plain activity rows with dividers, login slate restyle, dialogs r16 + the wizard as a 624px panel. Unit layer 101 → 107 (activity-icons + logo-geometry updates).

## Outcome

- Gate green after the v1.8 changes; the interrupted final verification pass was handed to Session 11 (which re-measured two v1.8 readings — the wizard's bot intro and the login logo shape — against a fresh crawl and corrected them in v1.9).

## Artifacts

- `docs/parity-remediation-v1.8.md` · `scripts/par-capture.sh` · `scripts/probes/*.js` · `research/par-s10/`
