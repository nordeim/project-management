Let me read the full uploaded instructions file first.
I've internalized the operating instructions. Now let me set up my task plan and begin the workspace refresh.
仓库已克隆。现在让我查看核心文档文件。
Now let me read the README, the Project Architecture Document, and the SKILL doc.
现在让我阅读最新状态的文档：worklog.md, session_31.md, session_30.md 和 parity-remediation-v2.10.md。
Now let me read the parity-remediation-v2.10 plan and check git state in detail.
The repo contains an in-progress v2.10 remediation (session 31 was interrupted mid-work). Let me read the v2.10 parity plan.
The v2.10 plan includes a completion audit listing exactly what remains. Now let me validate the current code state against it — checking which fixes are in place and which are missing.
`.env` 和 `db/` 缺失（需要创建它们）。`WS-1` 对话框基础修复已应用。我来检查一下接线剩余部分。
Dialog conversions look complete. Now checking WS-5/6/7 wiring status.
Clear picture emerging. Let me check the remaining dialog details and the v30 spec state.
Now I have a precise gap list. Let me set up the environment: create `.env`, `db/` folder, install dependencies, and clone the scandihaven reference repo in parallel.
`db/` folder (with .gitkeep) is tracked and `.env` is created. Now installing dependencies and reviewing the scandihaven reference docs in parallel.
Let me check the project repo's skills catalog and Tailwind v4 validation report — the operator flagged these as relevant.
上下文已收集。现在让我运行基线测试流程（lint → typecheck → unit），并留意已知的 `DATABASE_URL` shell 覆盖陷阱。
The DATABASE_URL shell trap is present (points outside the repo). Prisma client needs generation. Let me fix both.
Database created at repo-root `db/custom.db` and seeded (3/31/36). Now running unit tests.
Build clean. Running the smoke suite and then the e2e baseline.
基线已确认：98/114 通过，16 个红色 —— 正是 v2.10 版本计划的 RED 状态。在接入修复之前，让我阅读一下那些失败的 spec body。
Now I have the full RED picture. Let me examine the remaining fix sites in detail — date-picker wrapper, login footer structure, and the online pill.
让我运行标签测试，查看实际与预期的数值。
Label renders 16 not 17 — the `height: 16.5px` may not be surviving the CSS cascade. Let me check the compiled CSS.
CSS emitted correctly — the label height failure is the zoom-in animation artifact (same class as the check-in anchor measurement). Let me verify remaining infrastructure items, then finalize the remediation plan.
All infrastructure verified. Now let me record the remediation plan and update the worklog before executing.
Now executing WS-5. Let me read the exact edit sites first.
Now the sheet overlay z-index and date-picker fixes.
WS-5 done. Now the clock and sidebar chrome fixes.
Now the activity feed pill restructure and group label line-height.
现在进行登录 F10 的修复。让我先读取完整的登录卡片结构。
Now moving the footer inside the form's bottom block:
Let me verify the final login file structure is clean.
Login structure is clean. Now let me run a quick typecheck before the spec fixes.
Source wiring complete and gates clean. Now the spec fixes (measurement artifacts + retired pins).
I need to fix a Playwright API detail — `expect.poll().toMatchObject()` doesn't return a value to capture. Let me correct that.
Now updating the two retired v29 pins.
All fixes wired. Rebuilding and running the v30/v29 specs for GREEN iteration.
36/42 green now. Let me diagnose the 6 remaining failures with detailed output.
Let me probe the running app directly to diagnose the label finder issue.
The label span is fine — the failures are async-load timing artifacts. The pill width needs live re-measurement. Now checking the login + settings failures.
The login tests are hitting the authenticated redirect — they need a logged-out context. Let me check how v29 handles this.
Before fixing the pill test, let me get ground truth from the live site. Booting a live probing session with the reference app.
关键发现 —— 线上站点的实际计算值与计划中的部分 `pin` 不同。让我更精确地测量一下线上登录表单的几何结构。
The live's form structure is more nuanced. Let me dump its exact DOM shape.
The live's exact structure is now fully mapped. Let me restructure the clone's login form to mirror it exactly.
Now closing the fields wrapper and fixing the bottom block spacing.
Now fixing the Online pill letter-spacing and the group label structure per live measurements.
Now updating the v30 spec tests with the live-verified pins and robust waits.
The tool calls are failing repeatedly. Per my operating protocol, I need to inform you:

**The tool calls are timing out frequently. Please click the restart button in the top right corner to restart the session and try again.**

---

**Progress summary so far** (so nothing is lost on restart):

✅ **Completed:**
1. Repo cloned at `/home/z/my-project/project-management` (HEAD `5dc787b`, 35 commits past v2.9)
2. All core docs reviewed (AGENTS, CLAUDE, README, PAD, SKILL, session_30/31, parity-remediation-v2.10) — the repo contains an **interrupted v2.10 session** with a documented completion audit
3. scandihaven reference repo cloned; skills catalog, TDD, Tailwind v4 patterns reviewed
4. Infra verified: `.env` created (`DATABASE_URL="file:../db/custom.db"`), `db/` at repo root (seeded 3/31/36), vitest + playwright configs functional
5. Baseline gate: lint 0 · typecheck 0 · 138/138 unit · build clean · 30/30 smoke · e2e **98/114 (16 RED** — exactly the plan's remaining work)
6. **WS-5/6/7 wiring applied**: tab bar z-100, sheet overlay z-200, date-picker z-210 + `.orb-panel-shadow`, pill chip `.orb-chip-active`, back-strip `.orb-back-btn`, clock `.orb-clock` + r50%, sidebar brand x50 + collapse p-2, activity pill restructure, settings save `size-3.5`, user-menu sideOffset 8, login F10 restructure
7. **Live site re-probed with credentials** — resolved pin ambiguities: login card 746/blur 4px, exact form DOM structure (space-y-1.5 field blocks, footer strip mt 12), pill ls 0.66px, group label lh 15 (span) with 24px parent line box

⏳ **Remaining when session restarts:**
- Apply live-probe corrections to login form (already done in source) + v30 spec updates (pill/label/settings/login tests with proper waits + storageState opt-out)
- Button-row test poll fix
- GREEN gate → full e2e → live re-probe of changed surfaces (mobile nav focus) → screenshots → docs → commit + push via SSH wrapper
