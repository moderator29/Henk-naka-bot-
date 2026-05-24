import type { BrandIconName } from "@/components/brand/BrandIcon";

/**
 * Onboarding card sequence, RPD update §3.
 *
 * 15 cards total. The first 10 are big, immersive, one concept per card , 
 * they sell the experience. The last 5 are tighter "how to" cards.
 *
 * Voice: confident, warm, a little playful, never crude.
 *
 * Each card declares its `auroraVariant` so the background shifts subtly as
 * you move through the flow, and its `icon` for the floating 3D brand icon.
 */

export interface OnboardingCard {
  id: string;
  size: "large" | "small";
  icon: BrandIconName;
  auroraVariant: "magenta" | "purple" | "cyan" | "orchid";
  eyebrow: string;
  headline: string;
  body: string;
}

export const ONBOARDING_CARDS: OnboardingCard[] = [
  // -- 10 large immersive cards -------------------------------------------
  {
    id: "welcome",
    size: "large",
    icon: "sparkle",
    auroraVariant: "magenta",
    eyebrow: "Welcome",
    headline: "You're inside the new Pleasure Coin.",
    body: "One platform. Real creators. A token that actually works for the people using it. We rebuilt every surface so you'd feel the difference in your first three seconds.",
  },
  {
    id: "unified",
    size: "large",
    icon: "diamond",
    auroraVariant: "purple",
    eyebrow: "One home",
    headline: "Everything in one place.",
    body: "Creators, NFTs, staking, the token, your wallet, your DMs. No more bouncing between sites. Sign in once, and the whole ecosystem opens at the same time.",
  },
  {
    id: "discover",
    size: "large",
    icon: "globe",
    auroraVariant: "cyan",
    eyebrow: "Front door",
    headline: "Discover is where you live.",
    body: "Land on Discover, see what's trending, follow the categories and creators that pull you in. Your feed fills up the moment you start following.",
  },
  {
    id: "creators",
    size: "large",
    icon: "heart",
    auroraVariant: "orchid",
    eyebrow: "The people",
    headline: "Creators run the show.",
    body: "Every creator on the platform is verified and 18+. Subscribe to their tiers, tip them in $NSFW, and message them directly. They keep the lion's share of everything.",
  },
  {
    id: "subscribe",
    size: "large",
    icon: "crown",
    auroraVariant: "magenta",
    eyebrow: "Subscriptions",
    headline: "Pay creators directly.",
    body: "Subscribing is a tap. Pricing is set by the creator, paid in $NSFW from your wallet, and goes to them, not a middleman. Tiers unlock private posts, DMs, and perks.",
  },
  {
    id: "tip",
    size: "large",
    icon: "sparkle",
    auroraVariant: "cyan",
    eyebrow: "Tips",
    headline: "Tipping is built in.",
    body: "Loved a post? Send a tip in $NSFW with one tap. Tip from a profile, a post, or a DM. It's on-chain, instant, and visible to the creator immediately.",
  },
  {
    id: "ai",
    size: "large",
    icon: "sparkle",
    auroraVariant: "orchid",
    eyebrow: "AI you'll actually use",
    headline: "Meet Aura.",
    body: "Aura is your concierge. Ask for a fresh feed, find new creators, shift the mood. Creators get their own Co-Pilot for posting, captions, replies, and earnings forecasts. AI that does real work.",
  },
  {
    id: "nfts",
    size: "large",
    icon: "diamond",
    auroraVariant: "magenta",
    eyebrow: "NFTs",
    headline: "Collect, trade, flex.",
    body: "PleasureNifty lives inside the platform. Browse drops, buy and sell with $NSFW, list your own. Every NFT is on Polygon, so trades are cheap and instant.",
  },
  {
    id: "staking",
    size: "large",
    icon: "lock",
    auroraVariant: "purple",
    eyebrow: "Conviction earns",
    headline: "Stake. Earn. Belong.",
    body: "Lock $NSFW for 12 weeks and earn rewards on top. Staking signals you're here for the long game, and unlocks perks across the platform as the ecosystem grows.",
  },
  {
    id: "community",
    size: "large",
    icon: "heart",
    auroraVariant: "orchid",
    eyebrow: "The community",
    headline: "Built by holders, for holders.",
    body: "Pleasure Coin has been alive since 2021 because real people stayed through every cycle. You're not joining a launch, you're joining a chapter. Welcome.",
  },

  // -- 5 small how-to cards -----------------------------------------------
  {
    id: "how-follow",
    size: "small",
    icon: "heart",
    auroraVariant: "magenta",
    eyebrow: "How to follow",
    headline: "Tap follow on any profile.",
    body: "Following is free and fills your Feed. Subscribing is the paid tier that unlocks gated posts and DMs.",
  },
  {
    id: "how-subscribe",
    size: "small",
    icon: "crown",
    auroraVariant: "orchid",
    eyebrow: "How to subscribe",
    headline: "Pick a tier, confirm in your wallet.",
    body: "Tier cards show what's included. Approve the $NSFW transaction once, auto-renew is on by default and easy to turn off.",
  },
  {
    id: "how-tip",
    size: "small",
    icon: "sparkle",
    auroraVariant: "cyan",
    eyebrow: "How to tip",
    headline: "Tap the tip icon, set the amount.",
    body: "Tips fire as on-chain transfers in $NSFW. The creator sees it land in real time.",
  },
  {
    id: "how-search",
    size: "small",
    icon: "globe",
    auroraVariant: "purple",
    eyebrow: "Smart Search",
    headline: "Type what you want, in plain English.",
    body: "“Creators under 1k followers who post weekly.” “NFTs under 50 $NSFW with a cosplay theme.” Search reads natural language and returns real results.",
  },
  {
    id: "how-around",
    size: "small",
    icon: "diamond",
    auroraVariant: "magenta",
    eyebrow: "Finding your way",
    headline: "Side nav on desktop, bottom bar on mobile.",
    body: "Discover · Feed · Messages · Marketplace · Staking · Profile. You can always replay this tour from Settings.",
  },
];

export function getOnboardingCard(
  id: string
): OnboardingCard | undefined {
  return ONBOARDING_CARDS.find((c) => c.id === id);
}

export const ONBOARDING_LARGE_COUNT = ONBOARDING_CARDS.filter(
  (c) => c.size === "large"
).length;

export const ONBOARDING_SMALL_COUNT = ONBOARDING_CARDS.filter(
  (c) => c.size === "small"
).length;
