import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import type { FeedPost } from "@/components/feed/PostCard";

type DbClient = ReturnType<typeof createClient>;

/**
 * Hydrate each post with whether the viewer already liked / saved it, so the
 * UI reflects real state on load instead of always starting "unliked".
 */
async function applyViewerState(
  supabase: DbClient,
  posts: FeedPost[],
  userId: string | null
): Promise<FeedPost[]> {
  if (!userId || posts.length === 0) return posts;
  const ids = posts.map((p) => p.id);
  const [{ data: likes }, { data: saves }] = await Promise.all([
    supabase.from("likes").select("post_id").eq("user_id", userId).in("post_id", ids),
    supabase.from("saves").select("post_id").eq("user_id", userId).in("post_id", ids),
  ]);
  const liked = new Set((likes ?? []).map((l) => l.post_id as string));
  const saved = new Set((saves ?? []).map((s) => s.post_id as string));
  return posts.map((p) => ({
    ...p,
    likedByMe: liked.has(p.id),
    savedByMe: saved.has(p.id),
  }));
}

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

interface PostMedia {
  url?: string;
  path?: string;
  type: string;
}

interface PostRow {
  id: string;
  caption: string | null;
  category: string | null;
  tier_required: string | null;
  media: PostMedia[] | null;
  created_at: string;
  creator_id: string;
  users: {
    username: string | null;
    display_name: string | null;
    is_verified: boolean;
  } | null;
  likes: { count: number }[] | null;
  comments: { count: number }[] | null;
}

function mapRow(r: PostRow): FeedPost {
  const gated = r.tier_required != null;
  // Gated posts expose no media here — the private storage path stays server-
  // side and entitled viewers fetch a signed URL via getGatedMedia. Public
  // posts carry their public URLs.
  const media = gated
    ? []
    : (Array.isArray(r.media) ? r.media : [])
        .filter((m): m is { url: string; type: string } => !!m.url)
        .map((m) => ({ url: m.url, type: m.type }));
  return {
    id: r.id,
    creatorUsername: r.users?.username ?? "creator",
    creatorName: r.users?.display_name ?? r.users?.username ?? "Creator",
    verified: r.users?.is_verified ?? false,
    caption: r.caption ?? "",
    category: r.category ?? "",
    gated,
    media,
    likes: r.likes?.[0]?.count ?? 0,
    comments: r.comments?.[0]?.count ?? 0,
    createdAt: r.created_at,
  };
}

const SELECT =
  "id, caption, category, tier_required, media, created_at, creator_id, users!inner(username, display_name, is_verified), likes(count), comments(count)";

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
      if (rows.length > 0) {
        return applyViewerState(supabase, rows.map(mapRow), userId);
      }
    }
  }

  // Fallback: recent public posts.
  const { data } = await supabase
    .from("posts")
    .select(SELECT)
    .is("tier_required", null)
    .order("created_at", { ascending: false })
    .limit(40);
  const posts = ((data as unknown as PostRow[]) ?? []).map(mapRow);
  return applyViewerState(supabase, posts, userId);
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
  const posts = ((data as unknown as PostRow[]) ?? []).map(mapRow);
  const viewer = await getSessionUser().catch(() => null);
  return applyViewerState(supabase, posts, viewer?.id ?? null);
}
