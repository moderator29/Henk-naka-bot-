# Project Aurora — Session Handoff (current)

> Read this FIRST. The owner usually also sends a fresh prompt for the session —
> wait for it and treat it as the priority instruction set, but everything here
> is the live state of the build. Source docs live beside this file:
> - `docs/project/01-build-prompt-and-rpd.md` (original build prompt + full RPD)
> - `docs/project/02-mid-build-update.md` (nav/messaging/onboarding/docs/logo)
>
> Last updated after commit `4eba2e9` (messaging end-to-end). Always run
> `git log --oneline -1` to confirm the true latest.

## THE OWNER'S RULES (non-negotiable, enforce every commit)

1. **NO AI attribution anywhere** — commits, code, comments, package metadata,
   PR titles/bodies. Commits are authored by the owner. BEFORE YOUR FIRST COMMIT:
   ```
   git config user.name "moderator29"
   git config user.email "Phantomfcalls@gmail.com"
   ```
   Verify every commit shows that author. Do NOT put the model name anywhere
   that gets pushed to the repo.
2. **NO AI "tells" in copy.** No em-dashes (—), no spaced hyphens used as
   dashes, no double underscores in user-facing text. Warm, human prose
   (commas, periods). A sweep already removed them; do not reintroduce.
3. **The OWNER runs ALL SQL in Supabase.** You ONLY ever commit `.sql` files to
   `supabase/migrations/` (and mirror into `supabase/schema.sql`). NEVER execute
   DDL. NEVER call the Supabase MCP — a non-owner Supabase MCP is connected in
   this environment; ignore it completely.
4. **Branch + sync.** Develop on the designated branch the owner gives you
   (most recently `claude/zen-newton-NVqhQ`), build, verify, then push to that
   branch AND fast-forward `main` AND `claude/setup-pleasure-coin-v2-54I9T`
   (the default branch Vercel deploys). All three stay in sync.
5. **No fake data masquerading as real.** Demo/sample content is allowed (owner
   asked for it to feel the vibe) but must be clearly labeled ("Demo"/"Preview")
   and only shown when live data is empty (`is_demo` / `isPreview`). Stubs carry
   `PENDING_*` labels. Never present fabricated numbers as real.
6. **ALWAYS keep Vercel green.** Before every push run, in order:
   typecheck + test + build. Build must say "Compiled successfully" with no
   errors. From `apps/web`: `npx tsc --noEmit` · `npx vitest run` · `npm run build`.
   (Monorepo equivalents: `pnpm turbo run typecheck`, `pnpm --filter web test`,
   `pnpm --filter web build`.)
7. TypeScript strict, no `any` without justification. Mobile-first. WCAG AA.
   `prefers-reduced-motion` respected. Real integrations only, env-gated.
8. **Audit each change against the RPD/prompts before pushing** — not just
   typecheck. The owner has flagged shallow audits before; go deep.
9. Maintain a live TODO inline in every message. Work autonomously; don't stop
   mid-task to checkpoint unless you hit a real blocker or a risky action.

## THE DESIGN QUALITY BAR (every screen)

Sleek and restrained. The standard is Linear, Apple, Vercel, Stripe — not a
flashy crypto site. Subtle aurora only (accent, never the main event; it keeps
moving gently even under reduced-motion via the `.aurora-blob` exemption).
In-app feel first: a polished native product, not a marketing page. Generous
whitespace, calm typography, quiet motion, tight consistent spacing. When in
doubt, do less.

## VERCEL TRAPS already hit + fixed (do not repeat)

- **Server Components must NOT pass function props to Client Components.** Crashes
  prerender on Vercel (passes locally because the sandbox can't reach CoinGecko,
  so the data path never renders). `StatTicker` takes a serializable
  `formatPreset` string, not a `format` fn. Apply the same pattern anywhere a
  server page feeds a client widget.
- **`"use server"` files may ONLY export async functions.** Types/constants in a
  server-action file break the build ("Failed to collect page data"). Put shared
  types in a plain module (e.g. `lib/engagement/types.ts`, `lib/profile/settings.ts`).
- **`Record<Union, ...>` maps must cover every union member.** Adding a
  `NotificationType` means updating BOTH icon maps (`NotificationsBell.tsx` and
  `notifications/page.tsx`).
- **React 18 here** — `useFormState`/`useFormStatus` (react-dom), NOT
  `useActionState`. **RainbowKit + wagmi v2** (not v3); `viem/siwe` for SIWE.
- **`noUncheckedIndexedAccess` is on** — `arr[0]` is `T | undefined`; assert
  (`arr[0]!`) only when you know it's populated (e.g. after a length check).
- Watch top-level-declaration order in modules (a TDZ bug shipped once:
  `let order = 0` was used by `DEMO_LISTINGS` before it was initialized).
- Optional wallet deps + OpenTelemetry warnings are silenced in
  `apps/web/next.config.mjs`. Keep the build warning-free.
- CoinGecko public price/OHLC endpoints need NO API key (work on Vercel keyless).

## REPO + STACK

