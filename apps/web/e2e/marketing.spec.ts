import { test, expect } from "@playwright/test";

test.describe("Marketing surface", () => {
  test("landing renders the hero and primary CTAs", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /creator platform of tomorrow/i })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /enter the platform/i })
    ).toBeVisible();
  });

  test("the hero CTA routes into Discovery, not the Feed", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("link", { name: /enter the platform/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/explore$/);
  });

  test("footer links to the docs", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Documentation" }).click();
    await expect(page).toHaveURL(/\/docs$/);
    await expect(
      page.getByRole("heading", { name: /Everything/i }).first()
    ).toBeVisible();
  });
});
