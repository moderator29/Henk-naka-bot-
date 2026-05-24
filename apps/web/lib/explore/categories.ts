import type { BrandIconName } from "@/components/brand/BrandIcon";

/**
 * The platform category taxonomy. Real, fixed product data (not user content),
 * so it's safe to define here. Used by Explore's category grid and by Smart
 * Search filter parsing in Phase 3.
 */
export interface Category {
  slug: string;
  label: string;
  icon: BrandIconName;
}

export const CATEGORIES: Category[] = [
  { slug: "trending", label: "Trending", icon: "sparkle" },
  { slug: "new", label: "New & Rising", icon: "rocket" },
  { slug: "top", label: "Top Creators", icon: "crown" },
  { slug: "nfts", label: "NFT Creators", icon: "diamond" },
  { slug: "metaverse", label: "Metaverse", icon: "globe" },
  { slug: "premium", label: "Premium", icon: "lock" },
];
