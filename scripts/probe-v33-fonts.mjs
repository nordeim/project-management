// Check the live's @font-face declarations (which DM Sans file it serves).
import { chromium } from "/home/z/my-project/project-management/node_modules/@playwright/test/index.mjs";

const LIVE = "https://agent-pm-copy-15e23720.base44.app";
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(LIVE + "/login", { waitUntil: "networkidle" });
const fonts = await page.evaluate(async () => {
  // Collect @font-face rules from all stylesheets
  const faces = [];
  for (const sheet of document.styleSheets) {
    let rules;
    try { rules = sheet.cssRules; } catch { continue; }
    for (const rule of rules) {
      if (rule instanceof CSSFontFaceRule) {
        faces.push({
          family: rule.style.getPropertyValue("font-family"),
          weight: rule.style.getPropertyValue("font-weight"),
          src: rule.style.getPropertyValue("src").slice(0, 130),
        });
      }
    }
  }
  // Also: the loaded font files via document.fonts
  const loaded = [];
  for (const f of document.fonts) {
    if (f.status === "loaded") loaded.push(`${f.family} ${f.weight} ${f.style}`);
  }
  return { faces, loaded: [...new Set(loaded)] };
});
console.log(JSON.stringify(fonts, null, 1));
await browser.close();
