import { describe, it, expect } from "vitest";
import { generateNonce, buildSiweMessage, SIWE_NONCE_COOKIE } from "./siwe";

describe("generateNonce", () => {
  it("produces an alphanumeric nonce of sufficient length", () => {
    const nonce = generateNonce();
    expect(nonce).toMatch(/^[A-Za-z0-9]+$/);
    expect(nonce.length).toBeGreaterThanOrEqual(17);
  });

  it("produces unique values across calls", () => {
    const set = new Set(Array.from({ length: 50 }, () => generateNonce()));
    expect(set.size).toBe(50);
  });
});

describe("buildSiweMessage", () => {
  it("includes the address, domain, uri, and nonce", () => {
    const nonce = "abc123def456ghi78";
    const msg = buildSiweMessage({
      address: "0x1111111111111111111111111111111111111111",
      chainId: 137,
      domain: "pleasurecoin.io",
      uri: "https://pleasurecoin.io",
      nonce,
    });
    expect(msg).toContain("pleasurecoin.io");
    expect(msg).toContain("0x1111111111111111111111111111111111111111");
    expect(msg).toContain(nonce);
    expect(msg).toContain("Chain ID: 137");
  });
});

describe("constants", () => {
  it("exposes a stable nonce cookie name", () => {
    expect(SIWE_NONCE_COOKIE).toBe("aurora-siwe-nonce");
  });
});
