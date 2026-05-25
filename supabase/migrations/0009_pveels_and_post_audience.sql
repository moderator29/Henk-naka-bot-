-- =============================================================================
-- Aurora · 0009 — Pveels (short video) + post audience/visibility
-- Adds the short-video ("Pveels") system and the post composer's audience
-- controls, with engagement tables, count-maintaining triggers, indexes, RLS,
-- and storage buckets. Idempotent + additive; safe to re-run. Mirrors
-- apps/web/lib/db/schema.ts and supabase/schema.sql.
--
-- GATING MODEL (read this): rows are world-readable so a non-subscriber can see
-- an elegant locked PREVIEW (poster + caption). The actual gated FILE lives in
-- the PRIVATE `gated-media` bucket and is only reachable through a short-lived
-- signed URL the server issues after verifying an active subscription. Public /
-- free media stays in the public buckets. A visual blur is never the gate.
-- =============================================================================

-- ---------- POSTS: audience/visibility + per-post toggles + tag arrays -------
alter table public.posts add column if not exists visibility text not null default 'public'; -- 'public'|'followers'|'subscribers'|'tier'
alter table public.posts add column if not exists allow_comments boolean not null default true;
alter table public.posts add column if not exists allow_tips boolean not null default true;
alter table public.posts add column if not exists hashtags text[];
alter table public.posts add column if not exists mentions uuid[];

-- ---------- PVEELS (short vertical video) ------------------------------------
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

-- ---------- INDEXES ----------------------------------------------------------
create index if not exists pveels_creator_idx       on public.pveels (creator_id);
create index if not exists pveels_created_idx        on public.pveels (created_at desc);
create index if not exists pveels_caption_trgm_idx   on public.pveels using gin (caption gin_trgm_ops);
create index if not exists pveels_hashtags_idx       on public.pveels using gin (hashtags);
create index if not exists pveels_demo_idx           on public.pveels (is_demo) where is_demo;
create index if not exists posts_hashtags_idx        on public.posts using gin (hashtags);
create index if not exists pveel_comments_pveel_idx  on public.pveel_comments (pveel_id);

-- ---------- ENGAGEMENT COUNTERS (keep the cached counts on pveels fresh) -----
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

-- ---------- ROW LEVEL SECURITY ----------------------------------------------
alter table public.pveels         enable row level security;
alter table public.pveel_likes    enable row level security;
alter table public.pveel_saves    enable row level security;
alter table public.pveel_comments enable row level security;
alter table public.pveel_views    enable row level security;

-- Pveel rows are readable by all (locked preview); the gated FILE is protected
-- by living in the private `gated-media` bucket (signed URLs only). Author writes.
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

-- ---------- STORAGE BUCKETS --------------------------------------------------
-- Public read for free media + posters/covers/avatars; PRIVATE `gated-media`
-- for subscribers-only files (served via signed URLs after an entitlement check).
insert into storage.buckets (id, name, public) values
  ('covers', 'covers', true),
  ('pveels', 'pveels', true),
  ('gated-media', 'gated-media', false)
on conflict (id) do nothing;

drop policy if exists "covers public read"   on storage.objects;
drop policy if exists "pveels public read"   on storage.objects;
drop policy if exists "media2 auth upload"   on storage.objects;
drop policy if exists "media2 owner update"  on storage.objects;
drop policy if exists "media2 owner delete"  on storage.objects;
drop policy if exists "gated owner manage"   on storage.objects;

create policy "covers public read" on storage.objects
  for select using (bucket_id = 'covers');
create policy "pveels public read" on storage.objects
  for select using (bucket_id = 'pveels');

-- Authenticated users upload to the new buckets (incl. private gated-media).
create policy "media2 auth upload" on storage.objects
  for insert to authenticated with check (bucket_id in ('covers', 'pveels', 'gated-media'));
create policy "media2 owner update" on storage.objects
  for update to authenticated using (owner = auth.uid()) with check (owner = auth.uid());
create policy "media2 owner delete" on storage.objects
  for delete to authenticated using (owner = auth.uid());
-- Note: `gated-media` has NO public select policy on purpose. Reads happen only
-- through server-issued signed URLs after the subscription/entitlement check.

-- =============================================================================
-- DONE.
-- =============================================================================
