-- =============================================================================
-- Aurora · 0005 — demo content flags
-- Adds is_demo to users, posts, and marketplace_listings so owner-requested
-- demo/sample rows can be clearly marked and purged the moment the platform
-- goes fully real (and automatically on first real signup). Mirrors
-- lib/db/schema.ts.
-- =============================================================================

alter table public.users
  add column if not exists is_demo boolean not null default false;
alter table public.posts
  add column if not exists is_demo boolean not null default false;
alter table public.marketplace_listings
  add column if not exists is_demo boolean not null default false;

-- Demo rows are a small set swept on first real signup, so index only where
-- is_demo is true to keep these indexes tiny.
create index if not exists users_demo_idx
  on public.users (is_demo) where is_demo;
create index if not exists posts_demo_idx
  on public.posts (is_demo) where is_demo;
create index if not exists listings_demo_idx
  on public.marketplace_listings (is_demo) where is_demo;

-- One call purges every demo row. Invoked (service role) the first time a real
-- user completes signup, and runnable by hand to go fully real on demand.
create or replace function public.purge_demo_content()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.marketplace_listings where is_demo;
  delete from public.posts where is_demo;
  delete from public.users where is_demo;
$$;
