import type { TrendingCreator } from "@/lib/explore/queries";
import type { CreatorProfileData } from "@/lib/creators/types";

/**
 * DEMO content. Owner-requested sample creators + posts so the platform feels
 * alive before real creators onboard. This is clearly-labeled demo data: every
 * surface that renders it shows a "Demo" marker, and it is only used when the
 * live Supabase tables return nothing. It never overwrites or masquerades as
 * real production data.
 *
 * To turn it off entirely, set NEXT_PUBLIC_DISABLE_DEMO=1.
 */

export function demoEnabled(): boolean {
  return process.env.NEXT_PUBLIC_DISABLE_DEMO !== "1";
}

export interface DemoCreator extends TrendingCreator {
  categories: string[];
  postCount: number;
  totalEarningsNsfw: number;
}

export const DEMO_CREATORS: DemoCreator[] = [
  {
    username: "pleasurecoin",
    displayName: "Pleasure Coin",
    tagline: "The official home of $NSFW. Drops, alpha, and the occasional surprise.",
    avatarUrl: null,
    verified: true,
    subscriberCount: 48230,
    categories: ["Official", "Announcements"],
    postCount: 312,
    totalEarningsNsfw: 0,
  },
  {
    username: "spiral",
    displayName: "Spiral",
    tagline: "Visual artist bending light into something you have not seen before.",
    avatarUrl: null,
    verified: true,
    subscriberCount: 12840,
    categories: ["Art", "Visuals"],
    postCount: 184,
    totalEarningsNsfw: 92400,
  },
  {
    username: "tim",
    displayName: "Tim",
    tagline: "Building in public. Behind the scenes of the whole ecosystem.",
    avatarUrl: null,
    verified: true,
    subscriberCount: 9310,
    categories: ["Builder", "BTS"],
    postCount: 96,
    totalEarningsNsfw: 41200,
  },
  {
    username: "paul",
    displayName: "Paul",
    tagline: "Strategy, markets, and the long game. Weekly deep dives for holders.",
    avatarUrl: null,
    verified: true,
    subscriberCount: 7620,
    categories: ["Strategy", "Markets"],
    postCount: 78,
    totalEarningsNsfw: 33800,
  },
  {
    username: "nova",
    displayName: "Nova",
    tagline: "Late-night soundscapes and the stories behind them.",
    avatarUrl: null,
    verified: false,
    subscriberCount: 4180,
    categories: ["Music", "Ambient"],
    postCount: 61,
    totalEarningsNsfw: 15600,
  },
  {
    username: "aurora",
    displayName: "Aurora",
    tagline: "Your concierge moonlights as a creator. Curated drops, weekly.",
    avatarUrl: null,
    verified: true,
    subscriberCount: 21050,
    categories: ["Curation", "AI"],
    postCount: 140,
    totalEarningsNsfw: 58900,
  },
];

export interface DemoPost {
  id: string;
  creatorUsername: string;
  creatorName: string;
  verified: boolean;
  caption: string;
  category: string;
  gated: boolean;
  likes: number;
  comments: number;
  minutesAgo: number;
}

export const DEMO_POSTS: DemoPost[] = [
  {
    id: "demo-post-1",
    creatorUsername: "pleasurecoin",
    creatorName: "Pleasure Coin",
    verified: true,
    caption:
      "Project Aurora is live. One platform, one wallet, one home for everything. Tap in and look around.",
    category: "Announcements",
    gated: false,
    likes: 1840,
    comments: 212,
    minutesAgo: 14,
  },
  {
    id: "demo-post-2",
    creatorUsername: "spiral",
    creatorName: "Spiral",
    verified: true,
    caption:
      "New series drops Friday. Three pieces, each built from a single frame of light. Subscribers see it first.",
    category: "Art",
    gated: true,
    likes: 932,
    comments: 88,
    minutesAgo: 47,
  },
  {
    id: "demo-post-3",
    creatorUsername: "paul",
    creatorName: "Paul",
    verified: true,
    caption:
      "This week's deep dive: why conviction compounds. Staking is not about yield, it is about signal.",
    category: "Strategy",
    gated: false,
    likes: 611,
    comments: 54,
    minutesAgo: 119,
  },
  {
    id: "demo-post-4",
    creatorUsername: "tim",
    creatorName: "Tim",
    verified: true,
    caption:
      "Spent the night wiring the new Concierge. Watching it build a feed from a single sentence still feels like magic.",
    category: "BTS",
    gated: false,
    likes: 743,
    comments: 67,
    minutesAgo: 205,
  },
  {
    id: "demo-post-5",
    creatorUsername: "nova",
    creatorName: "Nova",
    verified: false,
    caption:
      "Recorded this one at 3am with the city asleep. Headphones on, lights off. Out now for subscribers.",
    category: "Music",
    gated: true,
    likes: 388,
    comments: 31,
    minutesAgo: 320,
  },
  {
    id: "demo-post-6",
    creatorUsername: "aurora",
    creatorName: "Aurora",
    verified: true,
    caption:
      "Six creators I think you will love this week, picked by vibe not by follower count. Open the app and ask me.",
    category: "Curation",
    gated: false,
    likes: 1207,
    comments: 143,
    minutesAgo: 540,
  },
];

export function findDemoCreator(username: string): DemoCreator | undefined {
  return DEMO_CREATORS.find((c) => c.username === username);
}

/** Builds a full CreatorProfileData from a demo creator for the profile page. */
export function demoCreatorProfile(username: string): CreatorProfileData | null {
  const c = findDemoCreator(username);
  if (!c) return null;
  const posts = DEMO_POSTS.filter((p) => p.creatorUsername === username);
  return {
    username: c.username,
    displayName: c.displayName,
    tagline: c.tagline ?? "",
    verified: c.verified,
    avatarUrl: null,
    coverUrl: null,
    categories: c.categories,
    subscriberCount: c.subscriberCount,
    postCount: c.postCount,
    totalEarningsNsfw: c.totalEarningsNsfw,
    activeRecently: true,
    tiers: [
      {
        id: `${username}-tier-1`,
        name: "Supporter",
        priceNsfw: 250,
        benefits: ["All public posts", "Direct messages", "Community badge"],
      },
      {
        id: `${username}-tier-2`,
        name: "Insider",
        priceNsfw: 750,
        benefits: [
          "Everything in Supporter",
          "Tier-gated drops",
          "Priority DM replies",
          "Early access",
        ],
        highlighted: true,
      },
    ],
    posts: posts.map((p) => ({
      id: p.id,
      caption: p.caption,
      category: p.category,
      gated: p.gated,
      createdAt: new Date(Date.now() - p.minutesAgo * 60_000).toISOString(),
    })),
    isPreview: true,
  };
}
