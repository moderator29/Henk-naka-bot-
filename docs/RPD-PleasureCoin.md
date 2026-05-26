# Pleasure Coin V2: The Realized Product Document

Codename: Project Aurora
Prepared for: Tim and Paul
Status: Build Complete, v2.0
Stack: Next.js 14 . Supabase . Polygon . TypeScript . Tailwind . Framer Motion . RainbowKit . wagmi . viem . Anthropic Claude

---

## 1. Executive Summary

Pleasure Coin has built something rare. A token with real holders, a community that stuck through every cycle, an ecosystem of products that work, and a brand that owns a category most teams are too scared to touch. The foundation was solid. This chapter was about making the product feel as future facing as the vision behind it, and that chapter is now shipped.

The ecosystem used to live in pieces. Pleasurely, PleasureNifty, Pleasureland, and the staking surface each sat on their own domain, with their own interface language and their own flow. That served the launch era well, but the bar for Web3 consumer products in 2026 moved. Users expect depth, motion, and intelligence. They expect interfaces that feel like the apps they already use every day.

Project Aurora is the answer. A full ground up rebuild that pulls the entire ecosystem into one unified platform, evolves the pink and purple identity into an aurora driven design language, weaves AI through the product as a genuine cornerstone, and ships a frontend with the polish of a modern consumer app.

The token, the staking contract, the NFT contracts, and Pleasureland stay exactly as they are. Aurora rebuilt everything that touches the user: the marketing site, the platform, the creator tools, the staking experience, the NFT marketplace frontend, the messaging layer, the AI layer, on demand translation, and the identity layer that ties it all together. One account, one wallet, one session, one design system.

It is a production grade product, wired to a live database and to the chain. One sign in opens the entire ecosystem.

### What this document is

A complete account of the rebuild as it stands today: architecture, design, the AI layer, the platform page by page, the motion language, the security posture, what is live, what is intentionally pending the on chain contracts, and what is needed to finish the last mile. Every section describes the platform as it actually works now.

### Goals, and where each landed

1. Unify Pleasurely, PleasureNifty, Staking, and the marketing surface into one cohesive product. One login. One wallet. One design system. **Delivered.**
2. Ship five integrated AI features that demonstrably improve life for both fans and creators. **Delivered.**
3. Establish an aurora driven, motion rich brand language that is unmistakably Pleasure Coin across every surface. **Delivered.**
4. Build a clean modern data layer from scratch on Supabase with zero legacy debt. **Delivered, with row level security on every table.**
5. Preserve every integration path with the existing on chain infrastructure: $NSFW on Polygon, the staking contract, and the NFT contracts. **Delivered. The token and swap are live; staking and the NFT marketplace are wired and ready for their contract addresses.**

### Non-goals, held

1. No new smart contracts. We consume the existing staking and NFT contracts via their addresses and ABIs.
2. No data migration in this phase. New platform, fresh database, clean start.
3. No Pleasureland rebuild. It links out from the unified platform through a styled launch surface.
4. No content generation or hosting decisions beyond the rails. Creators upload their own work; the platform builds the rails and serves them safely.

---

## 2. Product Architecture

### 2.1 The Unified Platform

One domain. One sign in. One wallet connection. Inside the platform, dedicated sections live as first class experiences, each with their own full surface and identity, all sharing the same foundation: identity, navigation, design tokens, animation language, and wallet state.

- **Home / Feed.** A personalized stream of the creators a user follows, plus their own posts, newest first, with AI curated discovery layered in.
- **Explore / Discover.** Search, categories, trending creators, and AI powered recommendations.
- **Creators.** Browse, follow, subscribe, tip, and message.
- **Pveels.** A vertical short video surface with its own creation studio.
- **Marketplace.** PleasureNifty NFTs, built against the existing contracts.
- **Staking.** A live dashboard wired to the staking contract.
- **Token.** $NSFW live data, market info, contract details, and a wallet gated price chart.
- **Messages.** Real time direct messages with permissions.
- **News.** Platform broadcasts and announcements, likeable and commentable.
- **Profile and Settings.** The user's own space: identity, subscriptions, wallet, social links, preferences, and creator earnings.
- **Pleasureland.** A styled in platform launch surface that opens the metaverse.

