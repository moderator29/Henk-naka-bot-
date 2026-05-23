import { test, expect } from "@playwright/test";

test.describe("Auth + age gate", () => {
  test("signup shows email, password, DOB, and the 18+ confirmation", async ({
    page,
  }) => {
    await page.goto("/signup");
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByLabel("Date of birth")).toBeVisible();
    await expect(
      page.getByText(/i confirm i am 18 years of age or older/i)
    ).toBeVisible();
  });

  test("the DOB field caps at 18 years ago", async ({ page }) => {
    await page.goto("/signup");
    const dob = page.getByLabel("Date of birth");
    const max = await dob.getAttribute("max");
    expect(max).toBeTruthy();
    const maxYear = Number(max!.slice(0, 4));
    expect(new Date().getFullYear() - maxYear).toBe(18);
  });

  test("login links across to signup", async ({ page }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("heading", { name: /welcome back/i })
    ).toBeVisible();
    await page.getByRole("link", { name: /create an account/i }).click();
    await expect(page).toHaveURL(/\/signup$/);
  });
});
