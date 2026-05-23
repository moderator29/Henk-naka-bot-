import { describe, it, expect } from "vitest";
import { wagmiConfig, ACTIVE_CHAIN } from "./wagmi";

describe("wagmiConfig", () => {
  it("targets Polygon mainnet as the active chain", () => {
    expect(ACTIVE_CHAIN.id).toBe(137);
  });

  it("configures both Polygon mainnet and Amoy testnet", () => {
    const ids = wagmiConfig.chains.map((c) => c.id);
    expect(ids).toContain(137); // polygon
    expect(ids).toContain(80002); // amoy
  });
});
