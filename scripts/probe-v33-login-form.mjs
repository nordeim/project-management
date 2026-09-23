// Deep walk: the login form area (w-full wrapper) internals — live vs clone.
import { chromium } from "/home/z/my-project/project-management/node_modules/@playwright/test/index.mjs";

const LIVE = "https://agent-pm-copy-15e23720.base44.app";
const CLONE = "http://127.0.0.1:3100";

async function formTree(page, url) {
  await page.goto(url + "/login", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(900);
  return page.evaluate(() => {
    const form = document.querySelector("form");
    if (!form) return null;
    const walk = (el, depth) => {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        tag: el.tagName,
        cls: String(el.className ?? "").slice(0, 52),
        h: Math.round(r.height * 10) / 10,
        mt: cs.marginTop, mb: cs.marginBottom, pt: cs.paddingTop, pb: cs.paddingBottom,
        text: el.children.length === 0 ? (el.textContent ?? "").trim().slice(0, 20) : "",
        kids: [...el.children].map((c) => walk(c, depth - 1)),
      };
    };
    // walk from the form's PARENT (the w-full wrapper) down through the form
    const wrapper = form.parentElement;
    const w = { tag: "WRAPPER", cls: String(wrapper.className).slice(0, 52), h: Math.round(wrapper.getBoundingClientRect().height * 10) / 10, mt: getComputedStyle(wrapper).marginTop, kids: [] };
    for (const c of wrapper.children) {
      if (c.contains(form) && c !== form) {
        w.kids.push({ tag: "FORM-PARENT", cls: String(c.className).slice(0, 52), h: Math.round(c.getBoundingClientRect().height * 10) / 10, mt: getComputedStyle(c).marginTop, kids: [walk(form, 3)] });
      } else {
        w.kids.push(walk(c, 1));
      }
    }
    return w;
  });
}

const browser = await chromium.launch();
const out = {};
for (const [name, url] of [["LIVE", LIVE], ["CLONE", CLONE]]) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const p = await ctx.newPage();
  out[name] = await formTree(p, url);
  await ctx.close();
}
const fmt = (n, ind = 0) => `${" ".repeat(ind * 2)}${n.tag} h=${n.h} mt=${n.mt ?? "-"} mb=${n.mb ?? "-"} | ${(n.cls ?? "").slice(0, 44)} | ${n.text ?? ""}` + (n.kids?.length ? "\n" + n.kids.map((k) => fmt(k, ind + 1)).join("\n") : "");
console.log("=== LIVE ===\n" + fmt(out.LIVE));
console.log("\n=== CLONE ===\n" + fmt(out.CLONE));
await browser.close();
