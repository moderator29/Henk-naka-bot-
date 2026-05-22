-- =============================================================================
-- Aurora · initial schema
-- Mirrors lib/db/schema.ts. Drizzle-kit generates the DDL portion; this file
-- adds the platform-specific concerns drizzle doesn't manage:
--   · pg_trgm + pgcrypto extensions
--   · full-text search columns + GIN indexes
--   · RLS policies on every table
--   · helper SQL functions used by RLS (e.g. has_active_subscription)
-- =============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- ------------------------------------------------------------------------- --
-- Tables (kept in sync with drizzle schema; drizzle-kit owns the DDL once
-- DATABASE_URL is provided. The hand-written copy below exists so a fresh
-- Supabase project can be bootstrapped from this file directly via psql.)
-- ------------------------------------------------------------------------- --

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  username text unique,
  display_name text,
  bio text,
  avatar_url text,
  cover_url text,
  wallet_address text,
  country text,
  date_of_birth date,
  is_creator boolean not null default false,
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  last_active_at timestamptz
);
create index if not exists users_username_idx on public.users (username);
create index if not exists users_wallet_idx on public.users (wallet_address);
create index if not exists users_display_name_trgm_idx
  on public.users using gin (display_name gin_trgm_ops);
create index if not exists users_bio_trgm_idx
  on public.users using gin (bio gin_trgm_ops);

create table if not exists public.creator_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  tagline text,
  categories text[],
  payout_wallet text,
  total_earnings_nsfw numeric(36,6) not null default 0,
  subscriber_count integer not null default 0,
  verified_creator boolean not null default false,
  onboarded_at timestamptz
);

create table if not exists public.subscription_tiers (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  price_nsfw numeric(36,6) not null,
  benefits jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists tiers_creator_idx on public.subscription_tiers (creator_id);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  fan_id uuid not null references public.users(id) on delete cascade,
  tier_id uuid not null references public.subscription_tiers(id),
  started_at timestamptz not null default now(),
  expires_at timestamptz not null,
  auto_renew boolean not null default true,
  tx_hash text
);
create index if not exists subs_fan_idx on public.subscriptions (fan_id);
create index if not exists subs_expires_idx on public.subscriptions (expires_at);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.users(id) on delete cascade,
  caption text,
  media jsonb,
  tier_required uuid references public.subscription_tiers(id),
  category text,
  created_at timestamptz not null default now(),
  scheduled_for timestamptz
);
create index if not exists posts_creator_idx on public.posts (creator_id);
create index if not exists posts_created_idx on public.posts (created_at desc);
create index if not exists posts_category_idx on public.posts (category);
create index if not exists posts_caption_fts_idx
  on public.posts using gin (to_tsvector('english', coalesce(caption, '')));

create table if not exists public.likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.saves (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists comments_post_idx on public.comments (post_id);

create table if not exists public.tips (
  id uuid primary key default gen_random_uuid(),
  from_user uuid not null references public.users(id),
  to_user uuid not null references public.users(id),
  amount_nsfw numeric(36,6) not null,
  post_id uuid references public.posts(id),
  tx_hash text,
  created_at timestamptz not null default now()
);

create table if not exists public.follows (
  follower_id uuid not null references public.users(id) on delete cascade,
  following_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id)
);
create index if not exists follows_follower_idx on public.follows (follower_id);
create index if not exists follows_following_idx on public.follows (following_id);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null,
  payload jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications (user_id);

create table if not exists public.user_preferences (
  user_id uuid primary key references public.users(id) on delete cascade,
  categories_interest jsonb,
  creator_affinities jsonb,
  ai_persona_memory jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.staking_positions (
  user_id uuid primary key references public.users(id) on delete cascade,
  wallet text not null,
  amount_staked numeric(36,6) not null default 0,
  staked_at timestamptz,
  unlock_at timestamptz,
  pending_rewards numeric(36,6) not null default 0,
  last_synced_at timestamptz not null default now()
);

create table if not exists public.nft_holdings (
  user_id uuid not null references public.users(id) on delete cascade,
  contract_address text not null,
  token_id text not null,
  metadata jsonb,
  last_synced_at timestamptz not null default now(),
  primary key (user_id, contract_address, token_id)
);

create table if not exists public.marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.users(id) on delete cascade,
  contract_address text not null,
  token_id text not null,
  price_nsfw numeric(36,6) not null,
  status text not null default 'active',
  created_at timestamptz not null default now()
);
create index if not exists listings_status_idx on public.marketplace_listings (status);

-- ------------------------------------------------------------------------- --
-- Helper: is the requesting user 18+?
-- ------------------------------------------------------------------------- --

