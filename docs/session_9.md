Workspace exists with v1.5 committed locally. Let me pull the latest from remote and check the docs status.
Workspace refreshed — `docs/session_8.md` is new. Let me set up the task plan and read the key docs.
Now let me read README.md and the architecture doc.
Let me read the architecture doc directly in chunks.
Now the session and remediation docs.
`docs/session_8.md` turns out to be a raw transcript dump of the v1.5 session (committed as "update session log"), not a proper session log — a doc defect to fix this round. Now let me validate the codebase against the documented v1.5 claims.
The worklog confirms Session 7's v1.5 was fully delivered. Now let me validate the v1.5 claims against the codebase and run the gate.
Lint, typecheck, and 85/85 unit tests all green. Now the production build.
Full gate green — all v1.5 claims hold. Now let me check the skills catalog and start the fresh parity crawl (v1.6 evidence round).
Browser is up with the live app. Let me set up the research directory and crawl the live reference app.
Live app shows the unauth shell as expected. Let me log in for the deep crawl.
Signed in. Now let me capture the authenticated dashboard and probe it.
Now let me probe the live dashboard structure in depth.
Live 2×2 grid confirmed (526×526 cols, 180px top row). Now let me boot the clone's production server for side-by-side comparison.
The clone grid uses gap-16 (528px cells) vs live gap-20 (526px cells), and the bottom row is taller (657 vs 511). Let me set up parallel browser sessions for efficient side-by-side probing.
Both sessions are authenticated and independent. Let me write a reusable side-by-side probe script.
The probe missed the clone's `<section>` grids. Let me fix the probe to search all elements.
First deltas found: grid gap 16 vs 20px, and bottom-row panel height 657 vs 511px. Let me dig into the panel contents.
Key finding: live's Agent Activity panel appears to have NO card wrapper while Goals does. Let me verify.
The clone's DB is showing empty stats — the smoke suite left it depleted. Let me re-seed and re-measure.
API returns correct data (84%, 31 tasks). The browser page was mid-reload. Let me re-measure after settling.
The clone's bottom panels still look empty. Let me screenshot the clone session to see what's rendering.
The re-seed invalidated the clone session's user. Let me re-login on the clone session.
Clear deltas emerging. Let me screenshot both dashboards and compare visually.
VLM gives useful hints. Let me verify each programmatically — starting with the NEXT PLANNED ACTION box, activity icons, and stats panel.
NPA boxes match (VLM misjudged) — just padding differs slightly. Now the activity list items and their icons.
Selectors need refinement. Let me dump the live activity panel structure directly.
The live activity panel IS a card (nested one level deeper — my first probe hit the transparent wrapper). Let me map its inner structure precisely.
Positional DOM access is brittle on the live app. Let me use a text-anchored, defensive probe.
Solid deltas confirmed. Let me check the shadow variants on all dashboard cards and compare against the clone's CSS primitives.
Rich data. Let me read the clone's dashboard implementation to map these deltas to code.
Now let me measure the remaining dashboard details comprehensively on both sides.
Excellent data. Let me read the clone's globals.css to map the shadow primitives.
The live cards use radius 16 + LARGE shadow combo. Let me check whether live's other view cards also use the large shadow — this may be a global token fix.
Goals cards use a DEEPER shadow variant on live (0.92/0.36). Let me examine the live goal card's inner structure.
Let me read the clone's goals-view implementation to compare structures.
The live goal card has a 42px percentage and different structure. Let me probe the live card's action buttons and meta area.
Live goal card fully mapped. Now let me survey the remaining views' card styles on live.
Live My Tasks is empty for this account. Let me check the clone's tabs and continue the live survey: activity, team, settings.
My Tasks matches. Now the remaining live views.
Team buttons show radius 12 on live vs round pills on clone. Let me verify visually.
Now the goal-detail view on live.
The live task card HTML is flat — no edit/delete buttons (VLM hallucinated). Let me check if they appear on hover.
The live DOES have task pencil/trash buttons (26x26, radius 7). Let me locate their exact position in the DOM.
Now let me read the clone's task-card implementation for comparison.
Add-task dialog matches v1.5 spec. Let me close it and check the header/user area + sidebar clock.
Key finding: the clone's sidebar clock is below the fold (y=1957) while live pins it near the bottom (y=746). Let me verify the live's anchoring mechanism.
Let me probe the live dashboard's activity/goal row internals to explain the height difference.
Comprehensive data gathered. Let me do a quick mobile check, then compile the v1.6 plan.
The live session expired mid-crawl. Let me re-login and re-verify the mobile state.
I have comprehensive findings. Let me grab the last details — activity row icons and the clone's AiBadge — then write the plan.
Let me view the full live mobile screenshot to finalize the mobile layout understanding.
我已经获得了所有需要的证据。让我来编写 v1.6 补救计划文档。
现在，让我对照计划将涉及的代码库文件来验证该计划。
All files reviewed — the plan validates against the code. Let me begin implementation with WS-1 (globals.css card tiers).
Now let me add the card-tier primitives to globals.css.
Now WS-5.1 — the TDD seam. Writing RED tests first for the activity grouping.
RED confirmed. Now the GREEN implementation.
8/8 new tests green (93 total). Before the dashboard rework, let me verify the live mobile app bar's full contents.
No NEW GOAL on live mobile — the app bar is just logo + user pill. Now let me rewrite the dashboard view (WS-2 + mobile arrangement).
Now WS-3 — the task-card rework.
Now the AiBadge rework in widgets.tsx.
Now WS-4 — the goals-view card rework.
Now WS-5.2 — the activity view rework.
Now WS-6 — Team view updates.
Now the Settings view updates.
Now the goal-detail view updates.
Now WS-7 — the shell rework. Let me view the app shell's top portion first.
Let me check the live mobile main padding before restructuring the shell.
Now let me update the app shell with sticky sidebar, mobile app bar, and floating tab bar.
Now let me check UserMenuOrLogin to add the compact prop.
Let me run an interim gate check.
93/93 tests green. Now the production build.
Excellent — the clone now matches the live card specs. Let me run a full verification sweep.
Nearly everything matches. There's a small vertical offset (~16px) — let me measure the exact section spacing on both.
The spacing probe looks off. Let me measure the clone's hero section directly.
I dropped the hero section's margin in the rewrite. Let me fix the spacing.
Sticky sidebar works — clock at y=724 (visible). Now let me verify the goals view and task cards.
Goals card matches except the button radius (theme maps rounded-lg to 16px). Let me fix with an explicit value.
Action buttons match (zeroed entries are preflight artifacts; real shadows render). Now the activity view verification.
Now team and settings verification.
Live dialog inputs are 36-38px/13px. Let me align the Input component and remove the dialog overrides.
Mobile chrome verified. Let me do the VLM mobile comparison and run the smoke suite.
Mobile parity is good (remaining items are data-driven). Now the full smoke suite.
30/30 smoke checks pass. Now let me regenerate the README screenshots from the new build.
All screenshots regenerated. Let me do a final VLM spot-check on the key views.
The computed-style probes confirm all four panel shadows match exactly — VLM depth-perception on 1x PNGs is noise. Let me run the final full gate and the placeholder sweep.
Full gate green (lint 0 · typecheck 0 · 93/93 · build · 30/30 smoke · sweep clean). Now WS-9 — documentation. Starting with AGENTS.md.
Now CLAUDE.md updates.
Now README's feature table and design system sections.
Now the PAD v1.6 revision block and section updates.
Now let me re-measure §11 line counts and add the new seam.
Now let me rewrite `docs/session_8.md` as a proper session log (replacing the raw transcript).
Now let me update the worklog, review the change set, and commit.
Both commits in place. Now the SSH wrapper push — let me review the runbook and materialize the key.
The shim is in place with the right shebang. Let me materialize the operator key and verify.
Key fingerprint matches the prior session's record. Dry-run next.
Push verified — remote main @ `fa680e5` == local HEAD. Let me clean up and finalize the worklog.
**Session 8 (v1.6 parity remediation) is complete and pushed to GitHub `main` @ `fa680e5`.**

