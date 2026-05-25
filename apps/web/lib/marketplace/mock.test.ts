import { describe, it, expect } from "vitest";
import {
  DEMO_LISTINGS,
  CATEGORIES,
  COLLECTIONS,
  artGradient,
} from "./mock";

describe("marketplace mock", () => {
  it("ships demo listings, all flagged is_demo with unique ids and positive prices", () => {
    expect(DEMO_LISTINGS.length).toBeGreaterThan(8);
    const ids = new Set<string>();
    for (const l of DEMO_LISTINGS) {
      expect(l.isDemo).toBe(true);
      expect(l.priceNsfw).toBeGreaterThan(0);
      expect(ids.has(l.id)).toBe(false);
      ids.add(l.id);
      expect(["buy-now", "auction"]).toContain(l.status);
      expect(CATEGORIES).toContain(l.category as (typeof CATEGORIES)[number]);
      expect(COLLECTIONS).toContain(l.collection as (typeof COLLECTIONS)[number]);
    }
  });

  it("artGradient is deterministic for a seed", () => {
    expect(artGradient(11)).toBe(artGradient(11));
    expect(artGradient(11)).toContain("linear-gradient");
  });
});
