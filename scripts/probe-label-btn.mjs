import { chromium } from "/home/z/my-project/project-management/node_modules/@playwright/test/index.mjs";
const browser = await chromium.launch();
const loginCtx = await browser.newContext();
const lp = await loginCtx.newPage();
const resp = await lp.request.post("http://localhost:3100/api/auth/login", { data: { email: "demo@orbital.app", password: "Demo1234!" } });
const cookie = (await resp.headers()["set-cookie"] ?? "").split(";")[0];
await loginCtx.close();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addCookies([{ name: cookie.split("=")[0], value: cookie.split("=").slice(1).join("="), url: "http://localhost:3100" }]);
const page = await ctx.newPage();
await page.goto("http://localhost:3100/goals");
await page.getByRole("link", { name: /Product Onboarding Redesign/ }).first().click();
await page.getByRole("button", { name: "Add Task", exact: true }).first().click();
const d = page.locator('[role="dialog"]');
await d.waitFor({ state: "visible" });
const out = await d.evaluate((el) => {
  const l = el.querySelector("label");
  const lcs = l ? getComputedStyle(l) : null;
  const btn = [...el.querySelectorAll("button")].find((b) => /^Add Task$/.test((b.textContent ?? "").trim()));
  const row = btn?.parentElement;
  const bcs = btn ? getComputedStyle(btn) : null;
  return {
    label: l ? { h: l.getBoundingClientRect().height, computedH: lcs.height, lh: lcs.lineHeight, disp: lcs.display, box: lcs.boxSizing } : null,
    btn: btn ? { h: btn.getBoundingClientRect().height, lh: bcs.lineHeight, fs: bcs.fontSize, pt: bcs.paddingTop, pb: bcs.paddingBottom, cls: btn.className.slice(0, 80) } : null,
    row: row ? { h: row.getBoundingClientRect().height } : null,
  };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
