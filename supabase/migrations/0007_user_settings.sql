-- =============================================================================
-- Aurora · 0007 — user settings blob
-- Adds a free-form settings jsonb on user_preferences for notification toggles,
-- AI feature toggles, language, and other per-user preferences. Mirrors
-- lib/db/schema.ts.
-- =============================================================================

alter table public.user_preferences
  add column if not exists settings jsonb;
