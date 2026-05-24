# Project Aurora — Session Handoff

> Paste this into a new session (or just point it here) to continue seamlessly.
> The two source prompts live next to this file:
> - `docs/project/01-build-prompt-and-rpd.md` (build prompt + full RPD)
> - `docs/project/02-mid-build-update.md` (navigation/messaging/onboarding/docs/logo)

## Context

Continuing "Project Aurora" — the Pleasure Coin V2 rebuild. The RPD + build
prompt in this folder are the source of truth. Work is well underway. **Do not
rebuild what exists.**

- **Repo:** `moderator29/Henk-naka-bot-` (scoped to this repo only)
- **Working dir:** `/home/user/Henk-naka-bot-`
- **Default branch:** `claude/setup-pleasure-coin-v2-54I9T` currently holds the
  full project (owner may rename to `main`). A `main` branch also exists with
  identical content through the docs branch.

## NON-NEGOTIABLE RULES (owner enforced)

1. **NO AI attribution** anywhere — commits, code, comments. Commits authored by
   the owner. **BEFORE FIRST COMMIT run:**
   ```
   git config user.name "moderator29"
   git config user.email "Phantomfcalls@gmail.com"
   ```
   Verify every commit shows that author.
2. **Branch-per-work-unit:** create `claude/aurora-<name>` off the latest pushed
   branch, build, verify, push. Owner merges.
3. **AUDIT every branch against the RPD before pushing** — not just typecheck.
4. **No fake data / no mock APIs.** Label every stub: `PENDING_CONTRACT_ADDRESS`,
   `PENDING_SUPABASE_AUTH`, `PENDING_SUPABASE_REALTIME`, `PENDING_WAGMI`,
   `PENDING_WC_PROJECT_ID`, `PLACEHOLDER_PENDING_3D_ASSETS`,
   `PENDING_REAL_LOGO_ASSET`.
5. **TypeScript strict, no `any`** without a justified comment. Mobile-first.
   WCAG AA. `prefers-reduced-motion`.
6. **Maintain TODO inline in every message.** Real content, never lorem ipsum.
7. **Do NOT use the Supabase MCP** (the connected one is not the owner's
   project). Migrations are committed as SQL files for the owner to apply.
8. **VERIFY before every push:** `pnpm turbo run typecheck` + `pnpm --filter web
   test` + `pnpm --filter web build` must all pass.

## Stack notes

Next.js 14.2.35 App Router · TS strict · Tailwind (preset in
`packages/design-system`) · Drizzle + Supabase · wagmi v2 + RainbowKit + viem
(Polygon) · Framer Motion · Vitest. pnpm + turbo monorepo: `apps/web` +
`packages/{design-system,contracts}`. **React 18 — use
`useFormState`/`useFormStatus` (NOT `useActionState`, which is React 19).**
RainbowKit needs wagmi v2 (not v3). `parseSiweMessage`/`verifySiweMessage`/
`createSiweMessage` come from `viem/siwe`.

## DONE & PUSHED (branches, build order)

1. `claude/aurora-foundation-scaffold` — monorepo, design tokens, configs,
   `.env.example`
2. `claude/aurora-brand-and-ui` — AuroraBackground, GradientText, Logo,
   BrandIcon, Button, Card, Input, Modal, Toast, Skeleton + layout shells +
   marketing nav/footer
3. `claude/aurora-supabase-schema` — full Drizzle schema + `0001` migration
   (RLS, pg_trgm, FTS, helpers)
4. `claude/aurora-audit-fixes` — BrandIcon PNG-swap path, aurora mouse parallax,
   skip-to-content, StatTicker, ScrollReveal, more tests
5. `claude/aurora-discovery-and-messages` — Discovery-first nav, `/messages`
   (MessagesShell + ThreadView), `conversations`+`messages` tables (`0002`),
   Logo manifest placeholder
6. `claude/aurora-onboarding` — 15-card flow (`components/onboarding/cards.ts`),
   OnboardingFlow/Gate, `0003` migration (`onboarding_completed`), replay from
   Settings
7. `claude/aurora-audit-fixes-2` — Logo in onboarding + `app/loading.tsx`,
   `icon`/`apple-icon`/`opengraph-image`/`manifest` (PWA), onboarding focus trap
8. `claude/aurora-docs` — `/docs` with 11 real-content sections
   (`app/(docs)/docs/content.ts`), sidebar + search + ToC
9. `claude/aurora-auth-and-age-gate` — email + Google + SIWE, age gate
   (`lib/auth/*`), `requireAdult()`, `0004` auth-user trigger, `middleware.ts`,
   `/login` `/signup` `/check-email`
9b. `claude/aurora-wallet` — wagmi + RainbowKit, `useNsfwBalance` (real
    on-chain read), ConnectWallet in top bar, SIWE button activated, staking
    shows live $NSFW balance.
10. `claude/aurora-project-docs` — `docs/project/` source prompts + this handoff.
11. `claude/aurora-observability` — Sentry (gated on DSN via
    `instrumentation.ts` + `lib/observability/sentry.ts` +
    `app/global-error.tsx`) and PostHog (gated on key via
    `components/analytics/AnalyticsProvider.tsx`; manual pageviews, autocapture
    off). **104 tests passing.**

