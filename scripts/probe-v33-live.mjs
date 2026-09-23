// Live probe 4 (session 33): ground-truth the remaining v2.10 pins against
// the reference app — login geometry (logged out), activity pill + group
// label + user-menu offset (authenticated).
import { chromium } from "/home/z/my-project/project-management/node_modules/@playwright/test/index.mjs";

const LIVE = "https://agent-pm-copy-15e23720.base44.app";
const browser = await chromium.launch();

// ---------- Part 1: login page (logged out) ----------
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
await page.goto(LIVE + "/login", { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(800);

const loginCard = await page.evaluate(() => {
  const cards = [...document.querySelectorAll("div")].filter((d) => {
    const cs = getComputedStyle(d);
    const r = d.getBoundingClientRect();
    return r.width > 300 && r.width < 600 && cs.backgroundColor !== "rgba(0, 0, 0, 0)" && parseFloat(cs.borderRadius) >= 12 && r.height > 400;
  });
  if (!cards.length) return null;
  const c = cards[0];
  const cs = getComputedStyle(c);
  return {
    h: Math.round(c.getBoundingClientRect().height * 10) / 10,
    w: Math.round(c.getBoundingClientRect().width * 10) / 10,
    blur: cs.backdropFilter,
    pad: cs.padding,
  };
});
console.log("LIVE LOGIN CARD:", JSON.stringify(loginCard));

const loginForm = await page.evaluate(() => {
  const form = document.querySelector("form");
  if (!form) return null;
  const labels = [...form.querySelectorAll("label")];
  const signin = [...form.querySelectorAll("button")].find((b) => /^Sign in$/.test((b.textContent ?? "").trim()));
  const footer = [...form.querySelectorAll("div")].find((d) => /Forgot password\?/.test(d.textContent ?? "") && /Sign up/.test(d.textContent ?? ""));
  const emailBlock = labels[0]?.parentElement;
  const passwordBlock = labels[1]?.parentElement;
  return {
    labelMb: labels[1] ? getComputedStyle(labels[1]).marginBottom : "",
    labelLh: labels[1] ? getComputedStyle(labels[1]).lineHeight : "",
    passwordBlockMt: passwordBlock ? getComputedStyle(passwordBlock).marginTop : "",
    passwordBlockMb: passwordBlock ? getComputedStyle(passwordBlock).marginBottom : "",
    emailBlockMb: emailBlock ? getComputedStyle(emailBlock).marginBottom : "",
    footerInForm: !!footer,
    footerMt: footer ? getComputedStyle(footer).marginTop : "",
    footerMb: footer ? getComputedStyle(footer).marginBottom : "",
    signinMt: signin ? getComputedStyle(signin.parentElement).marginTop : "",
    signinParentGap: signin ? getComputedStyle(signin.parentElement).gap : "",
    signinParentDisplay: signin ? getComputedStyle(signin.parentElement).display : "",
  };
});
console.log("LIVE LOGIN FORM:", JSON.stringify(loginForm, null, 1));

// field-block wrapper structure
const fieldStructure = await page.evaluate(() => {
  const form = document.querySelector("form");
  if (!form) return null;
  const describe = (el, depth) => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      tag: el.tagName, cls: String(el.className ?? "").slice(0, 60),
      h: Math.round(r.height), mt: cs.marginTop, mb: cs.marginBottom,
      display: cs.display, gap: cs.gap,
      kids: depth > 0 && el.children.length ? [...el.children].map((c) => describe(c, depth - 1)) : undefined,
    };
  };
  return { formKids: [...form.children].map((c) => describe(c, 2)) };
});
console.log("LIVE LOGIN FORM TREE:", JSON.stringify(fieldStructure, null, 1).slice(0, 3000));
await ctx.close();

