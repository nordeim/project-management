// Paired login-card walk: live vs clone — find the 4px height delta (746 vs 742).
import { chromium } from "/home/z/my-project/project-management/node_modules/@playwright/test/index.mjs";

const LIVE = "https://agent-pm-copy-15e23720.base44.app";
const CLONE = "http://127.0.0.1:3100";

async function walkCard(page, url) {
  await page.goto(url + "/login", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(900);
  return page.evaluate(() => {
    const cards = [...document.querySelectorAll("div")].filter((d) => {
      const cs = getComputedStyle(d);
      const r = d.getBoundingClientRect();
      return r.width > 300 && r.width < 600 && cs.backgroundColor !== "rgba(0, 0, 0, 0)" && parseFloat(cs.borderRadius) >= 12 && r.height > 400;
    });
    if (!cards.length) return null;
    const card = cards[0];
    const cs = getComputedStyle(card);
    const rows = [{ tag: "CARD", h: Math.round(card.getBoundingClientRect().height * 10) / 10, pad: cs.padding, cls: String(card.className).slice(0, 60) }];
    const walk = (el, depth, path) => {
      for (const c of el.children) {
        const ccs = getComputedStyle(c);
        const r = c.getBoundingClientRect();
        rows.push({
          d: depth,
          path: path + ">" + (c.tagName === "DIV" ? "div" : c.tagName.toLowerCase()) + (ccs.display ? "" : ""),
          tag: c.tagName,
          cls: String(c.className ?? "").slice(0, 46),
          h: Math.round(r.height * 10) / 10,
          mt: ccs.marginTop, mb: ccs.marginBottom,
          text: c.children.length === 0 ? (c.textContent ?? "").trim().slice(0, 18) : "",
        });
        if (depth < 4) walk(c, depth + 1, path + ">" + c.tagName.toLowerCase());
      }
    };
    walk(card, 1, "");
    return rows;
  });
}

const browser = await chromium.launch();
const ctxL = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const pL = await ctxL.newPage();
const live = await walkCard(pL, LIVE);
const ctxC = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const pC = await ctxC.newPage();
const clone = await walkCard(pC, CLONE);

const fmt = (rows) => rows.map((r) => `${" ".repeat((r.d ?? 0) * 2)}${r.tag} h=${r.h} mt=${r.mt ?? ""} mb=${r.mb ?? ""} pad=${r.pad ?? ""} | ${(r.cls ?? "").slice(0, 40)} | ${r.text ?? ""}`).join("\n");
console.log("=== LIVE (h 746) ===\n" + fmt(live));
console.log("\n=== CLONE (h 742) ===\n" + fmt(clone));
await browser.close();
