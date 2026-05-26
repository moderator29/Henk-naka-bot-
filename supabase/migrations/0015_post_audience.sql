-- =============================================================================
-- Aurora · post audience
-- Posts gain an audience level that controls who can see the media:
--   public      → everyone
--   free        → any signed-in member
--   followers   → only people who follow the creator
--   subscribers → only active subscribers to tier_required
-- The row stays visible everywhere as a locked teaser; the MEDIA is gated by
-- the app via signed URLs (lib/posts/actions getGatedMedia). Existing gated
-- posts (tier_required set) are backfilled to 'subscribers'.
-- =============================================================================

alter table public.posts
  add column if not exists audience text not null default 'public'
    check (audience in ('public', 'free', 'followers', 'subscribers'));

update public.posts
  set audience = 'subscribers'
  where tier_required is not null and audience = 'public';