// ---------- Part 2: authenticated surfaces ----------
const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page2 = await ctx2.newPage();
await page2.goto(LIVE + "/login", { waitUntil: "networkidle" });
await page2.fill('input[id="email"]', "sepnetflix2023@outlook.com");
await page2.fill('input[id="password"]', "$Abcd1234");
await page2.click('button[type="submit"]');
await page2.waitForURL(LIVE + "/", { timeout: 30_000 }).catch(() => {});
await page2.waitForTimeout(2000);

// Activity pill
await page2.goto(LIVE + "/activity", { waitUntil: "networkidle" });
await page2.waitForTimeout(1500);
const pill = await page2.evaluate(() => {
  const p = [...document.querySelectorAll("p, span, div")].find(
    (e) => /^Online\s*·/.test((e.textContent ?? "").trim()) && e.getBoundingClientRect().width > 60 && e.getBoundingClientRect().width < 140,
  );
  if (!p) return null;
  const cs = getComputedStyle(p);
  return {
    tag: p.tagName, text: (p.textContent ?? "").replace(/\s+/g, " ").trim(),
    w: Math.round(p.getBoundingClientRect().width * 10) / 10, h: Math.round(p.getBoundingClientRect().height * 10) / 10,
    gap: cs.gap, pad: cs.padding, fs: cs.fontSize, fw: cs.fontWeight, display: cs.display,
    children: [...p.children].map((c) => ({
      tag: c.tagName, text: (c.textContent ?? "").trim().slice(0, 12),
      w: Math.round(c.getBoundingClientRect().width * 10) / 10,
      h: Math.round(c.getBoundingClientRect().height * 10) / 10,
      ls: getComputedStyle(c).letterSpacing, fs: getComputedStyle(c).fontSize,
    })),
  };
});
console.log("LIVE PILL:", JSON.stringify(pill, null, 1));

// Group label
const label = await page2.evaluate(() => {
  const spans = [...document.querySelectorAll("span, p")];
  const cands = spans.filter((e) => /^(Today|Mon|Tue|Wed|Thu|Fri|Sat|Sun)/.test((e.textContent ?? "").trim()));
  return cands.slice(0, 3).map((e) => {
    const cs = getComputedStyle(e);
    const parent = e.parentElement;
    return {
      tag: e.tagName, text: (e.textContent ?? "").trim().slice(0, 22),
      fs: cs.fontSize, lh: cs.lineHeight, h: Math.round(e.getBoundingClientRect().height * 10) / 10,
      display: cs.display,
      parentTag: parent?.tagName, parentLh: parent ? getComputedStyle(parent).lineHeight : "",
      parentH: parent ? Math.round(parent.getBoundingClientRect().height) : 0,
      parentDisplay: parent ? getComputedStyle(parent).display : "",
    };
  });
});
console.log("LIVE GROUP LABELS:", JSON.stringify(label, null, 1));

// User menu popover offset
await page2.goto(LIVE + "/", { waitUntil: "networkidle" });
await page2.waitForTimeout(1500);
const buttons = await page2.locator("main button").all();
let pill2 = null;
for (const b of buttons) {
  const t = await b.textContent().catch(() => "");
  if (/demo|sepn|outlook/i.test(t)) { pill2 = b; break; }
}
if (pill2) {
  await pill2.click();
  await page2.waitForTimeout(700);
  const offset = await page2.evaluate(() => {
    const content = document.querySelector("[data-radix-popper-content-wrapper]");
    if (!content) return null;
    const inner = content.firstElementChild;
    const trigger = [...document.querySelectorAll("button")].find((b) => /demo|sepn|outlook/i.test(b.textContent ?? ""));
    if (!trigger || !inner) return null;
    const tr = trigger.getBoundingClientRect();
    const ir = inner.getBoundingClientRect();
    return { gap: Math.round((ir.top - tr.bottom) * 10) / 10 };
  });
  console.log("LIVE USER POPOVER GAP:", JSON.stringify(offset));
  await page2.keyboard.press("Escape");
}

await browser.close();
