"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/auth/session";
import { notify } from "@/lib/notifications/notify";
import {
  SUBSCRIPTION_PERIOD_DAYS,
  type MySubscription,
  type SubscribeTarget,
} from "./types";

/**
 * Subscriptions are paid on-chain in $NSFW (the same ERC-20 transfer used for
 * tips), then recorded here under the fan's session so RLS enforces
 * "subscribe as yourself". The creator's denormalized subscriber_count is
 * recomputed from the live set of active subscriptions after each write, so it
 * never drifts on renewals or expiries.
 */

async function me() {
  try {
    return await getSessionUser();
  } catch {
    return null;
  }
}

interface TierRow {
  id: string;
  name: string;
  price_nsfw: string | number;
  price_usd: string | number | null;
  benefits: unknown;
  creator_id: string;
}

/** Resolves everything the subscribe modal needs to charge and record. */
export async function getSubscribeTarget(
  tierId: string
): Promise<SubscribeTarget | null> {
  const supabase = createClient();
  const { data: tier } = await supabase
    .from("subscription_tiers")
    .select("id, name, price_nsfw, price_usd, benefits, creator_id")
    .eq("id", tierId)
    .eq("is_active", true)
    .maybeSingle<TierRow>();
  if (!tier) return null;

  const [{ data: creator }, { data: profile }] = await Promise.all([
    supabase
      .from("users")
      .select("username, display_name, wallet_address")
      .eq("id", tier.creator_id)
      .maybeSingle<{
        username: string | null;
        display_name: string | null;
        wallet_address: string | null;
      }>(),
    supabase
      .from("creator_profiles")
      .select("payout_wallet")
      .eq("user_id", tier.creator_id)
      .maybeSingle<{ payout_wallet: string | null }>(),
  ]);

  return {
    tierId: tier.id,
    tierName: tier.name,
    benefits: Array.isArray(tier.benefits) ? (tier.benefits as string[]) : [],
    creatorUserId: tier.creator_id,
    creatorUsername: creator?.username ?? "creator",
    creatorName: creator?.display_name ?? creator?.username ?? "this creator",
    payoutWallet: profile?.payout_wallet ?? creator?.wallet_address ?? null,
    priceUsd: tier.price_usd != null ? Number(tier.price_usd) : null,
    priceNsfw: Number(tier.price_nsfw),
  };
}

async function refreshSubscriberCount(creatorId: string) {
  try {
    const admin = createAdminClient();
    const { data: tiers } = await admin
      .from("subscription_tiers")
      .select("id")
      .eq("creator_id", creatorId);
    const tierIds = (tiers ?? []).map((t) => t.id as string);
    if (tierIds.length === 0) return;
    const nowIso = new Date().toISOString();
    const { data: active } = await admin
      .from("subscriptions")
      .select("fan_id")
      .in("tier_id", tierIds)
      .gt("expires_at", nowIso);
    const unique = new Set((active ?? []).map((s) => s.fan_id as string));
    await admin
      .from("creator_profiles")
      .update({ subscriber_count: unique.size })
      .eq("user_id", creatorId);
  } catch {
    // Best-effort denormalized count; the source of truth is `subscriptions`.
  }
}