Each section feels like its own product. All of them share one identity, one navigation system, one set of design tokens, one animation language, and one wallet state.

### 2.2 User Roles

- **Guest.** Browses the marketing site, the token page, and public creator previews in read only mode.
- **Fan.** Authenticated user. Follows, subscribes, tips, comments, saves, messages, and uses every AI feature.
- **Creator.** Authenticated user with creator privileges. Uploads content, manages tiers, sees the dashboard and analytics, and uses the Creator Co-Pilot and Earnings Forecaster.
- **Moderator, Admin, Superadmin.** Internal staff. Moderation, creator verification, platform settings, announcements, legal documents, the audit log, and platform health. Roles are stored in the database, every admin action is re-checked on the server, and all of them are written to an append only audit log.

Fans upgrade to Creator through a verification flow that captures their application, categories, and payout wallet. Approval is an admin action that promotes the account and notifies the applicant.

---

## 3. The Five AI Cornerstones

AI is not an add on. It is woven into five distinct surfaces, each solving a real, specific job for a real, specific person. All five are live. Every feature runs server side, so the AI key is never exposed to the browser. Each one is access controlled, rate limited per user, and bound by a strict safety policy applied to every request: nothing involving minors or ambiguous age, no explicit image generation, nothing illegal or non-consensual, and no leaking of private data. When the AI is not configured, a feature fails cleanly rather than returning anything fabricated.

### 3.1 Discovery Concierge, "Aura" (for fans)

The first impression sets the tone. Instead of a "tick two categories" form, the Concierge is a friendly conversation: tell it a vibe, a type, a feeling, and it shapes your feed. A floating action button summons Aura anywhere on the platform to refresh the feed, find something new, or shift the mood. It supports a fresh chat and image input.

**Under the hood.** Powered by Claude with streaming responses and image input, and memory of a user's taste across sessions. The Concierge can be turned off per user in Settings, in which case it does not appear at all.

### 3.2 Creator Co-Pilot (for creators)

Every creator gets a strategist. Inside a direct message thread, the Co-Pilot reads the recent conversation and suggests on brand replies that match the creator's voice, so answering fans is fast and never robotic.

**Under the hood.** Powered by Claude, reading the recent thread to draft reply options. Available whenever the creator keeps Co-Pilot enabled. The broader analytics Co-Pilot (caption variations, pricing suggestions, a weekly digest) is specified and ready to extend on the same foundation.

### 3.3 Smart Search (across the platform)

Search that understands what you want. Natural language in, results out. "Creators who post weekly and are under 1k followers" becomes a real, structured query, and each result links straight to the creator. If the query is ambiguous, the system falls back to keyword search so the user always gets something useful.

**Under the hood.** Claude turns the query into structured filters that run against the database; low confidence falls back to keyword matching. Results render in the same card system used everywhere else, and the Smart Search bar can be turned off per user in Settings.

### 3.4 Earnings Forecaster (for creators)

Projects the next six months of earnings from the creator's real trajectory, with a transparent breakdown of what is driving the number, then writes a plain language read of where they are heading and one practical suggestion.

**Under the hood.** The projection is computed from the creator's real figures (baseline, subscriber growth, tip growth, churn). Claude writes the narrative and is held strictly to those numbers, with no guarantees and no financial advice.

### 3.5 Subscription Intelligence (for fans)

Manages the fan's subscription life so they never feel behind. It tracks active subscriptions in one place, sends renewal reminders before a subscription lapses, and writes a "since your last visit" recap of what a creator posted, grounded in their actual posts.

**Under the hood.** The recap is drawn from the creator's recent posts and never invents content. Renewal reminders are sent by email and as in app notifications, honoring each fan's notification preferences.

