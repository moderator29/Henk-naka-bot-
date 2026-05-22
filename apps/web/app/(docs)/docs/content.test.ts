import { describe, it, expect } from "vitest";
import { DOC_SECTIONS } from "./content";

const REQUIRED_SLUGS = [
  "getting-started",
  "feed-and-discovery",
  "following-and-subscriptions",
  "tipping-and-nsfw",
  "becoming-a-creator",
  "creator-tools",
  "staking",
  "marketplace",
  "ai-features",
  "wallet-and-security",
  "faq",
];

describe("docs content", () => {
  it("ships every required section from the brief", () => {
    const slugs = DOC_SECTIONS.map((s) => s.slug);
    for (const slug of REQUIRED_SLUGS) {
      expect(slugs).toContain(slug);
    }
  });

  it("has at least 11 sections", () => {
    expect(DOC_SECTIONS.length).toBeGreaterThanOrEqual(11);
  });

  it("every section has unique slug, real title, description, and body content", () => {
    const seen = new Set<string>();
    for (const section of DOC_SECTIONS) {
      expect(section.slug).toMatch(/^[a-z0-9-]+$/);
      expect(seen.has(section.slug)).toBe(false);
      seen.add(section.slug);

      expect(section.title.trim().length).toBeGreaterThan(0);
      expect(section.description.trim().length).toBeGreaterThan(0);
      expect(section.blocks.length).toBeGreaterThan(3);

      const bodyText = section.blocks
        .map((b) => b.text ?? (b.items ?? []).join(" "))
        .join(" ")
        .toLowerCase();
      expect(bodyText).not.toMatch(/lorem ipsum/);
      expect(bodyText).not.toMatch(/placeholder/);
      expect(bodyText).not.toMatch(/todo/);
      // Real content is substantive.
      expect(bodyText.length).toBeGreaterThan(200);
    }
  });

  it("every block has a valid type and matching payload", () => {
    for (const section of DOC_SECTIONS) {
      for (const block of section.blocks) {
        expect(["p", "h2", "h3", "ul", "callout"]).toContain(block.type);
        if (block.type === "ul") {
          expect(Array.isArray(block.items)).toBe(true);
          expect((block.items ?? []).length).toBeGreaterThan(0);
        } else {
          expect(typeof block.text).toBe("string");
        }
        if (block.type === "callout") {
          expect(["tip", "warning", "info"]).toContain(block.tone);
        }
      }
    }
  });
});
