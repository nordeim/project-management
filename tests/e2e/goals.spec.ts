import { expect, test } from "@playwright/test";

// Goals surface: the seeded demo workspace lists its goals in the live
// app's order (v2.3 seed fix), the blocked count renders lowercase inside
// the otherwise-uppercase chip, goal cards navigate to the detail view,
// and deletes confirm inline (never in a modal). Contexts arrive
// AUTHENTICATED (setup-project storageState).

test.describe("goals view", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/goals");
  });

  test("lists the seeded goals in the reference order", async ({ page }) => {
    const titles = page
      .locator("main h2, main p, main div")
      .getByText(/^(Product Onboarding Redesign|Launch new landing page|Q3 Content Marketing Campaign)$/)
      .filter({ visible: true });
    // Wait for the store's async fetch to render the seeded cards before
    // reading the order (count() does not auto-wait).
    await expect(titles.nth(0)).toBeVisible();
    const seen: string[] = [];
    const count = await titles.count();
    for (let i = 0; i < count; i++) {
      const text = (await titles.nth(i).textContent())?.trim();
      if (text && !seen.includes(text)) seen.push(text);
    }
    // v2.3: sortOrder 1/2/3 = Product Onboarding, Launch, Q3 — the live's
    // display order (the API orders by sortOrder asc, createdAt desc).
    expect(seen.slice(0, 3)).toEqual([
      "Product Onboarding Redesign",
      "Launch new landing page",
      "Q3 Content Marketing Campaign",
    ]);
  });

  test("the blocked count renders lowercase inside the uppercase chip", async ({ page }) => {
    const blocked = page.getByText(/· \d+ blocked/).filter({ visible: true }).first();
    await expect(blocked).toBeVisible();
    // v2.3: the live renders this fragment with text-transform: none even
    // though the surrounding status chip is uppercase.
    await expect(blocked).toHaveCSS("text-transform", "none");
    await expect(blocked).toHaveText(/· 2 blocked/);
  });

  test("goal cards navigate to the detail view", async ({ page }) => {
    await page.getByRole("button", { name: /Product Onboarding Redesign/ }).first().click();
    await expect(page).toHaveURL(/\/goals\/[a-z0-9]+/i);
    await expect(page.getByRole("heading", { name: "Product Onboarding Redesign" })).toBeVisible();
  });
});

test.describe("goal detail", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/goals");
    await page.getByRole("button", { name: /Product Onboarding Redesign/ }).first().click();
    await expect(page.getByRole("heading", { name: "Product Onboarding Redesign" })).toBeVisible();
  });

  test("add-task dialog opens, validates, and creates a task", async ({ page }) => {
    await page.getByRole("button", { name: "Add Task", exact: true }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Validation: an empty title keeps the submit disabled.
    const submit = dialog.getByRole("button", { name: "Add Task" });
    await expect(submit).toBeDisabled();

    await dialog.getByLabel("Title").fill("E2E verification task");
    await submit.click();
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(page.getByText("E2E verification task").filter({ visible: true }).first()).toBeVisible();
  });

  test("deletes confirm inline and remove the goal", async ({ page }) => {
    // Create a scratch goal through the API so seeded data stays intact.
    const res = await page.request.post("/api/goals", {
      data: { title: "E2E scratch goal", description: "created by Playwright" },
    });
    expect(res.ok()).toBeTruthy();
    const { id } = (await res.json()).data as { id: string };

    await page.goto(`/goals/${id}`);
    await expect(page.getByRole("heading", { name: "E2E scratch goal" })).toBeVisible();

    // Inline confirm — no AlertDialog. The goal header's DELETE pill swaps
    // for the confirm pair (task-card deletes carry "Delete task …" labels,
    // so the exact "Delete" name is unique).
    await page.getByRole("button", { name: "Delete", exact: true }).click();
    await expect(page.getByText("Delete goal & all tasks?")).toBeVisible();
    await page.getByRole("button", { name: "Yes, Delete" }).click();

    await expect(page).toHaveURL(/\/goals\/?$/);
    await expect(page.getByText("E2E scratch goal")).toHaveCount(0);
  });
});
