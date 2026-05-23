# Project Aurora — Mid-Build Update (Navigation, Onboarding, Docs, Logo)

> Clarifications the owner sent after the build was underway. These are
> additive requirements folded into the plan. Where they affect already-built
> work (especially navigation), the existing flow was reworked in place — not
> duplicated.

## 1. Navigation Flow Correction — Discovery first, then Feed

- After login, the default landing surface is **Explore / Discovery**, not the
  Feed.
- Discovery is the front door: trending, creators, categories, what pulls users
  in.
- Feed is one tap away in primary nav; it holds followed-creator content.
- Brand-new user with an empty follow graph: the Feed gracefully encourages
  them back to Discovery ("Your feed is quiet. Discover creators you'll love"
  with a button to Explore).
- Nav order reads Discovery as home base.

## 2. Full Direct Messaging System (added to MVP)

- `/messages` route, auth-gated.
- Conversation list (left desktop, full-screen mobile): avatar, name, last
  message preview, unread badge, timestamp.
- Thread view: message bubbles, glass-morphism, send box, typing states.
- Real-time delivery via Supabase Realtime.
- Text messages at MVP; clean labeled extension path for media + tips-in-DM
  (post-MVP).
- DB: `conversations (id, participant_a, participant_b, last_message_at,
  created_at)` and `messages (id, conversation_id, sender_id, body, media
  jsonb [post-MVP, null at MVP], read_at, created_at)`.
- RLS: a user can only read conversations they participate in.
- Creator Co-Pilot "reply suggestions" wire to this REAL messaging surface,
  not a mock.
- Messages icon with unread count in the platform top bar.

## 3. First-Time User Onboarding Card Flow (added)

- 15 cards total: **10 large full-screen immersive cards** (platform, feel,
  core idea, social experience, creators, subscriptions, tipping, AI features,
  token utility, community) then **5 smaller how-to cards** (follow, subscribe,
  tip, Smart Search, finding your way).
- Reveal slowly, one card at a time, smooth transitions. Swipeable on mobile,
  arrow/click on desktop. Progress indicator. Skip option, but make it good
  enough that people finish.
- Cinematic: aurora backgrounds drifting, 3D icons floating, staggered text
  reveals. The "trailer" for the platform.
- Persist completion in `user_preferences` (`onboarding_completed boolean`) so
  it shows once. Replayable from Settings.
- Real copy for all 15 cards — no placeholders. Brand voice: confident, warm, a
  little playful, never crude.

## 4. Full Documentation Area (added)

- Route `/docs`, publicly accessible, linked from Settings + footer.
- Left sidebar nav, main content area (Clash Display headings, Inter body).
- Sections (min): Getting Started, How the Feed & Discovery Work, Following &
  Subscriptions, Tipping & $NSFW, Becoming a Creator, Creator Tools & Co-Pilot,
  Staking, The NFT Marketplace, Using the AI Features, Wallet & Security, FAQ.
- Search within docs. Aurora-styled but readable. Glass cards for
  callouts/tips/warnings. Real, detailed content — no lorem ipsum. Smooth
  scroll, anchored headings, right-rail "on this page" ToC on longer pages.

## 5. The Real Logo (action required)

- Owner provides the real logo; white background must be removed (clean
  transparent PNG, plus SVG if vectorizable). Picture-perfect, no fringe/halo.
- Place in `apps/web/public/brand/logo/`: `logo-full.svg`, `logo-full.png`,
  `logo-mark.png`, and a white/monochrome version for dark surfaces.
- `<Logo />` component with full-lockup and mark-only variants.
- Place everywhere: marketing header, platform top bar, footer, login/signup,
  onboarding cards, loading screens, favicon, OG/social share images, PWA icon.
- If the file isn't dropped in yet, label `<Logo />` with
  `PENDING_REAL_LOGO_ASSET` and use a clean placeholder mark in brand colors,
  then swap when the file arrives.

## 6. UI / UX Elevation (overarching)

The entire frontend must feel 10x beyond the current platform. 2030. Another
world. Next-gen animated aurora backgrounds throughout (always subtly moving).
Every surface lucrative, polished, alive. Motion on everything per the spec.
Gliding transitions between surfaces. Premium creator-economy feel — rich
cards, depth, glow, glass, cinematic transitions. Hold 60fps and the perf
targets. The UI is the differentiator: in the first three seconds it must be
obvious this is a different league.
