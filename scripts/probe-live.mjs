import { chromium } from "/home/z/my-project/project-management/node_modules/@playwright/test/index.mjs";
const LIVE = "https://agent-pm-copy-15e23720.base44.app";
const browser = await chromium.launch();

// ---------- logged-out: login card geometry ----------
const lo = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const lp = await lo.newPage();
await lp.goto(LIVE + "/login", { waitUntil: "networkidle" });
const card = await lp.evaluate(() => {
  const cards = [...document.querySelectorAll("div")].filter((d) => {
    const cs = getComputedStyle(d);
    const r = d.getBoundingClientRect();
    return r.width > 300 && r.width < 600 && cs.backgroundColor !== "rgba(0, 0, 0, 0)" && parseFloat(cs.borderRadius) >= 12 && r.height > 400;
  });
  return cards.length ? { h: Math.round(cards[0].getBoundingClientRect().height), blur: getComputedStyle(cards[0]).backdropFilter, w: Math.round(cards[0].getBoundingClientRect().width) } : null;
});
console.log("LIVE login card:", JSON.stringify(card));

// ---------- log in via the UI ----------
await lp.fill('input[type="email"]', "sepnetflix2023@outlook.com");
await lp.fill('input[type="password"]', "$Abcd1234");
await lp.click('button[type="submit"]');
await lp.waitForURL((u) => !String(u).includes("/login"), { timeout: 30000 });
await lp.waitForTimeout(2500);
console.log("LIVE logged in:", lp.url());

// ---------- activity pill ----------
await lp.goto(LIVE + "/activity", { waitUntil: "networkidle" });
await lp.waitForTimeout(2000);
const pill = await lp.evaluate(() => {
  const p = [...document.querySelectorAll("p, span, div")].find((e) => /^Online\s*·/.test((e.textContent ?? "").trim()) && e.getBoundingClientRect().width > 60 && e.getBoundingClientRect().width < 130);
  if (!p) return null;
  const parts = [...p.childNodes].map((n) => ({ type: n.nodeType === 3 ? "text" : n.tagName, text: (n.textContent ?? "").trim().slice(0, 12), w: Math.round((n.getBoundingClientRect?.().width ?? 0) * 100) / 100 }));
  const cs = getComputedStyle(p);
  return { text: (p.textContent ?? "").replace(/\s+/g, " ").trim(), w: Math.round(p.getBoundingClientRect().width * 100) / 100, h: Math.round(p.getBoundingClientRect().height * 100) / 100, gap: cs.gap, pad: cs.padding, font: cs.fontFamily.slice(0, 40), parts };
});
console.log("LIVE pill:", JSON.stringify(pill, null, 1));

// ---------- group label ----------
const gl = await lp.evaluate(() => {
  const l = [...document.querySelectorAll("span, p")].find((e) => /^(Today|Mon|Tue|Wed|Thu|Fri|Sat|Sun)/.test((e.textContent ?? "").trim()) && e.getBoundingClientRect().height < 24 && getComputedStyle(e).fontSize === "10px");
  return l ? { text: (l.textContent ?? "").trim().slice(0, 24), lh: getComputedStyle(l).lineHeight, h: Math.round(l.getBoundingClientRect().height) } : null;
});
console.log("LIVE group label:", JSON.stringify(gl));
await browser.close();
