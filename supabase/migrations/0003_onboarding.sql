-- =============================================================================
-- Aurora · 0003 — onboarding completion flag on user_preferences
-- =============================================================================

alter table public.user_preferences
  add column if not exists onboarding_completed boolean not null default false,
  add column if not exists onboarding_completed_at timestamptz;

-- No new RLS policies — the existing user_prefs_self policy from 0001 already
-- restricts read/write to the owning user.