### 3.6 Translation, shipped early

The post MVP roadmap called for a caption translator. We went further and shipped full on demand page translation across the whole product (see Section 5.8 and Section 6). The rest of the post MVP roadmap (Mood Mode, AI Greeter, Trend Pulse, Visual Search) remains documented for future phases.

---

## 4. The Brand System

### 4.1 Identity Direction

The current branding served the launch era. The brief for 2026 was different: depth, motion, light, presence. We kept the soul (pink, purple, magenta, the diamond mark, the playful confidence) and elevated every surface around it. The brand was evolved into its next form, not replaced.

### 4.2 The Color System

The palette is richer, deeper, and more vibrant, and each color earns a defined role.

| Token | Hex | Role |
|---|---|---|
| Deep Plum | `#0F0420` | Base background |
| Imperial Purple | `#2A0E5A` | Secondary surfaces |
| Electric Magenta | `#FF1F8F` | Primary brand, CTAs and accents |
| Vivid Orchid | `#B847FF` | Secondary accent, gradient partner |
| Soft Lilac | `#E9D5FF` | Text on dark, subtle highlights |
| Aurora Cyan | `#5DD6FF` | Interactive states, carried from the existing Love infinity color |
| Pure White | `#FFFFFF` | Headlines only, used sparingly |

Signature gradients: a primary CTA gradient from magenta to orchid, a hero text gradient from magenta through orchid to cyan for keyword reveals, and the animated aurora background, a slowly drifting radial blend of magenta, orchid, cyan, and imperial purple.

### 4.3 Typography

A bold display face for headlines, Inter for body text, and a monospace face for contract addresses and technical detail. All web optimized and variable, to keep the experience fast.

### 4.4 Icons and Aurora

The brand icon system renders as glowing, extruded glyphs with a soft inner glow tuned to each section accent. The signature aurora background, animated radial gradient blobs drifting across a dark base, sits behind every surface: the marketing site, the platform, and the docs. It tunes its color emphasis per section and reduces or disables when a visitor prefers reduced motion.

### 4.5 Glass and Depth

Cards, modals, and navigation use a consistent glass treatment: a soft backdrop blur, semi transparent fills, and hairline borders with a magenta tinted glow. Every interactive element has real, measurable depth.

### 4.6 Motion Language

Every interaction moves, and motion conveys meaning rather than decoration: hero text staggers, scroll reveals, like and save micro interactions, the slide over menu, modals, navigation transitions, and animated stat tickers, all reduced motion aware and tuned for smooth playback.

---

## 5. Technical Architecture

### 5.1 The Stack

| Layer | Choice | Reasoning |
|---|---|---|
| Framework | Next.js 14, App Router | Server rendering for marketing, server components for fast platform loads |
| Language | TypeScript, strict | Type safety across a complex domain |
| Styling | Tailwind CSS plus design tokens | Fast iteration with a shared token system |
| Database | Supabase, Postgres, Auth, Storage, Realtime | All in one, with real time updates for feed and messages |
| Auth | Supabase Auth plus a custom wallet layer | Email and password, and wallet sign in |
| Wallet | RainbowKit, wagmi, viem | Industry standard, MetaMask, WalletConnect, Coinbase |
| Chain | Polygon, mainnet and testnet | Where $NSFW already lives |
| AI | Anthropic Claude | Streaming, structured output, the strongest model for product AI |
| Swap | 0x Swap API | Live quotes, executed in the user's own wallet |
| Animation | Framer Motion | Page transitions, micro interactions, sequences |
| Email | Resend | Transactional email |
| Rate limiting | Upstash Redis | Per user and per IP limits |
| Market data | CoinGecko, CoinMarketCap, GoldRush | Price, market cap, holder count |
| On chain reads | Alchemy | Balances and positions on Polygon |
| Monitoring | Sentry | Error tracking |
| Analytics | PostHog | Product analytics |
| Bot protection | Cloudflare Turnstile | Human verification on auth |
| Hosting | Vercel | Frontend, global edge |

