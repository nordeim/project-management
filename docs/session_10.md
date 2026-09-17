I'll start by reading the uploaded instructions file and checking the current workspace state.
Let me read the full instructions file to internalize the operating requirements.
I've internalized the operating instructions. Now let me set up the task plan and start by refreshing the workspace.
Repo cloned successfully. Now let me review the core documentation files.
The architecture doc is large. Let me read it directly in chunks from the source file.
Now let me review the session docs — session_8.md, parity-remediation-v1.6.md, and session_9.md.
I've reviewed the core docs. Note: `docs/session_9.md` is another raw transcript dump (of the v1.6 session) — same doc defect pattern as session_8 was; I'll replace it with a proper log this round. Let me check the skills catalog and worklog, then survey the codebase structure.
Let me search the skills catalog for relevant skills for this parity remediation round.
Let me check the most relevant skills — `clone-app-pat-pro`, `agent-browser`, and `tdd`.
Now let me survey the codebase structure and validate the v1.6 claims against the code.
Now let me check the package.json and set up the environment to run the baseline gate.
Database seeded. Now let me run the baseline verification gate to validate the v1.6 claims.
Build is clean. Let me run the smoke suite to complete the baseline gate.
**Baseline gate fully green** — lint 0 · typecheck 0 · 93/93 unit · build clean · 30/30 smoke. All v1.6 claims hold. Now let me review the scandihaven repo for tech stack patterns.
Scandihaven reviewed — its patterns (Next 16 + React 19 + Tailwind v4 CSS-first tokens, strict TS, pure-seam testing, ordered verification gates) are already what ORBITAL follows. Now let me load the agent-browser skill to crawl the live reference app.
Let me set up the research workspace and open the live reference app.
The live app shows the unauthenticated shell. Let me log in with the provided credentials.
Logged in successfully. Let me save the session state and capture the dashboard.
Now let me boot the clone's production server for side-by-side comparison.
Both sessions authenticated. Let me check the existing probe script and set up the side-by-side comparison.
The probe works. Let me create an improved extraction script for cleaner delta analysis.
First deltas found — greeting text case ("Good Evening." vs "Good evening.") and main element structure. Let me dig deeper.
NEW GOAL button matches. Confirmed delta #1: greeting Title Case. Let me probe the full dashboard grid.
Panels match well. There's a 4px y-offset (129 vs 133). Let me measure the header-to-grid spacing precisely.
Found a 4px spacing delta (gap p→grid: 20px live vs 24px clone). Let me now probe dashboard panel internals comprehensively.
LIVE's date square has a raised shadow; clone's doesn't. Let me check the clone's dashboard code.
The clone's date square seems to have no shadow rendering. Let me verify directly.
Date square matches except 4px height (live has no gap between day and month). Now the ring card and stats panel.
Ring card shadow matches; "done" label has a text-style delta. Now the stats panel.
Stats panel shows significant deltas. Let me probe the exact column layout details.
Major stats panel deltas found (centered layout, 50.4px numbers, 16px gap). Let me now probe the activity and goals panels.
The live goals rows look different from v1.6's spec. Let me dig into the actual row structure.
Good progress. Let me capture the remaining dashboard header details, then move through the other views.
A systemic label-style pattern is emerging. Let me check the clone's orb-label definition and the truncated probe output.
Rich delta set on dashboard. Let me now survey the Goals view on both apps.
Goal-card deltas noted. Now let me examine the goal detail view with task cards.
Blocked-card shadows match exactly. Let me compare the goal-detail stat cards and headers.
Systemic label-style delta confirmed. Let me survey My Tasks view next.
Let me probe the sidebar in detail on both apps.
Comprehensive sidebar deltas found. Let me survey the Activity feed view now.
Team view is closely aligned. Now Settings.
Desktop survey complete. Now let me check mobile chrome on both.
Major finding — live tab bar is a full-width bottom-attached bar, not a floating pill. Let me get the clone's values.
Let me check the task check-in modal on both apps (back to desktop viewport).
The survey is comprehensive. Let me close the dialogs and compile the remediation plan.
Let me do one final probe on goal-detail header details, then compile the plan.
The survey is complete. Let me record progress in the worklog and write the v1.7 remediation plan.
Now let me write the comprehensive v1.7 remediation plan.
Plan written. Now let me validate it against the codebase — reading every file the plan touches.
`.orb-live-dot` is already 7px (the 6px probe was mid-pulse animation) — dropping that item. Let me read the remaining view files.

I'm continuing from where the session stopped — the v1.7 work is complete and committed locally; the remaining step is the SSH wrapper push. The `pip install paramiko` failed due to PEP 668 (externally managed environment). Let me verify the local state and resolve the paramiko installation.
Both commits are in place and the tree is clean. The earlier failure used the system `/usr/bin/pip`; the active python is a venv at `/home/z/.venv`. Let me install paramiko into that venv.
paramiko 5.0.0 is installed. Let me review the wrapper script's interface, then materialize the key per the runbook.
The wrapper defaults to the task-management remote, so I'll pass `--remote` explicitly for project-management. Now materializing the key to `/tmp` (outside the repo, per the runbook).
The Write tool is restricted to /home/z — using the runbook's own `cat >` procedure via bash instead.
Key materialized with 0600 perms. Now the fingerprint sanity check from the runbook.
Key verified. Now deploying the paramiko ssh shim (runbook Appendix A) to a workspace `bin/` outside the checkout.
Dry-run succeeded — authentication works and the push would advance `64bf2d5..aa67151` (our two commits). Now the real push.
Push verified — remote `main` @ `aa67151` == local HEAD. Now shredding the operator key per the runbook's final step.
All work is complete and delivered. Let me formally close out the development task.
**Session 9 (v1.7 parity remediation) is complete and pushed to GitHub `main` @ `aa67151`.**

The interrupted push is now finished: paramiko was installed into the active venv, the runbook's ssh shim deployed, the wrapper's dry-run authenticated cleanly, and the real push was verified — remote `main` == local HEAD, tracking ref synced, and the deploy key shredded.

**Delivered this round:** ~49 measured parity deltas closed via `docs/parity-remediation-v1.7.md` — two-tier label typography, centered stats columns with big light numerals, the sidebar re-spec (clock/collapse now at the live app's exact coordinates), a corrected full-width mobile tab bar, activity-feed type tags + online pill (two new TDD seams, **93 → 101 unit checks**), darker `#BD3228` red, plus ~40 micro-specs. Final gate: lint 0 · typecheck 0 · 101/101 · build · 30/30 smoke · all docs aligned and screenshots regenerated.

**Suggested next:** pull the repo and click through dashboard → goal detail → activity (new type tags) → resize to mobile for the corrected chrome. If any surface still drifts, a v1.8 crawl can target it surgically with `scripts/par-probe2.sh`.
