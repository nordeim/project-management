import { chromium } from "/home/z/my-project/project-management/node_modules/@playwright/test/index.mjs";
const LIVE = "https://agent-pm-copy-15e23720.base44.app";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
await page.goto(LIVE + "/login", { waitUntil: "networkidle" });
await page.fill('input[type="email"]', "sepnetflix2023@outlook.com");
await page.fill('input[type="password"]', "$Abcd1234");
await page.click('button[type="submit"]');
await page.waitForURL((u) => !String(u).includes("/login"), { timeout: 30000 });
await page.waitForTimeout(2500);

// pill "Online" span computed spec
await page.goto(LIVE + "/activity", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);
const pillSpec = await page.evaluate(() => {
  const p = [...document.querySelectorAll("p, span, div")].find((e) => /^Online\s*·/.test((e.textContent ?? "").trim()) && e.getBoundingClientRect().width > 60 && e.getBoundingClientRect().width < 130);
  if (!p) return null;
  const online = [...p.childNodes].find((n) => (n.textContent ?? "").trim() === "Online");
  const dot = [...p.childNodes].find((n) => n.nodeType === 1 && !(n.textContent ?? "").trim());
  const dotEl = p.querySelector("span");
  return {
    pillClass: p.className.slice(0, 120),
    onlineCS: online ? { fw: getComputedStyle(online).fontWeight, fs: getComputedStyle(online).fontSize, ls: getComputedStyle(online).letterSpacing, color: getComputedStyle(online).color } : null,
    dotCS: dotEl ? { w: getComputedStyle(dotEl).width, h: getComputedStyle(dotEl).height, br: getComputedStyle(dotEl).borderRadius, bg: getComputedStyle(dotEl).backgroundColor } : null,
  };
});
console.log("LIVE pill spec:", JSON.stringify(pillSpec, null, 1));

// tab bar z at 390
const mob = await browser.newContext({ viewport: { width: 390, height: 844 } });
const mp = await mob.newPage();
await mp.goto(LIVE + "/", { waitUntil: "networkidle" });
await mp.waitForTimeout(2000);
const tabz = await mp.evaluate(() => {
  const nav = document.querySelector('nav[aria-label="Primary"]');
  return nav ? getComputedStyle(nav).zIndex : "NO_NAV";
});
console.log("LIVE tab bar z:", tabz);

// check-in radios at 1440
const desk = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const dp = await desk.newPage();
await dp.goto(LIVE + "/goals", { waitUntil: "networkidle" });
await dp.waitForTimeout(2500);
await dp.getByText("Product Onboarding Redesign").first().click();
await dp.waitForTimeout(1500);
await dp.getByRole("heading", { name: "Review Q3 project milestones" }).click();
await dp.waitForTimeout(1200);
const radios = await dp.evaluate(() => {
  const dialog = document.querySelector('[role="dialog"]');
  if (!dialog) return { dialog: false };
  const rs = [...dialog.querySelectorAll("[role=radio]")];
  const labels = [...dialog.querySelectorAll("label, span")].filter((n) => /^(On Track|Blocked|Need Help|Done)$/.test((n.textContent ?? "").trim()));
  return {
    dialog: true,
    radios: rs.map((el) => ({ r: getComputedStyle(el).borderRadius, w: Math.round(el.getBoundingClientRect().width), color: getComputedStyle(el).color, fs: getComputedStyle(el).fontSize, fw: getComputedStyle(el).fontWeight })),
    labels: labels.map((n) => ({ tag: n.tagName, w: Math.round(n.getBoundingClientRect().width), fs: getComputedStyle(n).fontSize, fw: getComputedStyle(n).fontWeight, lh: getComputedStyle(n).lineHeight })),
  };
});
console.log("LIVE check-in radios:", JSON.stringify(radios, null, 1));
await browser.close();