/** Record a subscription after the on-chain $NSFW payment confirms. */
export async function recordSubscription(
  tierId: string,
  txHash: string,
  amountNsfw: string
): Promise<{ ok: boolean; needsAuth?: boolean }> {
  const user = await me();
  if (!user) return { ok: false, needsAuth: true };

  const target = await getSubscribeTarget(tierId);
  if (!target) return { ok: false };

  const supabase = createClient();

  // Idempotency: a confirmed tx is recorded once. If we've already seen this
  // hash, treat the call as a success without double-applying.
  const { data: seen } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("tx_hash", txHash)
    .maybeSingle<{ id: string }>();
  if (seen) return { ok: true };

  const periodMs = SUBSCRIPTION_PERIOD_DAYS * 24 * 60 * 60 * 1000;

  // If the fan already has an active subscription to this tier, extend it from
  // its current expiry (a renewal) instead of inserting a duplicate active row.
  const { data: active } = await supabase
    .from("subscriptions")
    .select("id, expires_at")
    .eq("fan_id", user.id)
    .eq("tier_id", tierId)
    .gt("expires_at", new Date().toISOString())
    .order("expires_at", { ascending: false })
    .maybeSingle<{ id: string; expires_at: string }>();

  if (active) {
    const base = Math.max(Date.now(), new Date(active.expires_at).getTime());
    const { error } = await supabase
      .from("subscriptions")
      .update({
        expires_at: new Date(base + periodMs).toISOString(),
        auto_renew: true,
        amount_nsfw: amountNsfw,
        tx_hash: txHash,
      })
      .eq("id", active.id);
    if (error) return { ok: false };
  } else {
    const { error } = await supabase.from("subscriptions").insert({
      fan_id: user.id,
      tier_id: tierId,
      expires_at: new Date(Date.now() + periodMs).toISOString(),
      auto_renew: true,
      amount_nsfw: amountNsfw,
      tx_hash: txHash,
    });
    // A concurrent insert of the same tx hits the unique index; treat as done.
    if (error && error.code !== "23505") return { ok: false };
  }

  await Promise.all([
    refreshSubscriberCount(target.creatorUserId),
    notify(target.creatorUserId, user.id, "subscribe", {
      tierName: target.tierName,
    }),
  ]);
  return { ok: true };
}

interface SubRow {
  id: string;
  started_at: string;
  expires_at: string;
  auto_renew: boolean;
  subscription_tiers: {
    id: string;
    name: string;
    users: {
      username: string | null;
      display_name: string | null;
      avatar_url: string | null;
    } | null;
  } | null;
}

/** The caller's own subscriptions, newest first. */
export async function getMySubscriptions(): Promise<MySubscription[]> {
  const user = await me();
  if (!user) return [];

  const supabase = createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select(
      "id, started_at, expires_at, auto_renew, subscription_tiers!inner(id, name, users!inner(username, display_name, avatar_url))"
    )
    .eq("fan_id", user.id)
    .order("expires_at", { ascending: false });

  const now = Date.now();
  return ((data as unknown as SubRow[]) ?? []).map((r) => {
    const creator = r.subscription_tiers?.users;
    return {
      id: r.id,
      tierId: r.subscription_tiers?.id ?? "",
      tierName: r.subscription_tiers?.name ?? "Tier",
      creatorUsername: creator?.username ?? "creator",
      creatorName: creator?.display_name ?? creator?.username ?? "Creator",
      creatorAvatarUrl: creator?.avatar_url ?? null,
      startedAt: r.started_at,
      expiresAt: r.expires_at,
      autoRenew: r.auto_renew,
      active: new Date(r.expires_at).getTime() > now,
    };
  });
}

export interface MyTier {
  id: string;
  name: string;
  priceUsd: number | null;
}

/** The caller's own active subscription tiers (for gating a post to one). */
export async function getMyTiers(): Promise<MyTier[]> {
  const user = await me();
  if (!user) return [];
  const supabase = createClient();
  const { data } = await supabase
    .from("subscription_tiers")
    .select("id, name, price_usd")
    .eq("creator_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: true });
  return ((data ?? []) as { id: string; name: string; price_usd: string | number | null }[]).map(
    (t) => ({
      id: t.id,
      name: t.name,
      priceUsd: t.price_usd != null ? Number(t.price_usd) : null,
    })
  );
}

/**
 * Turn auto-renew on or off. Industry-standard "cancel" keeps access until the
 * period ends, then simply doesn't renew, so cancelling is auto_renew = false.
 */
export async function setAutoRenew(
  subscriptionId: string,
  autoRenew: boolean
): Promise<{ ok: boolean; needsAuth?: boolean }> {
  const user = await me();
  if (!user) return { ok: false, needsAuth: true };

  const supabase = createClient();
  const { error } = await supabase
    .from("subscriptions")
    .update({ auto_renew: autoRenew })
    .eq("id", subscriptionId)
    .eq("fan_id", user.id);
  return { ok: !error };
}