### 5.2 Repository Structure

A single monorepo holds the web application and shared packages for the design system and the contract interfaces. The application is organized into the marketing site, the documentation, the authenticated platform, the admin panel, and the server side endpoints. Supporting code is grouped by domain (the AI layer, authentication, web3, posts, messaging, subscriptions, notifications, translation, and admin), and the database migrations are version controlled alongside the schema.

### 5.3 Database Schema

A clean Postgres schema with row level security on every table. The core entities cover users and creator profiles, subscription tiers and active subscriptions, posts and their media, the engagement graph (likes, saves, comments, tips, follows), notifications and preferences, conversations and messages, roles and the audit log, moderation (reports, blocks, mutes, creator applications), platform settings, announcements and their engagement, legal documents, and cache tables for staking and NFTs.

Recent protections added in this build: a safeguard that freezes privileged account fields so a suspended or banned account cannot reinstate itself or grant itself a role, the profile social link fields, and idempotent subscription recording that stores the real amount paid and prevents duplicate charges.

Row level security: posts gated by a tier are checked against the requester's active subscriptions, creator dashboards are readable only by the creator, users can only edit their own non privileged fields, and admin actions run through a privileged path that is fully audited.

### 5.4 Auth Flow

Two methods, both converging on one account.

1. **Email and password.** Standard email sign in with confirmation, recovery, and resend, all rate limited.
2. **Wallet (Sign-In With Ethereum).** The server issues a single use, time bounded challenge, the user signs it, the server verifies the signature on Polygon and creates a real session. First time wallets land in profile setup with an age check; returning wallets go straight in.

Age verification by date of birth is captured at signup and re-checked on the server before any gated content loads. The platform is strictly 18+. Google sign in from the original plan was intentionally left out to keep sign in simple and wallet native.

### 5.5 Wallet Integration

A brand styled wallet modal supporting MetaMask, WalletConnect (covering most mobile wallets), and Coinbase Wallet, with an automatic prompt to switch to Polygon on the wrong network. One in app wallet powers tips, the swap, subscriptions, staking, and marketplace purchases across the whole platform.

### 5.6 Smart Contract Integration

We integrate, we do not deploy.

- **$NSFW token** (`0x8f006d1e1d9dc6c98996f50a4c810f17a47fbf19`): read balance, transfer, approve. **Live.**
- **0x swap**: a live server side quote, executed in the user's own wallet, with the platform fee routed to the treasury. **Live.**
- **Staking contract** (address pending): read position, stake, unlock, withdraw, claim. **Built against a typed mock, clearly labeled, ready to activate.**
- **NFT contracts** (addresses pending): read ownership, list, buy. **Built against a typed mock, clearly labeled, ready to activate.**

On chain reads are cached for speed, and writes run through the user's wallet with clear transaction feedback. Until the staking and NFT addresses arrive, those surfaces run against typed mock interfaces and present a clear preview state. No transaction is ever simulated as real.

### 5.7 AI Integration Architecture

Every AI request runs on the server, which assembles the necessary context, applies the safety policy, and calls the model. Each feature has its own dedicated prompt, runs under per user rate limits, and fails cleanly when the AI is not configured. The browser never holds the key and never calls the model directly.

### 5.8 Translation Architecture

On demand translation runs through a server side proxy over a public translation service, with caching for speed. A globe control in the platform header and the marketing navigation, along with the language setting in Settings, translate the visible page in place into a dozen languages, restore the original English on switch back, flip the layout to right to left for Arabic, and re-run automatically as the user navigates. Form fields and code are left untouched.

---

## 6. The Platform, Page by Page

### 6.1 The Marketing Surface (public)

**Landing.** An aurora hero with a gradient keyword sweep, a live $NSFW ticker, the ecosystem cards, an AI showcase, a featured creator carousel, a staking call to action, the journey timeline, and a footer with the contract address and one click copy. A globe translate control sits in the navigation.

