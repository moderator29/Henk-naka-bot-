# Pleasure Coin

### A Realized Product Document for Tim and Paul

---

## The short version

You asked for one platform where a creator economy, a social network, an NFT
marketplace, staking, a real token, and direct messaging all live under one
roof and behind one sign in. That platform is built. Not a prototype, not a
slide deck, not a set of disconnected demos. A single, production grade product
where a person signs in once and the entire ecosystem opens at the same moment.

Where the old experience was fragmented, a token over here, a chat somewhere
else, content on a third site, this is unified. The feed, the creators, the
NFTs, the staking, the $NSFW token, the swap, the messages, and a layer of
genuinely useful AI are one continuous product with one identity, one wallet,
and one calm, modern design language inspired by the best of Linear, Apple,
Vercel, and Stripe.

This document walks through everything that is built, why it is built the way
it is, what is live right now, and how ownership transfers cleanly to you.

---

## Why this is different

Most platforms in this category do one thing and bolt the rest on. A creator
site that later tacks on a token. A token project that later tacks on a feed.
The seams always show. Pleasure Coin was built the other way around, as one
system from the first line:

- **One account, one wallet, one session.** Sign in with email or with your
  wallet, and subscriptions, tips, NFT purchases, staking, and the swap all use
  the same connected wallet and the same identity.
- **Real data, everywhere.** Posts, follows, likes, comments, subscriptions,
  tips, messages, notifications, and creator rankings are all real and live.
  Nothing on the platform is mock or placeholder content.
- **Restraint as a feature.** Subtle animated aurora behind every surface,
  glass cards, calm motion, generous whitespace. It feels expensive because it
  is deliberate, and it is built mobile first, accessible, and tuned for smooth
  motion.

---

## The full platform, feature by feature

### Accounts and wallet authentication
Two ways in. Email and password with confirmation and recovery, or wallet
sign in using Sign In With Ethereum. Wallet sign in is a single signature, no
password required: the platform issues a one time, time bounded nonce, you sign
it, and the signature is verified on the server before a real session is
minted. First time wallet users complete a short profile setup with an age
check; returning wallets go straight in. The platform is strictly 18+, and that
is verified on the server every time gated content loads, not just hidden in
the interface.

*Why it is exceptional:* most platforms treat wallet login as a bolt on. Here
it is a first class path that creates a genuine, secure session, and both
methods can belong to one account.

### Profiles and social links
An X style profile with cover and avatar editing, live preview, a bio, and tabs
for posts, media, and likes. Followers and following are tappable lists with
follow back. Creators get a Message button. Profiles now carry optional
**Telegram and X links**, entered as a handle or a full URL, validated and
tidied on the server, and shown as clean buttons so fans can follow a creator
everywhere they exist.

### The feed and posting
A real feed of real posts, newest first, drawn from the creators a person
follows plus their own posts. Posting supports four audience levels that map to
exactly how this category works: **public, free members, followers, and
subscribers.** Media for gated posts is never exposed as a public link; it
lives in a private store and is served only through short lived signed URLs
after the server confirms the viewer is entitled, for example an active
subscriber. Likes, comments, saves, and tips are all real and persisted, and
the relevant person is notified live.

### Pveels, short video
A vertical, full screen short video surface with its own creation studio:
record or upload, add a caption, choose the audience, and publish. It plays the
real videos creators post, with an honest empty state until they do.

### Subscriptions and the flagship tier
Creators define subscription tiers priced in plain US dollars, for example a
$20 flagship tier, and fans pay on chain in $NSFW, converted at the live token
price at checkout. Fans manage and cancel from one place and keep access
through the end of the period they paid for. Recording is idempotent, the same
confirmed transaction is never double counted, and re subscribing extends the
existing period rather than stacking duplicates. Because payouts settle
directly to the creator's wallet on chain, there is no platform held balance to
disburse.

