# Project Aurora — Session Handoff (COMPLETE, current)

> Read this FIRST. The owner is also sending you a fresh prompt this session —
> wait for it and treat it as the priority instruction set, but everything in
> here is the live state of the build. The two source docs live beside this
> file:
> - `docs/project/01-build-prompt-and-rpd.md` (original build prompt + full RPD)
> - `docs/project/02-mid-build-update.md` (nav/messaging/onboarding/docs/logo)

## THE OWNER'S RULES (non-negotiable, enforce every commit)

1. **NO AI attribution anywhere** — commits, code, comments, package metadata.
   Commits are authored by the owner. BEFORE YOUR FIRST COMMIT run:
   ```
   git config user.name "moderator29"
   git config user.email "Phantomfcalls@gmail.com"
   ```
   Verify every commit shows that author.
2. **NO AI "tells" in copy.** The owner specifically flagged em-dashes (—),
   spaced hyphens used as dashes, and double underscores in user-facing text.
   Do not use em-dashes. Keep prose warm and human (commas, periods). A sweep
   already removed them; do not reintroduce.
3. **The OWNER runs ALL SQL in Supabase.** You only ever commit `.sql` files to
   `supabase/migrations/`. NEVER execute DDL, NEVER call the Supabase MCP
   (a non-owner Supabase MCP is connected in this environment — ignore it).
4. **Branch-per-work-unit, merge in batches.** Create `claude/aurora-<name>`
   off the LATEST state, build, verify, then push to `main` AND the default
   branch `claude/setup-pleasure-coin-v2-54I9T` (both must stay in sync — the
   default branch is what Vercel deploys). Owner asked to "merge after ~10
   works"; in practice merge each verified batch.
5. **No fake data masquerading as real.** Demo/sample content is allowed
   because the OWNER explicitly asked for it (to feel the vibe), but it must be
   clearly labeled (a "Demo"/"Preview" marker) and only shown when live data is
   empty. Stubs carry PENDING_* labels.
6. **ALWAYS keep Vercel green.** Before every merge run, in order:
   `pnpm turbo run typecheck` + `pnpm --filter web test` +
   `pnpm --filter web build`. The build must say "Compiled successfully" with
   no errors. Watch for the classic trap (below).
7. TypeScript strict, no `any` without justification. Mobile-first. WCAG AA.
   `prefers-reduced-motion` respected. Real integrations only, env-gated.
8. Audit each branch against the RPD before pushing (not just typecheck).
9. Maintain a live TODO inline in every message. Don't stop until complete.

## THE DESIGN QUALITY BAR (non-negotiable, applies to every screen)

Sleek and restrained. The standard is Linear, Apple, Vercel, and Stripe, not a
flashy crypto site. Subtle aurora only (it is an accent, never the main event).
In-app feel comes first: the platform should feel like a polished native
product, not a marketing page. Generous whitespace, calm typography, quiet
motion (respect prefers-reduced-motion), tight and consistent spacing. When in
doubt, do less. Polish over spectacle on every screen.

## VERCEL TRAPS already hit + fixed (do not repeat)

- **Server Components must NOT pass function props to Client Components.**
  This crashes prerender on Vercel (it didn't locally because the sandbox can't
  reach CoinGecko, so the data path never rendered). `StatTicker` uses a
  serializable `formatPreset` string instead of a `format` fn from server
  components. Apply the same pattern anywhere a server page feeds a client
  widget.
- **React 18 here** — use `useFormState`/`useFormStatus` (react-dom), NOT
  `useActionState` (React 19).
- **RainbowKit needs wagmi v2** (not v3). `viem/siwe` for SIWE helpers.
- Optional wallet deps (`@react-native-async-storage/async-storage`,
  `pino-pretty`, `lokijs`, `encoding`) and OpenTelemetry warnings are silenced
  in `apps/web/next.config.mjs` (webpack externals/alias false + ignoreWarnings).
  Build is warning-free; keep it that way.
- CoinGecko public price endpoint needs NO API key (works on Vercel keyless).

## REPO + STACK

- Repo: `moderator29/Henk-naka-bot-`. Working dir `/home/user/Henk-naka-bot-`.
- `main` and `claude/setup-pleasure-coin-v2-54I9T` (default/deploy branch) are
  kept in sync and hold the full project.
- pnpm + turbo monorepo: `apps/web` + `packages/{design-system,contracts}`.
- Next.js 14.2.35 App Router · TS strict · Tailwind (preset in design-system)
  · Drizzle + Supabase · wagmi v2 + RainbowKit + viem (Polygon) · Framer Motion
  · Recharts · Anthropic SDK · Sentry + PostHog · Vitest + Playwright.

## DONE (all merged to main + deploy branch)

**Foundation/infra:** monorepo, design tokens, brand primitives
(AuroraBackground w/ mouse parallax + ambient particles, GradientText, Logo
w/ PENDING_REAL_LOGO_ASSET placeholder, BrandIcon w/ PLACEHOLDER_PENDING_3D_ASSETS),
base UI (Button, Card, Input, Modal, Toast, Skeleton, StatTicker, ScrollReveal,
SkipToContent), layout shells, page transitions (app/template.tsx).

**Data:** full Drizzle schema + migrations `0001`–`0004` (schema+RLS+pg_trgm,
messaging, onboarding flag, auth-user trigger). All awaiting OWNER to run.