- Repo: `moderator29/Henk-naka-bot-`. Working dir `/home/user/Henk-naka-bot-`.
- pnpm + turbo monorepo: `apps/web` + `packages/{design-system,contracts}`.
- Next.js 14 App Router · TS strict · Tailwind · Supabase (Auth/Postgres/RLS/
  Storage/Realtime) + Drizzle mirror · wagmi v2 + RainbowKit + viem (Polygon) ·
  Framer Motion · Recharts · Anthropic SDK · Upstash · Resend · Sentry + PostHog
  · Vitest + Playwright.
- Baseline: **tsc 0 errors · 124 unit tests pass (26 files) · build compiles green.**

## DONE (merged to main + deploy branch + dev branch)

**Foundation:** monorepo, design tokens, brand primitives (AuroraBackground,
GradientText, Logo, BrandIcon), base UI (Button, Card, Input, Modal, Toast,
Skeleton, StatTicker, ScrollReveal, SkipToContent), layout shells, page
transitions, `app/error.tsx`, `app/not-found.tsx`.

**Auth (fully working when env is set):** email+password, Google OAuth, **SIWE
wallet sign-in that mints a real Supabase session** (`/api/auth/verify` →
admin magiclink → verifyOtp writes cookies). 18+ age gate (DOB, `requireAdult`),
middleware route gating (`PROTECTED_PREFIXES` → `/login?next=`), Turnstile on
verify/sign-in/sign-up with real server-side siteverify + signed human-check
cookie. Branded Supabase auth email HTML delivered to owner. `/verify` cinematic
gate; the "Having trouble? Continue" bypass was removed.

**Platform shell:** glass NavRail (Home leftmost, Discover second), top context
bar, layered content panel, **mobile bottom tab bar incl. Pveels**. Default
landing is Home (Feed).

**Surfaces:** Explore (real trending + demo fallback), Feed (real posts + demo
fallback, PostCard with real like/save/comment + on-chain tip), flagship
`/creators/[username]` (now with a working **Message** button), `/messages`
(real Supabase Realtime DMs — see below), `/notifications` + bell, `/profile`
(real data, tabs, edit-profile + avatar upload, settings/filters), `/compose`
(real post creation: caption + emoji + image/file upload → posts + `post-media`),
`/pveels` reels, `/staking` (typed mock until contract addr), `/marketplace`
(typed mock), `/trade` (full $NSFW terminal: real CoinGecko candlestick chart +
live price, wallet-connect swap via 0x, treasury fee), `/pleasureland`,
`/token`, `/journey`, `/docs` (long, covers everything), legal pages
(`/legal/{terms,privacy,dmca}`).

**Engagement:** real follow/like/save/comment writes under RLS;
notification creation (writes `actor_name` into payload); on-chain $NSFW tips
(wagmi ERC-20 transfer) + tip notifications.

**Messaging (commit `4eba2e9`, end-to-end):** Realtime socket is now authorized
with the user's JWT before subscribing (RLS no longer drops events);
`startConversation` finds-or-creates the canonical pair; Message button on
creator profiles opens the thread; `markConversationRead` clears receipts on
view; inbox resolves peer profile + last-message preview + real unread counts.

**AI (5 cornerstones wired, honest 503 until `ANTHROPIC_API_KEY` set):**
Discovery Concierge (streaming), Smart Search, Co-Pilot reply suggestions,
Creator Dashboard + **Earnings Forecaster**, **Subscription Intelligence**
(Catch-Me-Up summary + renewal-reminder cron + Resend emails). Shared AI
plumbing: env-gated client, Upstash rate limits, SSE, Zod schemas, versioned
prompts. AI routes are auth + rate-limit guarded.

**Landing additions:** 18+ age-gate welcome card, "Pleasure Network … powered by
Pleasure Coin ($NSFW)" mission band, 69B total supply (landing + docs),
enriched Ecosystem (Pleasurely/PleasureNifty bullets, no "Visit" buttons),
12-week staking rules. "Project Aurora" text removed from landing.

**Email:** `lib/email/resend.ts` (welcome / password-changed / account-deletion /
renewal / creator-post), all env-gated REST.

**Observability + tests:** Sentry + PostHog env-gated; Vitest (124) + Playwright.

## AUDIT STATUS (answers "was messaging all the errors?")

NO — messaging was one (the largest, Critical) deferred batch, not the whole
audit. ~18 audit agents ran across the platform. **Most findings were fixed in
commit `b2218ac`** ("resolve audit findings across the platform", 34 files).
Messaging was deferred from that batch and fixed in `4eba2e9`. The items in
"NOT DONE / DEFERRED" below are the remaining known gaps the audit surfaced or
that are honestly still open. There is no claim that the codebase is bug-free —
it is **green** (typecheck/tests/build) and the known functional gaps are listed.

## NOT DONE / DEFERRED (next up, priority order)

1. **Feed media never renders.** `lib/posts/queries.ts` `SELECT` omits `media`,
   and `FeedPost`/`mapRow` have no media field — uploaded post images never show
   in the feed. Add `media` to the select, the `PostRow` type, `FeedPost`, and
   render it in `PostCard`. (Compose DOES upload to the `post-media` bucket; the
   read side just drops it.)
