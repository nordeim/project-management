import { chromium } from "/home/z/my-project/project-management/node_modules/@playwright/test/index.mjs";
const BASE = "http://localhost:3100";
const browser = await chromium.launch();
const loginCtx = await browser.newContext();
const lp = await loginCtx.newPage();
const resp = await lp.request.post(BASE + "/api/auth/login", { data: { email: "demo@orbital.app", password: "Demo1234!" } });
const cookie = (await resp.headers()["set-cookie"] ?? "").split(";")[0];
await loginCtx.close();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addCookies([{ name: cookie.split("=")[0], value: cookie.split("=").slice(1).join("="), url: BASE }]);
const page = await ctx.newPage();
await page.goto(BASE + "/activity");
await page.waitForTimeout(2000);
const out = await page.evaluate(() => {
  const p = [...document.querySelectorAll("p, span, div")].find((e) => /^Online\s*·/.test((e.textContent ?? "").trim()) && e.getBoundingClientRect().width > 60 && e.getBoundingClientRect().width < 130);
  if (!p) return null;
  const parts = [...p.childNodes].map((n) => ({
    type: n.nodeType === 3 ? "text" : n.tagName,
    text: (n.textContent ?? "").trim().slice(0, 12),
    w: Math.round(n.getBoundingClientRect?.().width * 100) / 100 ?? null,
  }));
  const cs = getComputedStyle(p);
  return {
    w: Math.round(p.getBoundingClientRect().width * 100) / 100,
    h: Math.round(p.getBoundingClientRect().height * 100) / 100,
    gap: cs.gap, pad: cs.padding, font: cs.fontFamily, dotW: p.querySelector(".orb-live-dot") ? getComputedStyle(p.querySelector(".orb-live-dot")).width : null,
    parts,
  };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
