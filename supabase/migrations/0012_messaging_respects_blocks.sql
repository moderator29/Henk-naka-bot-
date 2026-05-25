-- =============================================================================
-- Aurora · 0012 — DMs respect blocks
-- Adds an is_blocked() guard to the conversation + message INSERT policies so a
-- blocked user can't start a thread with, or message, someone who blocked them
-- (in either direction). Uses the SECURITY DEFINER helper from migration 0010.
-- Idempotent.
-- =============================================================================

drop policy if exists conv_participant_insert on public.conversations;
create policy conv_participant_insert on public.conversations for insert with check (
  auth.uid() in (participant_a, participant_b)
  and not public.is_blocked(participant_a, participant_b)
);

drop policy if exists messages_participant_insert on public.messages;
create policy messages_participant_insert on public.messages for insert with check (
  auth.uid() = sender_id
  and exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id
      and auth.uid() in (c.participant_a, c.participant_b)
      and not public.is_blocked(c.participant_a, c.participant_b)
  )
);

-- =============================================================================
-- DONE.
-- =============================================================================
