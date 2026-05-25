/**
 * Shared types for the creator profile surface. The page renders real data
 * fetched from Supabase when a creator exists; otherwise it renders a clearly
 * labeled preview (see sample.ts) so the flagship UI is visible pre-launch.
 */

export interface CreatorTier {
  id: string;
  name: string;
  priceNsfw: number;
  benefits: string[];
  highlighted?: boolean;
}

export interface CreatorPostCard {
  id: string;
  caption: string;
  category: string | null;
  gated: boolean;
  createdAt: string;
}

export interface CreatorProfileData {
  /** The creator's user id. Present only for real, onboarded creators (used
   * to start a DM); undefined for the labeled preview/demo profiles. */
  id?: string;
  username: string;
  displayName: string;
  tagline: string;
  verified: boolean;
  avatarUrl: string | null;
  coverUrl: string | null;
  categories: string[];
  subscriberCount: number;
  postCount: number;
  totalEarningsNsfw: number;
  activeRecently: boolean;
  tiers: CreatorTier[];
  posts: CreatorPostCard[];
  /** True when this is the labeled preview, not a real onboarded creator. */
  isPreview: boolean;
}
