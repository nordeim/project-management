import { expect, test } from "@playwright/test";

// Mobile navigation (390×844 — the reference's mobile chrome, v1.7–v2.3):
// the full-bleed app bar, the bottom tab bar with the ACTIVE tab's
// inset-well chip, the MORE bottom sheet, and the 768 middle state's
// floating pill nav. This is the highest-regression-risk chrome — the
// active-tab well was added in v2.3 after re-measuring the live app.
// Contexts arrive AUTHENTICATED (setup-project storageState).

// A touch-enabled 390×844 chromium context (the iPhone geometry without
// switching browsers — locator.tap needs hasTouch).
test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

test.describe("mobile navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("app bar and bottom tab bar render", async ({ page }) => {
    const bar = page.getByRole("banner");
    await expect(bar).toBeVisible();
    await expect(bar).toHaveCSS("height", "62px");

    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav).toBeVisible();
    for (const label of ["Home", "Goals", "My Tasks", "Agent", "More"]) {
      await expect(nav.getByRole("button", { name: label, exact: true })).toBeVisible();
    }
  });

  test("the ACTIVE tab carries the inset-well chip (v2.3 parity)", async ({ page }) => {
    const home = page.getByRole("navigation", { name: "Primary" }).getByRole("button", { name: "Home", exact: true });
    const chip = home.locator("span").first();

    // The wrapper chip: well background + the BRIGHT inset pair.
    await expect(chip).toHaveCSS("background-color", "rgb(235, 231, 226)");
    await expect(chip).toHaveCSS("border-radius", "14px");
    const shadow = await chip.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(shadow).toContain("rgba(255, 252, 248, 0.75)");
    expect(shadow).toContain("rgba(180, 165, 150, 0.32)");
    expect(shadow).toContain("inset");
  });

  test("INACTIVE tabs render no well", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: "Primary" });
    const goalsChip = nav.getByRole("button", { name: "Goals", exact: true }).locator("span").first();
    await expect(goalsChip).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    const shadow = await goalsChip.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(shadow).toBe("none");
  });

  test("tab taps switch views and move the well", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: "Primary" });
    await nav.getByRole("button", { name: "Goals", exact: true }).tap();
    await expect(page).toHaveURL(/\/goals\/?$/);
    await expect(page.getByRole("heading", { name: "Goals", exact: true }).filter({ visible: true }).first()).toBeVisible();

    const goalsChip = nav.getByRole("button", { name: "Goals", exact: true }).locator("span").first();
    await expect(goalsChip).toHaveCSS("background-color", "rgb(235, 231, 226)");
    // Home lost the well.
    const homeChip = nav.getByRole("button", { name: "Home", exact: true }).locator("span").first();
    await expect(homeChip).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  });

  test("MORE opens the bottom sheet and navigates; never carries the well", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: "Primary" });
    const more = nav.getByRole("button", { name: "More", exact: true });

    // MORE has no well wrapper at all (its active state is color-only).
    await expect(more.locator("span.orb-nav-active")).toHaveCount(0);

    await more.tap();
    const sheet = page.getByRole("dialog");
    await expect(sheet).toBeVisible();
    // (The brand renders as "Orbital" in the DOM — uppercase is CSS.)
    await expect(sheet).toContainText("Orbital");
    await expect(sheet.getByRole("button", { name: "Tasks", exact: true })).toBeVisible();

    await sheet.getByRole("button", { name: "Team", exact: true }).tap();
    await expect(page).toHaveURL(/\/team\/?$/);
    await expect(page.getByRole("heading", { name: "Team", exact: true }).filter({ visible: true }).first()).toBeVisible();
    // The sheet closed on navigation.
    await expect(page.getByRole("dialog")).toBeHidden();

    // MORE stays well-free while Team is active.
    await expect(more.locator("span.orb-nav-active")).toHaveCount(0);
  });

  test("mobile team header shows the short INVITE label; AI Agents header stays inline", async ({ page }) => {
    await page.goto("/team");
    // The header pill (aria-label "Invite Member") is the FIRST match — the
    // empty-state button carries the same visible text.
    const invite = page.getByRole("button", { name: "Invite Member" }).first();
    await expect(invite).toBeVisible();
    // v2.3: below sm the visible label is just "Invite" (the long text is
    // the accessible name; the sm:hidden span carries the short one).
    await expect(invite.getByText("Invite Member")).toBeHidden();
    await expect(invite.getByText("Invite", { exact: true })).toBeVisible();

    // v2.3: the NEW AGENT button stays on the AI Agents header row.
    const agentsHeading = page.getByRole("heading", { name: "AI Agents" });
    const newAgent = page.getByRole("button", { name: "New Agent" });
    const headingBox = await agentsHeading.boundingBox();
    const buttonBox = await newAgent.boundingBox();
    expect(headingBox).not.toBeNull();
    expect(buttonBox).not.toBeNull();
    expect(Math.abs((headingBox?.y ?? 0) - (buttonBox?.y ?? 0))).toBeLessThan(40);
    expect(buttonBox!.x).toBeGreaterThan(200); // right-aligned on the row
  });
});

test.describe("middle state (768) navigation", () => {
  test.use({ viewport: { width: 768, height: 844 } });

  test("the floating pill nav carries the six desktop tabs with an inset-well active chip", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav).toBeVisible();
    for (const label of ["Home", "Goals", "Tasks", "Activity", "Team", "Settings"]) {
      await expect(nav.getByRole("button", { name: label, exact: true })).toBeVisible();
    }
    const home = nav.getByRole("button", { name: "Home", exact: true });
    await expect(home).toHaveCSS("background-color", "rgb(235, 231, 226)");
    const box = await nav.boundingBox();
    expect(box?.width).toBeGreaterThan(400);
    expect(box?.width).toBeLessThan(560);
    expect(box?.x).toBeGreaterThan(100); // centered, not full-width
  });

  test("no app bar and no bottom tab bar at md", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("banner")).toBeHidden();
    // The mobile bottom bar is the Primary nav that CONTAINS the More
    // button — it stays in the DOM (display:none) at md, so assert it is
    // hidden rather than absent.
    const mobileBar = page
      .locator('nav[aria-label="Primary"]')
      .filter({ has: page.getByRole("button", { name: "More", exact: true }) });
    await expect(mobileBar).toBeHidden();
  });
});
