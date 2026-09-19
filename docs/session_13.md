I'll continue this multi-phase task. Let me start by checking the workspace state and the uploaded prompt file.
The worklog shows v1.9 was shipped at commit 313ad50. This new request references `docs/parity-remediation-v1.9.md`, so this is a new iteration cycle. Let me refresh the workspace and check current state.
Workspace is at 313ad50 (v1.9 shipped). Let me verify the uploaded prompt and review the current state of the key documents.
The repo state is clean at v1.9. Let me set up the task plan and review the session/status docs.
Session 11 completed v1.9. Now reviewing the parity remediation doc and core docs to establish the current status baseline.
v1.9 plan fully executed and shipped. This is a new iteration (session 12). Let me re-verify the core docs, then run the baseline gate.
Core docs re-verified. Now running the baseline gate to confirm the current project status (skills/ excluded).
**Baseline gate GREEN**: lint 0 · typecheck 0 · 122/122 unit · build clean · 30/30 smoke. Current status confirmed — v1.9 holds. Now let me update the worklog and start the fresh parity verification crawl.
Let me check the agent-browser skill for session setup, and start the clone server.
Now let me set up both authenticated browser sessions.
The live app shows the shell (public-read). I need to log in properly. Let me click LOG IN and authenticate.
Live session authenticated. Now setting up the clone session.
Both sessions authenticated. Let me set up the session-12 probe directory and run fresh probes across all surfaces.
Now let me create the session-12 navigation script and run the full probe sweep.
All probes captured. Now let me build a comparison tool to extract deltas.
The activity view shows real structural deltas. Let me see the remaining diffs (team, settings, dashboard), then verify suspicious items at the DOM level.
Key findings emerging. Let me do direct DOM verification of the suspicious deltas — team invite button, empty icons, goal-detail chip, settings rhythm, and goals card height.
The clone session wasn't on /team. Let me navigate it properly and re-probe.
Team view is clean except the empty-state icon color (#B3B3B3 live vs #2F2823 clone). Now verifying goal-detail chip, settings rhythm, and goals card height.
Goal-detail header margins measured precisely — clone uses mt-compensation (8/8/12) vs live's mb-based rhythm (chip mb 8, h1 mb 6, Target mt 8). Now checking the settings right-card rhythm.
Settings right-card rhythm delta confirmed: select→AI-Tone-label gap 18px live vs 10px clone. Now checking the goals card internals.
Goal card measurements reveal v1.9's pad-top fix may have been based on a swapped reading. Let me verify computed paddings directly and check the content above the cards.
Two real goals-view deltas found. Let me check the live filter-chip wrapper styling (it has 2px padding — possibly a visible well).
Chip wrapper is invisible — only a 2px position delta. Now let me precisely measure the activity feed rows, hero margins, and separators.
Borders match. Now let me take comparison screenshots (dashboard at current night hour, wizard, login) to complete the delta inventory.
Dashboard is visually identical (only data-driven differences). Now checking the wizard, login, and check-in modal.
VLM readings need computed-style verification (per the established noise rules). Let me probe the wizard DOM directly.
The wizard wrapper heights differ (552 vs 501). Let me get the complete child stack geometry of both wizards.
Wizard deltas cataloged. Now checking login and the check-in modal.
The clone's /login redirected (authenticated session). Let me log out of the clone browser session and re-probe.
Login deltas found — notably the white page background appears missing. Let me check the login code.
Login deltas fully quantified. Now checking the check-in modal and mobile chrome.
The smoke test reseeded the DB — goal IDs changed. Let me re-discover them.
The smoke test left the DB empty. Let me reseed and restart verification.
The clone session logged out earlier. Let me log back in and continue verification.
Now let me verify the mobile chrome at 390×844.
VLM found several sheet deltas. Let me verify each with computed styles.
Complete inventory nearly done. Let me quickly verify the date-picker popover on both sides, then compile the remediation plan.
Delta inventory complete. Now let me locate the exact files for each fix before writing the remediation plan.
The wizard code is clear. Before fixing shared components (Input, DatePicker, orb-btn-dark), let me check how they render in the live app's OTHER dialogs (add-task) to make the right call.
The live uses per-dialog input styles (add-task: 36px/8-12 well-style; wizard: 37.5px/9-14). Let me check the clone's current state.
The live's standard dialogs use r20 + different button styles. Let me sweep the remaining live dialogs (task-edit, goal-edit, invite-member) to complete the picture.
Team icons confirmed NOT a delta (stroke matches — probe artifact). Let me verify the goal-detail stats→tasks gap and locate the mobile sheet code, then write the plan.
Now let me read the remaining dialog files for the plan validation.
Let me take one final measurement of the live add-task selects, then write the plan.
I have a complete inventory. Now writing the v2.0 remediation plan.
Plan written. Let me validate the remaining referenced files before executing.
Two more findings: the live sheet overlay is black/20 + 4px blur, and the clone renders a duplicate close. Updating the plan.
Now starting TDD. **WS-1 RED first**: update the calendar spec to expect dynamic rows.
RED confirmed. Now GREEN — implementing dynamic rows in calendar.ts.
GREEN — 122/122. Now implementing WS-2 and WS-3 (goals, goal-detail, activity).
Now goal-detail-view and activity-view:
Now WS-4 — the standard dialog system. First check which dialogs override the base panel:
The live invite is a smaller 384px dialog. Now implementing WS-4 — dialog base, buttons, and inputs:
Now update the check-in dialog to preserve its p-24, and add the new button classes:
Now the shared Input (h-36 pattern) and applying the new classes to the three standard dialogs:
Now applying the new button classes to the standard dialogs:
Now the invite dialog — 384px panel + its 13px/36px button style:
Now WS-5 — the wizard rhythm fixes:
Edits 1-2 applied; only the button row remains (two occurrences). Fixing with context:
Now the date picker (WS-9):
Now WS-6 (check-in), WS-7 (login), WS-8 (settings):
Now the login rhythm (WS-7):
Now WS-8 (settings AI Tone gap) and WS-10 (mobile MORE sheet):
Now WS-10 — the mobile MORE sheet. First add `showCloseButton` support to SheetContent:
Now the MORE sheet itself in orbital-app.tsx:
Let me verify the live's tab-bar icons before keeping that change:
The live tab bar uses square-check-big — my change broke it. Reverting the tab icon, keeping ListTodo only for the sheet rows:
Now the MORE sheet body itself:
Fixing a padding conflict in the sheet classes (tailwind-merge would drop `p-[...]` when `pb-[...]` follows):
Now let me run the intermediate gate (lint + typecheck + tests) before rebuilding:
Server restarted. Now re-probing all changed surfaces (WS-11):
The clone still shows old styles — let me verify the build actually contains the changes:
The old server (PID 13224) never died — pkill pattern didn't match. Killing and restarting properly:
Goals card matches (165.75/18-20) but the card starts 6px high — the chips→cards gap is 20 vs live 24. Let me fix:
Let me re-verify the other surfaces with the current build (one more rebuild at the end for the goals fix):
Activity feed matches. Now the add-task dialog:
Close button matches. Now the check-in modal:
Check-in matches (one micro-fix: h2 tracking −0.4px). Applying, then checking the wizard:
Wizard now within 1px throughout. Checking the wizard's lower internals + date picker:
The Continue button's padding is being overridden. Let me inspect the Button component:
The `has-[>svg]:px-3` utility (higher specificity via `:has()`) overrides the custom class. Fixing with important-suffixed utilities on the wizard buttons:
Now verifying the date picker, login, settings, and MORE sheet (all in the current build):
Date picker matches (5 rows, centered, downward). Now login and the MORE sheet:
Login matches (footer y 763=763, heights 20=20, card equal). Now settings + MORE sheet:
Settings AI card matches (AI Tone at 284 vs live 285). Now the MORE sheet:
MORE sheet is pixel-perfect. Now rebuilding with the final three fixes and running the full gate:
Full gate GREEN. Final spot-checks on the rebuilt server:
Goals card height exact (166=166). Verifying the wizard's Continue button fix:
Wizard buttons match. Now regenerating the README screenshots:
Final VLM sanity check on the key changed surfaces:
VLM disproven again (computed probes show identical card widths 1072@x316). Checking the mobile menu visually:
The clone-more.png is stale (pre-fix). Re-comparing with the fresh screenshot:
All verification complete. Now updating documentation (WS-12). Let me check the README sections:
Now AGENTS.md and CLAUDE.md:
Now the PAD revision block:
Now the session_12 log and worklog:
Now the final step — commit and push. Let me first review the runbook and stage changes:
The shim and paramiko are ready. First, commit the v2.0 remediation on main:
Committed e9929e1. Now writing the SSH key outside the repo and verifying it:
Dry-run successful (remote at 313ad50, HEAD e9929e1 ready). Now the real push:
All tasks complete. Final worklog entry:
Session 12 is complete — **v2.0 parity remediation shipped to `main @ e9929e1`** on `git@github.com:nordeim/project-management.git` (remote verified, SSH key shredded, no new branches).

**What this session delivered:**

1. **Verified the v1.9 baseline** — full gate green (lint 0 · typecheck 0 · 122/122 unit · build · 30/30 smoke)
2. **Fresh side-by-side crawl** (~35 computed-style probes, both viewports) found the real residuals:
   - v1.9's goal-card "pad-top 23px" was a mis-read → corrected to the live's `18px 20px`
   - The live uses a **second dialog button system** (12px normal-case submits, r20 panels, 30px r8 close) distinct from the wizard's 11px uppercase pills; the invite dialog is a third 384px variant
   - The live calendar renders **only the weeks a month needs** (5 rows for Sep 2026) and opens centered/downward
   - The mobile MORE sheet was rebuilt from precise measurements (r24, upward shadow, 9px brand, plain 16px rows, 20%+4px blur scrim)
3. **TDD execution** — calendar spec rewritten red-first → dynamic `monthGrid`, 122/122 held
4. **Re-verification closed every surface to 0–2px** (goal cards 166=166px, login card 746=746px, date picker 5=5 rows, MORE sheet geometry identical); two VLM misreads disproven by computed styles
5. **Docs aligned** (README, AGENTS, CLAUDE, PAD v2.0 revision block, session_12 log) + 14 screenshots regenerated

**Suggested next steps:** re-run the smoke suite after pulling `e9929e1` in a fresh clone to confirm the standalone build, or spot-check the wizard's date picker around a month boundary (e.g., Nov 30 → Dec 1) where the dynamic-row change is most visible.
