import type { CreatorProfileData } from "./types";

/**
 * SAMPLE_PREVIEW_DATA, a single, clearly-labeled demo profile used ONLY to
 * preview the flagship creator surface before real creators are onboarded.
 *
 * This is NOT a real creator and is never presented as one: the page shows a
 * visible "Preview" banner whenever this data is in use (isPreview: true).
 * Real profiles come from Supabase via queries.ts. Per Rule 7, this is a
 * labeled sample, not mock data masquerading as real.
 */
export const SAMPLE_PREVIEW_DATA: CreatorProfileData = {
  username: "preview",
  displayName: "Sample Creator",
  tagline: "This is how a creator profile looks. Yours will be better.",
  verified: true,
  avatarUrl: null,
  coverUrl: null,
  categories: ["Preview", "Demo"],
  subscriberCount: 0,
  postCount: 0,
  totalEarningsNsfw: 0,
  activeRecently: true,
  tiers: [
    {
      id: "sample-tier-1",
      name: "Supporter",
      priceNsfw: 0,
      benefits: [
        "All public posts in your feed",
        "Direct messages",
        "Community badge",
      ],
    },
    {
      id: "sample-tier-2",
      name: "Insider",
      priceNsfw: 0,
      benefits: [
        "Everything in Supporter",
        "Tier-gated posts",
        "Priority DM replies",
        "Early access to drops",
      ],
      highlighted: true,
    },
  ],
  posts: [],
  isPreview: true,
};