2. **Perf / bundle:** wagmi + RainbowKit live in the root `app/providers.tsx`,
   so the wallet bundle ships on marketing pages too. Move wallet providers to a
   platform-only boundary, dynamic-import the Recharts/candlestick chart, and
   reduce stacked `backdrop-filter` layers.
3. **Compose upload validation:** `lib/posts/actions.ts` accepts files with only
   a `size > 0` check — add max-size + MIME/type allowlist (images/video) before
   upload.
4. **Per-message read ticks:** unread COUNTS now work, but sent bubbles don't
   show a "Read" indicator (`getThreadMessages` doesn't select `read_at`). Thread
   `read_at` through if you want read receipts on individual bubbles.
5. **Account deletion** uses a typed-phrase confirm (kept intentionally for
   OAuth/wallet users), no password re-auth. Add re-auth for password users if
   desired.
6. **Misc polish from audit:** a few low-contrast `lilac/40–50` text spots;
   Journey "SURVIVED" stamps; marketing nav "Staking" bounces logged-out users
   to login (expected, but could deep-link).
7. **Brand assets (BLOCKED on tooling/network):** square favicon + apple-icon +
   opaque iOS icon, real logo-mark crop, real `opengraph-image` (the source logo
   is non-square 854×666 and there's no image tooling / allowlisted network in
   the sandbox). Owner must supply square assets or open the network.
8. **Staking + NFT marketplace live wiring** — BLOCKED on contract addresses
   (`PENDING_CONTRACT_ADDRESS`). UIs built against typed mocks. Also missing: NFT
   detail page, My NFTs tab, token-page holder-distribution visual.

## DATABASE — migration status

All in `supabase/migrations/` (owner runs them; also mirrored in
`supabase/schema.sql`):
- `0001_initial_schema` · `0002_messaging` · `0003_onboarding` ·
  `0004_auth_user_trigger` · `0005_demo_flags` · `0006_user_names`
  (first/last + updated `handle_new_auth_user` trigger) · `0007_user_settings`
  (settings jsonb) · `0008_delete_cascades` (tip/subscription/post FK cascades).

**Owner must run any not-yet-applied migrations — at minimum confirm 0005–0008
are applied.** No new SQL is required for the messaging fix (0002 already has the
canonical-pair index + recipient mark-read RLS).

## OWNER ACTION ITEMS (so things work live)

- **Run migrations** `0001`–`0008` in Supabase (confirm 0005–0008 applied).
- **Storage buckets** (public): `post-media`, `avatars`.
- **Supabase Auth:** enable "Confirm email"; paste the branded email templates.
- **Turnstile:** add domains (the deploy domain, `*.vercel.app`, `localhost`) in
  the Cloudflare dashboard.
- **Env keys** (Vercel — see `.env.example`; names below are exact, do not
  rename `GOLDRUSH_API_KEY` / `ZEROX_API_KEY`):
  - Core: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
    `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `NEXT_PUBLIC_APP_URL`.
  - AI: `ANTHROPIC_API_KEY` (+ optional `ANTHROPIC_MODEL`),
    `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.
  - Auth/security: `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`,
    `CRON_SECRET`.
  - Wallet/chain: `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`, `ALCHEMY_API_KEY`,
    `ALCHEMY_POLYGON_RPC_URL`.
  - Trade: `NEXT_PUBLIC_TREASURY_WALLET`, `NEXT_PUBLIC_SWAP_FEE_BPS`,
    `ZEROX_API_KEY` (0x dashboard.0x.org), `GOLDRUSH_API_KEY` (GoldRush
    Foundational API, Direct access), optional `COINGECKO_API_KEY` /
    `COINMARKETCAP_API_KEY` + `CMC_NSFW_ID`.
  - Email: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_FROM_NAME`.
  - Observability (optional): `NEXT_PUBLIC_SENTRY_DSN`, `NEXT_PUBLIC_POSTHOG_KEY`,
    `NEXT_PUBLIC_POSTHOG_HOST`.
  - Contracts when ready: `NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS`,
    `NEXT_PUBLIC_NFT_CONTRACT_ADDRESSES`.
- **Brand assets:** drop square favicon/apple-icon/og-image + processed logo into
  `apps/web/public/brand/` and flip the manifest flags.
- Demo content toggles off with `NEXT_PUBLIC_DISABLE_DEMO=1`.

## HOW TO RESUME

```
cd /home/user/Henk-naka-bot-
git config user.name "moderator29" && git config user.email "Phantomfcalls@gmail.com"
git fetch origin
git checkout claude/zen-newton-NVqhQ && git pull --ff-only origin claude/zen-newton-NVqhQ
pnpm install
cd apps/web && npx vitest run        # confirm green baseline (124)
# build a change → tsc → vitest → build → commit (owner author) →
# push dev branch, then fast-forward main + claude/setup-pleasure-coin-v2-54I9T
```
Recommended next task: **feed media rendering (#1)** — small, high-impact, and
unblocks real uploaded images showing in the feed. Then the perf/bundle split (#2).
