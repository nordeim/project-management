Workspace refreshed — new commit added `docs/session_28.md`. Let me set up the task plan and begin the review.
Core docs reviewed — repo is now at **v2.8**. Now let me read the v2.8-specific documents.
v2.8 was shipped in session_27/28. Let me read the remaining v2.8 documents.
All v2.8 docs reviewed. Now let me quickly review the remaining core docs (README, PAD, SKILL.md) in parallel.
`.env` and `.env.example` are already correctly configured with `DATABASE_URL="file:../db/custom.db"` and `db/` at the repo root. Let me validate the v2.8 code changes and test configs against the codebase.
v2.8 changes verified in code. Let me check the skills catalog and runtime state, then run the baseline gate.
The shell `DATABASE_URL` override trap is present (absolute path pointing outside the repo) — all gate commands must use `env -u DATABASE_URL`. Let me check the relevant skills in the catalog.
All infrastructure items (env, db, vitest/playwright configs, skills) are verified in place. Now let me run the baseline gate on the pulled v2.8 state.
Lint 0 · typecheck 0. Now unit tests.
Build clean. Now the smoke suite (boots the standalone server).
30/30 smoke. Now the Playwright e2e suite (73 checks).
**Baseline gate GREEN**: lint 0 · typecheck 0 · 138/138 unit · build clean · 30/30 smoke · 73/73 e2e. The pulled v2.8 state is healthy.