**Token.** Live price, market cap, volume, and holder count from real market data; the contract address with copy and a PolygonScan link; a "Buy on SushiSwap" call to action; and the utility breakdown. The price chart is gated behind the in app wallet: connect to unlock it, otherwise a clean connect prompt stands in its place.

**Journey, Pleasureland, Legal.** The expanded timeline, the styled metaverse launch surface, and admin editable Privacy, Terms, and Disclaimer pages.

### 6.2 The Platform (authenticated)

**Feed.** The default after sign in. A real stream of followed creators plus the user's own posts. Each post shows the creator header, media with proper gating, the caption, and an engagement bar (like, comment, save, tip), with a tier badge when gated. The Concierge sits bottom right; the top bar holds Smart Search, the translate control, notifications, the wallet, and a menu of secondary destinations.

**Explore.** Top creators ranked by real follower and subscriber counts, categories, and AI recommendations.

**Creator profile.** A cover with parallax, a floating profile card with avatar, verified badge, tagline, social link buttons (Telegram and X), and stats; a visual tier selector with one tap subscribe; tabbed content; a "catch me up" recap; and Follow, Subscribe, Tip, and Message actions.

**Pveels.** A vertical video feed playing real uploaded videos, with a creation studio to record or upload, caption, and choose the audience.

**Marketplace and Staking.** Complete browse, filter, list, stake, and claim experiences, presented as a clear preview until their contracts deploy.

**Messages.** Real time direct messages with an instant send, a people picker for new conversations, and a permission model (everyone, or mutuals only) enforced on the server and re-checked on every message.

**News.** Platform broadcasts that reach the feed, notifications, and email, and that fans can like and comment on.

**Profile and Settings.** Edit profile (avatar, cover, bio, and the Telegram and X links), manage subscriptions and wallet, and a sectioned settings hub. Notification and AI preferences save instantly and take effect immediately; the language setting drives translation; the privacy section controls who can send direct messages; and the danger zone handles data export and account deletion.

### 6.3 Creator Dashboard (for creators)

An overview of subscribers, posts, and earnings; tier management; the Earnings Forecaster; and the content surface. Built on the same data and design system as the rest of the platform.

### 6.4 The Admin Panel

A complete, role gated control room, protected on the server: overview, users, moderation, creator applications, transactions, announcements and broadcasts, live editable legal documents, an AI overview, system health, platform settings (including the fee and a live maintenance mode), a demo data control, the append only audit log, and an internal operations playbook.

---

## 7. Motion and Animation System

The motion language from the original brief is implemented: aurora backgrounds drifting behind every surface, hero text staggers, scroll triggered reveals, card lifts, button micro interactions, animated number tickers, AI responses that stream in, glass toast notifications, and modal scale and blur. Everything is tuned for smooth playback and reduces when a visitor prefers reduced motion.

---

## 8. Services That Power the Platform

Every external service, by role and by environment variable name. Secret values are never written here. All accounts were created under one platform email: **pleasurecoinv2@gmail.com**.

- **AI, Anthropic Claude.** `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`.
- **Database, auth, storage, realtime, Supabase.** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`.
- **Wallet and chain.** `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`, `ALCHEMY_API_KEY`, `ALCHEMY_POLYGON_RPC_URL`.
- **Market data.** `COINGECKO_API_KEY`, `COINMARKETCAP_API_KEY`, `CMC_NSFW_ID`, `GOLDRUSH_API_KEY`, `POLYGONSCAN_API_KEY`, `ETHERSCAN_API_KEY`.
- **Swap.** `ZEROX_API_KEY`, `NEXT_PUBLIC_TREASURY_WALLET`, `NEXT_PUBLIC_SWAP_FEE_BPS`.
- **Email, Resend.** `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_FROM_NAME`.
- **Rate limiting, Upstash.** `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.
- **Bot protection, Turnstile.** `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`.
- **Session signing.** `AUTH_COOKIE_SECRET`.
- **Monitoring and analytics.** `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`.
- **Operations.** `CRON_SECRET`, `NEXT_PUBLIC_APP_URL`.
- **Contracts.** `NEXT_PUBLIC_NSFW_TOKEN_ADDRESS`, `NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS`, `NEXT_PUBLIC_NFT_CONTRACT_ADDRESSES`.

