import { chromium } from "/home/z/my-project/project-management/node_modules/@playwright/test/index.mjs";
const LIVE = "https://agent-pm-copy-15e23720.base44.app";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
await page.goto(LIVE + "/login", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const out = await page.evaluate(() => {
  const form = document.querySelector("form");
  if (!form) return { form: false };
  const labels = [...form.querySelectorAll("label")];
  const pwBlock = labels[1]?.parentElement;
  const kids = [...form.children].map((c) => ({
    tag: c.tagName,
    cls: (c.className ?? "").slice(0, 44),
    mt: getComputedStyle(c).marginTop,
    mb: getComputedStyle(c).marginBottom,
    h: Math.round(c.getBoundingClientRect().height),
  }));
  const signin = [...form.querySelectorAll("button")].find((b) => /^Sign in$/.test((b.textContent ?? "").trim()));
  const footer = [...form.querySelectorAll("div")].find((d) => /Forgot password\?/.test(d.textContent ?? "") && /Sign up/.test(d.textContent ?? ""));
  // walk the card's column for the divider + google button margins
  const google = [...document.querySelectorAll("button")].find((b) => /Continue with Google/.test(b.textContent ?? ""));
  const divider = [...document.querySelectorAll("div")].find((d) => (d.textContent ?? "").trim() === "or" && d.getBoundingClientRect().width < 60);
  const cards = [...document.querySelectorAll("div")].filter((d) => {
    const cs = getComputedStyle(d);
    const r = d.getBoundingClientRect();
    return r.width > 300 && r.width < 600 && cs.backgroundColor !== "rgba(0, 0, 0, 0)" && parseFloat(cs.borderRadius) >= 12 && r.height > 400;
  });
  return {
    formCls: form.className,
    kids,
    pwMt: pwBlock ? getComputedStyle(pwBlock).marginTop : null,
    labelMb: labels[1] ? getComputedStyle(labels[1]).marginBottom : null,
    googleH: google ? Math.round(google.getBoundingClientRect().height) : null,
    googleMb: google ? getComputedStyle(google).marginBottom : null,
    dividerMt: divider ? getComputedStyle(divider.parentElement).marginTop : null,
    dividerMb: divider ? getComputedStyle(divider.parentElement).marginBottom : null,
    cardH: cards.length ? Math.round(cards[0].getBoundingClientRect().height) : null,
  };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
