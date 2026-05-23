import { test, expect } from "@playwright/test";

test.describe("Platform shell", () => {
  test("Explore (Discovery) renders as the front door", async ({ page }) => {
    await page.goto("/explore");
    await expect(
      page.getByRole("heading", { name: /Explore/i }).first()
    ).toBeVisible();
    // Primary nav exposes Discover + Feed + Messages.
    await expect(
      page.getByRole("link", { name: "Discover" }).first()
    ).toBeVisible();
  });

  test("empty Feed encourages discovery", async ({ page }) => {
    await page.goto("/feed");
    await expect(page.getByText(/your feed is quiet/i)).toBeVisible();
    await expect(
      page.getByRole("link", { name: /discover creators/i })
    ).toBeVisible();
  });

  test("messages surface shows the empty conversation state", async ({
    page,
  }) => {
    await page.goto("/messages");
    await expect(
      page.getByRole("heading", { name: "Messages" })
    ).toBeVisible();
    await expect(page.getByText(/no conversations yet/i)).toBeVisible();
  });

  test("staking prompts wallet connection and flags pending contract", async ({
    page,
  }) => {
    await page.goto("/staking");
    await expect(
      page.getByRole("heading", { name: /Stake \$NSFW/i })
    ).toBeVisible();
    await expect(page.getByText(/PENDING_CONTRACT_ADDRESS/)).toBeVisible();
  });
});