## What was delivered

**Fresh evidence round** — two parallel browser sessions (live + clone build) with a reusable side-by-side computed-style probe surfaced four systemic gaps no screenshot round had caught:

1. **Three card tiers** — the reference ships standard (buttons), deeper (goal/task/activity cards), and large (view panels) shadow pairs; the clone only had one. New `.orb-panel` / `.orb-row-card` / `.orb-goal-card` primitives now carry the measured values byte-for-byte.
2. **Sticky sidebar** — the clock/TASKS STATUS previously sat below the fold at y≈1957; now pinned like the reference.
3. **Flat task cards** — radius-14, gray status chips, one-line descriptions, 26px action squares floating outside the card (plus a latent radius-16 cascade bug fixed).
4. **Mobile chrome** — a real app bar (logo + user pill), side-by-side date/ring hero, and a floating rounded-24 pill tab bar.

Plus: TDD date-grouping seam for the activity feed (`activity-groups.ts`, 85→**93** unit checks), 42px goal percentages, radius-12 team buttons, settings panel/input alignment — all verified programmatically against live measurements, with all 12 README screenshots regenerated.

**Final gate:** lint 0 · typecheck 0 · 93/93 unit · build clean · 30/30 smoke · sweep clean. Docs fully aligned, and the accidentally-committed raw transcript in `session_8.md` was replaced with a proper log.

**Suggested next:** pull the repo and click through dashboard → goal detail (new task cards) → activity (date groups) → resize to mobile to see the new chrome. If any surface still drifts, a v1.7 crawl can target it surgically with `scripts/par-probe.sh`.
