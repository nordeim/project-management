import { chromium } from "/home/z/my-project/project-management/node_modules/@playwright/test/index.mjs";
const BASE = "http://localhost:3100";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
await page.goto(BASE + "/login");
await page.waitForTimeout(1500);
const out = await page.evaluate(() => {
  const form = document.querySelector("form");
  if (!form) return { form: false };
  const labels = [...form.querySelectorAll("label")];
  const pwBlock = labels[1]?.parentElement;
  const emailBlock = labels[0]?.parentElement;
  const kids = [...form.children].map((c) => ({
    cls: (c.className ?? "").slice(0, 40),
    mt: getComputedStyle(c).marginTop,
    h: Math.round(c.getBoundingClientRect().height),
    tag: c.tagName,
  }));
  const signin = [...form.querySelectorAll("button")].find((b) => /^Sign in$/.test((b.textContent ?? "").trim()));
  const footer = [...form.querySelectorAll("div")].find((d) => /Forgot password\?/.test(d.textContent ?? "") && /Sign up/.test(d.textContent ?? ""));
  return {
    form: true,
    formCls: form.className,
    kids,
    emailBlockCls: emailBlock?.className,
    pwMt: pwBlock ? getComputedStyle(pwBlock).marginTop : null,
    labelMb: labels[1] ? getComputedStyle(labels[1]).marginBottom : null,
    signinMt: signin ? getComputedStyle(signin.parentElement).marginTop : null,
    footerMt: footer ? getComputedStyle(footer).marginTop : null,
    cardH: (() => {
      const cards = [...document.querySelectorAll("div")].filter((d) => {
        const cs = getComputedStyle(d);
        const r = d.getBoundingClientRect();
        return r.width > 300 && r.width < 600 && cs.backgroundColor !== "rgba(0, 0, 0, 0)" && parseFloat(cs.borderRadius) >= 12 && r.height > 400;
      });
      return cards.length ? Math.round(cards[0].getBoundingClientRect().height) : null;
    })(),
  };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
