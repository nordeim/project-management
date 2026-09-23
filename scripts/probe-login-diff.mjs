import { chromium } from "/home/z/my-project/project-management/node_modules/@playwright/test/index.mjs";
const browser = await chromium.launch();

async function loginCard(url) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const out = await page.evaluate(() => {
    const cards = [...document.querySelectorAll("div")].filter((d) => {
      const cs = getComputedStyle(d);
      const r = d.getBoundingClientRect();
      return r.width > 300 && r.width < 600 && cs.backgroundColor !== "rgba(0, 0, 0, 0)" && parseFloat(cs.borderRadius) >= 12 && r.height > 400;
    });
    const card = cards[0];
    if (!card) return null;
    // walk the card's meaningful column: the direct child that stacks the content
    const col = [...card.children].find((c) => c.getBoundingClientRect().height > 600) ?? card;
    const kids = [...col.children].map((c) => {
      const cs = getComputedStyle(c);
      const r = c.getBoundingClientRect();
      return {
        tag: c.tagName,
        text: (c.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 28),
        h: Math.round(r.height),
        mt: cs.marginTop,
        mb: cs.marginBottom,
        pt: cs.paddingTop,
        pb: cs.paddingBottom,
      };
    });
    return { cardH: Math.round(card.getBoundingClientRect().height), pad: getComputedStyle(card).padding, kids };
  });
  await ctx.close();
  return out;
}

const live = await loginCard("https://agent-pm-copy-15e23720.base44.app/login");
console.log("=== LIVE ===");
console.log(JSON.stringify(live, null, 1));
const clone = await loginCard("http://localhost:3100/login");
console.log("=== CLONE ===");
console.log(JSON.stringify(clone, null, 1));
await browser.close();
