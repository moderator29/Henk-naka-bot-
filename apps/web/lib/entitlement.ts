import { createClient } from "@/lib/supabase/server";
import type { PveelVisibility } from "@/lib/pveels/types";

/**
 * Content entitlement. The single source of truth for "may this viewer see the
 * gated FILE behind this content". Public content is open; the author always
 * sees their own; followers-only needs a follow; subscribers/tier needs an
 * active subscription. Gating is enforced here (and at the storage layer via
 * private buckets + signed URLs), never by a visual blur alone.
 */

function configured() {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export interface ViewerAccess {
  viewerId: string | null;
  /** creator ids this viewer follows */
  follows: Set<string>;
  /** creator ids this viewer has any active subscription to */
  subCreators: Set<string>;
  /** tier ids this viewer has an active subscription to */
  subTiers: Set<string>;
}

/**
 * Loads everything needed to decide entitlement for many items at once (so the
 * feed avoids an N+1). One follows read + one subscriptions read.
 */
export async function loadViewerAccess(
  viewerId: string | null
): Promise<ViewerAccess> {
  const empty: ViewerAccess = {
    viewerId,
    follows: new Set(),
    subCreators: new Set(),
    subTiers: new Set(),
  };
  if (!viewerId || !configured()) return empty;

  const supabase = createClient();
  const [{ data: f }, { data: s }] = await Promise.all([
    supabase.from("follows").select("following_id").eq("follower_id", viewerId),
    supabase
      .from("subscriptions")
      .select("tier_id, subscription_tiers!inner(creator_id)")
      .eq("fan_id", viewerId)
      .gt("expires_at", new Date().toISOString()),
  ]);

  const follows = new Set<string>(
    ((f ?? []) as { following_id: string }[]).map((r) => r.following_id)
  );
  const subTiers = new Set<string>();
  const subCreators = new Set<string>();
  type SubRow = {
    tier_id: string | null;
    subscription_tiers:
      | { creator_id: string }
      | { creator_id: string }[]
      | null;
  };
  for (const row of (s ?? []) as unknown as SubRow[]) {
    if (row.tier_id) subTiers.add(row.tier_id);
    const tier = Array.isArray(row.subscription_tiers)
      ? row.subscription_tiers[0]
      : row.subscription_tiers;
    if (tier?.creator_id) subCreators.add(tier.creator_id);
  }
  return { viewerId, follows, subCreators, subTiers };
}

/** Pure entitlement decision given pre-loaded viewer access. */
export function isEntitled(
  access: ViewerAccess,
  opts: {
    creatorId: string;
    visibility: PveelVisibility;
    tierRequired: string | null;
  }
): boolean {
  const { creatorId, visibility, tierRequired } = opts;
  if (visibility === "public") return true;
  if (access.viewerId && access.viewerId === creatorId) return true;
  if (!access.viewerId) return false;
  if (visibility === "followers") {
    return access.follows.has(creatorId) || access.subCreators.has(creatorId);
  }
  if (visibility === "tier" && tierRequired) {
    return access.subTiers.has(tierRequired);
  }
  // "subscribers": any active subscription to this creator.
  return access.subCreators.has(creatorId);
}
