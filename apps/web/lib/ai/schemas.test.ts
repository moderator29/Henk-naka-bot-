import { describe, it, expect } from "vitest";
import {
  smartSearchFiltersSchema,
  replySuggestionsSchema,
  chatMessagesSchema,
} from "./schemas";

describe("smartSearchFiltersSchema", () => {
  it("parses a typical creator filter and defaults confidence", () => {
    const r = smartSearchFiltersSchema.parse({
      kind: "creators",
      maxFollowers: 1000,
      postedWithinDays: 7,
    });
    expect(r.kind).toBe("creators");
    expect(r.maxFollowers).toBe(1000);
    expect(r.confidence).toBe(0);
  });

  it("rejects an invalid kind", () => {
    expect(
      smartSearchFiltersSchema.safeParse({ kind: "videos" }).success
    ).toBe(false);
  });

  it("clamps confidence to 0..1", () => {
    expect(
      smartSearchFiltersSchema.safeParse({ confidence: 1.5 }).success
    ).toBe(false);
  });
});

describe("replySuggestionsSchema", () => {
  it("accepts up to 3 short strings", () => {
    expect(replySuggestionsSchema.safeParse(["hi", "hey", "yo"]).success).toBe(
      true
    );
  });
  it("rejects more than 3", () => {
    expect(
      replySuggestionsSchema.safeParse(["a", "b", "c", "d"]).success
    ).toBe(false);
  });
});

describe("chatMessagesSchema", () => {
  it("requires at least one message with a valid role", () => {
    expect(
      chatMessagesSchema.safeParse([{ role: "user", content: "hi" }]).success
    ).toBe(true);
    expect(
      chatMessagesSchema.safeParse([{ role: "bot", content: "hi" }]).success
    ).toBe(false);
    expect(chatMessagesSchema.safeParse([]).success).toBe(false);
  });
});
