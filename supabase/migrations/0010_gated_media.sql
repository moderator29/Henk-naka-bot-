-- =============================================================================
-- Aurora · gated media done right
--
-- Before this, gated posts were protected only by hiding the ROW from
-- non-subscribers, while the media itself sat in a PUBLIC bucket (world-
-- readable by URL). That is both insecure and bad for conversion (no locked
-- teasers). New model:
--   1. Gated post ROWS are readable by anyone signed in, so locked teasers
--      (caption + "subscribe to unlock") show in the feed and on profiles.
--      Future-scheduled posts stay hidden from everyone but their author.
--   2. The MEDIA for gated posts lives in a PRIVATE bucket and is never stored
--      as a public URL. The app issues short-lived signed URLs only to the
--      creator or an active subscriber (see lib/posts/actions.ts getGatedMedia).
--
-- The private storage bucket itself must be created in Supabase (Storage is not
-- managed by these table migrations) — see OWNER ACTION below.
-- =============================================================================

drop policy if exists posts_public_read on public.posts;

create policy posts_public_read on public.posts
  for select using (
    auth.uid() = creator_id
    or scheduled_for is null
    or scheduled_for <= now()
  );

-- =============================================================================
-- OWNER ACTION — run this once in the Supabase SQL editor to create the private
-- bucket that holds subscriber-only media. The app uploads + signs via the
-- service role, so no extra storage RLS policies are required (a private bucket
-- denies all anonymous reads by default; signed URLs are issued server-side).
-- =============================================================================
--
--   insert into storage.buckets (id, name, public)
--   values ('post-media-private', 'post-media-private', false)
--   on conflict (id) do nothing;
--
