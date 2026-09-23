// Probe the check-in modal geometry + the label height + heading cascade
// against the freshly built standalone server on :3100.
import { chromium } from "/home/z/my-project/project-management/node_modules/@playwright/test/index.mjs";

const BASE = "http://localhost:3100";

const browser = await chromium.launch();

// Sign in once; reuse the cookie in both contexts.
const loginCtx = await browser.newContext();
const lp = await loginCtx.newPage();
const resp = await lp.request.post(BASE + "/api/auth/login", {
  data: { email: "demo@orbital.app", password: "Demo1234!" },
});
const cookie = (await resp.headers()["set-cookie"] ?? "").split(";")[0];
console.log("login:", resp.status(), cookie.slice(0, 40));
await loginCtx.close();

const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
await ctx.addCookies([{ name: cookie.split("=")[0], value: cookie.split("=").slice(1).join("="), url: BASE }]);
const page = await ctx.newPage();
await page.goto(BASE + "/goals");
await page.getByRole("link", { name: /Product Onboarding Redesign/ }).first().click();
await page.getByRole("heading", { name: "Review Q3 project milestones" }).click();
const dialog = page.locator('[role="dialog"]');
await dialog.waitFor({ state: "visible", timeout: 10000 });

const info = await dialog.evaluate((el) => {
  const cs = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  const chain = [];
  let node = el;
  while (node && node !== document.documentElement) {
    const s = getComputedStyle(node);
    chain.push({
      tag: node.tagName,
      pos: s.position,
      top: s.top,
      transform: s.transform,
      translate: s.translate,
      filter: s.filter,
      bt: s.backdropFilter,
      willChange: s.willChange,
      contain: s.contain,
      h: Math.round(node.getBoundingClientRect().height),
    });
    node = node.parentElement;
  }
  return {
    y: r.y, top: r.top, height: r.height, pos: cs.position, csTop: cs.top,
    translate: cs.translate, transform: cs.transform, margin: cs.margin,
    docH: document.documentElement.scrollHeight,
    chain,
  };
});
console.log(JSON.stringify(info, null, 1));
await page.keyboard.press("Escape");

// --- desktop: add-task label + heading geometry ---
const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx2.addCookies([{ name: cookie.split("=")[0], value: cookie.split("=").slice(1).join("="), url: BASE }]);
const p2 = await ctx2.newPage();
await p2.goto(BASE + "/goals");
await p2.getByRole("link", { name: /Product Onboarding Redesign/ }).first().click();
await p2.getByRole("button", { name: "Add Task", exact: true }).first().click();
const d2 = p2.locator('[role="dialog"]');
await d2.waitFor({ state: "visible", timeout: 10000 });
const labelInfo = await d2.evaluate((el) => {
  const l = el.querySelector("label");
  const p = el.querySelector("p");
  const lc = l ? getComputedStyle(l) : null;
  return {
    label: l ? {
      display: lc.display, lh: lc.lineHeight, fs: lc.fontSize,
      rawH: l.getBoundingClientRect().height,
      h: Math.round(l.getBoundingClientRect().height),
      cls: l.className,
    } : null,
    headingP: p ? {
      tag: p.tagName, fs: getComputedStyle(p).fontSize, lh: getComputedStyle(p).lineHeight,
      cls: p.className,
    } : null,
  };
});
console.log(JSON.stringify(labelInfo, null, 1));
await browser.close();