### Tips
One tap appreciation, paid on chain in $NSFW directly to the creator, from a
post or a profile, with the creator notified instantly.

### Messaging
Real time direct messages with an optimistic send and live delivery. A new
conversation people picker searches real users. Privacy is enforced on the
server, not just in the interface: a creator can accept messages from everyone
or only from people they follow back, and that rule is re checked on every
single message, not only when a thread is first opened.

### Search
Two complementary ways to find anything. A **Smart Search** bar that takes plain
language, for example "creators under 1k who post weekly," interprets it with
AI, and returns real results that link straight to the creator. And a fast
keyword search page across people, posts, and Pveels that respects blocks.

### The $NSFW token and the in app swap
$NSFW is the ERC-20 on Polygon that powers everything: subscriptions, tips,
marketplace purchases, and staking. The Token page shows live price, market
cap, volume, and a price chart from real market data. The chart is gated behind
the in app wallet, the same wallet used everywhere else, so the trading view is
tied to the wallet a person actually transacts with. An **in app swap**, powered
by a live 0x quote and executed in the user's own wallet, lets people acquire
$NSFW without leaving the platform.

### The NFT marketplace and staking
Both surfaces are fully designed and built: browse, search, and list art on the
marketplace; stake $NSFW on a fixed lock with reward tracking on the staking
dashboard. These are the two features that wait on their on chain contracts to
deploy, and they are framed honestly in the product as a clear preview until
then. Everything around the single on chain call is finished and ready to
activate the moment the contract addresses land.

### The five AI features
A layer of AI that does real jobs, not a chatbot in a corner. Each one runs on
the server, never exposes the model to the browser, carries a hard safety floor
appended to every prompt, and degrades honestly if its key is ever absent.

1. **Aura, the Concierge.** Builds and refines a fan's feed through
   conversation, with a fresh chat and image input.
2. **Smart Search.** Turns natural language into real, structured queries.
3. **Creator Co-Pilot.** Suggests on brand replies to fan messages.
4. **Earnings Forecaster.** Reads a creator's real six month projection and
   writes a grounded, plain language take, with no hype and no financial
   promises.
5. **Subscription Intelligence.** Pulls a creator's recent posts and writes a
   short, accurate "since your last visit" recap for returning fans.

### Translation
The entire platform translates itself on demand into a dozen languages, from a
globe control in the app header, in the marketing navigation, on the landing
page, in the docs, and from the language setting. The visible page is rewritten
in place, right to left languages flip the layout automatically, and switching
back to English restores the original exactly. This opens the platform to a
worldwide audience without a separate localized build.

### Settings
A clean, sectioned hub: edit profile, account, privacy and message permissions,
notifications and AI, subscriptions, creator tools, wallet and security,
content and safety, password, help, legal, and a danger zone. Toggles save the
instant they are flipped, and they genuinely take effect: turn off an AI
feature and it disappears from the interface; turn off a notification type and
it stops arriving.

### The admin panel
A complete, role gated control room at /admin, protected on the server, not
just hidden: overview, users, moderation, creator applications, transactions,
announcements and broadcasts, live editable legal documents, an AI overview,
system health, settings including the platform fee and a live maintenance mode,
a demo data control, an append only audit log, and an internal operations
playbook. Every sensitive action is logged.

### Security
Security was treated as a feature, not an afterthought:

- Row level security on every table, so people read only their own data.
- A database guard that freezes privileged fields on a user's own row, so a
  suspended account cannot un-suspend itself or grant itself a role. Bans are
  enforced at the database.
- Gated media served only through short lived signed URLs after a server side
  entitlement check.
- Wallet signatures verified on the server with single use, time bounded
  nonces, so replay is not possible.
- Rate limiting on every sensitive path: sign in, sign up, magic link,
  password reset, the human and username checks, tips, uploads, data export,
  translation, and per user daily AI limits.
- Server side validation on every action, the service role key never reaching
  the browser, an open redirect closed on the auth callback, and no secrets in
  the repository.

