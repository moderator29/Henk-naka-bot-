-- =============================================================================
-- Aurora · subscription pricing
-- Tiers carry a USD list price (e.g. $20). Fans pay on-chain in $NSFW at the
-- live token price; price_nsfw is kept as the fallback token amount used when
-- a live price is briefly unavailable. No fiat rail: payment is the existing
-- ERC-20 $NSFW transfer, recorded against the subscription's tx_hash.
-- =============================================================================

alter table public.subscription_tiers
  add column if not exists price_usd numeric(12,2);
