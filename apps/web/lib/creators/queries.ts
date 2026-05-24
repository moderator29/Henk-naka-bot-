import { createClient } from "@/lib/supabase/server";
import type { CreatorProfileData, CreatorTier, CreatorPostCard } from "./types";

/**
 * Fetches a real creator profile by username from Supabase. Returns null when
 * Supabase isn't configured or no such creator exists — the page then falls
 * back to the labeled preview. RLS makes only public fields + non-gated posts
 * readable to anonymous visitors.
 */

function configured() {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

interface UserRow {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  is_verified: boolean;
  last_active_at: string | null;
}

interface ProfileRow {
  tagline: string | null;
  categories: string[] | null;
  subscriber_count: number;
  total_earnings_nsfw: string | number;
}

export async function getCreatorByUsername(
  username: string
): Promise<CreatorProfileData | null> {
  if (!configured()) return null;

  const supabase = createClient();
  const { data: user } = await supabase
    .from("users")
    .select("id, username, display_name, avatar_url, cover_url, is_verified, last_active_at")
    .eq("username", username)
    .eq("is_creator", true)
    .maybeSingle<UserRow>();

  if (!user) return null;

  const [{ data: profile }, { data: tiers }, { data: posts }, { count }] =
    await Promise.all([
      supabase
        .from("creator_profiles")
        .select("tagline, categories, subscriber_count, total_earnings_nsfw")
        .eq("user_id", user.id)
        .maybeSingle<ProfileRow>(),
      supabase
        .from("subscription_tiers")
        .select("id, name, price_nsfw, benefits")
        .eq("creator_id", user.id)
        .eq("is_active", true),
      supabase
        .from("posts")
        .select("id, caption, category, tier_required, created_at")
        .eq("creator_id", user.id)
        .order("created_at", { ascending: false })
        .limit(24),
      supabase
        .from("posts")
        .select("id", { count: "exact", head: true })
        .eq("creator_id", user.id),
    ]);

  const mappedTiers: CreatorTier[] = (tiers ?? []).map((t) => ({
    id: t.id as string,
    name: t.name as string,
    priceNsfw: Number(t.price_nsfw),
    benefits: Array.isArray(t.benefits) ? (t.benefits as string[]) : [],
  }));

  const mappedPosts: CreatorPostCard[] = (posts ?? []).map((p) => ({
    id: p.id as string,
    caption: (p.caption as string) ?? "",
    category: (p.category as string) ?? null,
    gated: p.tier_required != null,
    createdAt: p.created_at as string,
  }));

  const lastActive = user.last_active_at
    ? new Date(user.last_active_at).getTime()
    : 0;

  return {
    username: user.username ?? username,
    displayName: user.display_name ?? username,
    tagline: profile?.tagline ?? "",
    verified: user.is_verified,
    avatarUrl: user.avatar_url,
    coverUrl: user.cover_url,
    categories: profile?.categories ?? [],
    subscriberCount: profile?.subscriber_count ?? 0,
    postCount: count ?? mappedPosts.length,
    totalEarningsNsfw: Number(profile?.total_earnings_nsfw ?? 0),
    activeRecently: Date.now() - lastActive < 1000 * 60 * 60 * 24 * 3,
    tiers: mappedTiers,
    posts: mappedPosts,
    isPreview: false,
  };
}
