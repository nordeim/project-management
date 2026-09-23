// Follow-up probes: (1) mobile Home tab diff detail, (2) popover gap via the
// e2e method, (3) does the LIVE /login redirect authenticated visitors?
import { chromium } from "/home/z/my-project/project-management/node_modules/@playwright/test/index.mjs";

const LIVE = "https://agent-pm-copy-15e23720.base44.app";
const CLONE = "http://127.0.0.1:3100";

const browser = await chromium.launch();

// --- 1+2: clone at 390 (home tab detail) and 1440 (popover via e2e method) ---
const ctxC = await browser.newContext({ viewport: { width: 390, height: 844 } });
const pageC = await ctxC.newPage();
await pageC.goto(CLONE + "/login", { waitUntil: "networkidle" });
await pageC.fill('input[id="email"]', "demo@orbital.app");
await pageC.fill('input[id="password"]', "Demo1234!");
await pageC.click('button[type="submit"]');
await pageC.waitForURL(CLONE + "/").catch(() => {});
await pageC.waitForTimeout(1500);
const homeTab = await pageC.evaluate(() => {
  const nav = [...document.querySelectorAll("nav")].find((n) => n.getAttribute("aria-label") === "Primary" || (getComputedStyle(n).position === "fixed" && n.getBoundingClientRect().width > 370));
  const home = nav?.querySelector("a");
  if (!home) return null;
  const chip = home.firstElementChild;
  return {
    ariaCurrent: home.getAttribute("aria-current"),
    chipCls: chip ? String(chip.className).slice(0, 50) : null,
    chipRect: chip ? { w: Math.round(chip.getBoundingClientRect().width * 10) / 10, h: Math.round(chip.getBoundingClientRect().height * 10) / 10 } : null,
    chipBg: chip ? getComputedStyle(chip).backgroundColor : null,
    chipShadow: chip ? getComputedStyle(chip).boxShadow.slice(0, 80) : null,
  };
});
console.log("CLONE home tab:", JSON.stringify(homeTab));
await ctxC.close();

// live home tab detail
const ctxL = await browser.newContext({ viewport: { width: 390, height: 844 } });
const pageL = await ctxL.newPage();
await pageL.goto(LIVE + "/login", { waitUntil: "networkidle" });
await pageL.fill('input[id="email"]', "sepnetflix2023@outlook.com");
await pageL.fill('input[id="password"]', "$Abcd1234");
await pageL.click('button[type="submit"]');
await pageL.waitForURL(LIVE + "/").catch(() => {});
await pageL.waitForTimeout(1500);
const homeTabL = await pageL.evaluate(() => {
  const nav = [...document.querySelectorAll("nav, div")].find((n) => {
    const cs = getComputedStyle(n);
    const r = n.getBoundingClientRect();
    return cs.position === "fixed" && Math.abs(r.y + r.height - window.innerHeight) < 2 && r.width > 370 && r.height > 60 && r.height < 90 && n.querySelectorAll("a").length >= 4;
  });
  const home = nav?.querySelector("a");
  if (!home) return null;
  const chip = home.firstElementChild;
  return {
    ariaCurrent: home.getAttribute("aria-current"),
    chipCls: chip ? String(chip.className).slice(0, 50) : null,
    chipRect: chip ? { w: Math.round(chip.getBoundingClientRect().width * 10) / 10, h: Math.round(chip.getBoundingClientRect().height * 10) / 10 } : null,
    chipBg: chip ? getComputedStyle(chip).backgroundColor : null,
    chipShadow: chip ? getComputedStyle(chip).boxShadow.slice(0, 80) : null,
  };
});
console.log("LIVE home tab:", JSON.stringify(homeTabL));

// --- 2: popover gap on live via pill click (fixed finder) ---
const gapL = await (async () => {
  await pageL.setViewportSize({ width: 1440, height: 900 });
  await pageL.goto(LIVE + "/", { waitUntil: "networkidle" });
  await pageL.waitForTimeout(1500);
  const clicked = await pageL.evaluate(() => {
    const spans = [...document.querySelectorAll("span")].filter((s) => /sepn/i.test(s.textContent ?? "") && s.getBoundingClientRect().width > 0 && s.getBoundingClientRect().y < 150);
    if (!spans.length) return false;
    spans[0].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    return true;
  });
  await pageL.waitForTimeout(900);
  const gap = await pageL.evaluate(() => {
    const wrapper = document.querySelector("[data-radix-popper-content-wrapper]");
    const inner = wrapper?.firstElementChild;
    const triggers = [...document.querySelectorAll("button, [role=button], div")].filter((b) => /sepn/i.test(b.textContent ?? "") && b.getBoundingClientRect().height > 25 && b.getBoundingClientRect().height < 60 && b.getBoundingClientRect().y < 150 && b.querySelector("span, svg"));
    if (!inner || !triggers.length) return null;
    const tr = triggers[0].getBoundingClientRect();
    const ir = inner.getBoundingClientRect();
    return { gap: Math.round((ir.top - tr.bottom) * 10) / 10, triggerH: Math.round(tr.height), triggerTag: triggers[0].tagName };
  });
  return { clicked, gap };
})();
console.log("LIVE popover (fixed):", JSON.stringify(gapL));

// --- 3: does the live /login redirect authenticated visitors? ---
const liveLoginAuthed = await pageL.evaluate(() => null);
await pageL.goto(LIVE + "/login", { waitUntil: "networkidle" });
await pageL.waitForTimeout(1200);
const liveLoginState = await pageL.evaluate(() => ({
  url: location.pathname,
  hasCard: [...document.querySelectorAll("div")].some((d) => {
    const cs = getComputedStyle(d);
    const r = d.getBoundingClientRect();
    return r.width > 300 && r.width < 600 && cs.backgroundColor !== "rgba(0, 0, 0, 0)" && parseFloat(cs.borderRadius) >= 12 && r.height > 400;
  }),
  hasForm: !!document.querySelector("form"),
}));
console.log("LIVE /login while authenticated:", JSON.stringify(liveLoginState));

// clone comparison
const ctxC2 = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const pageC2 = await ctxC2.newPage();
await pageC2.goto(CLONE + "/login", { waitUntil: "networkidle" });
await pageC2.fill('input[id="email"]', "demo@orbital.app");
await pageC2.fill('input[id="password"]', "Demo1234!");
await pageC2.click('button[type="submit"]');
await pageC2.waitForURL(CLONE + "/").catch(() => {});
await pageC2.waitForTimeout(1000);
await pageC2.goto(CLONE + "/login", { waitUntil: "networkidle" });
await pageC2.waitForTimeout(1200);
const cloneLoginState = await pageC2.evaluate(() => ({
  url: location.pathname,
  hasCard: [...document.querySelectorAll("div")].some((d) => {
    const cs = getComputedStyle(d);
    const r = d.getBoundingClientRect();
    return r.width > 300 && r.width < 600 && cs.backgroundColor !== "rgba(0, 0, 0, 0)" && parseFloat(cs.borderRadius) >= 12 && r.height > 400;
  }),
  hasForm: !!document.querySelector("form"),
}));
console.log("CLONE /login while authenticated:", JSON.stringify(cloneLoginState));

await browser.close();
