-- 0018 — Subscription integrity
--
-- Store the on-chain amount paid for each subscription, and stop the same
-- confirmed transaction (or a duplicate re-subscribe) from creating multiple
-- active rows. A partial unique index on tx_hash makes recording idempotent;
-- the app extends an existing active subscription instead of inserting a
-- duplicate. amount_nsfw records what was actually paid (was previously
-- discarded), so earnings/history reflect real figures.

alter table public.subscriptions
  add column if not exists amount_nsfw numeric(36, 6);

create unique index if not exists subs_tx_hash_unique
  on public.subscriptions (tx_hash)
  where tx_hash is not null;