### Documentation
Two complete, current documentation sets ship with the product: a detailed,
designed public docs site that walks users through every feature, and an
internal admin playbook that covers operations, moderation, integrations by key
name, roles, the audit log, and everything added in this build.

---

## How it compares to the category leaders

- Against **OnlyFans, Fanvue, and Patreon** on the creator and monetization
  side: the same subscription, tip, and gated content model, with on chain
  settlement that pays creators directly and no platform float, plus an AI
  layer those platforms do not have.
- Against **TikTok, Instagram, and X** on the social side: a real feed, short
  video in Pveels, profiles, real time messaging with proper permissions, and
  search, in the same product as the monetization.
- And it adds what none of them combine in one place: a real utility token, an
  in app swap, staking, an NFT marketplace, and on demand translation across
  the whole experience.

---

## What is live now, and what is ready to activate

**Live now.** Accounts and wallet sign in, profiles and social links, the feed
and all four post audiences, gated media, Pveels, subscriptions and tips on
chain, real time messaging, search, the live token data and the in app swap,
all five AI features, translation, settings, the full admin panel, the security
layer, and both documentation sets. Every integration the platform relies on is
connected: the database and auth, the AI, the swap, email, rate limiting, bot
protection, market data, and the wallet layer.

**Ready to activate.** The NFT marketplace and staking are complete experiences
waiting only on their on chain contracts. When the contract addresses are
deployed and set, the single pending call in each lights up with no further
work. This is a deliberate, clean boundary, not an unfinished feature.

The build is complete and built to a professional standard.

---

## Access and ownership

Everything is new, clean, and ready to hand to you.

**Platform account.** Every account and API was created under one platform
email: **pleasurecoinv2@gmail.com**.

**Services that power the platform**, by key name only (the values are secrets
and are never written here):

- AI: `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`
- Database, auth, storage, realtime (Supabase): `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`
- Wallet and chain: `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`, `ALCHEMY_API_KEY`,
  `ALCHEMY_POLYGON_RPC_URL`
- Market data: `COINGECKO_API_KEY`, `COINMARKETCAP_API_KEY`, `CMC_NSFW_ID`,
  `GOLDRUSH_API_KEY`, `POLYGONSCAN_API_KEY`, `ETHERSCAN_API_KEY`
- Swap: `ZEROX_API_KEY`, `NEXT_PUBLIC_TREASURY_WALLET`, `NEXT_PUBLIC_SWAP_FEE_BPS`
- Email (Resend): `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_FROM_NAME`
- Rate limiting (Upstash): `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- Bot protection (Turnstile): `NEXT_PUBLIC_TURNSTILE_SITE_KEY`,
  `TURNSTILE_SECRET_KEY`
- Session signing: `AUTH_COOKIE_SECRET`
- Monitoring and analytics: `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN`,
  `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`
- Operations: `CRON_SECRET`
- Contracts: `NEXT_PUBLIC_NSFW_TOKEN_ADDRESS`,
  `NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS`, `NEXT_PUBLIC_NFT_CONTRACT_ADDRESSES`

**Passwords.** There is a single password used across the accounts and
services. It will be shared with you privately and in person, not in this
document.

**The code.** The build currently lives on a personal GitHub. A dedicated
GitHub organization for the project can be created and the repository pushed or
transferred to you, so the project lives under your ownership. The personal
accounts are the only thing currently tied to it, and because everything is new
and clean, the handover is straightforward and complete.

---

## Closing

This is built, and it is built well. One unified, modern, secure platform that
realizes the vision you set out: the creator economy, the social experience, the
token, the marketplace, the staking, the messaging, and a real AI layer, all in
one place and all working together.

It is also a foundation, not a finish line. I can keep building toward your
vision, take on new feature ideas as they come, and make any correction or
adjustment you want, quickly and cleanly. Tell me where you want it to go next.
