// Session-33 re-probe: paired live-vs-clone verification of (a) the
// operator's MOBILE NAVIGATION focus and (b) every surface changed in this
// session. Computed-style census on both apps at 390 / 768 / 1440.
import { chromium } from "/home/z/my-project/project-management/node_modules/@playwright/test/index.mjs";

const LIVE = "https://agent-pm-copy-15e23720.base44.app";
const CLONE = "http://127.0.0.1:3100";

async function login(page, url, email, password) {
  await page.goto(url + "/login", { waitUntil: "networkidle" });
  await page.fill('input[id="email"]', email);
  await page.fill('input[id="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(url + "/", { timeout: 30_000 }).catch(() => {});
  await page.waitForTimeout(1800);
}

async function mobileNavCensus(page) {
  return page.evaluate(() => {
    // find the fixed bottom-attached tab bar by geometry (aria-labels differ
    // between the apps)
    const nav = [...document.querySelectorAll("nav, div")].find((n) => {
      const cs = getComputedStyle(n);
      const r = n.getBoundingClientRect();
      return cs.position === "fixed" && Math.abs(r.y + r.height - window.innerHeight) < 2 && r.width > 370 && r.height > 60 && r.height < 90 && n.querySelectorAll("a").length >= 4;
    });
    if (!nav) return null;
    const nr = nav.getBoundingClientRect();
    const ncs = getComputedStyle(nav);
    const tabs = [...nav.querySelectorAll("a, button")].map((t) => {
      const r = t.getBoundingClientRect();
      const chip = t.firstElementChild;
      const cs = getComputedStyle(t);
      const svg = t.querySelector("svg");
      return {
        tag: t.tagName, text: (t.textContent ?? "").trim().slice(0, 10),
        href: t.getAttribute("href") ?? "",
        w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10,
        z: cs.zIndex, chipW: chip ? Math.round(chip.getBoundingClientRect().width * 10) / 10 : null,
        chipActiveBg: chip && t.getAttribute("aria-current") === "page" ? getComputedStyle(chip).backgroundColor : null,
        stroke: svg ? getComputedStyle(svg).strokeWidth : null,
      };
    });
    return { rect: { y: Math.round(nr.y), h: Math.round(nr.height * 10) / 10 }, z: ncs.zIndex, radius: ncs.borderRadius, shadow: ncs.boxShadow.slice(0, 70), tabs };
  });
}

async function moreSheetCensus(page) {
  await page.getByRole("button", { name: "More" }).click();
  await page.waitForTimeout(700);
  const data = await page.evaluate(() => {
    const overlay = [...document.querySelectorAll("div")].filter((d) => {
      const cs = getComputedStyle(d);
      const r = d.getBoundingClientRect();
      return cs.position === "fixed" && r.width > 380 && r.height > 700 && parseFloat(cs.backgroundColor.slice(-4, -1)) >= 0.1 && cs.backgroundColor.startsWith("rgba(0, 0, 0");
    });
    const sheet = [...document.querySelectorAll("div")].find((d) => {
      const r = d.getBoundingClientRect();
      const cs = getComputedStyle(d);
      return r.width > 380 && r.height > 250 && r.y > 400 && cs.borderRadius.startsWith("24px");
    });
    const rows = sheet ? [...sheet.querySelectorAll("a, button")].filter((e) => /Tasks|Team|Settings/.test(e.textContent ?? "")).map((e) => ({ text: (e.textContent ?? "").trim().slice(0, 12), tag: e.tagName, href: e.getAttribute("href") ?? "" })) : [];
    return {
      overlayZ: overlay.length ? getComputedStyle(overlay[0]).zIndex : "none",
      sheetZ: sheet ? getComputedStyle(sheet).zIndex : "none",
      sheetRect: sheet ? { y: Math.round(sheet.getBoundingClientRect().y), h: Math.round(sheet.getBoundingClientRect().height), w: Math.round(sheet.getBoundingClientRect().width) } : null,
      rows,
    };
  });
  // test a navigation (Tasks row)
  const tasksRow = page.locator('[role="dialog"] a, [data-state] a').filter({ hasText: "Tasks" }).first();
  const navigated = await tasksRow.isVisible().catch(() => false);
  if (navigated) {
    await tasksRow.click();
    await page.waitForTimeout(900);
    data.rowNavigationWorked = page.url().endsWith("/tasks");
    await page.goBack();
    await page.waitForTimeout(600);
  } else {
    data.rowNavigationWorked = "not-found";
  }
  return data;
}

async function popoverGap(page) {
  const spans = await page.locator("span", { hasText: /demo|sepn/i }).all();
  for (const s of spans) {
    const box = await s.boundingBox().catch(() => null);
    if (box && box.width > 0 && box.y < 150) {
      await s.click();
      await page.waitForTimeout(800);
      const gap = await page.evaluate(() => {
        const wrapper = document.querySelector("[data-radix-popper-content-wrapper]");
        const inner = wrapper?.firstElementChild;
        const triggers = [...document.querySelectorAll("button, div")].filter((b) => /demo|sepn/i.test(b.textContent ?? "") && b.getBoundingClientRect().height > 25 && b.getBoundingClientRect().height < 60 && b.getBoundingClientRect().y < 150);
        if (!inner || !triggers.length) return null;
        const tr = triggers[0].getBoundingClientRect();
        const ir = inner.getBoundingClientRect();
        return Math.round((ir.top - tr.bottom) * 10) / 10;
      });
      await page.keyboard.press("Escape").catch(() => {});
      return gap;
    }
  }
  return null;
}

async function pillCensus(page) {
  return page.evaluate(() => {
    const p = [...document.querySelectorAll("p, span, div")].find((e) => /^Online\s*·/.test((e.textContent ?? "").trim()) && e.getBoundingClientRect().width > 60 && e.getBoundingClientRect().width < 140);
    if (!p) return null;
    return {
      tag: p.tagName, text: (p.textContent ?? "").replace(/\s+/g, " ").trim(),
      w: Math.round(p.getBoundingClientRect().width * 10) / 10,
      gap: getComputedStyle(p).gap, pad: getComputedStyle(p).padding,
      kids: [...p.children].map((c) => ({ text: (c.textContent ?? "").trim().slice(0, 8), w: Math.round(c.getBoundingClientRect().width * 10) / 10, h: Math.round(c.getBoundingClientRect().height * 10) / 10, ls: getComputedStyle(c).letterSpacing, fw: getComputedStyle(c).fontWeight })),
    };
  });
}

async function loginCard(page, url) {
  await page.goto(url + "/login", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800);
  return page.evaluate(() => {
    const cards = [...document.querySelectorAll("div")].filter((d) => {
      const cs = getComputedStyle(d);
      const r = d.getBoundingClientRect();
      return r.width > 300 && r.width < 600 && cs.backgroundColor !== "rgba(0, 0, 0, 0)" && parseFloat(cs.borderRadius) >= 12 && r.height > 400;
    });
    const form = document.querySelector("form");
    const labels = form ? [...form.querySelectorAll("label")] : [];
    const passwordBlock = labels[1]?.parentElement;
    const inputWrap = passwordBlock?.querySelector("div");
    const signin = form ? [...form.querySelectorAll("button")].find((b) => /^Sign in$/.test((b.textContent ?? "").trim())) : null;
    const forgot = form ? [...form.querySelectorAll("button")].find((b) => /Forgot password\?/.test(b.textContent ?? "")) : null;
    const footer = forgot?.parentElement;
    return {
      cardH: cards.length ? Math.round(cards[0].getBoundingClientRect().height) : null,
      blur: cards.length ? getComputedStyle(cards[0]).backdropFilter : null,
      labelDisplay: labels[1] ? getComputedStyle(labels[1]).display : null,
      inputWrapMt: inputWrap ? getComputedStyle(inputWrap).marginTop : null,
      passwordBlockMt: passwordBlock ? getComputedStyle(passwordBlock).marginTop : null,
      fieldBlockH: passwordBlock ? Math.round(passwordBlock.getBoundingClientRect().height) : null,
      bottomBlockMt: signin?.parentElement ? getComputedStyle(signin.parentElement).marginTop : null,
      footerMt: footer ? getComputedStyle(footer).marginTop : null,
    };
  });
}

const browser = await chromium.launch();
const results = {};

for (const [name, url, email, pw] of [["LIVE", LIVE, "sepnetflix2023@outlook.com", "$Abcd1234"], ["CLONE", CLONE, "demo@orbital.app", "Demo1234!"]]) {
  const out = {};
  // mobile nav at 390
  let ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  let page = await ctx.newPage();
  await login(page, url, email, pw);
  out.mobileNav = await mobileNavCensus(page);
  out.moreSheet = await moreSheetCensus(page);
  await ctx.close();

  // 768 pill nav + desktop at 1440
  ctx = await browser.newContext({ viewport: { width: 768, height: 1024 } });
  page = await ctx.newPage();
  await login(page, url, email, pw);
  out.pillNav768 = await page.evaluate(() => {
    const nav = [...document.querySelectorAll("nav")].find((n) => Math.abs(n.getBoundingClientRect().width - 494) < 8 || (getComputedStyle(n).position === "fixed" && n.getBoundingClientRect().width > 400 && n.getBoundingClientRect().y > 900));
    if (!nav) return null;
    const r = nav.getBoundingClientRect();
    return { w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10, z: getComputedStyle(nav).zIndex, tabs: nav.querySelectorAll("a").length };
  });
  await ctx.close();

  ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  page = await ctx.newPage();
  await login(page, url, email, pw);
  out.popoverGap = await popoverGap(page);
  await page.goto(url + "/activity", { waitUntil: "networkidle" });
  await page.waitForTimeout(1800);
  out.pill = await pillCensus(page);
  out.login = await loginCard(page, url);
  await ctx.close();

  results[name] = out;
}

const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
console.log("=== MOBILE NAV (390) ===");
console.log("tab count:", results.LIVE.mobileNav.tabs.length, "vs", results.CLONE.mobileNav.tabs.length,
  "| z:", results.LIVE.mobileNav.z, "vs", results.CLONE.mobileNav.z,
  "| radius:", eq(results.LIVE.mobileNav.radius, results.CLONE.mobileNav.radius),
  "| rect:", JSON.stringify(results.LIVE.mobileNav.rect), "vs", JSON.stringify(results.CLONE.mobileNav.rect));
for (let i = 0; i < Math.max(results.LIVE.mobileNav.tabs.length, results.CLONE.mobileNav.tabs.length); i++) {
  const l = results.LIVE.mobileNav.tabs[i], c = results.CLONE.mobileNav.tabs[i];
  console.log(`  tab[${i}] ${l?.text ?? "-"}: LIVE ${l?.w}x${l?.h} z${l?.z} stroke${l?.stroke} href${l?.href} | CLONE ${c?.w}x${c?.h} z${c?.z} stroke${c?.stroke} href${c?.href} | ${eq(l, c) ? "EXACT" : "DIFF"}`);
}
console.log("=== MORE SHEET ===");
console.log("LIVE:", JSON.stringify(results.LIVE.moreSheet));
console.log("CLONE:", JSON.stringify(results.CLONE.moreSheet));
console.log("=== 768 PILL NAV ===");
console.log("LIVE:", JSON.stringify(results.LIVE.pillNav768), "CLONE:", JSON.stringify(results.CLONE.pillNav768));
console.log("=== POPOVER GAP ===", results.LIVE.popoverGap, "vs", results.CLONE.popoverGap);
console.log("=== PILL ===");
console.log("LIVE:", JSON.stringify(results.LIVE.pill));
console.log("CLONE:", JSON.stringify(results.CLONE.pill));
console.log("=== LOGIN ===");
console.log("LIVE:", JSON.stringify(results.LIVE.login));
console.log("CLONE:", JSON.stringify(results.CLONE.login));
await browser.close();
