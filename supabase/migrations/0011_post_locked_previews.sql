-- =============================================================================
-- Aurora · 0011 — let gated posts show a locked preview
-- Relaxes post ROW reads to public so a non-subscriber can see the locked card
-- (caption + "subscribe to unlock"). This is safe ONLY because gated post media
-- now lives in the private `gated-media` bucket (migration 0009) and is served
-- exclusively via short-lived signed URLs after the entitlement check
-- (apps/web/lib/entitlement.ts + lib/media/sign.ts). The raw file is never
-- exposed to a non-entitled viewer. The author still controls writes.
-- Idempotent.
-- =============================================================================

drop policy if exists posts_public_read on public.posts;
create policy posts_public_read on public.posts for select using (true);

-- =============================================================================
-- DONE.
-- =============================================================================
