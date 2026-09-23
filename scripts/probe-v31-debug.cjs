// Probe: debug the v30 activity label finder + pill geometry.
// (ESM import — the repo's ESLint config forbids require() imports; run with bun.)
import { chromium } from "/home/z/my-project/project-management/node_modules/@playwright/test/index.mjs";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://127.0.0.1:3100/login");
  await page.fill('input[id="email"]', "demo@orbital.app");
  await page.fill('input[id="password"]', "Demo1234!");
  await page.click('button[type="submit"]');
  await page.waitForURL("http://127.0.0.1:3100/");
  await page.goto("http://127.0.0.1:3100/activity");
  await page.waitForTimeout(1500);

  const out = await page.evaluate(() => {
    const spans = [...document.querySelectorAll("span, p")];
    const candidates = spans.filter((e) => /^(Today|Mon|Tue|Wed|Thu|Fri|Sat|Sun)/.test((e.textContent ?? "").trim()));
    const labelSpan = [...document.querySelectorAll("span")].find((e) => /orb-label-sm/.test(e.className));
    return {
      candidates: candidates.slice(0, 6).map((e) => ({
        text: (e.textContent ?? "").trim().slice(0, 24),
        h: Math.round(e.getBoundingClientRect().height * 10) / 10,
        fs: getComputedStyle(e).fontSize,
        lh: getComputedStyle(e).lineHeight,
        cls: String(e.className).slice(0, 40),
      })),
      labelSpan: labelSpan
        ? {
            text: (labelSpan.textContent ?? "").trim().slice(0, 24),
            h: Math.round(labelSpan.getBoundingClientRect().height * 10) / 10,
            fs: getComputedStyle(labelSpan).fontSize,
            lh: getComputedStyle(labelSpan).lineHeight,
            display: getComputedStyle(labelSpan).display,
            parentLh: getComputedStyle(labelSpan.parentElement).lineHeight,
          }
        : null,
      pill: (() => {
        const p = [...document.querySelectorAll("p, span, div")].find(
          (e) => /^Online\s*·/.test((e.textContent ?? "").trim()) && e.getBoundingClientRect().width > 60 && e.getBoundingClientRect().width < 130
        );
        if (!p) return null;
        return {
          text: (p.textContent ?? "").replace(/\s+/g, " ").trim(),
          w: Math.round(p.getBoundingClientRect().width * 10) / 10,
          h: Math.round(p.getBoundingClientRect().height * 10) / 10,
          gap: getComputedStyle(p).gap,
          pad: getComputedStyle(p).padding,
          children: [...p.children].map((c) => ({
            tag: c.tagName,
            text: (c.textContent ?? "").trim().slice(0, 12),
            w: Math.round(c.getBoundingClientRect().width * 10) / 10,
          })),
        };
      })(),
    };
  });
  console.log(JSON.stringify(out, null, 2));
  await browser.close();
})();
