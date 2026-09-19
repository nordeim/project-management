I'll continue this comprehensive task. Let me start by checking the current workspace state and any existing progress.
The workspace has been reset. Let me set up the task plan and clone the repository.
仓库已克隆。现在我来查看其结构并阅读核心文档。
Now let me read the core documentation files.
Now let me read CLAUDE.md and start on the architecture document.
Now let me read the architecture document (it's large, I'll read it in parts).
The architecture doc is large. Let me read the most current session docs to understand the current state.
Now let me read the parity-remediation-v2.0 plan and check what the last commit changed.
Now I understand the state: **v2.0 parity shipped** (e9929e1 + session_13 log at 4bcd9a8). This session is the next iteration cycle. Let me update my todos, verify the codebase state, and run the baseline gate.
Environment is ready. Let me install dependencies and run the baseline gate.
**Baseline gate is fully GREEN**: lint 0 · typecheck 0 · 122/122 unit · build clean · 30/30 smoke. The v2.0 claims hold. Let me log this and set up the fresh parity crawl.
agent-browser is available. Let me check how it handles sessions, then start the clone server.
Let me start the clone production server and set up both browser sessions.
Clone server is up. Now let me set up the live reference session and authenticate.
Live session authenticated. Now the clone session.
The server died when the shell exited. Let me start it fully detached.
The server keeps dying. Let me diagnose by running it in the foreground briefly.
The sandbox kills background processes between tool calls. Let me verify which processes survive.
Browser sessions persist — only my background servers get killed. I'll boot the server per-command. Let me authenticate the clone session now.
Both sessions are authenticated. Now let me build the probe harness for the fresh crawl.
Let me build the probe harness. First, a quick eval test on the live session.
Eval works. Let me inspect the live app's DOM structure to build robust selectors.
The DOMs differ structurally. I'll build a dual-selector probe harness. Let me create the research directory and write it.
Now the runner and diff scripts:
Now let me explore both dashboards' DOM in detail to write the selector maps.
I notice smoke-test artifacts in the clone's data. Let me re-seed for clean demo data.
Clean seed done. Now let me define the dashboard surface selector maps.
Let me fix the selector file to avoid CSS-escaping issues and verify the clone's DOM paths.
Now let me run the dashboard probe:
Only 2 probes captured — something's off. Let me check the output.
The runner passes the whole file instead of the per-app map. Let me fix it.
The eval context persists `const` declarations. Let me pass selectors as an IIFE argument instead.
The probe works but selectors picked mismatched elements. Let me enhance the probe core with relative finders and rewrite selectors using text-based matching.
Now the dashboard selectors with consistent like-for-like targets:
Let me verify which tags hold the key texts on both apps before finalizing.
Good progress! Let me fix the diff's shadow-noise bug and the activity heading selector mismatch.
The byText matcher needs to handle the clone's duplicated responsive spans. Let me improve it and fix the presence print.
The clone's responsive-span doubling breaks text matching. Let me relax the filter and inspect the goals panel structure.
The clone's dashboard goals list is EMPTY while live has rows! Let me verify visually.
A real functional delta — the clone's dashboard goals panel is empty. Let me check the dashboard view code.
The store's goals list may be empty. Let me query the API directly.
API returns 3 goals but the store shows none. Let me check the goals view in the browser.
The re-seed created a new user ID, invalidating the session. Let me log in again.
Session restored, goals render now. Let me fix the goalsRow selector and re-run the dashboard probe.
Let me fix the remaining selector mismatches with structural selectors.
Let me examine the saved probe data in detail for the stat columns.
Key findings emerging. Let me run a focused follow-up probe on the shell geometry and the stat number boxes.
Both mains are 852 — the difference is the greeting header block. Let me measure it.
Headers match. The live grid is 12px shorter than the clone's. Let me check the grid sizing mode.
The live has 12px more bottom spacing. Let me check if this shell pattern holds on other views.
Subtitle positions match (margin distributed differently — visually identical). Let me verify the ring card internals and check the mobile breakpoints.
The ring is identical — that delta was a probe artifact. Let me check the clone's stat column code for the well-box finding.
Let me check the live's stat number box element details.
Confirmed Finding A: the live's stat numbers sit in 88×88 well squares. Let me continue the crawl — goals view next.
Structures match well. Let me write the goals-view probe selectors.
Goals deltas are mostly 2px shifts from the filter wrapper. Let me measure the live's exact spacing chain.
Let me check the clone's filter chips for counts and the active well style.
Goals view matches well (2px residual). Let me capture side-by-side screenshots for all views to hunt structural deltas efficiently.
All views captured. Let me stitch side-by-side comparison images for VLM review.
Now let me use the VLM skill to review the comparison images.
The VLM sees the dashboard as identical. Let me crop the stats panel to verify my well-box finding.
Finding A confirmed by VLM. Let me compare the remaining views.
Desktop views are clean. Now the goal-detail view — let me navigate both to a goal.
Data-driven differences mostly. Let me verify the progress bar precisely with a computed probe.
Progress bars are identical (67%). Let me probe the goal-detail task cards with computed styles.
Task cards match. Let me run the goal-detail computed probe.
Selector mismatches again. Let me re-dump both apps' task card structures precisely.
Where are the clone's task action buttons? Let me check the card's container.
Found a 6px gap difference between chip row and title. Let me check the clone's task-card code.
Let me measure the first task cards (with descriptions) on both apps.
The task card needs +6px chip-row margin. Now let me verify the goal-detail header rhythm.
Header rhythm aligns. Now let me crawl the dialogs — starting with the New Goal wizard.
VLM found wizard differences. Let me verify with computed styles.
The live wizard renders inline in the page, not as an overlay? Let me view the screenshots.
The wizard is a fixed-position modal. Let me probe its geometry on both apps.
Wizard matches. Now the add-task dialog on both apps.
Let me verify the add-task dialog with computed probes.
The inline quoting is breaking. Let me write dialog probes to files and run them with a helper.
The dialog closed. Let me re-open and probe in one command.
Found real deltas: dialog panel shadow + select heights. Let me get the full live data.
The live dialog keeps closing between commands. Let me re-open and probe in one atomic command.
Confirmed deltas. Let me check the clone's dialog base code.
The clone's dialog base carries a shadow the live doesn't have. Let me verify the remaining dialog details atomically.
The clone's scrim probe hit the wrong element (Radix portals overlay as sibling). Let me check it directly.
Confirmed: panel shadow + scrim alpha deltas. Let me check the check-in dialog on the live.
Let me measure the check-in dialog geometry precisely.
The inner content matches. Let me find the actual check-in panel width on both.
The live's check-in has extra content height. Let me probe the description text element.
Real deltas found in check-in description styles. Let me compare the radio option rows.
Let me check the invite dialog on the live, then wrap up the dialog crawl.
Invite scrim = 0.25 but add-task measured 0.3. Let me re-verify the add-task scrim.
add-task = 0.3, invite = 0.25. Let me check the check-in scrim to complete the pattern.
Ambiguous — two scrims present. Let me test fresh with everything closed.
add-task = 0.3, check-in = 0.25. Let me test goal-edit and task-edit scrims.
goal-edit = 0.3 scrim. Let me get its panel geometry.
Let me check the live's goal-edit date field type.
Let me re-open add-task on the live to capture its full field spec.
Full add-task field spec captured. Let me get the clone's add-task fields for comparison.
Solid delta list. Now let me verify the wizard's date picker popover on both apps.
The popover measurements look suspicious. Let me compare the screenshots visually.
Let me verify the chevrons and popover geometry with computed probes.
Real date-picker deltas found (radius, bg, padding). Let me dump the live popover's internal structure.
Let me compare the clone's date picker internals.
Date picker deltas captured. Now the mobile chrome — switching both to 390×844.
Let me probe the mobile chrome computed styles.
The tab labels need a precise probe (inner spans). Let me redo.
Mobile chrome matches. Let me check the mobile stats boxes and the MORE sheet.
Mismatched elements again. Let me dump the live's mobile stats DOM.
Mobile stat wells confirmed (r10 at mobile). Let me get the exact shadow values.
Mobile numerals differ (30px/400 vs 28px/300). Now the MORE sheet on both.
Let me verify the MORE sheet differences with computed probes.
MORE sheet matches perfectly. Let me verify the login page with anonymous sessions.
Let me verify the login claims with computed probes.
Login matches. Let me check that input shadow micro-delta.
Login verified clean. Let me spot-check mobile goals view, then compile the findings.
The live screenshot caught the sheet scrim. Let me redo it.
Let me verify the mobile goals header backgrounds with computed probes.
h1 sits 28px lower on live. Let me check the mobile dashboard content start for comparison.
Mobile dashboard matches. Let me check the pattern across other mobile views.
Confirmed 28px shortfall on mobile list views. Let me check the live's mobile list-view structure.
Let me trace the clone's mobile list view chain.
Let me examine the clone's shell mobile padding code.
Let me check the live's mobile goal cards x position.
Let me check the live's mobile dashboard container padding.
Let me look at how orbital-app renders the views.
Let me check the view roots to plan the padding fix.
I have comprehensive findings. Let me check the TDD skill guidance before writing the plan.
Let me verify the check-in radio default state difference (VLM claim).
All radios unchecked by default on both — VLM noise. The crawl is complete. Let me update the worklog and write the v2.1 remediation plan.
Plan written. Now let me validate it against the codebase — reading every touched file.
Let me re-open the live check-in to verify the description block styling.
The live's check-in description is plain text — updating the plan. Let me validate the date-picker and remaining files.
Date-picker validated. Let me check all view roots for the mobile padding fix.
Plan validated against every touched file. Let me log progress and begin implementation.
**WS-1/WS-2: The stat well boxes + mobile numerals.** Let me implement:

