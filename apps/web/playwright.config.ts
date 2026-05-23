import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for critical user flows (RPD §11). Unit tests stay on
 * Vitest (*.test.ts[x]); these e2e specs live in ./e2e and run against a real
 * Next dev server that Playwright boots for the run.
 *
 * Browser binaries must be installed once with `npx playwright install`
 * (needs network). In CI add that step before `pnpm --filter web e2e`.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
