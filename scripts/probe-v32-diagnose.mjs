// Probe: diagnose the 4 remaining v30 RED pins against the e2e server (:3100).
import { chromium } from "/home/z/my-project/project-management/node_modules/@playwright/test/index.mjs";

const BASE = "http://127.0.0.1:3100";
const browser = await chromium.launch();

// --- Authenticated context (login once) ---
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(`${BASE}/login`);
await page.fill('input[id="email"]', "demo@orbital.app");
await page.fill('input[id="password"]', "Demo1234!");
await page.click('button[type="submit"]');
await page.waitForURL(`${BASE}/`);
await page.waitForTimeout(1200);

// --- 1. Settings save icon ---
await page.goto(`${BASE}/settings`);
await page.waitForTimeout(1500);
const saveInfo = await page.evaluate(() => {
  const btns = [...document.querySelectorAll("button")].filter((x) => /Save/i.test(x.textContent ?? ""));
  return btns.map((b) => {
    const s = b.querySelector("svg");
    return {
      text: (b.textContent ?? "").trim().slice(0, 20),
      hasSvg: !!s,
      svgW: s ? Math.round(s.getBoundingClientRect().width) : 0,
      svgClasses: s ? s.getAttribute("class") : "",
      svgAttrW: s ? s.getAttribute("width") : "",
      btnRect: { w: Math.round(b.getBoundingClientRect().width), h: Math.round(b.getBoundingClientRect().height) },
    };
  });
});
console.log("SETTINGS SAVE:", JSON.stringify(saveInfo, null, 1));

// --- 2. Activity pill + group label ---
await page.goto(`${BASE}/activity`);
await page.waitForTimeout(2000);
const pill = await page.evaluate(() => {
  const p = [...document.querySelectorAll("p, span, div")].find(
    (e) => /^Online\s*·/.test((e.textContent ?? "").trim()) && e.getBoundingClientRect().width > 60 && e.getBoundingClientRect().width < 140,
  );
  if (!p) return null;
  const cs = getComputedStyle(p);
  return {
    tag: p.tagName, text: (p.textContent ?? "").replace(/\s+/g, " ").trim(),
    w: Math.round(p.getBoundingClientRect().width), h: Math.round(p.getBoundingClientRect().height),
    gap: cs.gap, ls: cs.letterSpacing, fs: cs.fontSize, fw: cs.fontWeight,
    pad: cs.padding, display: cs.display,
    children: [...p.children].map((c) => ({ tag: c.tagName, text: (c.textContent ?? "").trim().slice(0, 12), w: Math.round(c.getBoundingClientRect().width), ls: getComputedStyle(c).letterSpacing })),
  };
});
console.log("ACTIVITY PILL:", JSON.stringify(pill, null, 1));

const label = await page.evaluate(() => {
  const spans = [...document.querySelectorAll("span, p")];
  const cands = spans.filter((e) => /^(Today|Mon|Tue|Wed|Thu|Fri|Sat|Sun)/.test((e.textContent ?? "").trim()));
  return cands.slice(0, 4).map((e) => {
    const cs = getComputedStyle(e);
    const parent = e.parentElement;
    return {
      tag: e.tagName, text: (e.textContent ?? "").trim().slice(0, 22), cls: (e.getAttribute("class") ?? "").slice(0, 40),
      fs: cs.fontSize, lh: cs.lineHeight, h: Math.round(e.getBoundingClientRect().height),
      display: cs.display,
      parentLh: parent ? getComputedStyle(parent).lineHeight : "",
      parentDisplay: parent ? getComputedStyle(parent).display : "",
    };
  });
});
console.log("GROUP LABELS:", JSON.stringify(label, null, 1));

// --- 3. Button row in add-task dialog (zoom animation artifact?) ---
await page.goto(`${BASE}/goals`);
await page.waitForTimeout(1500);
await page.getByRole("link", { name: /Product Onboarding Redesign/ }).first().click();
await page.waitForTimeout(800);
await page.getByRole("button", { name: "Add Task", exact: true }).first().click();
await page.waitForTimeout(120); // mid-animation sample
const early = await page.evaluate(() => {
  const el = document.querySelector('[role="dialog"]');
  const btn = [...el.querySelectorAll("button")].find((b) => /^Add Task$/.test((b.textContent ?? "").trim()));
  const row = btn?.parentElement;
  return row ? { mt: getComputedStyle(row).marginTop, gap: getComputedStyle(row).gap, h: Math.round(row.getBoundingClientRect().height) } : null;
});
await page.waitForTimeout(600); // settled
const settled = await page.evaluate(() => {
  const el = document.querySelector('[role="dialog"]');
  const btn = [...el.querySelectorAll("button")].find((b) => /^Add Task$/.test((b.textContent ?? "").trim()));
  const row = btn?.parentElement;
  const close = el.querySelector('[data-slot="dialog-close"]');
  const svg = close?.querySelector("svg");
  return {
    row: row ? { mt: getComputedStyle(row).marginTop, gap: getComputedStyle(row).gap, h: Math.round(row.getBoundingClientRect().height) } : null,
    close: svg ? { w: Math.round(svg.getBoundingClientRect().width), color: getComputedStyle(svg).color } : null,
    dialogTransform: getComputedStyle(el).transform,
  };
});
console.log("BTN ROW early(120ms):", JSON.stringify(early));
console.log("BTN ROW settled(720ms):", JSON.stringify(settled));
await page.keyboard.press("Escape");

// --- 4. Login page geometry (logged-out context) ---
const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page2 = await ctx2.newPage();
await page2.goto(`${BASE}/login`);
await page2.waitForTimeout(1000);
const login = await page2.evaluate(() => {
  const cards = [...document.querySelectorAll("div")].filter((d) => {
    const cs = getComputedStyle(d);
    const r = d.getBoundingClientRect();
    return r.width > 300 && r.width < 600 && cs.backgroundColor !== "rgba(0, 0, 0, 0)" && parseFloat(cs.borderRadius) >= 12 && r.height > 400;
  });
  const form = document.querySelector("form");
  const labels = form ? [...form.querySelectorAll("label")] : [];
  const signin = form ? [...form.querySelectorAll("button")].find((b) => /^Sign in$/.test((b.textContent ?? "").trim())) : null;
  const footer = form ? [...form.querySelectorAll("div")].find((d) => /Forgot password\?/.test(d.textContent ?? "") && /Sign up/.test(d.textContent ?? "")) : null;
  return {
    cardCount: cards.length,
    card: cards.length ? { h: Math.round(cards[0].getBoundingClientRect().height), blur: getComputedStyle(cards[0]).backdropFilter, w: Math.round(cards[0].getBoundingClientRect().width) } : null,
    formExists: !!form,
    labelCount: labels.length,
    labelMb: labels[1] ? getComputedStyle(labels[1]).marginBottom : "",
    fieldGap: labels[0]?.parentElement && labels[1]?.parentElement ? getComputedStyle(labels[1].parentElement).marginTop : "",
    footerInForm: !!footer,
    footerMt: footer ? getComputedStyle(footer).marginTop : "",
    signinExists: !!signin,
  };
});
console.log("LOGIN:", JSON.stringify(login, null, 1));

await browser.close();
