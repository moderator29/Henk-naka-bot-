-- =============================================================================
-- Aurora · 0013 — roles, reports/moderation, admin audit log, announcements,
-- platform settings. Foundation for the admin panel + an 18+ moderation flow.
--
-- SECURITY: roles live in their OWN table (not a users column) so the existing
-- users_self_update policy can never let a user grant themselves a role. The
-- is_admin()/is_moderator() helpers are SECURITY DEFINER (owner-run, bypassing
-- RLS) so role checks in policies don't recurse. Idempotent + additive.
-- =============================================================================

-- ---------- ROLES ------------------------------------------------------------
create table if not exists public.user_roles (
  user_id uuid primary key references public.users(id) on delete cascade,
  role text not null default 'user'
    check (role in ('user', 'creator', 'moderator', 'admin', 'superadmin')),
  granted_by uuid references public.users(id) on delete set null,
  granted_at timestamptz not null default now()
);

create or replace function public.user_role(_uid uuid)
returns text language sql stable security definer set search_path = public as $$
  select coalesce((select role from public.user_roles where user_id = _uid), 'user');
$$;

create or replace function public.is_admin(_uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.user_role(_uid) in ('admin', 'superadmin');
$$;

create or replace function public.is_moderator(_uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.user_role(_uid) in ('moderator', 'admin', 'superadmin');
$$;

-- ---------- REPORTS / FLAGS --------------------------------------------------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.users(id) on delete cascade,
  target_type text not null check (target_type in ('post', 'pveel', 'comment', 'message', 'user')),
  target_id uuid not null,
  reason text not null,
  details text,
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  resolved_by uuid references public.users(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists reports_status_idx on public.reports (status, created_at desc);
create index if not exists reports_target_idx on public.reports (target_type, target_id);

-- ---------- ADMIN AUDIT LOG (append-only) ------------------------------------
create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.users(id) on delete set null,
  action text not null,
  target_type text,
  target_id text,
  detail jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_created_idx on public.admin_audit_log (created_at desc);

-- ---------- ANNOUNCEMENTS ----------------------------------------------------
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  audience text not null default 'all' check (audience in ('all', 'creators', 'fans')),
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists announcements_created_idx on public.announcements (created_at desc);

-- ---------- PLATFORM SETTINGS (feature flags, maintenance, fees) -------------
create table if not exists public.platform_settings (
  key text primary key,
  value jsonb,
  updated_by uuid references public.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

-- ---------- MODERATION FLAGS on content (soft) -------------------------------
alter table public.posts  add column if not exists is_removed boolean not null default false;
alter table public.pveels add column if not exists is_removed boolean not null default false;
alter table public.users  add column if not exists is_suspended boolean not null default false;

-- ---------- ROW LEVEL SECURITY ----------------------------------------------
alter table public.user_roles      enable row level security;
alter table public.reports         enable row level security;
alter table public.admin_audit_log enable row level security;
alter table public.announcements   enable row level security;
alter table public.platform_settings enable row level security;

-- Roles: you can read your own; admins read/write all. (Bootstrap the first
-- superadmin by inserting via the SQL editor, which runs as service role.)
drop policy if exists user_roles_read  on public.user_roles;
drop policy if exists user_roles_admin on public.user_roles;
create policy user_roles_read  on public.user_roles for select
  using (user_id = auth.uid() or public.is_admin(auth.uid()));
create policy user_roles_admin on public.user_roles for all
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- Reports: a user files + sees their own; moderators see + manage all.
drop policy if exists reports_insert on public.reports;
drop policy if exists reports_read   on public.reports;
drop policy if exists reports_mod    on public.reports;
create policy reports_insert on public.reports for insert with check (auth.uid() = reporter_id);
create policy reports_read   on public.reports for select
  using (auth.uid() = reporter_id or public.is_moderator(auth.uid()));
create policy reports_mod    on public.reports for update
  using (public.is_moderator(auth.uid())) with check (public.is_moderator(auth.uid()));

-- Audit log: admins read; admins insert (service role also writes).
drop policy if exists audit_admin_read   on public.admin_audit_log;
drop policy if exists audit_admin_insert on public.admin_audit_log;
create policy audit_admin_read   on public.admin_audit_log for select using (public.is_admin(auth.uid()));
create policy audit_admin_insert on public.admin_audit_log for insert with check (public.is_admin(auth.uid()));

-- Announcements: everyone reads; admins write.
drop policy if exists announcements_read  on public.announcements;
drop policy if exists announcements_admin on public.announcements;
create policy announcements_read  on public.announcements for select using (true);
create policy announcements_admin on public.announcements for all
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- Platform settings: everyone reads (feature flags); admins write.
drop policy if exists platform_settings_read  on public.platform_settings;
drop policy if exists platform_settings_admin on public.platform_settings;
create policy platform_settings_read  on public.platform_settings for select using (true);
create policy platform_settings_admin on public.platform_settings for all
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- =============================================================================
-- GRANT YOURSELF CEO: replace the email, run once in the SQL editor.
--   insert into public.user_roles (user_id, role)
--   select id, 'superadmin' from public.users where email = 'Phantomfcalls@gmail.com'
--   on conflict (user_id) do update set role = 'superadmin';
-- =============================================================================