The complete and authoritative list is kept in the repository, in sync with what the platform actually uses.

---

## 9. Security, Privacy, and Compliance

- **Age verification.** Date of birth is captured at signup, required and checked on the server before any gated content, and locked once set so the 18+ attestation cannot be rewritten.
- **Account integrity.** Privileged account fields are protected at the database, so a suspended or banned account cannot reinstate itself or grant itself a role. Bans are enforced at the database, not only in the interface.
- **Wallet security.** Private keys are never stored. Signed messages use a single use, time bounded challenge verified on the server, and every transaction is user initiated.
- **Gated media.** Subscriber only media lives in a private store and is served only through short lived signed links after a server side entitlement check.
- **Privacy and data rights.** Row level security on every table. Users can export everything or delete their account entirely.
- **Keys and secrets.** Every secret lives in environment variables, never in the codebase, never exposed to the browser.
- **Rate limiting.** Every sensitive path is throttled: sign in and sign up, password reset and email resend, the human and username checks, tips, uploads, data export, translation, and the daily AI limits.

---

## 10. Performance and Quality

The product is mobile first, meets WCAG AA color contrast, supports full keyboard navigation, and respects reduced motion, with animation tuned for smooth playback. Final device by device performance metrics (Lighthouse, load and layout stability, interaction latency) should be measured against the production deployment as the closing step.

---

## 11. Build Status

Everything that touches the user is built and wired to real data. The platform, the marketing site, the creator tools, messaging, the five AI features, translation, the admin panel, the security layer, and both documentation sets are complete. Every integration the platform relies on is connected: the database and authentication, the AI, the swap, email, rate limiting, bot protection, market data, and the wallet layer. The platform is complete and to a professional standard.

---

## 12. What We Need From You, and What Is Pending

None of these block the platform from running today. They finish the last mile.

1. **Run the database migrations.** Three new migrations from this build are ready to apply and are committed to the repository.
2. **Production environment scope.** Confirm every required key is set on Production, not only Preview. In particular `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` and `ALCHEMY_API_KEY` were Preview only, and `NEXT_PUBLIC_APP_URL` must point at the real production URL for the auth emails to work.
3. **Staking contract address and ABI.** The staking surface activates the moment this lands.
4. **NFT contract addresses and ABIs.** The same for the marketplace.
5. **Treasury and fee decisions.** Confirm the treasury wallet and the platform fee percentage, both already configurable.
6. **Final platform name and domain.** Confirm the deployment target.
7. **Brand assets.** High resolution logo files if available, otherwise the existing mark is recreated cleanly.

### One note on payments

Subscription and tip recording is idempotent and stores the real amount paid. As the recommended next enhancement, the server should verify the on chain receipt directly, confirming the transfer, the amount, and the recipient, rather than relying on the submitted transaction reference. It is straightforward to add and is the next security step on the roadmap.

---

## 13. Closing

The platform is built, and to a high standard. One unified, modern, secure product that realizes the vision: the creator economy, the social experience, the token, the swap, the marketplace, the staking, the messaging, translation, and a real AI layer, all in one place and all working together. Where the old experience was fragmented, this is one product with one identity.

It is also a foundation, not a finish line. We can keep building toward your vision, take on new feature ideas as they come, and make any correction or adjustment you want. Tell us where you want it to go next.

---

## 14. Appendix: Naming Inventory

- Project codename: Aurora.
- Platform: Pleasure Coin V2, the unified platform.
- Token: $NSFW, unchanged, on Polygon.
- AI persona: Aura. Friendly, confident, never crude.
