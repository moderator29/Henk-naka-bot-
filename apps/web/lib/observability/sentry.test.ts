import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * The init must be a no-op without a DSN, we never want events firing (or a
 * crash) in environments where Sentry isn't configured.
 */
describe("initSentry", () => {
  const original = process.env.NEXT_PUBLIC_SENTRY_DSN;

  beforeEach(() => {
    vi.resetModules();
  });
  afterEach(() => {
    process.env.NEXT_PUBLIC_SENTRY_DSN = original;
  });

  it("does not throw when DSN is absent", async () => {
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;
    const { initSentry } = await import("./sentry");
    expect(() => initSentry("server")).not.toThrow();
  });

  it("exposes the Sentry namespace for captureException", async () => {
    const { Sentry } = await import("./sentry");
    expect(typeof Sentry.captureException).toBe("function");
  });
});
