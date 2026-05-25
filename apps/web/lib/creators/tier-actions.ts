"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import { fetchLivePrice } from "@/lib/market/coingecko";

/**
 * Creator-side subscription tier management. Tiers are priced in USD; fans pay
 * on-chain in $NSFW at the live rate (lib/subscriptions). We snapshot a
 * price_nsfw fallback at write time from the live price so charging still works
 * if the price feed is briefly unavailable. All writes run under the creator's
 * session, so RLS (tiers_owner_write) enforces "manage only your own tiers".
 */

const tierSchema = z.object({
  name: z.string().trim().min(1).max(60),
  priceUsd: z.number().positive().max(100000),
  benefits: z.array(z.string().trim().min(1).max(140)).max(12),
});

export type TierInput = z.infer<typeof tierSchema>;

export interface TierActionResult {
  ok: boolean;
  error?: string;
}

async function me() {
  try {
    return await getSessionUser();
  } catch {
    return null;
  }
}

async function snapshotNsfw(priceUsd: number): Promise<number> {
  const { price } = await fetchLivePrice();
  return price && price > 0 ? priceUsd / price : 0;
}

export async function createTier(input: TierInput): Promise<TierActionResult> {
  const user = await me();
  if (!user) return { ok: false, error: "Sign in to manage tiers." };

  const parsed = tierSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Check the tier details." };

  const supabase = createClient();
  const { error } = await supabase.from("subscription_tiers").insert({
    creator_id: user.id,
    name: parsed.data.name,
    price_usd: parsed.data.priceUsd,
    price_nsfw: await snapshotNsfw(parsed.data.priceUsd),
    benefits: parsed.data.benefits,
    is_active: true,
  });
  if (error) return { ok: false, error: "Could not create the tier." };

  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateTier(
  tierId: string,
  input: TierInput
): Promise<TierActionResult> {
  const user = await me();
  if (!user) return { ok: false, error: "Sign in to manage tiers." };

  const parsed = tierSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Check the tier details." };

  const supabase = createClient();
  const { error } = await supabase
    .from("subscription_tiers")
    .update({
      name: parsed.data.name,
      price_usd: parsed.data.priceUsd,
      price_nsfw: await snapshotNsfw(parsed.data.priceUsd),
      benefits: parsed.data.benefits,
    })
    .eq("id", tierId)
    .eq("creator_id", user.id);
  if (error) return { ok: false, error: "Could not update the tier." };

  revalidatePath("/dashboard");
  return { ok: true };
}

/** Soft-hide or re-show a tier. Existing subscribers keep their access. */
export async function setTierActive(
  tierId: string,
  active: boolean
): Promise<TierActionResult> {
  const user = await me();
  if (!user) return { ok: false, error: "Sign in to manage tiers." };

  const supabase = createClient();
  const { error } = await supabase
    .from("subscription_tiers")
    .update({ is_active: active })
    .eq("id", tierId)
    .eq("creator_id", user.id);
  if (error) return { ok: false, error: "Could not update the tier." };

  revalidatePath("/dashboard");
  return { ok: true };
}
