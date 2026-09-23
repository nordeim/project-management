// Live probe 3: dump the login form's exact child structure.
import { chromium } from "/home/z/my-project/project-management/node_modules/@playwright/test/index.mjs";

const LIVE = "https://agent-pm-copy-15e23720.base44.app";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
await page.goto(LIVE + "/login", { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(800);

const tree = await page.evaluate(() => {
  const form = document.querySelector("form");
  if (!form) return null;
  const walk = (el, depth) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      tag: el.tagName,
      cls: String(el.className ?? "").slice(0, 70),
      top: Math.round(r.top * 10) / 10,
      h: Math.round(r.height * 10) / 10,
      mt: cs.marginTop,
      mb: cs.marginBottom,
      gap: cs.gap,
      text: el.children.length === 0 ? (el.textContent ?? "").trim().slice(0, 30) : "",
      kids: depth > 0 ? [...el.children].map((c) => walk(c, depth - 1)) : undefined,
    };
  };
  return walk(form, 3);
});
console.log(JSON.stringify(tree, null, 1));
await browser.close();