**Auth:** email+password, Google OAuth, SIWE wallet (server nonce+verify real),
age gate (18+ DOB, requireAdult), middleware session refresh.
**Cloudflare Turnstile:** `/verify` full-page cinematic gate ("Get Started" →
verify → signup), inline Turnstile on sign-in/sign-up with real server-side
siteverify (`lib/auth/turnstile.ts`). Needs `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
+ `TURNSTILE_SECRET_KEY`; dev passthrough until set (PENDING_TURNSTILE_KEYS).

**Wallet:** wagmi+RainbowKit on Polygon, ConnectWallet in top bar, live $NSFW
balance reads (real on-chain).

**Marketing:** full landing (Hero, LiveTicker via CoinGecko/CMC, Ecosystem,
AIShowcase, animated Creators marquee, StakingCTA, Journey), `/token`
(Recharts price chart + timeframe), `/journey`, `/docs` (11 real sections,
sidebar, search, ToC).

**Platform:** Discovery-first nav; **floating bottom nav** (Home · Pveels ·
elevated **+** create · Messages · Profile); Explore (real trending creators +
demo fallback); Feed (REAL posts from followed creators, demo fallback,
animated PostCard w/ like/save micro-interactions); flagship
`/creators/[username]`; `/messages` with Supabase Realtime DMs;
`/notifications` + bell dropdown; `/profile` (real profile/posts/follower
counts, tabs, **edit-profile** w/ avatar upload); `/compose` (REAL post
creation: caption + emoji picker + image/file upload → posts table +
`post-media` storage); **`/pveels`** vertical reels (demo clips, TikTok-style
rail; real video is post-MVP).

**Demo content** (owner-requested, labeled): Pleasure Coin, Tim, Paul, Spiral,
Nova, Aurora in `lib/demo/data.ts`. Toggle off with `NEXT_PUBLIC_DISABLE_DEMO=1`.

**AI (3 of 5 cornerstones live):**
- Discovery Concierge — streaming `/api/ai/concierge` + Aura FAB.
- Smart Search — `/api/ai/search` (Claude parse → Supabase, pg_trgm fallback)
  wired to the top-bar search.
- Creator Co-Pilot reply suggestions — `/api/ai/copilot/replies` on the real
  `/messages` thread.
- Shared AI plumbing: `lib/ai/` client (env-gated), Upstash rate limits, SSE,
  Zod schemas, versioned prompts. 503 (not fake) when ANTHROPIC_API_KEY unset.

**Observability:** Sentry + PostHog, both env-gated. **e2e:** Playwright specs.
**Tests:** 112 unit (Vitest) + e2e specs. Build warning-free.

## NOT DONE (next up, priority order)

1. **Earnings Forecaster** (AI #4, RPD §3.4): `/api/ai/forecast` — stat model
   over last 90d (revenue/cadence/churn/tips) + Claude narrative + scenario
   sliders. Surface on a creator dashboard/earnings panel.
2. **Subscription Intelligence** (AI #5, RPD §3.5): per-creator "since last
   visit" summaries + renewal reminders. Supabase cron (`app/api/cron/*`) +
   Claude + Resend. Wire the creator-profile `CatchMeUpButton`
   (PENDING_AI_SUMMARY) to it.
3. **Creator Dashboard** (RPD §6.3): Overview, Content Studio, Analytics,
   Earnings (+Forecaster), Tiers, Fans, Co-Pilot conversation surface.
4. **Real engagement**: like/save/comment/tip writes to Supabase + on-chain
   tips (wagmi useWriteContract on $NSFW); real follow/subscribe actions.
5. **Staking + NFT marketplace** live wiring — BLOCKED on contract addresses
   from Tim & Paul (PENDING_CONTRACT_ADDRESS). UIs built against typed mocks.
6. Settings panels (notifications/privacy/wallets/AI prefs), content
   moderation queue, GDPR export/delete.
7. Resend transactional email (owner setting it up).

## OWNER ACTION ITEMS (so things work live)

- Run migrations `0001`–`0004` in Supabase (owner runs all SQL).
- Create PUBLIC storage buckets: `post-media` (post images/files) and
  `avatars` (profile pictures).
- Set Vercel env (see `.env.example`): Supabase URL/anon/service + DATABASE_URL,
  ANTHROPIC_API_KEY, Turnstile site+secret, WalletConnect, Alchemy, Upstash,
  Sentry, PostHog, Resend, CoinGecko (optional), CMC (optional).
- Real logo → drop processed files in `apps/web/public/brand/logo/` and flip
  flags in `logo-manifest.ts`. Real 3D icons → `public/brand/icons/` +
  `brand-icon-manifest.ts`. Contract addresses when ready.
- Default branch is `claude/setup-pleasure-coin-v2-54I9T`; optionally rename to
  `main` in GitHub Settings → Branches (cosmetic).

## HOW TO RESUME

```
cd /home/user/Henk-naka-bot-
git config user.name "moderator29" && git config user.email "Phantomfcalls@gmail.com"
git fetch && git checkout main && git pull --ff-only origin main
pnpm install
pnpm --filter web test        # confirm green baseline (112)
git checkout -b claude/aurora-<next-work>
# build → typecheck → test → build → commit → push to main + deploy branch
```
Latest merged commit on main: see `git log --oneline -1`. Always branch off the
newest main.
