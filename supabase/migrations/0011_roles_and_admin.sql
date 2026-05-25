-- =============================================================================
-- Aurora · roles, moderation & admin foundation
--
-- Adds the role system the admin panel (/admin) is gated on, the safety layer
-- an 18+ platform needs (reports, blocks, mutes, creator applications,
-- per-post moderation status, per-user account status), plus admin-only
-- platform settings, announcements, and an append-only audit log.
--
-- Roles: user < creator < moderator < admin < superadmin. Admin = manage the
-- platform; moderator+ = staff (moderation). Helpers are SECURITY DEFINER so
-- RLS can call them without recursing on user_roles' own policy.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Roles
-- ---------------------------------------------------------------------------
create table if not exists public.user_roles (
  user_id uuid primary key references public.users(id) on delete cascade,
  role text not null default 'user'
    check (role in ('user','creator','moderator','admin','superadmin')),
  granted_at timestamptz not null default now(),
  granted_by uuid references public.users(id)
);

create or replace function public.current_user_role()
returns text language sql stable security definer set search_path = public as $$
  select coalesce(
    (select role from public.user_roles where user_id = auth.uid()),
    'user'
  );
$$;

create or replace function public.is_admin(_uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from public.user_roles
    where user_id = _uid and role in ('admin','superadmin')
  );
$$;

create or replace function public.is_staff(_uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from public.user_roles
    where user_id = _uid and role in ('moderator','admin','superadmin')
  );
$$;

alter table public.user_roles enable row level security;
drop policy if exists user_roles_self_read on public.user_roles;
drop policy if exists user_roles_admin_write on public.user_roles;
create policy user_roles_self_read on public.user_roles
  for select using (auth.uid() = user_id or public.is_staff());
create policy user_roles_admin_write on public.user_roles
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 2. Append-only admin audit log (writes happen via the service role)
-- ---------------------------------------------------------------------------
create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.users(id),
  action text not null,
  target_type text,
  target_id text,
  detail jsonb,
  created_at timestamptz not null default now()
);
create index if not exists admin_audit_created_idx on public.admin_audit_log (created_at desc);
alter table public.admin_audit_log enable row level security;
drop policy if exists admin_audit_staff_read on public.admin_audit_log;
create policy admin_audit_staff_read on public.admin_audit_log
  for select using (public.is_staff());

-- ---------------------------------------------------------------------------
-- 3. Reports / flags (content + users)
-- ---------------------------------------------------------------------------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.users(id) on delete set null,
  target_type text not null
    check (target_type in ('post','comment','user','message','profile')),
  target_id text not null,
  reason text not null,
  detail text,
  status text not null default 'open'
    check (status in ('open','reviewing','resolved','dismissed')),
  resolved_by uuid references public.users(id),
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists reports_status_idx on public.reports (status, created_at desc);
alter table public.reports enable row level security;
drop policy if exists reports_insert_self on public.reports;
drop policy if exists reports_read on public.reports;
drop policy if exists reports_staff_update on public.reports;
create policy reports_insert_self on public.reports
  for insert with check (auth.uid() = reporter_id);
create policy reports_read on public.reports
  for select using (auth.uid() = reporter_id or public.is_staff());
create policy reports_staff_update on public.reports
  for update using (public.is_staff()) with check (public.is_staff());

-- ---------------------------------------------------------------------------
-- 4. Blocks & mutes
-- ---------------------------------------------------------------------------
create table if not exists public.blocks (
  blocker_id uuid not null references public.users(id) on delete cascade,
  blocked_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id)
);
alter table public.blocks enable row level security;
drop policy if exists blocks_self on public.blocks;
create policy blocks_self on public.blocks
  for all using (auth.uid() = blocker_id) with check (auth.uid() = blocker_id);

create table if not exists public.mutes (
  muter_id uuid not null references public.users(id) on delete cascade,
  muted_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (muter_id, muted_id)
);
alter table public.mutes enable row level security;
drop policy if exists mutes_self on public.mutes;
create policy mutes_self on public.mutes
  for all using (auth.uid() = muter_id) with check (auth.uid() = muter_id);

-- ---------------------------------------------------------------------------
-- 5. Creator applications (verification queue)
-- ---------------------------------------------------------------------------
create table if not exists public.creator_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending','approved','rejected')),
  display_name text,
  categories text[],
  payout_wallet text,
  bio text,
  reviewed_by uuid references public.users(id),
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz not null default now()
);
create index if not exists creator_apps_status_idx
  on public.creator_applications (status, created_at desc);
alter table public.creator_applications enable row level security;
drop policy if exists creator_apps_read on public.creator_applications;
drop policy if exists creator_apps_insert_self on public.creator_applications;
drop policy if exists creator_apps_staff_update on public.creator_applications;
create policy creator_apps_read on public.creator_applications
  for select using (auth.uid() = user_id or public.is_staff());
create policy creator_apps_insert_self on public.creator_applications
  for insert with check (auth.uid() = user_id);
create policy creator_apps_staff_update on public.creator_applications
  for update using (public.is_staff()) with check (public.is_staff());

-- ---------------------------------------------------------------------------
-- 6. Moderation / account status columns
-- ---------------------------------------------------------------------------
alter table public.posts add column if not exists moderation_status text not null
  default 'active' check (moderation_status in ('active','age_restricted','removed'));
alter table public.users add column if not exists account_status text not null
  default 'active' check (account_status in ('active','suspended','banned'));

-- Hide removed / unpublished posts from non-authors (supersedes 0010's policy).
drop policy if exists posts_public_read on public.posts;
create policy posts_public_read on public.posts
  for select using (
    auth.uid() = creator_id
    or (
      moderation_status <> 'removed'
      and (scheduled_for is null or scheduled_for <= now())
    )
  );

-- ---------------------------------------------------------------------------
-- 7. Platform settings (admin-managed key/value) + announcements
-- ---------------------------------------------------------------------------
create table if not exists public.platform_settings (
  key text primary key,
  value jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.users(id)
);
alter table public.platform_settings enable row level security;
drop policy if exists platform_settings_read on public.platform_settings;
drop policy if exists platform_settings_admin_write on public.platform_settings;
create policy platform_settings_read on public.platform_settings
  for select using (true);
create policy platform_settings_admin_write on public.platform_settings
  for all using (public.is_admin()) with check (public.is_admin());

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  audience text not null default 'all'
    check (audience in ('all','creators','fans')),
  created_by uuid references public.users(id),
  created_at timestamptz not null default now()
);
create index if not exists announcements_created_idx on public.announcements (created_at desc);
alter table public.announcements enable row level security;
drop policy if exists announcements_read on public.announcements;
drop policy if exists announcements_admin_write on public.announcements;
create policy announcements_read on public.announcements
  for select using (true);
create policy announcements_admin_write on public.announcements
  for all using (public.is_admin()) with check (public.is_admin());

-- =============================================================================
-- OWNER ACTION — grant yourself superadmin AFTER running everything above.
-- (Your earlier attempt failed only because public.user_roles did not exist yet.)
-- =============================================================================
--
--   insert into public.user_roles (user_id, role)
--   select id, 'superadmin' from public.users
--   where email = 'pleasurecoinv2@gmail.com'
--   on conflict (user_id) do update set role = 'superadmin';
--
