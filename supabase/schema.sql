-- =============================================================================
-- PROJECT AURORA — COMPLETE PLATFORM SCHEMA (paste once, run top to bottom)
-- Idempotent: safe to re-run. Matches apps/web/lib/db/schema.ts + the numbered
-- migrations in supabase/migrations/. This single file is provided so a fresh
-- Supabase project can be bootstrapped in one paste from the SQL Editor.
-- =============================================================================

-- ---------- EXTENSIONS ----------
create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "pg_trgm";     -- fuzzy search (GIN trigram)

-- =============================================================================
-- TABLES
-- =============================================================================

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  username text unique,
  first_name text,
  last_name text,
  display_name text,
  bio text,
  avatar_url text,
  cover_url text,
  wallet_address text,
  country text,
  date_of_birth date,
  is_creator boolean not null default false,
  is_verified boolean not null default false,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  last_active_at timestamptz
);

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

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  fan_id uuid not null references public.users(id) on delete cascade,
  tier_id uuid not null references public.subscription_tiers(id) on delete cascade,
  started_at timestamptz not null default now(),
  expires_at timestamptz not null,
  auto_renew boolean not null default true,
  tx_hash text
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.users(id) on delete cascade,
  caption text,
  media jsonb,
  tier_required uuid references public.subscription_tiers(id) on delete set null,
  category text,
  visibility text not null default 'public',         -- 'public'|'followers'|'subscribers'|'tier'
  allow_comments boolean not null default true,
  allow_tips boolean not null default true,
  hashtags text[],
  mentions uuid[],
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  scheduled_for timestamptz
);

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

create table if not exists public.tips (
  id uuid primary key default gen_random_uuid(),
  from_user uuid not null references public.users(id) on delete cascade,
  to_user uuid not null references public.users(id) on delete cascade,
  amount_nsfw numeric(36,6) not null,
  post_id uuid references public.posts(id) on delete set null,
  tx_hash text,
  created_at timestamptz not null default now()
);

