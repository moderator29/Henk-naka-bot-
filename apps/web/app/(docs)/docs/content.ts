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
        text: "Sign up with email or your wallet. Wallet sign-in uses a one-tap signature, no password, no email if you don't want one. A first-time wallet creates your account and drops you into onboarding to set up your profile; a returning wallet signs you straight in.",
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
        text: "Feed shows posts from creators you follow, newest first. Subscriber-only posts show a locked preview with a Subscribe prompt until your subscription matches, the media itself stays private, never just visually blurred. When your Feed is empty, we'll point you back to Discover.",
      },
      { type: "h2", text: "Search" },
      {
        type: "p",
        text: "Search reliably finds any creator by display name or @username, plus posts and Pveels by caption. Open it from the nav, results are live as you type and split into People, Posts, and Pveels tabs, with your recent searches saved.",
      },
      {
        type: "p",
        text: "The top bar also has Smart Search, which reads plain English. Try \"creators under 1k followers who post weekly\" or \"NFTs under 50 $NSFW with a cosplay theme.\" If the AI's confidence is low, it falls back to ordinary text search so you always get something useful.",
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
        text: "The standard subscription is $20 a month, charged in the equivalent amount of $NSFW (the subscribe screen shows both the $20 and the live $NSFW amount). Creators set their own tier prices around that. Subscribing unlocks that creator's gated posts and Pveels, opens direct messages, and grants the Subscriber badge.",
      },
      { type: "h3", text: "What a subscription includes" },
      {
        type: "ul",
        items: [
          "All subscribers-only posts and Pveels from that creator",
          "The Subscriber badge on your profile and next to your name",
          "Direct messages with the creator",
          "The ability to tip and request content",
          "Early access to new posts and Pveels, plus exclusive behind-the-scenes",
          "An ad-free, premium experience and premium AI features",
        ],
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
        text: "Tiers are how fans subscribe. Create them in Settings → Creator tiers: name the tier, set a price in $NSFW, and list the benefits. Your first tier marks your account as a creator. Activate or deactivate any tier at any time.",
      },
      { type: "h3", text: "Subscription pricing playbook" },
      {
        type: "ul",
        items: [
          "Anchor your main tier near the $20/month standard so the value reads instantly",
          "Run one flagship tier that covers everything, before adding complexity",
          "Add a premium tier (roughly 2-3x) only when you have extras to gate: 1-on-1 DM time, an exclusive series, early access, NFT drops",
          "Price the benefits, not the content, list concrete perks fans can see",
          "Raise prices for new subscribers as demand grows; keep existing fans grandfathered to reward loyalty",
          "Review conversion in the dashboard monthly and adjust one variable at a time",
        ],
      },
      {
        type: "callout",
        tone: "tip",
        text: "Co-Pilot benchmarks pricing against anonymized aggregates of similar creators and suggests a number for each tier. You can override it any time.",
      },
      { type: "h2", text: "Your first post" },
      {
        type: "p",
        text: "Upload media, write a caption, and pick the audience with the buttons: Public, Free followers, Subscribers, or a specific tier. Co-Pilot offers three caption variations, playful, intimate, bold, and the best posting time for your audience.",
      },
      { type: "h2", text: "Earnings & payouts (step by step)" },
      {
        type: "ul",
        items: [
          "1. Connect the wallet that receives your earnings in Settings → Connected wallets",
          "2. Subscription payments and tips settle on-chain in $NSFW directly to that wallet as they happen, there's no platform middleman holding your money",
          "3. Watch it accrue in your Creator Dashboard: total and recent earnings, top content, and subscriber growth",
          "4. The Earnings Forecaster projects next month's revenue and breaks down what's driving it",
          "5. Withdraw or swap your $NSFW from your own wallet whenever you like",
        ],
      },
      {
        type: "callout",
        tone: "info",
        text: "Automated on-chain payout scheduling is on the roadmap and activates once the payout contract address is set (PENDING_CONTRACT_ADDRESS). Until then, earnings still land in your wallet in real time, you just move them yourself.",
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
        text: "Open Messages from the nav or the bell. Tap the compose button to start a new conversation, search for anyone by name or @username and pick them. Type and send; delivery is instant over a live connection, no refresh needed. Your conversation list orders by most recent so active threads stay on top.",
      },
      { type: "h3", text: "Read receipts" },
      {
        type: "p",
        text: "Your sent messages show a single tick when sent and a double tick once the other person has read them, updating live as they open the thread. You can also send normal images, voice notes aren't supported.",
      },
      { type: "h2", text: "Who can message you, and blocking" },
      {
        type: "p",
        text: "Subscribing to a creator opens a direct channel with them. You stay in control of your inbox, and every message a creator sends is written and sent by them. Block anyone from their profile (the … menu): blocking stops messages both ways, removes the mutual follow, and hides them from your search. Manage your block list in Settings → Profile & privacy.",
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
        text: "Open Pveels from the nav. Each clip autoplays when it's in view and pauses when you scroll on. Swipe up for the next, swipe down to go back.",
      },
      {
        type: "ul",
        items: [
          "Tap once to pause or play, double-tap to like (the heart bursts)",
          "Right rail: like, comment, tip in $NSFW, save, and share",
          "Tap the speaker to unmute, your choice is remembered",
          "Drag the bar at the bottom to scrub through a clip",
          "Switch between the For You and Following feeds at the top",
        ],
      },
      {
        type: "p",
        text: "Subscriber-only clips show an elegant locked preview with a Subscribe prompt, never the underlying video. The file itself is private and only served to you once you subscribe.",
      },
      { type: "h2", text: "Creating a Pveel" },
      {
        type: "p",
        text: "Tap the box-shaped create button (the plus) in Pveels to open the creation studio. You can record in-app or upload a clip you already have.",
      },
      { type: "h3", text: "Record or upload" },
      {
        type: "ul",
        items: [
          "Record: use your camera, flip front/back, and capture up to 45 seconds",
          "Upload: pick an MP4, WebM, or MOV up to 10 MB (45 seconds or less)",
        ],
      },
      { type: "h3", text: "Edit and publish" },
      {
        type: "ul",
        items: [
          "Cover: scrub to choose the poster frame people see first",
          "Caption: add your words and #hashtags so it's searchable",
          "Audience: Public, Free followers, Subscribers, or a specific tier",
          "Toggles: allow comments and allow tips, your call",
          "Schedule: post now or pick a date and time for later",
        ],
      },
      {
        type: "p",
        text: "When you publish, the clip uploads (to a public bucket for free clips, or a private one for subscriber-only) and a poster is generated automatically. It then appears in Pveels and on your profile's Pveels tab.",
      },
      {
        type: "callout",
        tone: "tip",
        text: "Short video is one of the fastest ways to grow. Keep it on-brand and let Co-Pilot suggest captions and a posting cadence.",
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
          "Changes save to your account and reflect instantly",
        ],
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
