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
        text: "Sign up with your email or your wallet. Wallet sign-in uses a one-tap signature, no password, no email if you don't want one. You can link both methods to one account later from Settings.",
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
    slug: "the-nsfw-token",
    title: "The $NSFW Token",
    description:
      "The utility token that powers the entire ecosystem. ERC-20 on Polygon.",
    blocks: [
      {
        type: "p",
        text: "$NSFW is the utility token behind everything on the platform. It is an ERC-20 on Polygon, live since 2021, and it is what you use to subscribe to creators, tip, buy and sell NFTs, and stake for rewards. One token, used everywhere, buy once and use it across the whole ecosystem.",
      },
      { type: "h2", text: "Total supply" },
      {
        type: "p",
        text: "The total supply is 69,000,000,000 $NSFW (69 billion). It is a fixed supply, the protocol does not mint new tokens.",
      },
      {
        type: "callout",
        tone: "info",
        text: "Contract: 0x8f006d1e1d9dc6c98996f50a4c810f17a47fbf19 on Polygon. Always verify the address on the Token page or PolygonScan before you transact.",
      },
      { type: "h2", text: "What it is used for" },
      {
        type: "ul",
        items: [
          "Subscriptions to creators on Pleasurely",
          "Tipping creators directly",
          "Buying and selling NFTs on PleasureNifty",
          "Staking for 10% APY over a 12-week lock",
          "Settlement across the whole ecosystem",
        ],
      },
      { type: "h2", text: "How to get $NSFW" },
      {
        type: "p",
        text: "Connect a wallet on Polygon and swap for $NSFW on a DEX like SushiSwap, or use the in-app trade screen. You only need a little POL for gas. The live price, market cap, and holder count are on the Token page.",
      },
      { type: "h2", text: "The live chart" },
      {
        type: "p",
        text: "The Token page shows the live $NSFW chart. Connect your wallet, the same one you use for tips, subscriptions, and the marketplace, to unlock it; until you do, a clean connect prompt stands in for the chart. This keeps the trading view tied to the wallet you actually transact with.",
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
      { type: "h2", text: "Post audiences" },
      {
        type: "p",
        text: "When a creator posts, they choose who can see the media, with four levels: Public (everyone, even logged out), Free (any signed-in member), Followers only (people who follow them), and Subscribers (active subscribers to a chosen tier). The post itself shows up as a locked teaser to everyone, with a clear prompt to sign in, follow, or subscribe; the media unlocks only for the right audience via a short-lived signed link.",
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
      { type: "h2", text: "How to subscribe" },
      {
        type: "p",
        text: "Open a creator's profile, pick the tier you want, and confirm the payment in $NSFW from your wallet. The unlock is instant: gated posts, the creator's DMs, and any tier perks open the moment the transaction confirms on Polygon. There's no platform middleman holding your money, payment settles on-chain.",
      },
      { type: "h3", text: "Tiers" },
      {
        type: "p",
        text: "Creators can run multiple tiers, for example a Supporter tier for the full public catalogue and an Insider tier that adds tier-gated drops, priority replies, and early access. You can be on one tier per creator and upgrade or downgrade between cycles.",
      },
      { type: "h3", text: "Managing your subscriptions" },
      {
        type: "ul",
        items: [
          "See every active subscription, its tier, and its renewal date in one place",
          "Turn auto-renew on or off per creator at any time",
          "Get a reminder a few days before each renewal",
          "Cancel and keep access until the end of the cycle you already paid for",
        ],
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
        text: "Connect your wallet on the Staking page, approve the staking contract for your $NSFW balance, then stake. Your position locks for 12 weeks and earns 10% APY. Rewards accrue continuously while it's locked.",
      },
      { type: "h2", text: "The rules" },
      {
        type: "ul",
        items: [
          "Lock your $NSFW for 12 weeks to earn 10% APY.",
          "Rewards accrue continuously and can be claimed weekly (every Monday).",
          "To unstake: request unlock, wait out the lock, then withdraw your principal.",
          "Adding more tokens to a position resets its 12-week lock.",
          "Minimum stake is 1,000,000 $NSFW.",
          "Keep a little POL in your wallet for transaction fees.",
        ],
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
        text: "Natural language in, real results out, across creators and posts. Ask for \"creators under 1k who post weekly\" and Aura turns it into a real query. Each result links straight to the creator. If the AI is unsure, it falls back to plain keyword search so you always get something useful.",
      },
      { type: "h2", text: "Earnings Forecaster (for creators)" },
      {
        type: "p",
        text: "Projects the next six months of earnings from your real trajectory, then writes a plain-language read of where you're heading and one practical suggestion. The numbers come from your own dashboard data; the narrative never promises returns or gives financial advice.",
      },
      { type: "h2", text: "Subscription Intelligence (for fans)" },
      {
        type: "p",
        text: "Catch up in one tap: it pulls a creator's recent posts and writes a short recap of what you missed since your last visit, grounded in their actual captions. Renewal reminders give you a heads-up before a subscription lapses, so there are no surprises.",
      },
      {
        type: "callout",
        tone: "info",
        text: "Every AI feature runs behind the same hard safety rules and only responds when the platform's AI key is configured; it never invents data or fakes a reply.",
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
    slug: "messages",
    title: "Messages & DMs",
    description: "Private, real-time conversations with creators and connections.",
    blocks: [
      {
        type: "p",
        text: "Messages is your private inbox. Threads with creators you subscribe to and the people you connect with, delivered in real time with read state and timestamps.",
      },
      { type: "h2", text: "How it works" },
      {
        type: "p",
        text: "Open Messages from the nav, or the bell. Pick a conversation or start a new one, type, and send. Delivery is instant over a live connection, no refresh needed. Your conversation list orders by most recent so the active threads stay on top.",
      },
      { type: "h2", text: "Starting a conversation" },
      {
        type: "p",
        text: "Tap the compose button in Messages to search for anyone by name or handle and start a thread. You can also message a creator straight from their profile.",
      },
      { type: "h2", text: "Who can message you" },
      {
        type: "p",
        text: "Anyone can follow you. For DMs you choose: in Settings → Privacy, set who can start a conversation with you to Everyone, or limit it to people you follow back (mutuals only). It's enforced the moment someone tries to open a thread. Every message a creator sends is written and sent by them.",
      },
      {
        type: "callout",
        tone: "tip",
        text: "Creators: the Co-Pilot drafts on-brand reply suggestions in your voice. You always edit and send, nothing goes out automatically.",
      },
    ],
  },
  {
    slug: "pveels",
    title: "Pveels (Short Video)",
    description: "Full-screen vertical video, the reels of Pleasure Coin.",
    blocks: [
      {
        type: "p",
        text: "Pveels is the full-screen vertical feed: short clips you swipe through one at a time, tuned to what you like. It's the fastest way to discover a creator's energy in seconds.",
      },
      { type: "h2", text: "Watching" },
      {
        type: "p",
        text: "Open Pveels from the nav, swipe up for the next clip, tap to like, and follow creators you discover without leaving the feed. Gated clips show a clean unlock prompt instead of the video.",
      },
      { type: "h2", text: "For creators" },
      {
        type: "p",
        text: "Short video is one of the fastest ways to grow. Post a clip and it surfaces in Pveels and on your profile, turning viewers into followers and subscribers. Keep it on-brand and let the Co-Pilot help you plan a posting cadence.",
      },
    ],
  },
  {
    slug: "profile-and-settings",
    title: "Profile & Settings",
    description: "Your profile, your account, and everything you control.",
    blocks: [
      {
        type: "p",
        text: "Your profile is your home on the platform: cover image, avatar, bio, your post grid, and your follower and following counts. It's what people see when they tap your name anywhere on Pleasure Coin.",
      },
      { type: "h2", text: "Editing your profile" },
      {
        type: "ul",
        items: [
          "Display name and username, with a live availability check",
          "Bio and country",
          "Avatar and cover image uploads",
          "Telegram and X (Twitter) links, shown as clean buttons on your profile so people can follow you off-platform. Enter a handle or a full link; we validate and tidy it for you",
          "Changes save to your account and reflect instantly",
        ],
      },
      { type: "h2", text: "Preferences" },
      {
        type: "p",
        text: "Under Settings, your notification and AI toggles save the moment you flip them. Turn off any notification type you don't want, or switch off an AI feature (Concierge, Smart Search, Co-Pilot) and it disappears from your interface immediately. Your display language lives here too and drives the translate control across the app.",
      },
      { type: "h2", text: "Account & security" },
      {
        type: "ul",
        items: [
          "Change your password, we confirm the current one first and email you when it changes",
          "Manage connected wallets",
          "Replay the welcome tour any time",
        ],
      },
      { type: "h2", text: "Deleting your account" },
      {
        type: "p",
        text: "From Settings you can permanently delete your account. You confirm by typing a phrase, we email you a confirmation, and your profile, posts, follows, and data are removed for good.",
      },
      {
        type: "callout",
        tone: "warning",
        text: "Account deletion is permanent and immediate. Export anything you want to keep before you confirm.",
      },
    ],
  },
  {
    slug: "creator-payouts",
    title: "Creator Payouts & Earnings",
    description: "How money reaches your wallet, step by step.",
    blocks: [
      {
        type: "p",
        text: "Earnings on Pleasure Coin are non-custodial. When a fan subscribes or tips, the $NSFW transfers on-chain directly from their wallet to your payout wallet. The platform never holds your money, so there is no balance to withdraw and no payout delay.",
      },
      { type: "h2", text: "Set your payout wallet" },
      {
        type: "p",
        text: "When you apply to become a creator you provide a payout wallet, and you can change it anytime in Settings → Creator. Tips and subscription payments route to that address. If you ever leave it blank, fans see that payouts aren't set up yet and can't subscribe until you add one.",
      },
      { type: "h2", text: "How a subscription pays out" },
      {
        type: "ul",
        items: [
          "A fan picks your tier and confirms the payment in their wallet.",
          "The $NSFW (converted from the tier's USD price at the live rate) transfers to your payout wallet on Polygon.",
          "The subscription is recorded with the transaction hash and a 30-day expiry, and your subscriber count updates.",
          "When it renews, the same on-chain transfer happens again unless the fan cancelled auto-renew.",
        ],
      },
      { type: "h2", text: "Tips" },
      {
        type: "p",
        text: "Tips are an instant on-chain transfer to your wallet, with an optional note tied to a post. They show in your earnings and the fan gets a confirmation once the transaction settles.",
      },
      {
        type: "callout",
        tone: "info",
        text: "Because payouts are on-chain, every payment is verifiable on PolygonScan. Keep a small amount of MATIC in your wallet for gas if you plan to move funds.",
      },
      { type: "h2", text: "Reading your earnings" },
      {
        type: "p",
        text: "The creator dashboard shows total earnings, active subscribers, and a 30-day tip total, plus the Earnings Forecaster for a transparent projection you can adjust with scenario sliders.",
      },
    ],
  },
  {
    slug: "pricing-playbook",
    title: "Subscription Pricing Playbook",
    description: "How to price your tiers, including the $20 starting tier.",
    blocks: [
      {
        type: "p",
        text: "You set tier prices in USD and fans pay the equivalent in $NSFW at the live token price at checkout. Pricing in dollars keeps your pricing stable and familiar even as the token moves.",
      },
      { type: "h2", text: "Start with one clear tier" },
      {
        type: "p",
        text: "A single, well-named tier converts better than a confusing ladder. A $20/month tier is a strong default: high enough to value your work, low enough for an easy yes. Add a second, higher tier later for superfans once you know what they want more of.",
      },
      { type: "h2", text: "Write benefits as outcomes" },
      {
        type: "ul",
        items: [
          "List concrete things a subscriber gets, not vague promises.",
          "Lead with the benefit fans ask for most.",
          "Keep it to three to five bullets so the value is scannable.",
        ],
      },
      { type: "h2", text: "Use the tools" },
      {
        type: "p",
        text: "The Co-Pilot suggests prices grounded in benchmarks from similar-profile creators, and the Forecaster shows how a price or growth change affects next month. Manage tiers (create, edit, show/hide) from the dashboard Tiers tab; hiding a tier never removes existing subscribers' access.",
      },
      {
        type: "callout",
        tone: "tip",
        text: "Raising a price? Keep current subscribers on their old price and apply the new one to new sign-ups. Goodwill compounds.",
      },
    ],
  },
  {
    slug: "safety-and-compliance",
    title: "Safety, Privacy & 18+ Compliance",
    description: "The rules that keep this platform safe, and your controls.",
    blocks: [
      {
        type: "p",
        text: "Pleasure Coin is strictly 18+. Age is verified by date of birth at signup and checked server-side every time you load gated content. Accounts that misrepresent age are removed.",
      },
      { type: "h2", text: "What is never allowed" },
      {
        type: "ul",
        items: [
          "Anything involving minors, or anyone whose age is unclear. Zero tolerance, reported to authorities where required.",
          "Non-consensual, leaked, or revenge content of any kind.",
          "Impersonation, doxxing, harassment, or sharing someone's private information.",
          "Illegal content or activity.",
        ],
      },
      { type: "h2", text: "Reporting and moderation" },
      {
        type: "p",
        text: "Every post, profile, and message has a Report button with clear reasons; the most serious (involving a minor, non-consensual content) are prioritized. Our moderation team can remove or age-restrict content and suspend or ban accounts. You can also block or mute any user from their profile.",
      },
      { type: "h2", text: "Your privacy controls" },
      {
        type: "p",
        text: "From Settings → Privacy you control who can message you (everyone, or mutuals only), your blocked and muted lists, and what's visible on your profile. Gated media is stored privately and only ever served to you or an active subscriber through a short-lived signed link, never a public URL.",
      },
      {
        type: "callout",
        tone: "warning",
        text: "If you see content involving a minor, report it immediately and do not share it. We act on these reports first and cooperate with law enforcement.",
      },
      { type: "h2", text: "Your data" },
      {
        type: "p",
        text: "Sensitive fields are protected by row-level security so only you (and, where required, moderators) can read them. You can export or delete your account at any time from Settings → Account. The AI assistants operate under hard safety limits and never generate explicit imagery or reveal your private data.",
      },
    ],
  },
  {
    slug: "news-and-broadcasts",
    title: "News & Broadcasts",
    description: "Platform announcements, delivered everywhere they matter.",
    blocks: [
      {
        type: "p",
        text: "News is the platform's announcement feed. When the team publishes an update, it lands in three places at once: the in-app News page, your notifications, and your email inbox, so you never miss something important.",
      },
      { type: "h2", text: "The News feed" },
      {
        type: "p",
        text: "Open News from the navigation (or the More menu on mobile) to read the latest announcements, newest first. Each post can include an image, and you can like, comment, and share any item, just like a regular post. It all updates in real time.",
      },
      { type: "h2", text: "Where broadcasts reach you" },
      {
        type: "p",
        text: "Every broadcast creates a real notification for the targeted audience and, if you have email notifications on, sends a branded email. You stay in control: manage what you receive from Settings → Notifications.",
      },
      {
        type: "callout",
        tone: "tip",
        text: "Admins broadcast from the admin panel: a title, a message, an optional image, and an audience (everyone, creators, or fans). Publishing fans it out instantly.",
      },
    ],
  },
  {
    slug: "pleasureland",
    title: "Pleasureland",
    description: "The immersive metaverse corner of the ecosystem.",
    blocks: [
      {
        type: "p",
        text: "Pleasureland is the immersive, world-building side of the Pleasure Coin ecosystem, a styled launch surface that connects the platform to the wider metaverse experience.",
      },
      { type: "h2", text: "How to reach it" },
      {
        type: "p",
        text: "Pleasureland is linked from the ecosystem sections and the navigation. It opens its own experience while your single Pleasure Coin sign-in and wallet carry across, so the token, identity, and assets stay unified.",
      },
      {
        type: "callout",
        tone: "info",
        text: "Pleasureland keeps its existing experience by design; Pleasure Coin unifies access and identity around it rather than rebuilding it.",
      },
    ],
  },
  {
    slug: "search",
    title: "Search",
    description: "Find people, posts, and Pveels across the platform.",
    blocks: [
      {
        type: "p",
        text: "There are two ways to search. The Smart Search bar in the top bar is AI-powered: ask in natural language (\"calm creators under 1k followers\") and it builds the filters for you. The Search page is a fast keyword search across people, posts, and Pveels.",
      },
      { type: "h2", text: "Keyword search" },
      {
        type: "p",
        text: "Open Search from the navigation (or the More menu on mobile), type a name, @handle, caption, or topic, and switch between the People, Posts, and Pveels tabs. Results respect your blocks, so people you've blocked won't appear.",
      },
      {
        type: "callout",
        tone: "tip",
        text: "Looking for someone to message? The new-message picker in Messages uses the same people search.",
      },
    ],
  },
  {
    slug: "translation",
    title: "Translate the Platform",
    description: "Read Pleasure Coin in your language, anywhere on the app.",
    blocks: [
      {
        type: "p",
        text: "Pleasure Coin translates itself on demand. Tap the globe control and pick from a dozen languages; the visible page is rewritten in place, from the landing page to the docs to the app itself. Switch back to English at any time and the original copy returns exactly as it was.",
      },
      { type: "h2", text: "Where to find it" },
      {
        type: "ul",
        items: [
          "In the app: the globe in the top bar, next to notifications",
          "On the landing page and docs: the globe in the main navigation",
          "In Settings: your display language, which drives the same translation",
        ],
      },
      { type: "h2", text: "How it works" },
      {
        type: "p",
        text: "Translation happens through a server-side proxy, so your choice follows you across the platform without slowing pages down, and right-to-left languages like Arabic flip the layout automatically. Your selection is remembered on your device. Input fields, code, and your own draft text are never altered.",
      },
      {
        type: "callout",
        tone: "tip",
        text: "Translation covers the interface and content text. Usernames, handles, and amounts are left as-is on purpose.",
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
