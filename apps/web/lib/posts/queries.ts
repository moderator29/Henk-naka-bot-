import { createClient } from "@/lib/supabase/server";
import type { FeedPost, PostMedia } from "@/components/feed/PostCard";

/**
 * Real post reads from Supabase. All run under the caller's session so RLS
 * applies (public posts for anyone; gated posts only for active subscribers).
 * Returns empty when Supabase isn't configured, so callers fall back to the
 * labeled demo feed rather than crashing.
 */

function configured() {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

interface PostRow {
  id: string;
  caption: string | null;
  category: string | null;
  tier_required: string | null;
  created_at: string;
  creator_id: string;
  media: PostMedia[] | null;
  users: {
    username: string | null;
    display_name: string | null;
    is_verified: boolean;
  } | null;
}

function mapRow(r: PostRow): FeedPost {
  return {
    id: r.id,
    creatorUsername: r.users?.username ?? "creator",
    creatorName: r.users?.display_name ?? r.users?.username ?? "Creator",
    verified: r.users?.is_verified ?? false,
    caption: r.caption ?? "",
    category: r.category ?? "",
    gated: r.tier_required != null,
    likes: 0,
    comments: 0,
    createdAt: r.created_at,
    media: r.media ?? undefined,
  };
}

const SELECT =
  "id, caption, category, tier_required, created_at, creator_id, media, users!inner(username, display_name, is_verified)";

/**
 * Home feed: posts from creators the signed-in user follows, newest first.
 * Falls back to recent public posts when the follow graph is empty so the
 * feed is never barren for a real signed-in user.
 */
export async function getFeedPosts(userId: string | null): Promise<FeedPost[]> {
  if (!configured()) return [];
  const supabase = createClient();

  if (userId) {
    const { data: follows } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", userId);

    const ids = (follows ?? []).map((f) => f.following_id as string);
    if (ids.length > 0) {
      const { data } = await supabase
        .from("posts")
        .select(SELECT)
        .in("creator_id", ids)
        .order("created_at", { ascending: false })
        .limit(40);
      const rows = (data as unknown as PostRow[]) ?? [];
      if (rows.length > 0) return rows.map(mapRow);
    }
  }

  // Fallback: recent public posts.
  const { data } = await supabase
    .from("posts")
    .select(SELECT)
    .is("tier_required", null)
    .order("created_at", { ascending: false })
    .limit(40);
  return ((data as unknown as PostRow[]) ?? []).map(mapRow);
}

/** A specific user's own posts (for their profile). */
export async function getUserPosts(userId: string): Promise<FeedPost[]> {
  if (!configured()) return [];
  const supabase = createClient();
  const { data } = await supabase
    .from("posts")
    .select(SELECT)
    .eq("creator_id", userId)
    .order("created_at", { ascending: false })
    .limit(40);
  return ((data as unknown as PostRow[]) ?? []).map(mapRow);
}

/** A user's own posts that carry media, for the profile Media tab. */
export async function getUserMediaPosts(userId: string): Promise<FeedPost[]> {
  if (!configured()) return [];
  const supabase = createClient();
  const { data } = await supabase
    .from("posts")
    .select(SELECT)
    .eq("creator_id", userId)
    .not("media", "is", null)
    .order("created_at", { ascending: false })
    .limit(40);
  return ((data as unknown as PostRow[]) ?? []).map(mapRow);
}

interface LikeRow {
  posts: PostRow | null;
}

/**
 * Posts the user has liked, newest like first, for the profile Likes tab.
 * Reads through the `likes` join; gated posts the user can no longer see are
 * dropped by RLS on the embedded `posts` row.
 */
export async function getUserLikedPosts(userId: string): Promise<FeedPost[]> {
  if (!configured()) return [];
  const supabase = createClient();
  const { data } = await supabase
    .from("likes")
    .select(`created_at, posts!inner(${SELECT})`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(40);
  return ((data as unknown as LikeRow[]) ?? [])
    .map((r) => r.posts)
    .filter((p): p is PostRow => p != null)
    .map(mapRow);
}
