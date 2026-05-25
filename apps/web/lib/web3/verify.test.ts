import { describe, it, expect, vi, beforeEach } from "vitest";

const parseSiweMessage = vi.fn();
const verifySiweMessage = vi.fn();

vi.mock("viem", () => ({
  createPublicClient: vi.fn(() => ({})),
  http: vi.fn(() => ({})),
}));
vi.mock("viem/chains", () => ({ polygon: { id: 137 } }));
vi.mock("viem/siwe", () => ({
  parseSiweMessage: (...a: unknown[]) => parseSiweMessage(...a),
  verifySiweMessage: (...a: unknown[]) => verifySiweMessage(...a),
}));

import { verifyWalletSignature } from "./verify";

const ADDR = "0xABCDef0000000000000000000000000000001234";
const SIG = "0xdeadbeef";

beforeEach(() => {
  parseSiweMessage.mockReset();
  verifySiweMessage.mockReset();
});

describe("verifyWalletSignature", () => {
  it("rejects a nonce that does not match the message", async () => {
    parseSiweMessage.mockReturnValue({ nonce: "OTHER", address: ADDR });
    const out = await verifyWalletSignature({ message: "m", signature: SIG, nonce: "EXPECTED" });
    expect(out).toBeNull();
    expect(verifySiweMessage).not.toHaveBeenCalled();
  });

  it("rejects a malformed signature before verifying", async () => {
    parseSiweMessage.mockReturnValue({ nonce: "N", address: ADDR });
    const out = await verifyWalletSignature({ message: "m", signature: "not-hex", nonce: "N" });
    expect(out).toBeNull();
    expect(verifySiweMessage).not.toHaveBeenCalled();
  });

  it("returns the lowercased address on a valid signature", async () => {
    parseSiweMessage.mockReturnValue({ nonce: "N", address: ADDR });
    verifySiweMessage.mockResolvedValue(true);
    const out = await verifyWalletSignature({ message: "m", signature: SIG, nonce: "N" });
    expect(out).toBe(ADDR.toLowerCase());
  });

  it("returns null when the signature fails verification", async () => {
    parseSiweMessage.mockReturnValue({ nonce: "N", address: ADDR });
    verifySiweMessage.mockResolvedValue(false);
    const out = await verifyWalletSignature({ message: "m", signature: SIG, nonce: "N" });
    expect(out).toBeNull();
  });
});
