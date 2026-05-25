-- =============================================================================
-- Aurora · DM permission
-- Following is open by default. DMs default to "everyone"; a user can switch to
-- "mutuals" so only people they follow back can start a conversation with them.
-- Enforced server-side in startConversation.
-- =============================================================================

alter table public.users
  add column if not exists dm_permission text not null default 'everyone'
    check (dm_permission in ('everyone', 'mutuals'));
