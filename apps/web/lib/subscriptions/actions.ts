"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/auth/session";
import { SUB_PERIOD_DAYS } from "./benefits";

/**
 * Subscription writes. Subscribing records the row after the on-chain $NSFW
 * payment confirms (the transfer happens client-side via wagmi, like tips);
 * the row drives entitlement everywhere. Managing (auto-renew, cancel) and the
 * fan's subscription list power Settings. Demo/preview tiers (non-uuid ids)
 * resolve to a no-op so the flow is previewable without real data.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface SubscribeTarget {
  tierId: string;
  name: string;
  priceNsfw: number;
  creatorId: string;
  creatorUsername: string;
  creatorName: string;
  payoutWallet: string | null;
  isPreview: boolean;
}

/** Resolves the on-chain payout wallet + price for a tier before subscribing. */
export async function getSubscribeTarget(tierId: string): Promise<SubscribeTarget | null> {
  if (!UUID.test(tierId)) return null; // demo/preview tier
  const supabase = createClient();
  const { data } = await supabase
    .from("subscription_tiers")
    .select("id, name, price_nsfw, creator_id, users:creator_id(username, display_name, wallet_address)")
    .eq("id", tierId)
    .maybeSingle();
  if (!data) return null;
  const row = data as unknown as {
    id: string;
    name: string;
    price_nsfw: number | string;
    creator_id: string;
    users:
      | { username: string | null; display_name: string | null; wallet_address: string | null }
      | { username: string | null; display_name: string | null; wallet_address: string | null }[]
      | null;
  };
  const u = Array.isArray(row.users) ? row.users[0] : row.users;
  return {
    tierId: row.id,
    name: row.name,
    priceNsfw: Number(row.price_nsfw),
    creatorId: row.creator_id,
    creatorUsername: u?.username ?? "creator",
    creatorName: u?.display_name ?? u?.username ?? "Creator",
    payoutWallet: u?.wallet_address ?? null,
    isPreview: false,
  };
}

const recordSchema = z.object({
  tierId: z.string().uuid(),
  txHash: z.string().regex(/^0x[0-9a-fA-F]+$/),
  amountNsfw: z.string(),
});

export interface SubscribeResult {
  ok: boolean;
  error?: string;
}

/** Record a subscription after the $NSFW payment confirms on-chain. */
export async function recordSubscription(
  input: z.input<typeof recordSchema>
): Promise<SubscribeResult> {
  let me;
  try {
    me = await getSessionUser();
  } catch {
    me = null;
  }
  if (!me) return { ok: false, error: "Sign in to subscribe." };

  const parsed = recordSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid subscription." };

  const supabase = createClient();
  const { data: tier } = await supabase
    .from("subscription_tiers")
    .select("id, creator_id")
    .eq("id", parsed.data.tierId)
    .maybeSingle<{ id: string; creator_id: string }>();
  if (!tier) return { ok: false, error: "That tier is no longer available." };
  if (tier.creator_id === me.id) return { ok: false, error: "You can't subscribe to yourself." };

  const expires = new Date(Date.now() + SUB_PERIOD_DAYS * 86_400_000).toISOString();
  const { error } = await supabase.from("subscriptions").insert({
    fan_id: me.id,
    tier_id: parsed.data.tierId,
    expires_at: expires,
    auto_renew: true,
    tx_hash: parsed.data.txHash,
  });
  if (error) return { ok: false, error: "Could not record subscription." };

  // Bump the creator's subscriber count + notify them (service role).
  try {
    const admin = createAdminClient();
    await admin.rpc("increment_subscriber_count", { _creator: tier.creator_id }).then(
      () => {},
      async () => {
        // No RPC: best-effort read-modify-write.
        const { data: cp } = await admin
          .from("creator_profiles")
          .select("subscriber_count")
          .eq("user_id", tier.creator_id)
          .maybeSingle<{ subscriber_count: number }>();
        await admin
          .from("creator_profiles")
          .update({ subscriber_count: (cp?.subscriber_count ?? 0) + 1 })
          .eq("user_id", tier.creator_id);
      }
    );
    const { data: actor } = await admin
      .from("users")
      .select("display_name, username")
      .eq("id", me.id)
      .maybeSingle<{ display_name: string | null; username: string | null }>();
    await admin.from("notifications").insert({
      user_id: tier.creator_id,
      type: "subscribe",
      payload: { actorId: me.id, actor_name: actor?.display_name ?? actor?.username ?? "Someone" },
    });
  } catch {
    /* best-effort */
  }

  revalidatePath("/settings");
  return { ok: true };
}

export interface MySubscription {
  id: string;
  tierName: string;
  priceNsfw: number;
  creatorName: string;
  creatorUsername: string;
  expiresAt: string;
  autoRenew: boolean;
  active: boolean;
}

export async function getMySubscriptions(): Promise<MySubscription[]> {
  let me;
  try {
    me = await getSessionUser();
  } catch {
    me = null;
  }
  if (!me) return [];

  const supabase = createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select(
      "id, expires_at, auto_renew, subscription_tiers:tier_id(name, price_nsfw, users:creator_id(username, display_name))"
    )
    .eq("fan_id", me.id)
    .order("expires_at", { ascending: false });

  const now = Date.now();
  return ((data ?? []) as unknown as {
    id: string;
    expires_at: string;
    auto_renew: boolean;
    subscription_tiers:
      | {
          name: string;
          price_nsfw: number | string;
          users: { username: string | null; display_name: string | null } | { username: string | null; display_name: string | null }[] | null;
        }
      | null;
  }[]).map((r) => {
    const tier = r.subscription_tiers;
    const u = tier ? (Array.isArray(tier.users) ? tier.users[0] : tier.users) : null;
    return {
      id: r.id,
      tierName: tier?.name ?? "Tier",
      priceNsfw: tier ? Number(tier.price_nsfw) : 0,
      creatorName: u?.display_name ?? u?.username ?? "Creator",
      creatorUsername: u?.username ?? "creator",
      expiresAt: r.expires_at,
      autoRenew: r.auto_renew,
      active: new Date(r.expires_at).getTime() > now,
    };
  });
}

export async function setAutoRenew(
  subscriptionId: string,
  on: boolean
): Promise<SubscribeResult> {
  let me;
  try {
    me = await getSessionUser();
  } catch {
    me = null;
  }
  if (!me) return { ok: false, error: "Sign in first." };
  const supabase = createClient();
  const { error } = await supabase
    .from("subscriptions")
    .update({ auto_renew: on })
    .eq("id", subscriptionId)
    .eq("fan_id", me.id);
  if (error) return { ok: false, error: "Could not update." };
  revalidatePath("/settings");
  return { ok: true };
}

/** Cancel = stop auto-renew; access continues until the period ends. */
export async function cancelSubscription(subscriptionId: string): Promise<SubscribeResult> {
  return setAutoRenew(subscriptionId, false);
}
