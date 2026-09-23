// Precise measurement of the live's login field block (the 78 vs 70 mystery).
import { chromium } from "/home/z/my-project/project-management/node_modules/@playwright/test/index.mjs";

const LIVE = "https://agent-pm-copy-15e23720.base44.app";
const CLONE = "http://127.0.0.1:3100";

async function fieldBlock(page, url) {
  await page.goto(url + "/login", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(900);
  return page.evaluate(() => {
    const form = document.querySelector("form");
    const label = form.querySelector("label");
    const block = label.parentElement;
    const inputWrap = [...block.children].find((c) => c.tagName === "DIV");
    const input = inputWrap?.querySelector("input");
    const rows = [];
    const describe = (el, name) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      rows.push({
        name, tag: el.tagName,
        top: Math.round(r.top * 10) / 10, bottom: Math.round(r.bottom * 10) / 10, h: Math.round(r.height * 10) / 10,
        mt: cs.marginTop, mb: cs.marginBottom, pt: cs.paddingTop, pb: cs.paddingBottom,
        fs: cs.fontSize, lh: cs.lineHeight, display: cs.display,
      });
    };
    describe(block, "block");
    describe(label, "label");
    describe(inputWrap, "inputWrap");
    describe(input, "input");
    // all children of the block
    const kidTags = [...block.children].map((c) => c.tagName + (c.className ? "." + String(c.className).split(" ")[0] : ""));
    const blockRect = block.getBoundingClientRect();
    const labelRect = label.getBoundingClientRect();
    const wrapRect = inputWrap.getBoundingClientRect();
    return { rows, kidTags, gapLabelToWrap: Math.round((wrapRect.top - labelRect.bottom) * 10) / 10, blockBottomMinusWrapBottom: Math.round((blockRect.bottom - wrapRect.bottom) * 10) / 10 };
  });
}

const browser = await chromium.launch();
for (const [name, url] of [["LIVE", LIVE], ["CLONE", CLONE]]) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const p = await ctx.newPage();
  console.log(`=== ${name} ===\n` + JSON.stringify(await fieldBlock(p, url), null, 1));
  await ctx.close();
}
await browser.close();