The workspace survived. Let me check the git state and the v2.1 remediation plan to see exactly where implementation stands.
State confirmed: v2.0 shipped (4bcd9a8), v2.1 plan written and validated, **implementation not yet started** (git shows only untracked plan + research artifacts). Let me set up the todo list and check the TDD skill guidance.
Now let me begin implementation. Starting with WS-1/WS-2 — the dashboard stat columns.
I have the StatColumn code. Let me check the `orb-well` color definition and existing tests for the dashboard before making changes (TDD approach).
The unit tests cover `src/lib` logic seams; UI styling is validated by the 30 smoke tests + computed-style probes (the repo's established pattern). Let me check the smoke tests briefly, then implement WS-1/WS-2.
Smoke tests are API-level; styling parity is verified via probes. Now implementing WS-1/WS-2 — the stat well squares:
WS-1/WS-2 已完成。现在正在将 WS-6.2 和 WS-7.1（仪表盘外壳/网格几何结构）应用到同一个文件，然后检查 `orbital-app.tsx` 以确认 WS-6.1：
Now WS-6.1 — the orbital-app shell main padding:
Applying WS-6.1 to the shell main:
Now WS-6.3 — the six list-view roots. Let me find each root's current className:
The roots are `<div className="w-full">`. Let me find the exact return roots in goals-view and goal-detail-view, then apply WS-6.3 to all six:
Applying WS-6.3 to all six list-view roots:
WS-6.3 已完成（已更新 7 个根节点，包括 goal-detail 的空状态）。现在进行 WS-7.2 —— 任务卡布局节奏：
WS-7.3 — goals cards container +2px:
WS-7 complete. Now the dialog system (WS-3). Let me read the dialog base:
Applying WS-3.1 — remove panel shadow from the dialog base:
WS-3.1 已完成。现在是各个对话框 —— 首先是 `add-task-dialog`（scrim 0.3、选择框、日期输入框、文本域、提交按钮）：
The dialog uses shared Input/Select/Textarea. Let me check their base classes and where they're used (to scope WS-3.3/3.4/3.5 correctly):
Input is also used in login (verified clean) and settings. I need the exact measured spec per field. Let me check the crawl's dialog probe data:
计划将这些控件变更的作用域限制在每个对话框中（设置 + 登录功能已确认无误）。我来检查一下 SelectTrigger 的 data-size 机制，以确保覆盖生效：
`cn` uses tailwind-merge, so per-dialog overrides will work. Let me read goal-edit-dialog (it has native select + date + textarea changes):
现在，让我来阅读 `task-edit-dialog`、`task-detail-dialog`（签入）以及 `invite-member-dialog`：
WS-4.2 is already covered by the base change (check-in override has no shadow). Let me check the wizard and invite textarea usages before deciding the textarea strategy:
The plan's WS-3.3/3.5 target the base classes, but SelectTrigger is also used in settings-view (verified clean). Let me check how settings uses it:
Settings uses `size="sm"` — unaffected by the `data-[size=default]` height. Let me verify FIELD_SELECT and check the wizard's selects too:
Settings overrides px itself and the wizard has no SelectTrigger — base changes are safe. Let me verify the wizard's scrim setup, then apply all dialog changes:
All scoping verified. Now applying WS-3 base changes (select trigger + textarea):
Now the per-dialog changes. First, let me verify the check-in description probe to confirm whether the live has an inset box:
The plan (validated) keeps the box and only fixes typography. Applying per-dialog changes now — add-task first:
现在是 goal-edit-dialog：
Now task-edit-dialog and the check-in description (WS-4.1):
WS-3/WS-4 已完成。现在是 WS-5 —— 日期选择器：
Applying WS-5 — date picker radius and day-cell rounding:
所有代码更改（WS-1 至 WS-7）均已应用。正在更新待办事项并运行完整的验证关卡（WS-8）：
Lint clean. Typecheck + unit tests:
类型检查无误，122/122 个单元测试已通过。现在开始构建：
Build clean. Now the smoke test (boots the production server + exercises the API):
**全量门禁通过**：lint 0 · typecheck 0 · 122/122 unit · build clean · 30/30 smoke。现在进行 WS-8.2 —— 重新探测已变更的表面。让我检查一下 probe harness 的设置：
让我验证浏览器会话是否完好并已完成身份验证：
两个会话都处于活跃状态。让我启动克隆服务器并验证克隆会话是否已通过身份验证：
克隆已完成身份验证。让我检查一下现有的选择器格式，并编写验证探针：
我来检查一下现有的对话框探测脚本是如何原子地打开和测量对话框的：
The probes run on already-open dialogs. Let me check the dialog openers in the clone code, then write the verification driver:
The existing selector maps from the crawl are reusable. Let me check the diff tool and existing outputs:
The harness is fully reusable. Let me check the clone's seed data (the selectors reference "Product Onboarding Redesign"):
Seed matches. Let me check the probe runner shell script, then run the three main surface probes:
Selectors still resolve with my changes. Let me write the verification driver and run the main-surface probes:
The clone's goal-detail navigation failed. Let me check the GoalCard structure to fix the click:
The goal card's onClick is on the inner button, not the div. Let me fix the clone navigation and re-run the goal-detail probe:
克隆位于 `goal-detail`（`h1` 匹配），但选择器解析结果不同。让我转储（dump）克隆的 `goal-detail` DOM 结构来修复选择器：
任务卡片修复已生效（h117 对比线上 117.2 ✓）。“Tasks”标签选择器在克隆版本上匹配到了一个错误的元素。让我检查一下克隆版本的 `goal-detail` 中的 `tasks-header` 标记，然后编写一个全新的 v2.1 选择器映射：
克隆的 Tasks header 是 `h2.orb-label`。让我查看一下已保存的完整 dashboard diff，看看 stat-well 的验证结果：
Dashboard stat wells **match perfectly** (not in delta list) — WS-1/WS-2 verified. The grid is still 723.4 (the plan's `pb-3 lg:pb-0` resets at desktop — the 12px must persist). Let me check the goals selector map for the newGoalBtn y delta, then fix the wrapper:
h1 对齐了 (y48)，但克隆的 New Goal 按钮低了 12px。让我检查一下克隆的 goals header 标记：
The live's header is top-aligned (y48), clone's centered (y60). Let me inspect the live's goals header structure to confirm this is a real delta:
The live is on goal-detail now. Let me navigate back to goals and inspect:
The live top-aligns the header button (y48 = h1 y48); the clone centers it. Let me check all list-view headers for this pattern:
Two fixes: goals header alignment + dashboard wrapper pb persistence. Applying:
Now rebuild and re-probe dashboard + goals:
**Grid height fixed** (711.4 both — delta gone), stat wells match. Remaining deltas are documented noise (margin distribution ≤2px, rounded-full). Now re-probe goals:
Goals fixed (newGoalBtn y gone; cards y match). Now a focused goal-detail task-card probe with corrected per-session selectors:
Both sessions need to be on goal-detail. Let me navigate the live there first:
已获取线上环境数据（gap=6, h117.2, mb4 ✓）。需要先将克隆环境导航至 `goals`：
**任务卡片韵律：完美匹配** (h 117.2, gap 6, mb 4 — 双方均一致)。现在开始对话。让我检查一下对话探测所使用的线上动作按钮选择器：
现在我来编写对话验证探测（通用，适用于两个应用）：
现在是 dialog driver。首先，让我检查一下线上任务卡片的按钮（用于 task-edit opener）：
The live's task cards have icon-only action buttons. I'll verify add-task/goal-edit/check-in/date-picker on both, and task-edit on the clone (identical structure to add-task). Writing the dialog verification driver:
克隆的对话框**完全符合规范**（阴影无、遮罩 0.3、h35/h38/h72/fs13）。但线上环境的 goal-edit/add-task 打开失败，且克隆的 add-task 胶囊框未应用 px-22。让我检查一下线上环境 `goal-detail` 的按钮和 `orb-btn-submit` CSS：
线上环境留有了已打开的向导（可能还有一个旧的 `scrim`，从而影响了签入的读取）。让我清理一下，并妥善检查线上环境的 `goal-detail`：
The wizard is still open (live dialogs don't use role=dialog). Let me close it via its Cancel button:
Clean. Now let me find the live's goal-edit opener — click the goal card action button and inspect what opens:
The live's goal-edit IS open — my probe's `position:fixed` requirement was too strict (the live panel positions differently). Fixing the probe and measuring now:
线上 `goal-edit` 符合规范（阴影无，遮罩 0.3，h35/h72/h38）。但发现两处问题：线上按钮显示为 "Save"（克隆显示为 "Save Changes"），以及克隆的添加任务 `px-22` 未生效。让我检查一下 CSS：
`.orb-btn-submit` 是未分层的 CSS（优于分层工具）——这就是为什么 `px-[22px]` 会失败。我会使用行内样式。此外，`goal-edit` 按钮标签必须为 "Save"。首先，让我检查一下实时（live）的 `task-edit` 打开器和按钮标签：
线上 `task-edit`："保存更改" `pad 8/22` — 克隆需要 `px-22`，且 `goal-edit` 标签必须为 "Save"。现在让我打开线上的 `add-task` 以确认其 `opener` + `pill`：
LIVE add-task: "Add Task" w96.5 pad **8/22** (confirms the pill fix). Now re-measure the live check-in cleanly (the earlier 0.3 reading may have hit a stale scrim):
Two stale scrims persist on the live — my probe picks the oldest. Let me measure all scrims (the check-in's own is the newest/last):
The live's check-in scrim is 0.25 ✓ (the 0.3s were stale artifacts from closed dialogs). Three real fixes needed: add-task pill px-22 (inline), goal-edit label "Save", task-edit px-22. Let me also check the Post Update pill gap:
Text width matches (69.4). The live's pill is 4px wider from something else — let me inspect its children:
Found it — the live's Send icon carries `margin-right: 4px` (gap 8 + 4 = 12px icon-text). Applying all four button fixes:
所有对话修复已应用。现在让我修复 `date-picker` 探针（它测量了一个透明的包装器），并重新验证：
线上环境在 `goal-detail`。先导航至 `goals`：
The live now measures r16/#EEEAE6 — contradicting the plan's r14/#ECEBE9. Let me dump ALL popover candidates on the live to check for nested cards:
The live has a **two-card structure**: outer r14/#ECEBE9 + inner r16/#EEEAE6. Let me get the exact inset mechanism (border vs margin):
The live's outer card carries a Material-style drop shadow + 1px border; the inner carries the neumorphic pair. Let me get the full shadow + border color:
Restructuring the clone's date picker into the two-layer card (faithful to the live):
Now close the inner div at the end of the popover:
Date picker restructured. Now rebuild and run the mobile verification (390×844):
克隆的移动端目标全部命中 (104/r10/#EBE7E2, 30px/400, pad 16/6/90, hero 22/90)。线上环境的 `main` 元素读取结果不同——让我找到线上环境的 hero card 以进行直接对比：
线上环境可见的主内容具有 `pad 16/6/90` ✓，且 `hero` 位于 `x21.6/y90` ✓ —— 与克隆版本一致。移动端仪表盘已验证。现在来看移动端列表视图：
克隆目标 h1：x18/y102 ✓。线上的第一个 h1 是隐藏的——让我找一下可见的那个：
线上环境可见 h1：x18/y102 — 克隆版本完全一致。移动端已验证。现在验证克隆版本的 post-fix 对话框和日期选择器：
goal-edit "Save" 67.5 ✓ and add-task 96.5/8/22 ✓ — both exact. Now task-edit, check-in, and the date picker:
The add-task dialog from the previous command stayed open (Escape didn't register). Let me close it properly and re-run:
task-edit 124.9/8/22 ✓ and Post Update 121.4 ✓ — both exact. Now the date picker:
内部卡片匹配 (260/r16/#EEEAE6/p16-18) 除了高度 269 对比 273。让我来比较一下内部布局的细节：
The live's popover closed between commands. Let me re-open it and measure the chevrons/header:
The live's header row is h20/mb4 (clone: 20.5/mb12). Let me measure the live's weekday row to complete the comparison:
Date-picker specs verified (two-layer card, cells r16, trigger, grid rows); a 4px popover-height residual from the live's table-vs-grid layout is sub-visual — accepted and documented. Now the final full gate after all edits:
**Full gate GREEN** (lint 0 · typecheck 0 · 122/122 · 30/30). Now WS-8.3 — screenshots of the changed surfaces + VLM sanity pass:
0 shots captured — let me debug the screenshot command directly:
Relative paths broke the screenshots. Fixing to absolute paths and re-running:
10 shots captured. Let me stitch the v2.1 pairs side-by-side for VLM review:
5 comparison images ready. Let me load the VLM skill for the sanity pass:
Running the VLM sanity pass on the 5 stitched comparisons:
Dashboard **IDENTICAL**. Now the dialog and date-picker comparisons:
4/5 IDENTICAL — but the mobile goals claims need verification (VLM misread 5 times in the crawl). Let me probe the live's mobile goal card structure directly:
The live's mobile card has the pct (13px) top-right INLINE — a compact mobile layout. Let me compare the clone's mobile card:
Confirmed — the live uses a compact mobile card (pct 13px top-right, full-width title, h136) vs the clone's desktop card. Let me dump the live's mobile card internals to replicate:
The live's mobile card is a compact single-column layout. Let me also check the filter-chip wrapping on both, then implement the mobile card variant:
线上环境的 chips 保持在单行（Paused 溢出屏幕边缘）；而克隆环境的则会换行。让我检查一下线上环境的行溢出行为：
The live's filter row is nowrap (overflows). Let me check the live's mobile my-tasks filter + task cards too, then implement all mobile fixes:
My-tasks is empty on the live. Let me check the live's mobile task cards on goal-detail instead:
The live's mobile task card matches the clone (same structure). Now let me trigger the live's mobile delete-confirm state for the goal card, then implement:
Scope check — the VLM flagged only the goal card + chips. Let me quickly verify the clone's mobile task-card actions vs the live's 26×26 buttons, then implement:
任务卡片已匹配 (26×26 ✓)。现在让我读取完整的 GoalCard，以构建移动端变体：
Now restructuring GoalCard with the mobile compact variant:
现在在卡片闭合之前关闭桌面端包裹容器：
Now the filter-row nowrap fixes for goals and my-tasks:
Rebuilding and re-verifying mobile goals:
The card content matches (title x/w/fs, pct 13px, chips one row) but the card sits 18px lower. Let me trace the clone's spacing chain:
The chips row is 50px tall (chips are 32). Something inflates it — let me dump the row's children:
The chips shrink in the nowrap row → text wraps → h50. The live's chips don't shrink. Adding `shrink-0 whitespace-nowrap` to the chips:
Mobile card now matches (y241 exact, chips h32, title/pct aligned; 4px height residual). Let me verify the desktop card didn't regress, then capture final screenshots:
Desktop card intact (y186.6 exact, 42px pct). Final mobile goals screenshots + VLM:
Let me visually inspect the actual screenshots myself to check the VLM's claims:
The clone screenshot was taken at 1440 (viewport never reset). Re-capturing at 390:
The VLM claims color differences — let me verify with computed styles (VLM misread colors 5× in the crawl):
App bar and body backgrounds are **identical** (#EEEAE6/#EBE7E2 both) — VLM misread. Now the live's pip color and tab icon:
The live's mobile pip is **green** (#2ECC8A) — status-colored! Let me check the live's other goal pips and the clone's tab icon:
Mobile pips are status-colored (Active=green, Completed=purple). Let me check the live's DESKTOP pip to see if it's status-colored there too:
Desktop pips are all-purple; mobile is status-colored. Let me check the clone's status color map for the mobile pip fix:
The clone's map has active=#2ECC8A (matches the live's mobile pip!). Mobile pip rule: active→green, else the light purple. Applying:
Rebuilding and running the final verification round:
The app-bar claim is disproven by measurement (both #EEEAE6 identical — the VLM's 6th misread this session). **WS-8 verification is complete.** Final gate pass, then documentation:
Now WS-9 — documentation. Let me review the current doc structure:
我先检查一下 `.env.example` 与代码库之间的不一致之处：
`.env.example` matches the codebase exactly (DATABASE_URL + AUTH_SECRET). Let me confirm it's git-tracked:
`.env.example` is tracked and accurate. Now updating the docs — README first:
README done. Now AGENTS.md — dialog and date-picker specs:
现在来更新 `AGENTS.md` 中的仪表板规范和数据卡片间距，以及移动端部分：
现在来处理 CLAUDE.md 的大段视觉规范：
Now the PAD revision block. Let me check its format:
Adding the v2.1 revision block to the PAD:
Now the session_14 log. Let me check session_13's format:
Now marking the v2.1 plan as executed with the verification results:
正在追加工作日志，随后进行提交：
Now the git phase. Let me read the SSH wrapper skill first:
The skill is clear. Let me check the wrapper's default remote (the doc references task-management; our target is project-management):
The wrapper defaults to task-management — I must pass `--remote` explicitly. No ssh binary found; let me check paramiko:
Installing paramiko and deploying the shim:
paramiko 5.0.0 installed. Deploying the shim outside the repo:
Shim works. Writing the SSH key to a 0600 temp file outside the repo:
Key verified (ed25519). Now let me check the previous commit's convention for what gets committed:
The convention includes regenerating `docs/screenshots/`. Let me check the existing shot format and refresh the changed views:
正在为六个已更改的界面重新生成截图：
All screenshots regenerated. Now the local commit (following the repo's conventions, excluding research/ like previous commits):
截图未显示 —— 让我检查一下它们的状态：
The relative-path bug again — re-capturing with absolute paths:
All six screenshots updated. Staging and committing:
已提交 `0429be8`。现在通过 wrapper 进行推送 —— 先进行验证，然后 dry-run：
Dry-run clean — remote at 4bcd9a8, fast-forward to 0429be8. Real push:
**Push verified** — remote main @ 0429be8 == local HEAD. Shredding the operator key and confirming final state:
All done — key shredded, remote verified @ 0429be8, working tree clean. Marking everything complete:
The **v2.1 parity remediation is complete and shipped**. Commit `0429be8` was pushed to `main` on `git@github.com:nordeim/project-management.git` via the SSH wrapper, with the remote ref verified to equal local HEAD and the deploy key shredded afterward.

**What this session delivered:**

1. **Executed the full v2.1 plan** (13 findings across 17 files): dashboard stat-well squares (88/r12 desktop, 104/r10 mobile with 30px/400 numerals), shadowless dialog panels with per-kind scrim alphas (0.3 form dialogs/wizard, 0.25 check-in/invite), the measured control spec (selects h35, date inputs h38, textareas 13px/min-h 72), the two-layer date-picker card, the mobile shell geometry split (main 16/6/90 + per-view containers), and the rhythm micro-sweeps.

2. **Verification surfaced 8 additional real deltas**, all fixed and measured exact: submit pill widths/labels ("Save" 67.5, "Add Task" 96.5 at 8/22, "Save Changes" 124.9), the Send icon's mr-4, goals header items-start, the live's **compact single-column mobile goal card** (13px pct top-right, 16px title, status-colored pip), and the non-wrapping filter chips.

3. **Quality gates stayed green throughout**: lint 0 · typecheck 0 · 122/122 unit tests · clean build · 30/30 smoke — with every changed surface re-probed at 1440×900 and 390×844 against the live app (6 VLM misreads disproven by computed styles along the way).

4. **Docs aligned**: README/AGENTS/CLAUDE updated, PAD gained the v2.1 revision block, `session_14.md` and the v2.1 execution record written, 6 screenshots regenerated, `.env.example` verified matching and tracked.

**Suggested next steps:** pull `0429be8` in a fresh clone and re-run the smoke suite to confirm the standalone build, and spot-check the goals view at ~700px (the tablet range between the mobile and desktop card variants was never crawled against the live).