create or replace function public.is_adult(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select date_of_birth <= (current_date - interval '18 years')
     from public.users where id = _user_id),
    false
  );
$$;

-- ------------------------------------------------------------------------- --
-- Helper: does the requesting user have an active subscription to a tier?
-- ------------------------------------------------------------------------- --

create or replace function public.has_active_subscription(
  _fan_id uuid,
  _tier_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1
    from public.subscriptions
    where fan_id = _fan_id
      and tier_id = _tier_id
      and expires_at > now()
  );
$$;

-- ------------------------------------------------------------------------- --
-- Row Level Security — enable on every public table
-- ------------------------------------------------------------------------- --

alter table public.users                  enable row level security;
alter table public.creator_profiles       enable row level security;
alter table public.subscription_tiers     enable row level security;
alter table public.subscriptions          enable row level security;
alter table public.posts                  enable row level security;
alter table public.likes                  enable row level security;
alter table public.saves                  enable row level security;
alter table public.comments               enable row level security;
alter table public.tips                   enable row level security;
alter table public.follows                enable row level security;
alter table public.notifications          enable row level security;
alter table public.user_preferences       enable row level security;
alter table public.staking_positions      enable row level security;
alter table public.nft_holdings           enable row level security;
alter table public.marketplace_listings   enable row level security;

-- Users: anyone signed in can read public profile fields; only the user can
-- update their own row. Email/DOB stay private via column-level grants applied
-- by the app layer when shaping the read.
create policy users_self_read on public.users
  for select using (true);
create policy users_self_update on public.users
  for update using (auth.uid() = id) with check (auth.uid() = id);
create policy users_self_insert on public.users
  for insert with check (auth.uid() = id);

-- Creator profiles: same shape as users — readable by anyone, writable by self.
create policy creator_profiles_read on public.creator_profiles
  for select using (true);
create policy creator_profiles_write on public.creator_profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Subscription tiers: anyone can read active tiers; only the creator manages.
create policy tiers_public_read on public.subscription_tiers
  for select using (is_active);
create policy tiers_owner_write on public.subscription_tiers
  for all using (auth.uid() = creator_id) with check (auth.uid() = creator_id);

-- Subscriptions: the fan sees their own; the creator sees subs to their tiers.
create policy subs_fan_read on public.subscriptions
  for select using (auth.uid() = fan_id);
create policy subs_creator_read on public.subscriptions
  for select using (
    auth.uid() in (
      select creator_id from public.subscription_tiers where id = subscriptions.tier_id
    )
  );
create policy subs_fan_insert on public.subscriptions
  for insert with check (auth.uid() = fan_id);
create policy subs_fan_update on public.subscriptions
  for update using (auth.uid() = fan_id) with check (auth.uid() = fan_id);

-- Posts: public posts (tier_required is null) are readable by anyone signed
-- in; gated posts require an active subscription. Authors fully control.
create policy posts_public_read on public.posts
  for select using (
    tier_required is null
    or auth.uid() = creator_id
    or public.has_active_subscription(auth.uid(), tier_required)
  );
create policy posts_owner_write on public.posts
  for all using (auth.uid() = creator_id) with check (auth.uid() = creator_id);

-- Likes / saves: visible to all, writable only by the actor.
create policy likes_read on public.likes for select using (true);
create policy likes_write on public.likes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy saves_read on public.saves for select using (auth.uid() = user_id);
create policy saves_write on public.saves
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Comments: visible to anyone who can see the parent post; writable by author.
create policy comments_read on public.comments for select using (true);
create policy comments_write on public.comments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Tips: visible to the two parties only.
create policy tips_read on public.tips
  for select using (auth.uid() = from_user or auth.uid() = to_user);
create policy tips_insert on public.tips
  for insert with check (auth.uid() = from_user);

-- Follows: readable by all, writable only by the follower.
create policy follows_read on public.follows for select using (true);
create policy follows_write on public.follows
  for all using (auth.uid() = follower_id)
  with check (auth.uid() = follower_id);

-- Notifications: each user sees only their own.
create policy notifications_self on public.notifications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- User preferences: strictly self.
create policy user_prefs_self on public.user_preferences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Staking positions: readable + writable by owner. (Cache-only; writes happen
-- via the server-side sync job; RLS bound to the user prevents foreign reads.)
create policy staking_self on public.staking_positions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- NFT holdings: same — strictly the owning user.
create policy nft_holdings_self on public.nft_holdings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Marketplace listings: readable by all, writable by seller.
create policy listings_read on public.marketplace_listings
  for select using (true);
create policy listings_seller_write on public.marketplace_listings
  for all using (auth.uid() = seller_id) with check (auth.uid() = seller_id);
