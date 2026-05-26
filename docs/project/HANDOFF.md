# Pleasure Coin V2 - Session Handoff

> Read this first, then wait for the owner's prompt for the session and treat it
> as the priority instruction set. This file is the live state of the build.
> Source docs live beside this one:
> - docs/project/01-build-prompt-and-rpd.md (original build prompt + full RPD)
> - docs/project/02-mid-build-update.md (nav, messaging, onboarding, docs, logo)

## 0. THE FIRST THING TO DO EVERY SESSION

Set the commit author before your first commit, and verify it on every commit:

```
git config user.name "moderator29"
git config user.email "Phantomfcalls@gmail.com"
```

Then confirm the true latest state:

```
git fetch origin
git log --oneline -1            # the real tip
```

## 1. OWNER RULES (non-negotiable, enforce on every commit)

1. NO AI attribution anywhere that reaches the repo. Not in commits, code,
   comments, package metadata, PR titles or bodies, or docs. Commits are
   authored by the owner (see section 0). Never write a model name into any
   file, commit, or artifact that gets pushed. Keep model identity in chat only.
2. NO AI "tells" in copy or in committed text. No em-dashes, no spaced hyphens
   used as dashes, no double underscores in user-facing text. Warm, human prose
   (commas and periods).
3. The OWNER runs ALL SQL. You ONLY commit .sql files to supabase/migrations/
   (and mirror the same change into supabase/schema.sql and the Drizzle schema
   at apps/web/lib/db/schema.ts). NEVER execute DDL. There is a non-owner
   Supabase MCP connected in this environment; ignore it completely. When a
   change needs SQL, deliver the exact SQL block in chat, clearly labeled, for
   the owner to paste.
4. PUSH MODEL (important). Develop on the working branch the owner assigns, then
   keep ALL of these in sync on every push:
     - the working branch (e.g. claude/affectionate-ritchie-T0d53)
     - main
     - claude/setup-pleasure-coin-v2-54I9T  (the GitHub default branch + what
       Vercel deploys)
   They are all the same commit. After a green commit, push the same HEAD to all
   three:
   ```
   for ref in <working-branch> main claude/setup-pleasure-coin-v2-54I9T; do
     git push origin HEAD:$ref
   done
   ```
   Everything the owner wants lives in main AND the default branch, in one place.
   The GitHub default is currently claude/setup-pleasure-coin-v2-54I9T; the owner
   may switch it to main in GitHub settings, which is fine since both are equal.
5. No fake data masquerading as real. There is NO demo data on the platform; it
   was removed and purge_demo_content() runs on first real signup. Do not
   reintroduce demo seed data. Stubs for genuinely blocked work carry a PENDING
   label (a contract address, or the Anthropic key if unfunded).
6. ALWAYS keep the build green before every push, in this order, from apps/web:
   ```
   npx next lint        # lint FIRST: tsc does NOT catch unused vars / a11y,
                        # and next build FAILS on lint errors
   npx tsc --noEmit     # types
   npx vitest run       # unit tests
   npm run build        # must end with the route manifest / "Compiled
                        # successfully". READ the real output; do not trust a
                        # chained command's exit code.
   ```
   Hard lesson: a type error and an unused-import lint error each shipped once
   because the actual build output was not read. Always read it.
7. TypeScript strict, no unjustified any. Mobile first. WCAG AA. Respect
   prefers-reduced-motion. Real integrations only, env-gated, failing honestly
   when a key is missing.
8. Conventional commits (feat/fix/docs/chore/refactor/test). Small, focused
   commits. Audit each change against the RPD and the owner's prompt, not just
   the typecheck.

## 2. DESIGN AND MOTION BAR

Sleek and restrained: Linear, Apple, Vercel, Stripe. Subtle animated aurora
behind every surface (AuroraBackground is mounted in the platform shell,
marketing layout, and docs layout). Glass-morphism cards, calm motion, generous
whitespace. Framer Motion drives hero text stagger, scroll reveals, like/save
micro-interactions, the slide-over menu, modals, and nav transitions, all
reduced-motion aware. When in doubt, do less.

## 3. STACK AND REPO

