-- =============================================================================
-- Aurora · broadcast/news + legal documents
--
-- News: announcements gain an image and become a real in-app feed that is
-- likeable and commentable. Broadcasting (admin) fans an announcement out to
-- every user's notifications + email + the /news page.
--
-- Legal: privacy / terms / disclaimer live in an admin-editable table. The app
-- ships sensible defaults in code and uses the DB row once an admin edits it.
-- =============================================================================

alter table public.announcements add column if not exists image_url text;

create table if not exists public.announcement_likes (
  announcement_id uuid not null references public.announcements(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (announcement_id, user_id)
);
alter table public.announcement_likes enable row level security;
drop policy if exists announcement_likes_read on public.announcement_likes;
drop policy if exists announcement_likes_write on public.announcement_likes;
create policy announcement_likes_read on public.announcement_likes for select using (true);
create policy announcement_likes_write on public.announcement_likes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.announcement_comments (
  id uuid primary key default gen_random_uuid(),
  announcement_id uuid not null references public.announcements(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists announcement_comments_idx
  on public.announcement_comments (announcement_id, created_at);
alter table public.announcement_comments enable row level security;
drop policy if exists announcement_comments_read on public.announcement_comments;
drop policy if exists announcement_comments_write on public.announcement_comments;
create policy announcement_comments_read on public.announcement_comments for select using (true);
create policy announcement_comments_write on public.announcement_comments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.legal_documents (
  slug text primary key,
  title text not null,
  content text not null,
  version integer not null default 1,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.users(id)
);
alter table public.legal_documents enable row level security;
drop policy if exists legal_read on public.legal_documents;
drop policy if exists legal_admin_write on public.legal_documents;
create policy legal_read on public.legal_documents for select using (true);
create policy legal_admin_write on public.legal_documents
  for all using (public.is_admin()) with check (public.is_admin());

-- Live news + comments to clients:
do $$
begin
  if not exists (select 1 from pg_publication_tables
    where pubname='supabase_realtime' and schemaname='public' and tablename='announcements') then
    alter publication supabase_realtime add table public.announcements;
  end if;
end $$;
