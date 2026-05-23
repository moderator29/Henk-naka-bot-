import { test, expect } from "@playwright/test";

test.describe("Docs", () => {
  test("index lists section cards and navigates into a section", async ({
    page,
  }) => {
    await page.goto("/docs");
    await page.getByRole("link", { name: "Getting Started" }).first().click();
    await expect(page).toHaveURL(/\/docs\/getting-started$/);
    await expect(
      page.getByRole("heading", { name: "Getting Started", level: 1 })
    ).toBeVisible();
  });

  test("in-docs search filters the sidebar", async ({ page }) => {
    await page.goto("/docs/getting-started");
    const search = page.getByPlaceholder("Search docs…");
    await search.fill("staking");
    await expect(
      page.getByRole("link", { name: "Staking" })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Getting Started" })
    ).toHaveCount(0);
  });

  test("section pages expose previous/next navigation", async ({ page }) => {
    await page.goto("/docs/staking");
    await expect(page.getByText("Next", { exact: false })).toBeVisible();
  });
});
