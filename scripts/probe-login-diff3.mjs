import { chromium } from "/home/z/my-project/project-management/node_modules/@playwright/test/index.mjs";
const browser = await chromium.launch();

async function formArea(url) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const out = await page.evaluate(() => {
    const form = document.querySelector("form");
    if (!form) return null;
    // the form-area = the block containing google+divider+form
    const area = form.closest("div");
    let block = area;
    for (let i = 0; i < 6; i++) {
      if (block.parentElement && block.parentElement.getBoundingClientRect().height < 500) block = block.parentElement;
      else break;
    }
    const walk = (node, depth) => {
      const cs = getComputedStyle(node);
      const r = node.getBoundingClientRect();
      const entry = {
        d: depth, tag: node.tagName, text: (node.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 22),
        h: Math.round(r.height), mt: cs.marginTop, mb: cs.marginBottom, my: cs.margin,
      };
      const kids = depth < 3 ? [...node.children].map((c) => walk(c, depth + 1)).filter(Boolean) : [];
      return [entry, ...kids].flat();
    };
    return walk(block, 0);
  });
  await ctx.close();
  return out;
}

console.log("=== LIVE ===");
console.log(JSON.stringify(await formArea("https://agent-pm-copy-15e23720.base44.app/login"), null, 0));
console.log("=== CLONE ===");
console.log(JSON.stringify(await formArea("http://localhost:3100/login"), null, 0));
await browser.close();
