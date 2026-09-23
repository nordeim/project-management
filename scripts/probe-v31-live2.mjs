// Live probe 2: exact login form geometry (rects + margins) to settle F10.
import { chromium } from "/home/z/my-project/project-management/node_modules/@playwright/test/index.mjs";

const LIVE = "https://agent-pm-copy-15e23720.base44.app";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await ctx.newPage();
await page.goto(LIVE + "/login", { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(800);

const geo = await page.evaluate(() => {
  const form = document.querySelector("form");
  if (!form) return null;
  const labels = [...form.querySelectorAll("label")];
  const inputs = [...form.querySelectorAll("input")];
  const signin = [...form.querySelectorAll("button")].find((b) => /^Sign in$/.test((b.textContent ?? "").trim()));
  const footer = [...form.querySelectorAll("div")].find((d) => /Forgot password\?/.test(d.textContent ?? "") && /Sign up/.test(d.textContent ?? ""));
  const rect = (el) => (el ? { top: Math.round(el.getBoundingClientRect().top * 10) / 10, bottom: Math.round(el.getBoundingClientRect().bottom * 10) / 10, h: Math.round(el.getBoundingClientRect().height * 10) / 10 } : null);
  const blocks = [...form.children].map((c) => ({
    tag: c.tagName,
    cls: String(c.className ?? "").slice(0, 50),
    mt: getComputedStyle(c).marginTop,
    mb: getComputedStyle(c).marginBottom,
    display: getComputedStyle(c).display,
    rect: rect(c),
  }));
  return {
    formCls: String(form.className),
    formKids: blocks,
    label0: { rect: rect(labels[0]), mb: labels[0] ? getComputedStyle(labels[0]).marginBottom : "", display: labels[0] ? getComputedStyle(labels[0]).display : "" },
    label1: { rect: rect(labels[1]), mb: labels[1] ? getComputedStyle(labels[1]).marginBottom : "" },
    input0: { rect: rect(inputs[0]), mt: inputs[0] ? getComputedStyle(inputs[0]).marginTop : "" },
    input1: { rect: rect(inputs[1]), mt: inputs[1] ? getComputedStyle(inputs[1]).marginTop : "" },
    signin: { rect: rect(signin), mt: signin ? getComputedStyle(signin).marginTop : "" },
    footer: {
      rect: rect(footer),
      mt: footer ? getComputedStyle(footer).marginTop : "",
      parentCls: footer?.parentElement ? String(footer.parentElement.className).slice(0, 60) : "",
      parentIsForm: footer?.parentElement === form,
    },
    // visual gaps
    gap_label_input: labels[0] && inputs[0] ? Math.round((inputs[0].getBoundingClientRect().top - labels[0].getBoundingClientRect().bottom) * 10) / 10 : null,
    gap_pwlabel_pwinput: labels[1] && inputs[1] ? Math.round((inputs[1].getBoundingClientRect().top - labels[1].getBoundingClientRect().bottom) * 10) / 10 : null,
    gap_signin_footer: signin && footer ? Math.round((footer.getBoundingClientRect().top - signin.getBoundingClientRect().bottom) * 10) / 10 : null,
  };
});
console.log(JSON.stringify(geo, null, 1));
await browser.close();
