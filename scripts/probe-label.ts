import { chromium } from "@playwright/test";

// Quick probe: dialog label + heading geometry on the dev server.
async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3000/login");
  await page.fill('input[type="email"]', "sepnetflix2023@outlook.com");
  await page.fill('input[type="password"]', "$Abcd1234");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/goals");
  await page.getByRole("link", { name: /Product Onboarding Redesign/ }).first().click();
  await page.getByRole("button", { name: "Add Task", exact: true }).first().click();
  await page.waitForSelector('[role="dialog"]');

  const data = await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"]')!;
    const heading = dlg.querySelector("h1, h2, h3, p") as HTMLElement | null;
    const label = dlg.querySelector("label") as HTMLElement | null;
    const dump = (el: HTMLElement, name: string) => {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        name,
        tag: el.tagName,
        classes: el.className,
        display: cs.display,
        fs: cs.fontSize,
        lh: cs.lineHeight,
        fw: cs.fontWeight,
        rectH: r.height,
        rectHExact: r.height.toFixed(3),
        childCount: el.childNodes.length,
      };
    };
    return {
      heading: heading ? dump(heading, "heading") : null,
      label: label ? dump(label, "label") : null,
      // also inspect the flex item line box
      labelChildren: label ? Array.from(label.childNodes).map((n) => n.nodeName) : [],
    };
  });
  console.log(JSON.stringify(data, null, 2));
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
