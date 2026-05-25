-- =============================================================================
-- Aurora · 0010 — privacy (blocks/mutes), search, and GDPR export storage
-- Fills the schema gaps the feature prompt implies but its SQL block omitted:
--   • block list + muted users (Settings > Privacy; DMs must respect blocking)
--   • a username trigram index so search reliably finds any user by @username
--   • a PRIVATE `exports` bucket for GDPR data-export files (signed URLs only)
-- Idempotent + additive; safe to re-run. Mirrors schema.sql + schema.ts.
-- =============================================================================

-- ---------- BLOCKS + MUTES ---------------------------------------------------
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

create index if not exists blocks_blocked_idx on public.blocks (blocked_id);
create index if not exists mutes_muted_idx     on public.mutes (muted_id);

-- SECURITY DEFINER so RLS policies (e.g. messaging) can check a block in either
-- direction without exposing the block rows themselves to the other party.
create or replace function public.is_blocked(_a uuid, _b uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from public.blocks
    where (blocker_id = _a and blocked_id = _b)
       or (blocker_id = _b and blocked_id = _a)
  );
$$;

alter table public.blocks enable row level security;
alter table public.mutes  enable row level security;

-- A user only ever sees/manages their own block + mute lists.
drop policy if exists blocks_self on public.blocks;
create policy blocks_self on public.blocks for all using (auth.uid() = blocker_id) with check (auth.uid() = blocker_id);

drop policy if exists mutes_self on public.mutes;
create policy mutes_self on public.mutes for all using (auth.uid() = muter_id) with check (auth.uid() = muter_id);

-- ---------- DEMO PURGE: include pveels so demo reels clear on first real signup
create or replace function public.purge_demo_content()
returns void language sql security definer set search_path = public as $$
  delete from public.marketplace_listings where is_demo;
  delete from public.pveels where is_demo;
  delete from public.posts where is_demo;
  delete from public.users where is_demo;
$$;

-- ---------- SEARCH: fuzzy username match ------------------------------------
create index if not exists users_username_trgm_idx on public.users using gin (username gin_trgm_ops);

-- ---------- GDPR EXPORT STORAGE (private; signed URLs only) ------------------
insert into storage.buckets (id, name, public) values ('exports', 'exports', false)
on conflict (id) do nothing;

drop policy if exists "exports owner write"  on storage.objects;
drop policy if exists "exports owner delete" on storage.objects;
-- No public read: export files are reachable only via a server-issued, expiring
-- signed URL after the requester is confirmed to be the file's owner.
create policy "exports owner write" on storage.objects
  for insert to authenticated with check (bucket_id = 'exports');
create policy "exports owner delete" on storage.objects
  for delete to authenticated using (bucket_id = 'exports' and owner = auth.uid());

-- =============================================================================
-- DONE.
-- =============================================================================
