/**
 * Docs content. Single source of truth, the docs route reads this list,
 * builds the sidebar nav, generates the search index, and renders the page
 * body. Sections live in display order.
 *
 * Voice: confident, warm, a little playful, never crude. Real content,
 * useful to read, on-brand. No lorem ipsum, no "coming soon".
 */

export interface DocBlock {
  type: "p" | "h2" | "h3" | "ul" | "callout";
  /** For p / h2 / h3 / callout */
  text?: string;
  /** For ul */
  items?: string[];
  /** For callout */
  tone?: "tip" | "warning" | "info";
}

export interface DocSection {
  slug: string;
  title: string;
  description: string;
  blocks: DocBlock[];
}

export const DOC_SECTIONS: DocSection[] = [
  {
    slug: "getting-started",
    title: "Getting Started",
    description:
      "Sign in, set up your wallet, find your first creators. Five minutes.",
    blocks: [
      {
        type: "p",
        text: "Pleasure Coin is one platform that unifies creators, NFTs, staking, the $NSFW token, and direct messaging. You sign in once and the entire ecosystem opens at the same time.",
      },
      { type: "h2", text: "Create your account" },
      {
        type: "p",
        text: "Sign up with email, Google, or your wallet. Wallet sign-in uses a one-tap signature, no password, no email if you don't want one. You can link more methods later from Settings.",
      },
      { type: "h2", text: "Verify your age" },
      {
        type: "p",
        text: "Pleasure Coin is an 18+ platform. You'll enter your date of birth at signup. We check this server-side every time you load anything gated.",
      },
      { type: "h2", text: "Connect a wallet" },
      {
        type: "p",
        text: "Subscriptions, tips, NFT purchases, and staking all happen in $NSFW on Polygon. Connect MetaMask, WalletConnect (covers Phantom and most mobile wallets), or Coinbase Wallet. We never store your keys.",
      },
      {
        type: "callout",
        tone: "tip",
        text: "First time on Polygon? Bridge a small amount of MATIC for gas at any major exchange before you try to send transactions.",
      },
      { type: "h2", text: "Start with Discover" },
      {
        type: "p",
        text: "Discover is the front door. Browse trending creators, scan categories, follow a few, and your Feed starts filling up. The Concierge can build a personalized starter feed if you tell it what you're in the mood for.",
      },
    ],
  },
  {
    slug: "feed-and-discovery",
    title: "How the Feed & Discovery Work",
    description:
      "Discover is where you land. Feed is where the people you follow live.",
    blocks: [
      {
        type: "p",
        text: "Two surfaces, one job: get the right thing in front of you.",
      },
      { type: "h2", text: "Discover" },
      {
        type: "p",
        text: "Discover blends trending creators, fresh drops, the Concierge's recommendations, and category browsing. It's where you go when you want to find something new, not when you want to catch up on what you already follow.",
      },
      { type: "h2", text: "Feed" },
      {
        type: "p",
        text: "Feed shows posts from creators you follow, newest first. Gated posts are blurred until your subscription tier matches. When your Feed is empty, we'll point you back to Discover.",
      },
      { type: "h2", text: "Smart Search" },
      {
        type: "p",
        text: "The search bar at the top reads plain English. Try \"creators under 1k followers who post weekly\" or \"NFTs under 50 $NSFW with a cosplay theme.\" If the AI's confidence is low, it falls back to ordinary text search so you always get something useful.",
      },
      {
        type: "callout",
        tone: "tip",
        text: "Tap the floating Aura button anytime to refresh your Feed or shift the mood. Aura remembers your preferences across sessions.",
      },
    ],
  },
  {
    slug: "following-and-subscriptions",
    title: "Following & Subscriptions",
    description: "What's free, what's paid, and how to manage both.",
    blocks: [
      { type: "h2", text: "Following is free" },
      {
        type: "p",
        text: "Tap Follow on any profile to see their public posts in your Feed. No payment, no signature, nothing to confirm. Unfollow any time.",
      },
      { type: "h2", text: "Subscribing is the paid tier" },
      {
        type: "p",
        text: "Creators set their own subscription tiers and prices. Subscribing unlocks gated posts, direct messages with that creator, and any perks they've listed for that tier. You pay in $NSFW from your wallet.",
      },
      { type: "h3", text: "Auto-renew" },
      {
        type: "p",
        text: "Subscriptions auto-renew at the end of each billing cycle. We'll always remind you a few days before the next charge, turn auto-renew off from your Subscriptions panel any time.",
      },
      {
        type: "callout",
        tone: "info",
        text: "Subscription Intelligence summarises what each creator you subscribe to has posted since your last visit so you never feel behind.",
      },
    ],
  },
  {
    slug: "tipping-and-nsfw",
    title: "Tipping & $NSFW",
    description: "Send appreciation directly. On-chain. Instant. Visible.",
    blocks: [
      { type: "h2", text: "What is $NSFW?" },
      {
        type: "p",
        text: "$NSFW is the platform's token. ERC-20 on Polygon. It's what pays for subscriptions, tips, NFTs, and what unlocks staking rewards. The token has been live since 2021.",
      },
      { type: "h2", text: "Tipping" },
      {
        type: "p",
        text: "Tap the tip icon on any post, profile, or DM. Pick an amount in $NSFW, confirm in your wallet, and it lands in the creator's wallet immediately. Tips are visible to the creator, they're a public thank-you, not a hidden transaction.",
      },
      { type: "h2", text: "Buying $NSFW" },
      {
        type: "p",
        text: "The token trades on SushiSwap. The Token page in the platform shows live price, market cap, and a direct link to swap. Bridge MATIC for gas first if you're new to Polygon.",
      },
      {
        type: "callout",
        tone: "warning",
        text: "Always double-check the contract address before swapping. The official address is on the Token page with a one-tap copy button, that's the only one we'll ever recommend.",
      },
    ],
  },
  {
    slug: "becoming-a-creator",
    title: "Becoming a Creator",
    description: "Verification, your first tier, your first post.",
    blocks: [
      { type: "h2", text: "Apply" },
      {
        type: "p",
        text: "From your Profile, tap \"Become a creator.\" You'll go through identity + age verification (18+, document check) and set the wallet that receives your earnings.",
      },
      { type: "h2", text: "Set up your tiers" },
      {
        type: "p",
        text: "Tiers are how fans subscribe. Most creators run one or two, start with a flagship tier covering everything, optionally add a premium tier with extras (1-on-1 DM time, exclusive series, NFT drops).",
      },
      {
        type: "callout",
        tone: "tip",
        text: "Co-Pilot benchmarks pricing against similar creators on the platform and suggests a number for each tier. You can override it any time.",
      },
      { type: "h2", text: "Your first post" },
      {
        type: "p",
        text: "Upload media, write a caption, pick whether it's public, follower-only, or tier-gated. Co-Pilot will offer three caption variations, playful, intimate, bold, and the best posting time for your specific audience.",
      },
      { type: "h2", text: "Earnings" },
      {
        type: "p",
        text: "Subscription revenue and tips land in your wallet in $NSFW as they happen. The Earnings tab in your Creator Dashboard projects next month's revenue and breaks down what's driving it.",
      },
    ],
  },
  {
    slug: "creator-tools",
    title: "Creator Tools & Co-Pilot",
    description:
      "The strategist that sits next to you while you build your audience.",
    blocks: [
      {
        type: "p",
        text: "Co-Pilot is the dedicated AI surface for creators. It reads your dashboard data and turns it into specific, applyable suggestions.",
      },
      { type: "h2", text: "What Co-Pilot does" },
      {
        type: "ul",
        items: [
          "Best posting times for your specific audience timezone distribution",
          "Three caption variations for any draft, in distinct voices",
          "Reply suggestions for fan DMs that match your established tone",
          "Pricing recommendations for tiers, benchmarked against similar creators",
          "Which content converts subscribers and which doesn't, with a hypothesis why",
          "A weekly digest in plain language: the most important number, why it moved, what to try next week",
        ],
      },
      { type: "h2", text: "One-click apply" },
      {
        type: "p",
        text: "Every recommendation has an Apply button. Suggested posting time? Tap once and the post schedules itself. Suggested caption? Tap once and it fills the editor.",
      },
      {
        type: "callout",
        tone: "info",
        text: "Co-Pilot never sees other creators' private data. Benchmarks come from anonymized aggregates only.",
      },
    ],
  },
  {
    slug: "staking",
    title: "Staking",
    description: "Lock $NSFW for 12 weeks. Earn rewards. Signal conviction.",
    blocks: [
      { type: "h2", text: "How staking works" },
      {
        type: "p",
        text: "Connect your wallet on the Staking page, approve the staking contract for your $NSFW balance, then stake. Your position locks for 12 weeks. During the lock, you accrue rewards continuously and can claim them at any time.",
      },
      { type: "h2", text: "Unlocking" },
      {
        type: "p",
        text: "After the 12 weeks, request an unlock. There's a short unlock window during which you can withdraw your principal. Rewards stay claimable separately.",
      },
      { type: "h2", text: "Why stake" },
      {
        type: "ul",
        items: [
          "Earn yield on $NSFW you'd otherwise be holding idle",
          "Signal long-term conviction to the rest of the community",
          "Unlock perks as the ecosystem grows (token-gated drops, creator perks, governance moments)",
        ],
      },
      {
        type: "callout",
        tone: "warning",
        text: "Staking is a smart-contract action. Always double-check the address on the Staking page matches the official one. If you're unsure, ask in the community before signing.",
      },
    ],
  },
  {
    slug: "marketplace",
    title: "The NFT Marketplace",
    description: "PleasureNifty inside the platform. Buy, sell, and collect.",
    blocks: [
      { type: "h2", text: "Browse" },
      {
        type: "p",
        text: "Marketplace lists every NFT across the verified collections, with filters for collection, price, and rarity. Smart Search works here too, ask for what you want in plain English.",
      },
      { type: "h2", text: "Buy" },
      {
        type: "p",
        text: "Each listing shows the seller, current price in $NSFW, and the full trait breakdown. Tap Buy, confirm in your wallet, and the NFT transfers to you in the next block.",
      },
      { type: "h2", text: "List your own" },
      {
        type: "p",
        text: "From the My NFTs tab, pick an NFT you own and tap List for sale. Set a price in $NSFW. The platform takes a small fee on completed sales (see the Token page for the current percentage).",
      },
    ],
  },
  {
    slug: "ai-features",
    title: "Using the AI Features",
    description: "Aura, Co-Pilot, Smart Search, Forecaster, Subscription Intel.",
    blocks: [
      {
        type: "p",
        text: "Five AI features ship at MVP. Each solves a real job for a real person, not a chatbot in the corner.",
      },
      { type: "h2", text: "Aura, your concierge (for fans)" },
      {
        type: "p",
        text: "Aura builds your feed through conversation. \"Show me something calm tonight.\" \"Find me creators like X but smaller.\" \"Refresh, I've seen this stuff.\" Tap the floating sparkle button to summon her.",
      },
      { type: "h2", text: "Co-Pilot (for creators)" },
      {
        type: "p",
        text: "See the Creator Tools section. Daily strategist with one-click apply.",
      },
      { type: "h2", text: "Smart Search" },
      {
        type: "p",
        text: "Natural language in, real results out. Across creators, posts, and NFTs.",
      },
      { type: "h2", text: "Earnings Forecaster (for creators)" },
      {
        type: "p",
        text: "Projects next month's earnings from your trajectory with a transparent breakdown of what's driving the number. Scenario sliders let you see the impact of decisions before you make them.",
      },
      { type: "h2", text: "Subscription Intelligence (for fans)" },
      {
        type: "p",
        text: "Tracks your active subscriptions, summarizes what each creator has posted since your last visit, notifies before auto-renews. No more feeling behind, no more surprise charges.",
      },
    ],
  },
  {
    slug: "wallet-and-security",
    title: "Wallet & Security",
    description: "How we treat your keys, your data, your transactions.",
    blocks: [
      { type: "h2", text: "Your keys, your control" },
      {
        type: "p",
        text: "We never store your private keys. Every on-chain action (subscribing, tipping, buying NFTs, staking) is initiated by you and signed in your wallet.",
      },
      { type: "h2", text: "Sign-in via wallet" },
      {
        type: "p",
        text: "Wallet sign-in uses Sign-In With Ethereum. We generate a unique nonce, you sign it once, we verify the signature. Nonces are single-use and time-bounded, replay attacks aren't possible.",
      },
      { type: "h2", text: "Your data" },
      {
        type: "p",
        text: "Email, date of birth, country, and wallet addresses are encrypted at rest. Row-level security policies sit on every table, you can only read your own data, creators can only read their own analytics, and admins access flows are logged and audited.",
      },
      { type: "h2", text: "Export and delete" },
      {
        type: "p",
        text: "You can export everything we have on you, or delete your account entirely, from Settings → Privacy. GDPR-aligned, no dark patterns.",
      },
      {
        type: "callout",
        tone: "warning",
        text: "We will never DM you for your seed phrase or send you a link asking you to \"reconnect.\" If anyone claiming to be Pleasure Coin support asks, it's a scam.",
      },
    ],
  },
  {
    slug: "faq",
    title: "FAQ",
    description: "Quick answers to the questions we hear the most.",
    blocks: [
      { type: "h3", text: "Do I need crypto to use the platform?" },
      {
        type: "p",
        text: "Browsing Discover and reading public posts: no. Subscribing, tipping, buying NFTs, and staking: yes, those happen in $NSFW on Polygon.",
      },
      { type: "h3", text: "Which wallets are supported?" },
      {
        type: "p",
        text: "MetaMask, Coinbase Wallet, and anything connected through WalletConnect (Phantom, Rainbow, Trust, Zerion, and most mobile wallets).",
      },
      { type: "h3", text: "Can I link multiple wallets?" },
      {
        type: "p",
        text: "Yes. From Settings → Connected Wallets you can link as many as you want. Subscriptions and earnings can route to whichever wallet you choose.",
      },
      { type: "h3", text: "What about other chains?" },
      {
        type: "p",
        text: "Polygon is the only chain we support today. We chose it for low gas, fast confirmations, and because $NSFW already lives there.",
      },
      { type: "h3", text: "Is my activity public?" },
      {
        type: "p",
        text: "Follows, likes, and tips you send to a creator are visible to that creator. Subscriptions are private to you and the creator. On-chain transactions are visible on PolygonScan as with any blockchain.",
      },
      { type: "h3", text: "How do I report something?" },
      {
        type: "p",
        text: "Every post, profile, and message has a Report button. Reports go to the moderation team. We act fast on anything that violates the creator agreement.",
      },
      { type: "h3", text: "Can I replay the welcome tour?" },
      {
        type: "p",
        text: "Settings → Replay tour. Anytime.",
      },
    ],
  },
];