create table if not exists public.follows (
  follower_id uuid not null references public.users(id) on delete cascade,
  following_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null,
  payload jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.user_preferences (
  user_id uuid primary key references public.users(id) on delete cascade,
  categories_interest jsonb,
  creator_affinities jsonb,
  ai_persona_memory jsonb,
  settings jsonb,
  onboarding_completed boolean not null default false,
  onboarding_completed_at timestamptz,
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
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- MESSAGING ----------
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  participant_a uuid not null references public.users(id) on delete cascade,
  participant_b uuid not null references public.users(id) on delete cascade,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  constraint conv_distinct_participants check (participant_a <> participant_b),
  constraint conv_canonical_pair check (participant_a < participant_b)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.users(id) on delete cascade,
  body text,
  media jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint messages_body_or_media check (body is not null or media is not null)
);

-- ---------- PVEELS (short vertical video) ----------
create table if not exists public.pveels (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.users(id) on delete cascade,
  video_url text not null,
  poster_url text,
  caption text,
  hashtags text[],
  mentions uuid[],
  category text,
  visibility text not null default 'public',         -- 'public'|'followers'|'subscribers'|'tier'
  tier_required uuid references public.subscription_tiers(id) on delete set null,
  duration_seconds numeric,
  width integer,
  height integer,
  allow_comments boolean not null default true,
  allow_tips boolean not null default true,
  view_count bigint not null default 0,
  like_count bigint not null default 0,
  comment_count bigint not null default 0,
  save_count bigint not null default 0,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  scheduled_for timestamptz
);

create table if not exists public.pveel_likes (
  pveel_id uuid not null references public.pveels(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (pveel_id, user_id)
);

create table if not exists public.pveel_saves (
  pveel_id uuid not null references public.pveels(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (pveel_id, user_id)
);

create table if not exists public.pveel_comments (
  id uuid primary key default gen_random_uuid(),
  pveel_id uuid not null references public.pveels(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.pveel_views (
  pveel_id uuid not null references public.pveels(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (pveel_id, user_id)
);

-- ---------- PRIVACY: blocks + mutes ----------
create table if not exists public.blocks (
  blocker_id uuid not null references public.users(id) on delete cascade,
  blocked_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint blocks_distinct check (blocker_id <> blocked_id)
);

create table if not exists public.mutes (
  muter_id uuid not null references public.users(id) on delete cascade,
  muted_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (muter_id, muted_id),
  constraint mutes_distinct check (muter_id <> muted_id)
);

-- =============================================================================
-- INDEXES
-- =============================================================================
create index if not exists users_username_idx       on public.users (username);
create index if not exists users_wallet_idx          on public.users (wallet_address);
create index if not exists users_display_name_trgm_idx on public.users using gin (display_name gin_trgm_ops);
create index if not exists users_bio_trgm_idx        on public.users using gin (bio gin_trgm_ops);
create index if not exists users_demo_idx            on public.users (is_demo) where is_demo;

create index if not exists tiers_creator_idx         on public.subscription_tiers (creator_id);
create index if not exists subs_fan_idx              on public.subscriptions (fan_id);
create index if not exists subs_expires_idx          on public.subscriptions (expires_at);

create index if not exists posts_creator_idx         on public.posts (creator_id);
create index if not exists posts_created_idx         on public.posts (created_at desc);
create index if not exists posts_category_idx        on public.posts (category);
create index if not exists posts_caption_fts_idx     on public.posts using gin (to_tsvector('english', coalesce(caption, '')));
create index if not exists posts_demo_idx            on public.posts (is_demo) where is_demo;

create index if not exists comments_post_idx         on public.comments (post_id);
create index if not exists follows_follower_idx      on public.follows (follower_id);
create index if not exists follows_following_idx     on public.follows (following_id);
create index if not exists notifications_user_idx    on public.notifications (user_id);
create index if not exists listings_status_idx       on public.marketplace_listings (status);
create index if not exists listings_demo_idx         on public.marketplace_listings (is_demo) where is_demo;

create unique index if not exists conv_pair_unique_idx on public.conversations (participant_a, participant_b);
create index if not exists conv_a_idx                on public.conversations (participant_a);
create index if not exists conv_b_idx                on public.conversations (participant_b);
create index if not exists conv_last_msg_idx         on public.conversations (last_message_at desc nulls last);
create index if not exists messages_conv_idx         on public.messages (conversation_id);
create index if not exists messages_created_idx      on public.messages (created_at desc);

create index if not exists posts_hashtags_idx        on public.posts using gin (hashtags);
create index if not exists pveels_creator_idx        on public.pveels (creator_id);
create index if not exists pveels_created_idx        on public.pveels (created_at desc);
create index if not exists pveels_caption_trgm_idx   on public.pveels using gin (caption gin_trgm_ops);
create index if not exists pveels_hashtags_idx       on public.pveels using gin (hashtags);
create index if not exists pveels_demo_idx           on public.pveels (is_demo) where is_demo;
create index if not exists pveel_comments_pveel_idx  on public.pveel_comments (pveel_id);

create index if not exists users_username_trgm_idx   on public.users using gin (username gin_trgm_ops);
create index if not exists blocks_blocked_idx        on public.blocks (blocked_id);
create index if not exists mutes_muted_idx           on public.mutes (muted_id);

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Is the requesting user 18+?
create or replace function public.is_adult(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(
    (select date_of_birth <= (current_date - interval '18 years')
     from public.users where id = _user_id),
    false
  );
$$;

-- Does a fan have an active subscription to a tier? (gates paid posts)
create or replace function public.has_active_subscription(_fan_id uuid, _tier_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from public.subscriptions
    where fan_id = _fan_id and tier_id = _tier_id and expires_at > now()
  );
$$;

-- Keep conversations.last_message_at fresh so the inbox orders correctly.
create or replace function public.bump_conversation_last_message()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.conversations
     set last_message_at = new.created_at
   where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists messages_bump_conversation on public.messages;
create trigger messages_bump_conversation
  after insert on public.messages
  for each row execute function public.bump_conversation_last_message();

-- Keep the cached engagement counters on a pveel fresh.
create or replace function public.bump_pveel_counter()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  col text := tg_argv[0];
  delta int := case when tg_op = 'INSERT' then 1 else -1 end;
  pid uuid := case when tg_op = 'INSERT' then new.pveel_id else old.pveel_id end;
begin
  execute format('update public.pveels set %I = greatest(0, %I + $1) where id = $2', col, col)
    using delta, pid;
  return null;
end;
$$;

drop trigger if exists pveel_likes_count    on public.pveel_likes;
drop trigger if exists pveel_saves_count    on public.pveel_saves;
drop trigger if exists pveel_comments_count on public.pveel_comments;
drop trigger if exists pveel_views_count    on public.pveel_views;
create trigger pveel_likes_count    after insert or delete on public.pveel_likes
  for each row execute function public.bump_pveel_counter('like_count');
create trigger pveel_saves_count    after insert or delete on public.pveel_saves
  for each row execute function public.bump_pveel_counter('save_count');
create trigger pveel_comments_count after insert or delete on public.pveel_comments
  for each row execute function public.bump_pveel_counter('comment_count');
create trigger pveel_views_count    after insert or delete on public.pveel_views
  for each row execute function public.bump_pveel_counter('view_count');

-- Mirror a new auth.users row into public.users + seed user_preferences,
-- copying date_of_birth from signup metadata for the 18+ gate.
create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  dob date;
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  uname text := nullif(meta ->> 'username', '');
  fname text := nullif(meta ->> 'first_name', '');
  lname text := nullif(meta ->> 'last_name', '');
  dname text := coalesce(nullif(meta ->> 'display_name', ''), nullif(meta ->> 'first_name', ''));
begin
  begin
    dob := (meta ->> 'date_of_birth')::date;
  exception when others then dob := null;
  end;

  begin
    insert into public.users
      (id, email, date_of_birth, first_name, last_name, username, display_name, created_at)
    values
      (new.id, new.email, dob, fname, lname, uname, dname, now())
    on conflict (id) do update
      set email = excluded.email,
          date_of_birth = coalesce(excluded.date_of_birth, public.users.date_of_birth),
          first_name = coalesce(excluded.first_name, public.users.first_name),
          last_name = coalesce(excluded.last_name, public.users.last_name),
          username = coalesce(public.users.username, excluded.username),
          display_name = coalesce(excluded.display_name, public.users.display_name);
  exception when unique_violation then
    insert into public.users
      (id, email, date_of_birth, first_name, last_name, display_name, created_at)
    values
      (new.id, new.email, dob, fname, lname, dname, now())
    on conflict (id) do update
      set email = excluded.email,
          date_of_birth = coalesce(excluded.date_of_birth, public.users.date_of_birth);
  end;

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- Keep email + dob in sync if the auth row changes (email change, OAuth dob backfill).
create or replace function public.handle_auth_user_updated()
returns trigger language plpgsql security definer set search_path = public as $$
declare dob date;
begin
  begin
    dob := (new.raw_user_meta_data ->> 'date_of_birth')::date;
  exception when others then dob := null;
  end;

  update public.users
     set email = new.email,
         date_of_birth = coalesce(dob, public.users.date_of_birth)
   where id = new.id;

  return new;
end;
$$;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update on auth.users
  for each row execute function public.handle_auth_user_updated();

-- One call wipes ALL demo content. Run it to go fully real, and the app calls
-- it automatically the first time a real user signs up.
create or replace function public.purge_demo_content()
returns void language sql security definer set search_path = public as $$
  delete from public.marketplace_listings where is_demo;
  delete from public.pveels where is_demo;
  delete from public.posts where is_demo;
  delete from public.users where is_demo;
$$;

-- Is there a block between two users (either direction)? SECURITY DEFINER so
-- RLS policies can check it without exposing block rows to the other party.
create or replace function public.is_blocked(_a uuid, _b uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from public.blocks
    where (blocker_id = _a and blocked_id = _b)
       or (blocker_id = _b and blocked_id = _a)
  );
$$;

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
alter table public.users                enable row level security;
alter table public.creator_profiles     enable row level security;
alter table public.subscription_tiers   enable row level security;
alter table public.subscriptions         enable row level security;
alter table public.posts                 enable row level security;
alter table public.likes                 enable row level security;
alter table public.saves                 enable row level security;
alter table public.comments              enable row level security;
alter table public.tips                  enable row level security;
alter table public.follows               enable row level security;
alter table public.notifications         enable row level security;
alter table public.user_preferences      enable row level security;
alter table public.staking_positions     enable row level security;
alter table public.nft_holdings          enable row level security;
alter table public.marketplace_listings  enable row level security;
alter table public.conversations         enable row level security;
alter table public.messages              enable row level security;
alter table public.pveels                enable row level security;
alter table public.pveel_likes           enable row level security;
alter table public.pveel_saves           enable row level security;
alter table public.pveel_comments        enable row level security;
alter table public.pveel_views           enable row level security;
alter table public.blocks                enable row level security;
alter table public.mutes                 enable row level security;

-- Users
drop policy if exists users_self_read   on public.users;
drop policy if exists users_self_update on public.users;
drop policy if exists users_self_insert on public.users;
create policy users_self_read   on public.users for select using (true);
create policy users_self_update on public.users for update using (auth.uid() = id) with check (auth.uid() = id);
create policy users_self_insert on public.users for insert with check (auth.uid() = id);

-- Creator profiles
drop policy if exists creator_profiles_read  on public.creator_profiles;
drop policy if exists creator_profiles_write on public.creator_profiles;
create policy creator_profiles_read  on public.creator_profiles for select using (true);
create policy creator_profiles_write on public.creator_profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Tiers
drop policy if exists tiers_public_read on public.subscription_tiers;
drop policy if exists tiers_owner_write on public.subscription_tiers;
create policy tiers_public_read on public.subscription_tiers for select using (is_active);
create policy tiers_owner_write on public.subscription_tiers for all using (auth.uid() = creator_id) with check (auth.uid() = creator_id);

-- Subscriptions
drop policy if exists subs_fan_read     on public.subscriptions;
drop policy if exists subs_creator_read on public.subscriptions;
drop policy if exists subs_fan_insert   on public.subscriptions;
drop policy if exists subs_fan_update   on public.subscriptions;
create policy subs_fan_read     on public.subscriptions for select using (auth.uid() = fan_id);
create policy subs_creator_read on public.subscriptions for select using (
  auth.uid() in (select creator_id from public.subscription_tiers where id = subscriptions.tier_id)
);
create policy subs_fan_insert on public.subscriptions for insert with check (auth.uid() = fan_id);
create policy subs_fan_update on public.subscriptions for update using (auth.uid() = fan_id) with check (auth.uid() = fan_id);

-- Posts (public posts open; gated posts need an active subscription; author controls)
drop policy if exists posts_public_read on public.posts;
drop policy if exists posts_owner_write on public.posts;
-- Rows are world-readable so gated posts can render a locked preview; the
-- gated FILE is protected in the private `gated-media` bucket (signed URLs only
-- after an entitlement check), so the media is never exposed to non-subscribers.
create policy posts_public_read on public.posts for select using (true);
create policy posts_owner_write on public.posts for all using (auth.uid() = creator_id) with check (auth.uid() = creator_id);

-- Likes / saves / comments
drop policy if exists likes_read  on public.likes;
drop policy if exists likes_write on public.likes;
create policy likes_read  on public.likes for select using (true);
create policy likes_write on public.likes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists saves_read  on public.saves;
drop policy if exists saves_write on public.saves;
create policy saves_read  on public.saves for select using (auth.uid() = user_id);
create policy saves_write on public.saves for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists comments_read  on public.comments;
drop policy if exists comments_write on public.comments;
create policy comments_read  on public.comments for select using (true);
create policy comments_write on public.comments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Tips (only the two parties can read; sender creates)
drop policy if exists tips_read   on public.tips;
drop policy if exists tips_insert on public.tips;
create policy tips_read   on public.tips for select using (auth.uid() = from_user or auth.uid() = to_user);
create policy tips_insert on public.tips for insert with check (auth.uid() = from_user);

-- Follows
drop policy if exists follows_read  on public.follows;
drop policy if exists follows_write on public.follows;
create policy follows_read  on public.follows for select using (true);
create policy follows_write on public.follows for all using (auth.uid() = follower_id) with check (auth.uid() = follower_id);

-- Notifications / preferences / staking / nft (strictly self)
drop policy if exists notifications_self on public.notifications;
create policy notifications_self on public.notifications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists user_prefs_self on public.user_preferences;
create policy user_prefs_self on public.user_preferences for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists staking_self on public.staking_positions;
create policy staking_self on public.staking_positions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists nft_holdings_self on public.nft_holdings;
create policy nft_holdings_self on public.nft_holdings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Marketplace listings
drop policy if exists listings_read         on public.marketplace_listings;
drop policy if exists listings_seller_write on public.marketplace_listings;
create policy listings_read         on public.marketplace_listings for select using (true);
create policy listings_seller_write on public.marketplace_listings for all using (auth.uid() = seller_id) with check (auth.uid() = seller_id);

-- Conversations (participants only)
drop policy if exists conv_participant_read   on public.conversations;
drop policy if exists conv_participant_insert on public.conversations;
create policy conv_participant_read   on public.conversations for select using (auth.uid() in (participant_a, participant_b));
create policy conv_participant_insert on public.conversations for insert with check (
  auth.uid() in (participant_a, participant_b)
  and not public.is_blocked(participant_a, participant_b)
);

-- Messages (read if participant; send as self; recipient may mark read)
drop policy if exists messages_participant_read    on public.messages;
drop policy if exists messages_participant_insert  on public.messages;
drop policy if exists messages_recipient_mark_read on public.messages;
create policy messages_participant_read on public.messages for select using (
  exists (select 1 from public.conversations c
          where c.id = messages.conversation_id and auth.uid() in (c.participant_a, c.participant_b))
);
create policy messages_participant_insert on public.messages for insert with check (
  auth.uid() = sender_id
  and exists (select 1 from public.conversations c
              where c.id = messages.conversation_id
                and auth.uid() in (c.participant_a, c.participant_b)
                and not public.is_blocked(c.participant_a, c.participant_b))
);
create policy messages_recipient_mark_read on public.messages for update
  using (
    sender_id <> auth.uid()
    and exists (select 1 from public.conversations c
                where c.id = messages.conversation_id and auth.uid() in (c.participant_a, c.participant_b))
  )
  with check (sender_id <> auth.uid());

-- Pveels (rows world-readable for the locked preview; gated FILE is protected
-- by the private `gated-media` bucket + signed URLs). Author writes own.
drop policy if exists pveels_public_read on public.pveels;
drop policy if exists pveels_owner_write on public.pveels;
create policy pveels_public_read on public.pveels for select using (true);
create policy pveels_owner_write on public.pveels for all using (auth.uid() = creator_id) with check (auth.uid() = creator_id);

drop policy if exists pveel_likes_read  on public.pveel_likes;
drop policy if exists pveel_likes_write on public.pveel_likes;
create policy pveel_likes_read  on public.pveel_likes for select using (true);
create policy pveel_likes_write on public.pveel_likes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists pveel_saves_read  on public.pveel_saves;
drop policy if exists pveel_saves_write on public.pveel_saves;
create policy pveel_saves_read  on public.pveel_saves for select using (auth.uid() = user_id);
create policy pveel_saves_write on public.pveel_saves for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists pveel_comments_read  on public.pveel_comments;
drop policy if exists pveel_comments_write on public.pveel_comments;
create policy pveel_comments_read  on public.pveel_comments for select using (true);
create policy pveel_comments_write on public.pveel_comments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists pveel_views_self on public.pveel_views;
create policy pveel_views_self on public.pveel_views for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Blocks + mutes: a user only ever sees/manages their own lists.
drop policy if exists blocks_self on public.blocks;
create policy blocks_self on public.blocks for all using (auth.uid() = blocker_id) with check (auth.uid() = blocker_id);
drop policy if exists mutes_self on public.mutes;
create policy mutes_self on public.mutes for all using (auth.uid() = muter_id) with check (auth.uid() = muter_id);

-- =============================================================================
-- STORAGE BUCKETS (public read; uploads by authenticated users; owner edits/deletes)
-- =============================================================================
insert into storage.buckets (id, name, public)
values ('post-media', 'post-media', true), ('avatars', 'avatars', true),
       ('covers', 'covers', true), ('pveels', 'pveels', true),
       ('gated-media', 'gated-media', false)
on conflict (id) do nothing;

drop policy if exists "media public read" on storage.objects;
drop policy if exists "media auth upload"  on storage.objects;
drop policy if exists "media owner update" on storage.objects;
drop policy if exists "media owner delete" on storage.objects;

-- Public read covers free media + posters/covers/avatars. `gated-media` is NOT
-- listed here on purpose: it is private and reached only via server-issued
-- signed URLs after a subscription/entitlement check.
create policy "media public read" on storage.objects
  for select using (bucket_id in ('post-media', 'avatars', 'covers', 'pveels'));
create policy "media auth upload" on storage.objects
  for insert to authenticated with check (bucket_id in ('post-media', 'avatars', 'covers', 'pveels', 'gated-media'));
create policy "media owner update" on storage.objects
  for update to authenticated using (owner = auth.uid()) with check (owner = auth.uid());
create policy "media owner delete" on storage.objects
  for delete to authenticated using (owner = auth.uid());

-- GDPR export files: private bucket, signed-URL reads only (owner write/delete).
insert into storage.buckets (id, name, public) values ('exports', 'exports', false)
on conflict (id) do nothing;
drop policy if exists "exports owner write"  on storage.objects;
drop policy if exists "exports owner delete" on storage.objects;
create policy "exports owner write" on storage.objects
  for insert to authenticated with check (bucket_id = 'exports');
create policy "exports owner delete" on storage.objects
  for delete to authenticated using (bucket_id = 'exports' and owner = auth.uid());

-- =============================================================================
-- DONE. To go fully real now, optionally run:  select public.purge_demo_content();
-- =============================================================================