Now the v2.9 drift survey. First: re-seed the clone DB (smoke residue), restart the production server, and set up dual agent-browser sessions.
Server is down. Re-seed and restart the production standalone server.
Server up. Now let me load the agent-browser skill for the dual-session drift survey.
Now let me set up dual agent-browser sessions — live site + clone — starting with the mobile viewport (390) for the mobile navigation focus.
Live session is logged out. Let me log in with the provided credentials.
Live session authenticated. Now the clone session at 390.
Clone server refused connection. Let me check what happened.
The server process died (session cleanup). Let me restart it detached with setsid.
curl works but the browser refuses — likely an IPv6 `::1` vs IPv4 mismatch. Let me use `127.0.0.1` explicitly.
The server keeps dying when the bash command exits. Let me check how previous sessions kept it alive.
The sandbox kills the process group on command exit. Let me use a double-fork launcher script.
Clone session is up. Let me log in with demo credentials.
Both sessions authenticated at 390. Now the drift survey — starting with the **mobile navigation menu** (user's focus #1). Let me run the tab-bar census on both apps.
The first `nav` in the DOM is a hidden 0×0 one. Let me write a robust probe that finds ALL navs and picks the visible tab bar.
**Tab bar census: EXACT** (rects, hrefs, glyphs, strokes, chips, shadows all identical). But I spotted one delta: the live app bar has `border-radius: 0px 0px 20px 20px` (rounded bottom corners) while the clone renders `0px`. Let me verify this and check the clone source.
Confirmed delta — the live app bar has 20px rounded bottom corners, the clone has none. Let me check the clone's source.
Found the app bar source. Also noticed the clone's mobile brand renders "Orbital" text. Let me check the live's app-bar brand string.
Second delta: app-bar brand text "Orbital" vs live's literal "ORBITAL". Now let me survey the MORE sheet on both apps.
**MORE sheet: EXACT** (geometry, shadows, rows, close, brand — only z-index 201 vs 50, an invisible stacking difference). Now let me verify sheet navigation behavior on both, then close the sheets.
Sheet navigation works identically on both. Now the 768 pill-nav state.
Surprising — the live now shows the desktop sidebar (`aside` display:flex) at 768! That contradicts the v2.2 third-chrome-state reading. Let me verify carefully.
The DOM seems transitional. Let me take a screenshot to see what's actually rendered at 768.
VLM confirms the live 768 state matches the v2.2 third-chrome-state reading (greeting header + pill nav, no sidebar) — the 0×0 aside was a hidden subtree. Now the clone at 768.
Several deltas at 768: pill nav width (490 vs 494), missing active chip on Home, different brand span. Let me probe the clone's pill structure in detail.
The clone applies active styles on the anchor itself; the live uses a chip wrapper. Let me dump the live's pill HTML for exact structural comparison.
Major discovery: the live's pill icons carry inline `stroke-width: 1.5` styles that override the attribute, plus the pill brand has a border-right divider, and chips have min-width 52px. Let me verify the computed stroke widths across surfaces on both apps.
**SYSTEMIC FINDING**: The live renders 88/91 icons at computed **1.5px** stroke (inline style overrides the `stroke-width="2"` attribute) — and the live shows 91 icons vs the clone's 41. Let me investigate both discrepancies.
The live's activity card caps at 20 ✓. The extra icons must be in hidden subtrees. Let me count visible vs hidden icons on both.
**SYSTEMIC FINDING CONFIRMED**: live = 28/29 visible icons at computed **1.5px**; clone = all 29 at 2px. The live's inline `stroke-width:1.5` styles override the attribute. Let me check the other viewports.
At 390: live = 30/31 at 1.5px, clone = 27/27 at 2px. Let me identify the live's 2px exceptions and the icon count difference (31 vs 27).
The extra live icons are from a mounted-but-closed MORE sheet (translated off-screen). Sheet-excluded counts match (27=27). Pattern: everything at 1.5px except the sheet-close x and NEW GOAL plus at 2px. Let me survey 1440 desktop.
Same pattern at 1440: live 16/17 at 1.5px, clone 17/17 at 2px. Let me find the live's CSS rule that drives this — checking its CSSOM for stroke-width rules.
The 1.5px comes from **inline styles on each svg**. Let me sample the exceptions and various icon types to map the full pattern.
Pattern mapped: live = inline `stroke-width: 1.5` on every icon except NEW GOAL plus (2px) and sheet-close x (2px). Let me survey the other views on the live to confirm this holds everywhere.
On /goals: the goal-card action squares (pencil/trash) render at **2px** while chrome icons are 1.5px. Let me complete the census on the other views.
Settings and Team reveal more 2px exceptions (form controls + action buttons). Let me enumerate the my-tasks icons and check the task-card action squares.
my-tasks is empty for this live user (data-dependent surface). Now let me census the dialogs on the live — goal-edit first.
The dialog is open (z-200 overlay). Let me census its icons specifically.
The live's Edit Goal dialog has NO close square — only Cancel + Save. Let me check the clone's goal-edit dialog for comparison.
**Key finding**: the clone's goal-edit has a Close square the live lacks. Let me verify the add-task dialog on the live (goal detail → ADD TASK).
Add-task dialog HAS the close square (X@2px) on the live; goal-edit does NOT. Let me check the task-edit dialog and the check-in modal on the live.
Task-edit matches. Now the check-in modal on the live.
Check-in modal open (448×408). Let me census its buttons and icons.
Check-in modal: send + x icons at 2px, Post Update 121×32, Close 30×30. Now the wizard on the live.
Wizard on live: x@2, bot@1.6, calendar@1.5, sparkles@2. Now the clone's wizard for comparison.
Clone wizard: bot@2 (live 1.6) and calendar@2 (live 1.5) are deltas. Let me check the live's goal-detail task-card action icons and the date picker chevrons.
Task cards: meta icons + zap@9 at 1.5; action squares at 2. Let me check the date picker and user-pill popover on the live.
Date picker chevrons at 2px (262×271 matches). Now the user-pill popover on the live.
The popover needs a real click — skipping (already pinned by v27 e2e). I now have the full live stroke map. Let me enumerate the clone's icon sites in source code.
Now let me check the live's login page and the empty-state surfaces.
Login input icons at 2px on live. Let me check the clone's login page.
The clone redirected (still authenticated). Let me clear cookies and retry.
Delta found: login input icons 15px (clone) vs 16px (live). Let me compare the login card geometry fully.
Login geometry mostly identical, but the logo svgs differ (live 20px vs clone 96px). Let me inspect both login logo structures.
**The live login page has been redesigned!** Small 20px logo (no white chip), no Google icon, different bottom links. Let me get the full structure and screenshots.
The live login HAS the 80/96px chip logo (div-based dots, not svg) — plus a card top gradient bar, a blur halo behind the logo, and a Google icon. Let me compare the clone's login structure.
The live login has been restyled: top gradient bar, blur halo, centered h1, Google icon 20px, "or" divider, 16px input icons, mobile-only footer. Let me screenshot both to compare visually.
The login page has genuinely been redesigned. Let me capture the live's exact login specs — page bg, card, inputs, placeholders.
h1/subtitle alignment (center vs left), Google icon size, gradient bar, blur halo are the login deltas. Let me get the live's card shadow and check mobile login (390).
Login needs a full restyle. Let me capture the live's login page outer wrapper structure.
**Login page background delta confirmed**: live uses a slate gradient (`from-slate-50 to-slate-100`), clone uses pure white. Let me check the live's logged-out workspace shell (LOG IN pill) at both viewports.
Session still authenticated. Let me clear cookies properly and re-check.
LOG IN pill matches the v2.5 spec exactly. Let me now verify the app-bar radius finding on the clone's source and check the remaining details.
App bar deltas confirmed (radius, brand, content-driven height). Let me measure the user-pill heights in both app bars (authenticated state).
Let me spot-check the desktop greeting header at 1440 on both apps, then compile the findings.
I have a comprehensive picture now. Let me verify a few clone source details, then compile the v2.9 remediation plan.
All findings compiled. Let me read the clone's login screen to plan the restyle.
Now let me check the existing e2e specs that will be affected by the stroke changes.
Let me verify the remaining unmeasured icons on the live — the 768 back-strip chevron, the user-menu popover, and the wizard Continue pill.
Back-strip chevron is 1.8px on the live (another exception!). Now the user-pill popover.
Session dropped again. Let me re-login and check the user-pill popover icons.
The live's user popover has TWO entries (Log Out + New Goal) vs the clone's one. Let me dump the live's popover structure.
The live's popover = single Log Out row (14px icon, #BD3228 text). The clone's probe showed [0,4,160,48] — suspicious position. Let me check the clone's user-menu source.
Let me check the live's mobile app-bar user pill (authenticated, 390).
I have the full findings list. Let me examine the pill-nav and app-bar code before writing the plan.
Let me check the sheet z-index and the login e2e spec before writing the plan.
Now I have everything needed. Let me write the v2.9 remediation plan.
Plan written. Now let me validate it against the codebase — checking the exact icon sites in the files I'll touch.
Let me measure the live's goal-detail "Back to Goals" arrow stroke before finalizing.
Validation complete — the plan matches the codebase. Now the TDD RED phase. Let me check the v28 spec conventions first.
Now writing the RED-phase v29 spec.
Now the RED phase — run the new spec against the current build (expect failures).
**RED 已确认**：所有 17 个测试均如期失败。现在进入 GREEN 阶段。我先定位 wizard sparkles 图标。
Now implementing WS-1 (stroke sweep). Starting with orbital-app.tsx.
Now the remaining orbital-app.tsx sites — back-chevron 1.8, Menu, and MORE sheet rows.
Now sidebar.tsx, task-card.tsx, and the other views.
The goals-view Plus was already updated. Now the remaining files.
WS-1 complete. Now WS-3 — the mobile app bar.
Now WS-4 — the 768 pill-nav restructure (brand divider, chips, z-index).
Now WS-7 — sheet z-index. Let me check if `cn` uses tailwind-merge for z conflict resolution.
`cn` uses tailwind-merge — adding `z-[201]` will override the base z-50. Applying to the MORE sheet.
Now WS-5 — remove the goal-edit close square. Let me check the goal-edit dialog.
The live's goal-edit has no icons at all — the clone's header has a pencil circle. Let me verify the live's heading structure.
The live session dropped again. Let me re-login and capture the goal-edit heading precisely.
The live's goal-edit heading is a plain 15px/600 "Edit Goal" with no icon. Let me check the clone's add-task heading too, then fix both.
Only goal-edit carries the icon circle. Removing it to match the live's plain heading.
Now WS-6 — the user-menu radii and name.
Now WS-2 — the login restyle. Let me check the LogoPyramid component first.
Now rewriting the login screen presentation.
Now the main render rewrite — page, card, centered column, logo halo, and footer.
Login restyled. Now WS-8 — the inset custom class. Let me check the primitives' current inset classes.
All four primitives share the standard pair. Adding `.orb-inset` to globals.css and swapping.
All inset swaps done. Now updating the retired stroke pins in existing specs.
Let me strengthen the v26 goal-detail pin — it should check by glyph, not just match either value.
The calendar glyph appears at two sizes/strokes — let me refine by size.
Let me check the v28 spec for pins my changes might break.
v28 pins are compatible. Let me check other specs for app-bar/pill-nav assertions that my restructure might affect.
The pill-nav active-chip test needs updating (active bg moved to the inner chip).
Now let me rebuild and run the quality gates.
13/18 green. Let me debug the 5 failures.
All diagnosed: need waits+viewports in tests, the shadcn Button svg trap on the Google glyph (`size-5` opts out), and the lab() gradient serialization. Fixing all.
Now fix the Google glyph (the shadcn Button svg trap — needs `size-5`).
12 = both mobile+desktop card subtrees (hidden one still counted). Filtering by visibility.
**v29 GREEN: 18/18.** Now the full e2e suite for regressions.
The live's Back-to-Goals arrow-left@14 is 2px — fixing the pin.
The ADD TASK plus@12 is also a 2px action button — adding that case.
**FULL E2E GREEN: 90/90.** Let me verify the test count arithmetic (73 prior + 18 new expected = 91).
90 = 73 prior + 17 new v29 pins ✓. Now the smoke suite.
**FULL GATE GREEN**. Now the re-probe phase — re-seed, restart the clone server with the new build, and verify against the live.
Rate limiter tripped (in-memory, per-process). Restarting the server clears it.
The old server process may have survived the pkill. Let me check.
The process renamed itself to `next-server` — the pkill pattern misses it. Let me fix the launcher and restart.
Clone authenticated. Let me verify the live session state and run the paired re-probe.
Live still authenticated. Running the paired re-probe — stroke censuses at all three viewports.
**1440: EXACT** (30=30, 29@1.5 + 1@2 both). Now 768 and 390.
768 exact; 390 exact (sheet-adjusted). Now the pill-nav structure re-probe at 768.
The sessions are still at 390. Setting 768 explicitly and re-probing.
Pill nav now matches (494 wide, z-100, chips min-w 52). Let me verify the brand divider on the live via its div wrapper, and the back-chevron on /goals.
Back-chevron 1.8px both ✓. Now goal-edit, user menu, and wizard re-probes.
Let me do a clean sequential probe per session.
The live's goal-edit shows no status select — let me dump its full field list.
The select measurements look transitional. Let me screenshot both dialogs side by side for a definitive comparison.
The VLM contradicts my button census — let me probe the live's goal-edit for a close icon directly.
The dialog closed. Let me re-open cleanly and probe the panel's top-right corner for any close element.
The dialog is stale-closed in DOM. Let me navigate fresh and re-open.
The live is at 768 and the pencil click hit a hidden variant. Let me set 1440 and use the aria-labeled button.
Definitive: the live's goal-edit has no close and uses a **native select** for Status. Let me check the clone's goal-edit date field and status control source.
The live uses a native select. Let me check the clone's GOAL_STATUS_META labels (the live shows "Completed" not "Done").
Labels match. Let me verify the live's add-task dialog select type too (native vs button).
The live uses native selects in dialogs (add-task: status 216×35 + assignee). Let me check task-edit and the clone's select sites.
Dialog selects need conversion to native; settings keeps shadcn. Let me check e2e interactions with the dialog selects first.
No e2e breakage. Let me view the add-task and task-edit select blocks for conversion.
Converting the dialog selects to native. First the `.orb-select` class in globals.css.
Now converting goal-edit's status select to native.
Now add-task's two selects.
Now task-edit's selects. Let me view them.
Gates clean. Adding a v29 pin for the native selects.
**91/91 e2e green.** Continuing re-probes — restart the clone server with the new build, then user menu + wizard + sheet z.
Log Out row identical. Let me verify the clone's popover element itself.
The popover shadow still composes v4 prefixes, and it sits 4px higher than the live. Let me fix both — custom class + sideOffset.
Rebuilding and restarting, then the wizard + login + sheet re-probes.
Wizard exact match. Now the login pages side by side.
The clone's cookie persisted — clearing cookies and re-capturing the login.
Computed styles already match for inputs/shadow. Let me measure the logo chips to settle the VLM's remaining claim.
Login verified via computed styles. Now the sheet z-index and inset-shadow cleanliness probes.
Sheet z-201 ✓. Let me re-login and verify the inset shadow cleanliness on the user pill.
All inset shadows clean (the input's focus ring is the live's focus behavior). All re-probes green. Now regenerating the affected screenshots.
Running the screenshot regeneration.
Screenshots + VLM pass. Now the documentation updates — starting with the session log.
Now updating the plan to EXECUTED and appending the worklog.
Now the README updates — e2e counts, stroke doctrine, login description.
Now AGENTS.md updates.
Now CLAUDE.md updates.
CLAUDE.md done. Now the PAD revision block and SKILL lesson.
Now the SKILL.md lesson.
Final staleness sweep before commit.
Docs aligned. Final quick gate, then commit.
Committed as `65d97f9`. Now the SSH wrapper push — checking the runbook first.
The shim is ready. Materializing the key outside the repo and dry-running.
Dry-run green (377008d → 65d97f9 fast-forward). Real push now.
**v2.9 shipped and pushed** — remote verified at `65d97f9`, key shredded. Let me record the session in the shared worklog and close out.
✅ **v2.9 已交付并推送到 main**（`65d97f9`，远端已验证，密钥已销毁）

**本轮核心成果：**

1. **移动端导航菜单**：双端逐项核验完全一致（5 标签 + MORE 键 + 底部抽屉几何/阴影/导航行为全部 EXACT）——您指定的重点关注项确认无恙。

2. **TailwindCSS v4 追查的重大发现**：线上站图标的真实描边是**计算值 1.5px**（内联 style 覆盖了 SVG 属性）——v2.6 的“全站 2px”结论是读属性导致的方法论盲区。已按实测重分：内容图标 1.5 / 动作按钮组 2 / 返回箭头 1.8 / 向导机器人 1.6，共约 45 处。

3. **登录页重构对齐**：线上页已改版（slate 渐变背景、卡片顶部渐变条、居中排版、光晕 logo、20px Google 图标），已完整复刻。

4. **附带修复**：app bar 圆角+内容驱动高度、pill 导航分隔线+芯片结构（494px 宽）、goal-edit 去关闭钮+原生 select、用户菜单 r12、z-index 对齐、内阴影 v4 组合残留清零。

**门禁全绿**：lint 0 · typecheck 0 · 138/138 单元 · 30/30 冒烟 · **91/91 e2e**（新增 18 个 v2.9 钉），所有变更面重探针 EXACT。

**建议下一步**：可在 GitHub 上核对 `65d97f9` 提交；线上站的图标系统已历经三种测量口径，后续巡检务必读**计算样式**（`getComputedStyle().strokeWidth`）——v29 钉会在下次漂移时立刻报警。