12. `claude/aurora-realtime-dms` — Supabase Realtime DM delivery
    (`lib/messaging/useRealtimeMessages.ts`, `queries.ts`, `actions.ts`,
    `ThreadContainer`); messages pages now server-fetch + live-subscribe.
13. `claude/aurora-e2e` — Playwright critical-flow specs in `apps/web/e2e/`
    (marketing, auth, docs, platform). Run via `pnpm --filter web e2e:install`
    then `e2e` (browser CDN blocked in this sandbox; runs in CI/locally).
14. `claude/aurora-landing` — full landing sections (Hero, LiveTicker w/ real
    CoinGecko+CMC via `lib/market/token-stats.ts`, Ecosystem, AIShowcase,
    CreatorsCarousel, StakingCTA, Journey).
15. `claude/aurora-token-page` — `/token` (Recharts PriceChart w/ timeframe
    selector + `/api/market/price-history`, real metric cards) and `/journey`.
16. `claude/aurora-creator-profile` — flagship `/creators/[username]`
    (CreatorHeader parallax + counters, TierSelector, ContentTabs,
    CatchMeUpButton). Real Supabase data via `lib/creators/queries.ts`, else a
    labeled `SAMPLE_PREVIEW_DATA` preview behind a visible banner.

17. `claude/aurora-explore-notifications` — Explore real content
    (`lib/explore/*`: trending creators + recent posts, category grid, For-You
    rail) and notifications (`lib/notifications/*`, bell dropdown,
    `/notifications`, API routes).
18. `claude/aurora-ai-foundation` — shared AI plumbing: `lib/ai/client.ts`
    (lazy Anthropic, env-gated), `ratelimit.ts` (Upstash), `sse.ts`,
    `schemas.ts` (Zod), versioned prompts; POST `/api/ai/concierge` (streaming)
    + POST `/api/ai/search` (parse → Supabase, pg_trgm fallback).
19. `claude/aurora-concierge-ui` — Aura FAB (`components/ai/ConciergeFab.tsx`)
    streaming from /api/ai/concierge, mounted in the platform layout.
20. `claude/aurora-copilot-replies` — POST `/api/ai/copilot/replies` + "Suggest
    replies" control in ThreadView, wired to the REAL /messages thread.
21. `claude/aurora-smart-search-ui` — `components/ai/SmartSearch.tsx` replaces
    the top-bar input, calls /api/ai/search, results dropdown.

> Always branch off the NEWEST pushed branch (also pushed to `main` + the
> default branch each time). 112 unit tests + e2e specs; every branch
> typecheck + build verified.

## NEXT UP (TODO)

PHASE 2 ✅ complete. PHASE 3 in progress — 3 of 5 AI cornerstones done
(Concierge, Smart Search, Co-Pilot replies). Remaining:

- **Earnings Forecaster (RPD §3.4):** stat model over the creator's last 90d
  (revenue, cadence, churn, tips) + Claude narrative + scenario sliders. The
  RPD suggests a Supabase Edge Function; a Next route handler is fine for MVP.
  Build `/api/ai/forecast` + a Forecaster panel for the creator dashboard.
- **Subscription Intelligence (RPD §3.5):** daily summaries of what each
  subscribed creator posted since last visit + renewal reminders. Supabase
  cron (`app/api/cron/*`) + Claude + Resend. A `/api/ai/sub-digest` route +
  a panel on the fan profile.
- **CatchMeUpButton** on creator profiles is waiting on this (PENDING_AI_SUMMARY)
  — wire it to a summary route once Subscription Intelligence lands.
- **Then:** Creator Dashboard (Overview/Content Studio/Analytics/Earnings/
  Tiers/Fans/Co-Pilot surface), Profile + Settings panels, full motion + perf
  pass (Lighthouse targets §10), Vercel deploy.

Note: no new SQL migrations were needed for Phase 3 so far
(`user_preferences` already has `ai_persona_memory`, etc.). The OWNER runs all
SQL in Supabase — only commit `.sql` files, never execute them.

## Known PENDING labels in the tree (grep for these)

`PENDING_CONTRACT_ADDRESS` (staking + NFT), `PENDING_SUPABASE_AUTH`,
`PENDING_SUPABASE_REALTIME`, `PENDING_WAGMI` (now activated, none left),
`PENDING_WC_PROJECT_ID`, `PENDING_REAL_LOGO_ASSET`,
`PLACEHOLDER_PENDING_3D_ASSETS`, `PENDING_AI_SUMMARY`, `SAMPLE_PREVIEW_DATA`.
- **PHASE 3:** five AI cornerstones via `/api/ai/*` streaming routes (prompts
  versioned in `lib/ai/prompts/`, Zod output schemas, Upstash rate limits) —
  Discovery Concierge, Creator Co-Pilot wired to the REAL `/messages` surface,
  Smart Search, Earnings Forecaster, Subscription Intelligence — then creator
  dashboard, profile/settings panels, motion pass, perf pass, Vercel deploy

## How to resume

```
cd /home/user/Henk-naka-bot-
git config user.name "moderator29"
git config user.email "Phantomfcalls@gmail.com"
git fetch
git checkout claude/aurora-wallet && git pull        # or newest pushed branch
git log --oneline -5
pnpm install
pnpm --filter web test                                # confirm green baseline
git checkout -b claude/aurora-<next-work>
# build → typecheck → test → build → commit → push → open next branch
```
