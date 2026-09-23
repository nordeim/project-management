// Measure the live's user-menu popover gap below the pill.
import { chromium } from "/home/z/my-project/project-management/node_modules/@playwright/test/index.mjs";

const LIVE = "https://agent-pm-copy-15e23720.base44.app";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(LIVE + "/login", { waitUntil: "networkidle" });
await page.fill('input[id="email"]', "sepnetflix2023@outlook.com");
await page.fill('input[id="password"]', "$Abcd1234");
await page.click('button[type="submit"]');
await page.waitForURL(LIVE + "/", { timeout: 30_000 }).catch(() => {});
await page.waitForTimeout(1500);

const buttons = await page.locator("button").all();
let pill = null;
for (const b of buttons) {
  const t = await b.textContent().catch(() => "");
  if (/sepnetflix|demo|outlook/i.test(t)) { pill = b; break; }
}
if (!pill) {
  console.log("NO PILL FOUND. Page buttons:", await page.locator("button").allTextContents().then((xs) => xs.slice(0, 12)));
} else {
  const before = await pill.boundingBox();
  await pill.click();
  await page.waitForTimeout(800);
  const data = await page.evaluate(() => {
    const wrapper = document.querySelector("[data-radix-popper-content-wrapper]");
    if (!wrapper) return { found: false };
    const inner = wrapper.firstElementChild;
    const triggers = [...document.querySelectorAll("header button, body > div button")];
    const trigger = triggers.find((b) => /sepnetflix|outlook/i.test(b.textContent ?? "") && b.getBoundingClientRect().height > 30);
    if (!trigger || !inner) return { found: false };
    const tr = trigger.getBoundingClientRect();
    const ir = inner.getBoundingClientRect();
    const cs = getComputedStyle(inner);
    return {
      found: true,
      gap: Math.round((ir.top - tr.bottom) * 10) / 10,
      triggerBottom: Math.round(tr.bottom * 10) / 10,
      innerTop: Math.round(ir.top * 10) / 10,
      innerTransform: cs.transform.slice(0, 40),
      wrapperTransform: getComputedStyle(wrapper).transform.slice(0, 40),
    };
  });
  console.log("LIVE POPOVER:", JSON.stringify(data));
  await page.keyboard.press("Escape");
}
await browser.close();
