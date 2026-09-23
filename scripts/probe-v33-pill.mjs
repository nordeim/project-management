// Pill font-metric comparison: live vs clone (the 103 vs 101 width delta).
import { chromium } from "/home/z/my-project/project-management/node_modules/@playwright/test/index.mjs";

const LIVE = "https://agent-pm-copy-15e23720.base44.app";
const CLONE = "http://127.0.0.1:3100";

async function pill(page, url) {
  await page.goto(url + "/login", { waitUntil: "networkidle" });
  await page.fill('input[id="email"]', url === LIVE ? "sepnetflix2023@outlook.com" : "demo@orbital.app");
  await page.fill('input[id="password"]', url === LIVE ? "$Abcd1234" : "Demo1234!");
  await page.click('button[type="submit"]');
  await page.waitForURL(url + "/", { timeout: 30_000 }).catch(() => {});
  await page.goto(url + "/activity", { waitUntil: "networkidle" });
  await page.waitForTimeout(1800);
  return page.evaluate(() => {
    const p = [...document.querySelectorAll("p, span, div")].find(
      (e) => /^Online\s*·/.test((e.textContent ?? "").trim()) && e.getBoundingClientRect().width > 60 && e.getBoundingClientRect().width < 140,
    );
    if (!p) return null;
    const cs = getComputedStyle(p);
    const r = p.getBoundingClientRect();
    return {
      tag: p.tagName, w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10,
      pad: cs.padding, gap: cs.gap, radius: cs.borderRadius, fs: cs.fontSize, fw: cs.fontWeight,
      ff: cs.fontFamily.slice(0, 40), shadow: cs.boxShadow.slice(0, 90),
      kids: [...p.children].map((c) => {
        const k = c.getBoundingClientRect();
        const kcs = getComputedStyle(c);
        return {
          tag: c.tagName, text: (c.textContent ?? "").trim().slice(0, 10) || "(dot)",
          w: Math.round(k.width * 10) / 10, h: Math.round(k.height * 10) / 10,
          fs: kcs.fontSize, fw: kcs.fontWeight, ls: kcs.letterSpacing,
          ff: kcs.fontFamily.slice(0, 30), bg: kcs.backgroundColor, display: kcs.display,
        };
      }),
    };
  });
}

const browser = await chromium.launch();
for (const [name, url] of [["LIVE", LIVE], ["CLONE", CLONE]]) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  console.log(`=== ${name} ===\n` + JSON.stringify(await pill(p, url), null, 1));
  await ctx.close();
}
await browser.close();
