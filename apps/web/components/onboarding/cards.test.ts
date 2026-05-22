import { describe, it, expect } from "vitest";
import {
  ONBOARDING_CARDS,
  ONBOARDING_LARGE_COUNT,
  ONBOARDING_SMALL_COUNT,
  getOnboardingCard,
} from "./cards";

describe("onboarding cards", () => {
  it("ships exactly 15 cards", () => {
    expect(ONBOARDING_CARDS).toHaveLength(15);
  });

  it("splits into 10 large + 5 small per the spec", () => {
    expect(ONBOARDING_LARGE_COUNT).toBe(10);
    expect(ONBOARDING_SMALL_COUNT).toBe(5);
  });

  it("large cards come first, small cards last", () => {
    const first10 = ONBOARDING_CARDS.slice(0, 10);
    const last5 = ONBOARDING_CARDS.slice(10);
    expect(first10.every((c) => c.size === "large")).toBe(true);
    expect(last5.every((c) => c.size === "small")).toBe(true);
  });

  it("every card has unique id, real eyebrow, headline, and body copy", () => {
    const ids = new Set<string>();
    for (const card of ONBOARDING_CARDS) {
      expect(card.id.length).toBeGreaterThan(0);
      expect(ids.has(card.id)).toBe(false);
      ids.add(card.id);

      expect(card.eyebrow.trim().length).toBeGreaterThan(0);
      expect(card.headline.trim().length).toBeGreaterThan(0);
      // Real copy, not placeholder.
      expect(card.body.trim().length).toBeGreaterThan(40);
      expect(card.body).not.toMatch(/lorem ipsum/i);
      expect(card.body).not.toMatch(/placeholder/i);
      expect(card.body).not.toMatch(/todo/i);
    }
  });

  it("declares a real aurora variant and brand icon per card", () => {
    const variants = new Set(["magenta", "purple", "cyan", "orchid"]);
    const icons = new Set([
      "rocket",
      "heart",
      "diamond",
      "lock",
      "globe",
      "sparkle",
      "crown",
    ]);
    for (const card of ONBOARDING_CARDS) {
      expect(variants.has(card.auroraVariant)).toBe(true);
      expect(icons.has(card.icon)).toBe(true);
    }
  });

  it("getOnboardingCard looks cards up by id", () => {
    expect(getOnboardingCard("welcome")?.size).toBe("large");
    expect(getOnboardingCard("how-tip")?.size).toBe("small");
    expect(getOnboardingCard("nonexistent")).toBeUndefined();
  });
});
