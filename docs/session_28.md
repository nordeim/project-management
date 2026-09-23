工作区完好。我来拉取最新更改并查看仓库状态。
已拉取 — 新增了 `docs/session_26.md`。当前仓库版本为 v2.7。我来阅读关键文档。
session_26.md 记录了 v2.7 交付的原始记录。现在让我来阅读剩余的核心文档和工作日志。
现在处理核心文档和 Tailwind v4 验证报告。
现在处理 CLAUDE.md、README.md 和项目技能清单。
The repo is in the v2.7 state. Now let me verify key codebase claims against the code.
All v2.7 claims verified in code. Let me check test configs and the mobile nav structure, then run the baseline gate.
Config verified. Now let me check the environment state and run the baseline gate.
The `DATABASE_URL` shell trap is present (absolute path override). Server already running on :3000. Let me check the DB seed state and run the baseline gate.
Clone is healthy with 3 goals. Now the baseline gate — lint, typecheck, unit tests.
138/138 unit ✓. Now build + smoke + e2e.
**基线门禁全绿**：lint 0 · typecheck 0 · 138/138 unit · build · 30/30 smoke · 60/60 e2e ✓

现在开始与线上环境的线上差异检测。首先，对冒烟测试残留进行 re-seed，重启服务器，并设置代理浏览器。
Setting up dual agent-browser sessions — live site and clone.
实时会话已登出。正在记录的凭据。
已登录 live 环境。接下来处理 clone 会话。
Both sessions authenticated. Now the drift survey — starting with the user's emphasis: **mobile navigation menu at 390**.
实时环境的移动端导航显示了意外情况 —— 一个尺寸为 0×0 且只有 3 个锚点的 `nav`，且标签为 "Dashboard"（而不是 "Home"）。让我仔细重新探测一下。
Now the real tab bar is visible (0,771,390,74). Full census:
Live tab bar matches v2.7 pins exactly. Now the clone:
**Tab bar: EXACT match.** Now testing the MORE sheet behavior on both apps.
Live MORE sheet matches. Testing live sheet navigation behavior:
Live sheet navigation works → /tasks. Same flow on the clone:
**发现偏差** — 克隆版本的 MORE 面板阴影不同。让我获取完整的阴影字符串：
克隆版本的阴影带有 Tailwind v4 组合痕迹（4 个零 α 阴影 + 真实阴影 —— 视觉上完全相同，但计算出的字符串与实际不同）。让我先测试一下克隆版本的 sheet 导航，然后再检查关闭按钮的 cursor 差异：
克隆 sheet 导航到 /tasks ✓。现在比较两个应用上的关闭按钮行为和光标：
Found real deltas in the MORE sheet: close cursor, brand case, shadow composition. Let me inspect the clone's sheet source:
Root cause identified: shadcn `SheetContent` base carries `shadow-lg`, and in Tailwind v4 every `shadow-*` utility composes with unset ring/inset vars → 4 zero-α prefixes. Let me run a full shadow census on both apps to find ALL such v4 artifacts:
Real deltas emerging. Let me do a precise side-by-side on the mobile dashboard stat wells and hero cards:
Both are still on /tasks. Navigating home and re-probing:
DOM structure delta found (goal wells) plus the shadow composition artifacts. Let me take side-by-side screenshots to check for REAL visual differences:
VLM 确认移动端导航和 MORE sheet 视觉效果**完全一致**。现在开始桌面端 (1440) 和 768 平板电脑的检查：
Sidebar anchors EXACT except the brand link width (91 live vs 101 clone). Let me drill into the brand:
**Key insight forming**: the live's close button has `cursor: pointer` while the clone's is `default` — this is the known **Tailwind v4 preflight change** (buttons default to `cursor: default`). Let me survey cursor on ALL interactive elements on both apps:
**已确认 Tailwind v4 bug**：克隆的按钮渲染为 `cursor: default`（v4 preflight），而线上环境的按钮渲染为 `pointer`。让我检查各个视图/端口：
The live's goal counts show 0 — session may have gone stale (documented behavior). Let me re-verify:
I accidentally navigated the live session to localhost — invalidating that census. Let me restore the live session properly:
Wait — the live's "New Goal" is now a BUTTON again (v2.7 said anchor)! Let me verify:
The live nests `<a><button class="btn-neu">` — interesting. Now re-running the goals-view button census on the REAL live:
**Systemic confirmation**: ALL live buttons = `cursor: pointer`; clone = `default`. This is the Tailwind v4 preflight bug. Let me verify it in the compiled CSS:
Confirmed: live sets `cursor: pointer` on ALL buttons (its own CSS); the clone relies on UA default (arrow) — a real parity gap. Continuing the survey at 768 (pill nav) and dialogs:
**发现实际功能偏差**：克隆版的胶囊导航栏在 `/goals` 路径下丢失了 ACTIVE 状态！让我检查一下源代码：
The pill shows the INACTIVE class while on /goals — possible re-render bug. Let me reproduce carefully:
Possible resize-related re-render bug. Let me reproduce exactly:
False alarm — the two sessions were on different views (live on /goals, clone on /). The pill is correct. Let me run a rigorous paired survey with both sessions on the same views:
**重大发现**：目标卡片宽度 — 线上 1072 vs 克隆 952（相差 120px）！外加 chip 半径的 v4 异常问题（`calc(infinity*1px)` → 33554432px vs 9999px）。让我来排查一下宽度差异：
The live's anchor wraps the WHOLE 1072px card (actions inside); the clone's anchor covers only 952px. Let me test the live's action-square click behavior:
The live's pencil button is **covered by an overlay div** — dead seam! Let me identify the covering element:
The live's edit dialog DID open (no role=dialog attr — my check was wrong). Closing it and continuing the survey:
All views structurally match — only the cursor delta is systemic. Now testing dialogs (add-task, check-in, wizard) on both:
Dialogs match geometrically; cursor is the systemic delta. Closing dialogs, then checking the wizard, date picker, and user pill:
User pill: live = pointer DIV, clone = default-cursor BUTTON (documented type difference + the systemic cursor delta). Now quick checks — wizard and date picker:
Date picker is pinned by e2e; skipping. Final survey items — login page and /tasks view:
/tasks matches except chip cursors. The live's rows show `onclick: has` — let me test if they've become clickable since v2.7:
The survey is complete. Let me scope the radius quirk with a quick census, then write the v2.8 plan:
**Smoking gun found** — the live's global CSS: `button, [role="button"] { cursor: pointer }`. Let me capture the live's exact chrome shadow strings for the plan:
All live specs captured. Now writing the v2.8 remediation plan:
Now let me examine the goals-view card structure for the anchor restructure plan:
Let me check a potential pre-existing bug — the mobile card's action buttons are inside the anchor (click bubbles → navigates?):
**发现原有 bug**：在移动端点击克隆的铅笔图标会导航离开（而非弹出对话框）！让我来验证一下线上的实际预期行为：
**已确认实际功能性 bug**：线上环境保持不变并打开对话框；克隆环境则会跳转页面。锚点（Anchor）需要一个按钮点击防护。现在正在检查受影响的 e2e 测试用例：
现在让我检查一下仪表板中 goal-well 行的结构，以进行 restructure 计划：
我现在已经掌握了完整的情况。正在编写 v2.8 修复计划：
Plan written. Now validating it against the codebase:
All sites validated. Now the TDD RED phase — writing the v28-parity spec. Let me check the v27 spec conventions first:
Writing the RED-phase spec:
RED 已确认 —— 预期会有 13 个失败。让我检查一下哪一个通过了（信息很有参考价值）：
All 13 pins fail (the "1 passed" is the auth setup). Perfect RED. Now GREEN — starting with globals.css:
Now adding the chrome shadow utility classes:
Applying the classes in orbital-app.tsx + the sheet brand fix:
Now the goals-view anchor guard + desktop restructure:
现在进行仪表板目标嵌套（WS-3）：
Now the filter chips (WS-6) and sidebar brand (WS-7):
All source changes done. Running the quality gates:
12/14 passing. Let me debug the 2 failures:
The dialog isn't opening. Let me restart the :3000 server with the new build and reproduce manually:
**Root cause**: the guard returns early WITHOUT `preventDefault()` — so the browser follows the anchor's href (full page navigation). The guard must suppress the default action:
F2 fixed. Now the pill nav test — the locator is ambiguous (two `aria-label="Primary"` navs). Using the class selector:
**v28 GREEN: 14/14.** Now the full e2e suite to verify no regressions:
Expected breakage — the old spec asserts the old "Orbital" text. Updating it to the live's literal string:
**Full e2e GREEN: 73/73.** Completing the gate with the smoke suite:
**FULL GATE GREEN**: lint 0 · typecheck 0 · 138/138 unit · build · 30/30 smoke · 73/73 e2e. Now the re-probe against the live:
按钮鼠标指针在两者上均匹配 ✓。但克隆中有 14 个锚点，而实际环境中有 17 个——让我检查一下目标卡片的锚点：
Clone returns no goal wells — let me check the dashboard state:
克隆会话在重新播种 (re-seed) 后已登出（这是已知行为）。正在重新登录：
**精确匹配**：光标统计和 well 嵌套现已与实时环境完全一致。继续重新探测：
All exact. Now the goals-view re-probe (chips + card coverage + pencil):
Clone at 390: chips 9999px + pointer, full-card anchor ✓. Fixing the live probe:
**Card coverage EXACT**: 1072×166 both apps. Final behavioral re-probe — mobile pencil:
One micro-delta: the live's brand span carries a redundant `text-transform: uppercase` (no-op on literal "ORBITAL"). Checking the sheet brand too, then aligning:
The live pattern = literal "ORBITAL" + redundant `uppercase` transform. Aligning the clone exactly:
The pill nav brand (line 186) also renders "Orbital". Checking the live's pill brand:
Updating the brand e2e pin to match the live's computed transform:
73/73 已通过。正在使用新构建重新启动服务器，并执行最终重新探测：
所有 re-probe 均已确认无误。现在开始重新生成截图：
All 16 screenshots present. VLM sanity pass on the key shots:
All VLM checks PASS. Now the documentation updates — starting with README:
Now AGENTS.md:
Now the SKILL.md lesson:
现在是 session log、worklog 以及该计划中 EXECUTED 标记：
Final staleness sweep before commit:
Docs aligned. Updating the main worklog, then committing:
已提交 `6ea6b1a`。现在进行 SSH wrapper push —— 根据操作手册进行设置：
Runbook confirmed, shim exists. Materializing the key and verifying:
Dry-run green — remote at a7d427e, fast-forward to 6ea6b1a confirmed. Real push:
✅ **v2.8 shipped and pushed to main** (`6ea6b1a`, remote verified == local HEAD, key shredded).

**This session's delivery** — the Tailwind v4 + mobile-nav pass you asked for:

1. **Mobile navigation menu**: verified working as expected on both apps (tab-bar census, MORE sheet, navigation behavior all EXACT; VLM: IDENTICAL)
2. **TailwindCSS v4 bugs found & fixed**:
   - Every button had lost the pointing cursor (v4 preflight sets no pointer) — restored via the live's exact global rule
   - `shadow-[…]` utilities were composing zero-alpha prefixes — chrome shadows now byte-match the live's clean declarations
   - `rounded-full` computed as 33554432px — chips now pin the literal 9999px
3. **Bonus functional fix**: the mobile goal-card edit/delete buttons navigated away instead of opening dialogs (a silent v2.7 regression) — fixed with a guarded full-card anchor

**Full gate**: lint 0 · typecheck 0 · 138/138 unit · 30/30 smoke · **73/73 e2e** (14 net-new pins) — all re-probed EXACT against the live.

**Next steps**: verify the commit on GitHub; the live has flipped navigation semantics twice in three deploys — the v27/v28 parity pins will fail loudly if it drifts again.
