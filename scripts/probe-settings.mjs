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
await page.goto(BASE + "/settings");
await page.waitForTimeout(1500);
const out = await page.evaluate(() => {
  const btns = [...document.querySelectorAll("button")].filter((b) => /Save/i.test(b.textContent ?? ""));
  return {
    saveButtons: btns.map((b) => {
      const s = b.querySelector("svg");
      return {
        text: (b.textContent ?? "").trim().slice(0, 20),
        visible: b.getBoundingClientRect().height > 0,
        svgW: s ? Math.round(s.getBoundingClientRect().width) : null,
        svgClass: s ? s.getAttribute("class") : null,
        svgAttrW: s ? s.getAttribute("width") : null,
      };
    }),
    cardCount: document.querySelectorAll("main div").length,
  };
});
console.log(JSON.stringify(out, null, 1));
// group labels on /activity
await page.goto(BASE + "/activity");
await page.waitForTimeout(1500);
const labels = await page.evaluate(() =>
  [...document.querySelectorAll("main span")]
    .filter((e) => e.getBoundingClientRect().width > 0 && e.children.length === 0)
    .map((e) => ({ text: (e.textContent ?? "").trim().slice(0, 24), fs: getComputedStyle(e).fontSize, h: Math.round(e.getBoundingClientRect().height), lh: getComputedStyle(e).lineHeight }))
    .filter((l) => l.fs === "10px")
    .slice(0, 12),
);
console.log(JSON.stringify(labels, null, 1));
await browser.close();