- Repo: moderator29/Henk-naka-bot-. Working dir /home/user/Henk-naka-bot-.
- pnpm + turbo monorepo: apps/web + packages/{design-system,contracts}.
- Next.js 14 App Router, TS strict, Tailwind, Supabase (Auth/Postgres/RLS/
  Storage/Realtime) + Drizzle mirror, wagmi v2 + RainbowKit + viem (Polygon),
  Framer Motion, Recharts, Anthropic SDK, Upstash, Resend, Sentry, PostHog,
  Vitest + Playwright.
- React 18 here: use useFormState/useFormStatus (react-dom), not useActionState.
- noUncheckedIndexedAccess is ON: arr[0] is T | undefined; type literal-key
  records as Record<"a"|"b", T> so indexing returns T (a Record<string,T> index
  returns T | undefined and breaks the build).
- Server Components must not pass function props to Client Components.
- "use server" files may ONLY export async functions; put types/constants in a
  plain module.
- Record<Union, ...> maps must cover every union member (e.g. the two
  notification icon maps must list every NotificationType, including broadcast).
- turbo.json globalEnv must list every runtime env var, or Turbo strips it from
  the Vercel build. Keep it in sync with .env.example exact names.

## 4. DATABASE / MIGRATIONS (owner runs them)

Migrations in supabase/migrations/, mirrored in supabase/schema.sql and the
Drizzle schema:
- 0001 initial schema, 0002 messaging, 0003 onboarding, 0004 auth user trigger,
  0005 demo flags + purge_demo_content(), 0006 user names, 0007 user settings,
  0008 delete cascades
- 0009 subscription pricing (price_usd on tiers)
- 0010 gated media (posts read policy; private bucket post-media-private)
- 0011 roles + admin (user_roles, is_admin/is_staff, admin_audit_log, reports,
  blocks, mutes, creator_applications, posts.moderation_status,
  users.account_status, platform_settings, announcements)
- 0012 dm_permission on users
- 0013 realtime publication (notifications, messages)
- 0014 news/broadcast (announcements.image_url, announcement_likes,
  announcement_comments, legal_documents) + announcements in realtime
- 0015 posts.audience (public | free | followers | subscribers)
- 0016 user column guard (before-update trigger freezing account_status,
  is_creator, is_verified, wallet_address, email, date_of_birth-once-set on
  self-edits; bans/age are now enforced at the DB, not just the UI)
- 0017 profile social links (users.telegram_url, users.x_url)
- 0018 subscription integrity (subscriptions.amount_nsfw + unique tx_hash index
  for idempotent recording)

Owner storage setup (Supabase): public bucket post-media; private bucket
post-media-private (gated media is served via short-lived signed URLs). Confirm
all migrations are applied. Grant your account: set role superadmin in
public.user_roles for the owner email (pleasurecoinv2@gmail.com).

## 5. WHAT IS BUILT (real, wired to Supabase)

- Auth: email + password, and wallet (SIWE). NO Google. First-time wallet ->
  profile setup (username + DOB, 18+); returning wallet -> straight in.
- Profile: X-style avatar/cover editing with live preview; real photos; Posts,
  Media, and Likes tabs; tappable followers/following lists with follow-back;
  Message button on creator profiles.
- Feed + posts: real posts, four-level audience (public/free/followers/
  subscribers) with media gated via signed URLs and locked teasers; real
  like/save/comment with read-back; tips on-chain in $NSFW.
- Pveels: real video feed + a creation studio (record or upload, caption,
  audience).
- Subscriptions: on-chain $NSFW, USD-priced tiers, manage/cancel; creator tier
  management in the dashboard.
- Messaging: realtime DMs, new-conversation people picker, DM permission
  (everyone vs mutuals) enforced.
- News/broadcast: admin composes (title/body/image/audience) -> fans out to the
  /news feed + every targeted user's notifications + email; items are likeable,
  commentable, shareable. Real-time notifications via Supabase Realtime.
- Search: AI Smart Search bar + a keyword /search page (people/posts/Pveels).
- Bookmarks page. Global navigation: bottom tab bar (Home, Discover, center
  create, Pveels, Profile) + a mobile "More" menu surfacing every secondary
  destination + AI; desktop rail.
- Admin at /admin (role-gated, server-side, mobile-navigable): Overview, Users,
  Moderation, Creators (applications), Transactions, Announcements (broadcast),
  Legal (edit Privacy/Terms/Disclaimer live), AI, System health, Demo data,
  Settings (fee %, maintenance mode -> live banner), Audit log, Admin docs. All
  real data.
