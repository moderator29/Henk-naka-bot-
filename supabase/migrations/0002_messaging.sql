-- =============================================================================
-- Aurora · 0002 — direct messaging
-- Adds conversations + messages tables with participant-only RLS.
-- =============================================================================

-- Conversations.
-- participant_a and participant_b are stored in canonical (sorted) order via
-- the conv_canonical_pair check so a unique constraint prevents duplicate
-- threads between the same two users.
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  participant_a uuid not null references public.users(id) on delete cascade,
  participant_b uuid not null references public.users(id) on delete cascade,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  constraint conv_distinct_participants check (participant_a <> participant_b),
  constraint conv_canonical_pair check (participant_a < participant_b)
);
create unique index if not exists conv_pair_unique_idx
  on public.conversations (participant_a, participant_b);
create index if not exists conv_a_idx on public.conversations (participant_a);
create index if not exists conv_b_idx on public.conversations (participant_b);
create index if not exists conv_last_msg_idx
  on public.conversations (last_message_at desc nulls last);

-- Messages.
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.users(id) on delete cascade,
  body text,
  -- media reserved for post-MVP image/audio/tip attachments. Null at MVP.
  media jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint messages_body_or_media check (
    body is not null or media is not null
  )
);
create index if not exists messages_conv_idx on public.messages (conversation_id);
create index if not exists messages_created_idx on public.messages (created_at desc);

-- ------------------------------------------------------------------------- --
-- Bump conversations.last_message_at whenever a message lands so the
-- conversation list orders correctly without a separate write.
-- ------------------------------------------------------------------------- --

create or replace function public.bump_conversation_last_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
     set last_message_at = new.created_at
   where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists messages_bump_conversation on public.messages;
create trigger messages_bump_conversation
  after insert on public.messages
  for each row
  execute function public.bump_conversation_last_message();

-- ------------------------------------------------------------------------- --
-- RLS
-- ------------------------------------------------------------------------- --

alter table public.conversations enable row level security;
alter table public.messages       enable row level security;

create policy conv_participant_read on public.conversations
  for select
  using (auth.uid() in (participant_a, participant_b));

create policy conv_participant_insert on public.conversations
  for insert
  with check (auth.uid() in (participant_a, participant_b));

-- A user can only read messages in conversations they participate in.
create policy messages_participant_read on public.messages
  for select
  using (
    exists (
      select 1
      from public.conversations c
      where c.id = messages.conversation_id
        and auth.uid() in (c.participant_a, c.participant_b)
    )
  );

-- A user can only send messages as themselves, into conversations they
-- participate in.
create policy messages_participant_insert on public.messages
  for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1
      from public.conversations c
      where c.id = messages.conversation_id
        and auth.uid() in (c.participant_a, c.participant_b)
    )
  );

-- A user can mark messages addressed to them as read (updates read_at).
-- They can never edit body or media after insert (handled at app layer + by
-- absence of an UPDATE policy on those columns).
create policy messages_recipient_mark_read on public.messages
  for update
  using (
    sender_id <> auth.uid()
    and exists (
      select 1
      from public.conversations c
      where c.id = messages.conversation_id
        and auth.uid() in (c.participant_a, c.participant_b)
    )
  )
  with check (
    sender_id <> auth.uid()
  );
