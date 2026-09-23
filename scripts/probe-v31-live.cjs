// Live re-probe: resolve the v2.10 pin ambiguities against the reference app.
import { chromium } from "/home/z/my-project/project-management/node_modules/@playwright/test/index.mjs";

const LIVE = "https://agent-pm-copy-15e23720.base44.app";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

// ---- Login (logged out) first -------------------------------------------------
await page.goto(LIVE + "/login", { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(800);
const loginCard = await page.evaluate(() => {
  const cards = [...document.querySelectorAll("div")].filter((d) => {
    const cs = getComputedStyle(d);
    const r = d.getBoundingClientRect();
    return r.width > 300 && r.width < 600 && cs.backgroundColor !== "rgba(0, 0, 0, 0)" && parseFloat(cs.borderRadius) >= 12 && r.height > 400;
  });
  return cards.length
    ? {
        h: Math.round(cards[0].getBoundingClientRect().height),
        blur: getComputedStyle(cards[0]).backdropFilter,
        w: Math.round(cards[0].getBoundingClientRect().width),
      }
    : null;
});
console.log("LIVE login card:", JSON.stringify(loginCard));

const loginForm = await page.evaluate(() => {
  const form = document.querySelector("form");
  if (!form) return null;
  const signin = [...form.querySelectorAll("button")].find((b) => /^Sign in$/.test((b.textContent ?? "").trim()));
  const footer = [...form.querySelectorAll("div")].find((d) => /Forgot password\?/.test(d.textContent ?? "") && /Sign up/.test(d.textContent ?? ""));
  const labels = [...form.querySelectorAll("label")];
  const labelGap = labels[1] ? getComputedStyle(labels[1]).marginBottom : "";
  const emailBlock = labels[0]?.parentElement;
  const passwordBlock = labels[1]?.parentElement;
  const fieldGap = emailBlock && passwordBlock ? getComputedStyle(passwordBlock).marginTop : "";
  return {
    footerInForm: !!footer,
    footerMt: footer ? getComputedStyle(footer).marginTop : "",
    labelGap,
    fieldGap,
    signinInForm: !!signin,
  };
});
console.log("LIVE login form:", JSON.stringify(loginForm));

// ---- Authenticate --------------------------------------------------------------
await page.fill('input[type="email"]', "sepnetflix2023@outlook.com");
await page.fill('input[type="password"]', "$Abcd1234");
await page.click('button[type="submit"]');
await page.waitForURL((u) => !String(u).includes("/login"), { timeout: 45000 });
await page.waitForTimeout(2500);

// ---- Activity: pill + group label ----------------------------------------------
await page.goto(LIVE + "/activity", { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(1500);
const pill = await page.evaluate(() => {
  const p = [...document.querySelectorAll("p, span, div")].find(
    (e) => /^Online\s*·/.test((e.textContent ?? "").trim()) && e.getBoundingClientRect().width > 60 && e.getBoundingClientRect().width < 130
  );
  if (!p) return null;
  const cs = getComputedStyle(p);
  return {
    text: (p.textContent ?? "").replace(/\s+/g, " ").trim(),
    w: Math.round(p.getBoundingClientRect().width * 10) / 10,
    h: Math.round(p.getBoundingClientRect().height * 10) / 10,
    gap: cs.gap,
    pad: cs.padding,
    fs: cs.fontSize,
    fw: cs.fontWeight,
    children: [...p.children].map((c) => ({
      tag: c.tagName,
      text: (c.textContent ?? "").trim().slice(0, 12),
      w: Math.round(c.getBoundingClientRect().width * 10) / 10,
      fs: getComputedStyle(c).fontSize,
      fw: getComputedStyle(c).fontWeight,
      ls: getComputedStyle(c).letterSpacing,
    })),
    dotAnim: p.firstElementChild ? getComputedStyle(p.firstElementChild).animationName : "",
  };
});
console.log("LIVE pill:", JSON.stringify(pill, null, 1));

const groupLabel = await page.evaluate(() => {
  const l = [...document.querySelectorAll("span, p")].find(
    (e) => /^(Today|Mon|Tue|Wed|Thu|Fri|Sat|Sun)/.test((e.textContent ?? "").trim()) && e.getBoundingClientRect().height < 24 && getComputedStyle(e).fontSize === "10px"
  );
  if (!l) return null;
  const parent = l.parentElement;
  return {
    text: (l.textContent ?? "").trim().slice(0, 20),
    lh: getComputedStyle(l).lineHeight,
    h: Math.round(l.getBoundingClientRect().height * 10) / 10,
    parentLh: parent ? getComputedStyle(parent).lineHeight : "",
    parentMb: parent ? getComputedStyle(parent).marginBottom : "",
  };
});
console.log("LIVE group label:", JSON.stringify(groupLabel));

// ---- Settings: save icon --------------------------------------------------------
await page.goto(LIVE + "/settings", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);
const saveIcon = await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find((x) => /Save/i.test(x.textContent ?? "") && x.querySelector("svg"));
  const s = b?.querySelector("svg") ?? null;
  return s
    ? {
        w: Math.round(s.getBoundingClientRect().width * 10) / 10,
        attrW: s.getAttribute("width"),
        cls: String(s.getAttribute("class") ?? "").slice(0, 60),
      }
    : null;
});
console.log("LIVE save icon:", JSON.stringify(saveIcon));

await browser.close();
