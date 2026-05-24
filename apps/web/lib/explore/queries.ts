import { createClient } from "@/lib/supabase/server";

/**
 * Explore data reads. Trending creators (by subscriber count) and recent
 * public posts come from Supabase under RLS. Everything returns empty when
 * Supabase isn't configured or nothing's seeded — Explore then shows honest
 * empty states, never fabricated creators or posts (Rule 7).
 */

function configured() {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export interface TrendingCreator {
  username: string;
  displayName: string;
  tagline: string | null;
  avatarUrl: string | null;
  verified: boolean;
  subscriberCount: number;
}

interface CreatorJoinRow {
  user_id: string;
  tagline: string | null;
  subscriber_count: number;
  users: {
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    is_verified: boolean;
  } | null;
}

export async function getTrendingCreators(
  limit = 8
): Promise<TrendingCreator[]> {
  if (!configured()) return [];
  const supabase = createClient();
  const { data, error } = await supabase
    .from("creator_profiles")
    .select(
      "user_id, tagline, subscriber_count, users!inner(username, display_name, avatar_url, is_verified)"
    )
    .order("subscriber_count", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return (data as unknown as CreatorJoinRow[])
    .filter((row) => row.users?.username)
    .map((row) => ({
      username: row.users!.username!,
      displayName: row.users!.display_name ?? row.users!.username!,
      tagline: row.tagline,
      avatarUrl: row.users!.avatar_url,
      verified: row.users!.is_verified,
      subscriberCount: row.subscriber_count,
    }));
}

export interface TrendingPost {
  id: string;
  caption: string;
  category: string | null;
  createdAt: string;
}

export async function getRecentPublicPosts(limit = 9): Promise<TrendingPost[]> {
  if (!configured()) return [];
  const supabase = createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("id, caption, category, created_at")
    .is("tier_required", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((p) => ({
    id: p.id as string,
    caption: (p.caption as string) ?? "",
    category: (p.category as string) ?? null,
    createdAt: p.created_at as string,
  }));
}
