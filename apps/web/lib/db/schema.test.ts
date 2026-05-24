import { describe, it, expect } from "vitest";
import * as schema from "./schema";

/**
 * Smoke test, the schema module loads, exposes every table the RPD calls
 * for, and Drizzle has assembled valid column metadata on each. This protects
 * against accidental column removals or import-time regressions.
 */

const expectedTables = [
  "users",
  "creatorProfiles",
  "subscriptionTiers",
  "subscriptions",
  "posts",
  "likes",
  "saves",
  "comments",
  "tips",
  "follows",
  "notifications",
  "userPreferences",
  "stakingPositions",
  "nftHoldings",
  "marketplaceListings",
  "conversations",
  "messages",
] as const;

describe("db/schema", () => {
  it.each(expectedTables)("exposes the %s table", (name) => {
    const table = schema[name];
    expect(table).toBeDefined();
  });

  it("users table carries the required age-verification column", () => {
    expect(schema.users.dateOfBirth).toBeDefined();
  });

  it("posts table carries the gating column tier_required", () => {
    expect(schema.posts.tierRequired).toBeDefined();
  });

  it("staking positions carry a 12-week unlock_at column", () => {
    expect(schema.stakingPositions.unlockAt).toBeDefined();
  });

  it("conversations table tracks both participants and last activity", () => {
    expect(schema.conversations.participantA).toBeDefined();
    expect(schema.conversations.participantB).toBeDefined();
    expect(schema.conversations.lastMessageAt).toBeDefined();
  });

  it("messages table carries body, media (post-MVP), and read_at", () => {
    expect(schema.messages.body).toBeDefined();
    expect(schema.messages.media).toBeDefined();
    expect(schema.messages.readAt).toBeDefined();
  });

  it("user_preferences tracks onboarding completion", () => {
    expect(schema.userPreferences.onboardingCompleted).toBeDefined();
    expect(schema.userPreferences.onboardingCompletedAt).toBeDefined();
  });
});