- AI: Concierge (Aura) with new-chat + image upload, Smart Search, Co-Pilot,
  Forecaster, Subscription Intelligence. ALL FIVE call Claude for real now
  (Forecaster + Subscription Intelligence were placeholder stubs and are wired
  in lib/ai/prompts/{forecaster,summary}.ts). Hard safety guardrails appended to
  every prompt. 503 when ANTHROPIC_API_KEY unset. Each AI feature is honored by
  its per-user Settings toggle (off => removed from the UI live).
- Translation: live on-demand page translation (lib/i18n + components/i18n +
  /api/translate proxy over Google's public endpoint). Globe control in the
  platform header and marketing nav (covers landing + docs); the Settings
  language drives it. RTL for Arabic, restores English exactly, skips inputs and
  [data-no-translate].
- Profile social links: optional Telegram + X, validated/normalized server-side
  (lib/profile/social-links.ts), shown as buttons on own + creator profiles.
- Token chart is gated behind the in-app wallet (components/token/ChartWalletGate).
- Notifications: DM ("message") and new-post ("post") now fire; the shared
  lib/notifications/notify helper honors recipient preferences. A user's own
  posts appear in their own feed.
- Security this pass: users column-guard trigger (0016), OAuth callback redirect
  guard, rate limiting on all email-auth actions + username/human-check routes,
  human-check cookie signed with a real secret in prod (AUTH_COOKIE_SECRET ->
  service-role fallback). turbo.json / .env.example synced to the code.
- Subscriptions: idempotent recording, amount stored, "auto-renew" relabeled as
  a renewal reminder (the cron emails a reminder; there is no custodial charge).
- Build note: TypeScript resolved to 5.9; baseUrl was dropped and ambient
  declarations added (apps/web/types/ambient.d.ts) to keep tsc/build green.
- Legal: admin-editable Privacy Policy, Terms, Disclaimer (defaults in code,
  DB overrides). Footer disclaimer line + signup 18+/Terms agreement.
- Security: rate limiting on auth/upload/tips/export (Upstash with in-memory
  fallback), RLS on every table, signed-URL gated media, server-side input
  validation, no service-role key on the client.
- GDPR data export (Settings -> Account). Sign out everywhere (revokes sessions).
- Settings: a sectioned hub with Edit Profile separated, plus Account, Privacy
  (DM permission), Notifications & AI, Subscriptions, Creator, Wallet & Security,
  Content & Safety, Password, Help, Legal, Danger zone.

## 6. THE PARALLEL BRANCH (claude/eager-franklin-drtLs)

There is a second, separate build of the same app on
claude/eager-franklin-drtLs. It is an alternate version, not additive features.
Its unique gaps were ported into main (global search, four-level audience,
Pveels creation studio, followers/following lists, GDPR export, maintenance
mode). Do NOT git-merge that branch into main: it has its own conflicting
migrations and duplicate systems and would break the build. If the owner wants a
specific piece from it, port that one feature by re-implementing it on main's
schema.

## 7. VERCEL

- Vercel deploys the default branch. Keep main and the default branch equal to
  the working branch (section 1, rule 4).
- A failed Vercel build may be an OLD commit; check the commit hash in the log
  against the current tip before debugging.
- All runtime env vars are declared in turbo.json globalEnv (see section 3).
  Production should set Upstash, Turnstile, Resend, Anthropic, WalletConnect,
  Alchemy, 0x, GoldRush keys; everything fails honestly without them.

## 8. OPEN / NEXT

- Responsiveness and 60fps motion need a real browser to verify; the foundation
  is mobile-first and the admin panel is now mobile-navigable. Best next step:
  test on a device and fix specific reported breakages.
- Staking and NFT marketplace frontends are complete against typed mocks; the
  on-chain calls are PENDING_CONTRACT_ADDRESS until the contracts land.
- The Anthropic-dependent AI calls return a clear 503 until ANTHROPIC_API_KEY is
  funded.

## 9. HOW TO RESUME

```
cd /home/user/Henk-naka-bot-
git config user.name "moderator29" && git config user.email "Phantomfcalls@gmail.com"
git fetch origin
git checkout <working-branch> && git pull --ff-only origin <working-branch>
pnpm install
cd apps/web && npx next lint && npx tsc --noEmit && npx vitest run && npm run build
# build a change -> lint -> tsc -> vitest -> build (read the output) -> commit
# (owner author) -> push HEAD to working branch + main + default branch
```
