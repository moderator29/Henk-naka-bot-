-- =============================================================================
-- Aurora · 0008 — foreign-key cascades so account deletion never blocks
-- tips.from_user / tips.to_user must cascade (a user who sent or received a tip
-- could not be deleted otherwise). tips.post_id and posts.tier_required become
-- SET NULL so deleting a post/tier doesn't fail; subscriptions.tier_id cascades
-- so removing a creator's tier removes its subscriptions. Mirrors schema.ts.
-- =============================================================================

alter table public.tips drop constraint if exists tips_from_user_fkey;
alter table public.tips add constraint tips_from_user_fkey
  foreign key (from_user) references public.users(id) on delete cascade;

alter table public.tips drop constraint if exists tips_to_user_fkey;
alter table public.tips add constraint tips_to_user_fkey
  foreign key (to_user) references public.users(id) on delete cascade;

alter table public.tips drop constraint if exists tips_post_id_fkey;
alter table public.tips add constraint tips_post_id_fkey
  foreign key (post_id) references public.posts(id) on delete set null;

alter table public.subscriptions drop constraint if exists subscriptions_tier_id_fkey;
alter table public.subscriptions add constraint subscriptions_tier_id_fkey
  foreign key (tier_id) references public.subscription_tiers(id) on delete cascade;

alter table public.posts drop constraint if exists posts_tier_required_fkey;
alter table public.posts add constraint posts_tier_required_fkey
  foreign key (tier_required) references public.subscription_tiers(id) on delete set null;
