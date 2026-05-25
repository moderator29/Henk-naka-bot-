/**
 * Marketplace mock data — PENDING_CONTRACT_ADDRESS.
 *
 * NFT contract addresses are not wired yet, so the marketplace runs against
 * these demo listings. They are owner-requested preview content: clearly
 * labeled "Demo", using generated gradient art (never real adult imagery), and
 * flagged is_demo so they are purged on first real signup. Prices are in $NSFW.
 */

export const MARKETPLACE_IS_MOCK = true;

export type ListingStatus = "buy-now" | "auction";

export interface Listing {
  id: string;
  title: string;
  creatorHandle: string;
  creatorName: string;
  priceNsfw: number;
  category: string;
  collection: string;
  status: ListingStatus;
  /** Seed drives the deterministic gradient art. */
  seed: number;
  popularity: number;
  createdOrder: number;
  traits: { trait_type: string; value: string }[];
  isDemo: true;
}

export const CATEGORIES = [
  "Art",
  "Photography",
  "Music",
  "Collectible",
  "3D",
  "Animation",
] as const;

export const COLLECTIONS = [
  "Genesis",
  "Aurora Drops",
  "Night Series",
  "Open Edition",
] as const;

const C = CATEGORIES;
const COL = COLLECTIONS;

// Declared before DEMO_LISTINGS so the l() calls below don't hit the temporal
// dead zone (function l is hoisted, but this counter is not).
let order = 0;

export const DEMO_LISTINGS: Listing[] = [
  l("Spectral Bloom", "spiral", "Spiral", 1850, C[0], COL[1], "auction", 11, 98),
  l("Midnight Frequency", "nova", "Nova", 420, C[2], COL[2], "buy-now", 23, 71),
  l("Curator's Cut #04", "aurora", "Aurora", 3200, C[0], COL[0], "buy-now", 7, 90),
  l("Refracted I", "spiral", "Spiral", 980, C[1], COL[1], "buy-now", 31, 64),
  l("Pulse 808", "nova", "Nova", 260, C[2], COL[3], "auction", 44, 52),
  l("Faceted Dawn", "aurora", "Aurora", 4500, C[4], COL[0], "buy-now", 3, 95),
  l("Static Garden", "spiral", "Spiral", 1500, C[5], COL[1], "buy-now", 17, 80),
  l("Velvet Loop", "nova", "Nova", 640, C[5], COL[2], "auction", 19, 60),
  l("Prism Study", "aurora", "Aurora", 290, C[0], COL[3], "buy-now", 52, 45),
  l("Neon Relic", "tim", "Tim", 2100, C[3], COL[0], "buy-now", 9, 88),
  l("Ghost Print", "paul", "Paul", 760, C[1], COL[1], "auction", 27, 58),
  l("Chromatic Vow", "aurora", "Aurora", 3800, C[4], COL[0], "buy-now", 5, 93),
  l("Low Light", "nova", "Nova", 180, C[1], COL[3], "buy-now", 61, 40),
  l("Mirror Form", "spiral", "Spiral", 1240, C[4], COL[1], "auction", 21, 76),
];

function l(
  title: string,
  creatorHandle: string,
  creatorName: string,
  priceNsfw: number,
  category: string,
  collection: string,
  status: ListingStatus,
  popularity: number,
  seed: number
): Listing {
  order += 1;
  return {
    id: `demo-nft-${order}`,
    title,
    creatorHandle,
    creatorName,
    priceNsfw,
    category,
    collection,
    status,
    seed,
    popularity,
    createdOrder: order,
    traits: [
      { trait_type: "Collection", value: collection },
      { trait_type: "Category", value: category },
      { trait_type: "Edition", value: status === "auction" ? "1 of 1" : "Open" },
    ],
    isDemo: true,
  };
}

const HUES = ["#FF1F8F", "#B847FF", "#5DD6FF", "#2A0E5A", "#E9D5FF"];

/** Deterministic gradient for a listing's placeholder art. */
export function artGradient(seed: number): string {
  const a = HUES[seed % HUES.length];
  const b = HUES[(seed * 3 + 2) % HUES.length];
  const angle = (seed * 47) % 360;
  return `linear-gradient(${angle}deg, ${a} 0%, ${b} 100%)`;
}
