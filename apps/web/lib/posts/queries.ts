import { createClient } from "@/lib/supabase/server";
import { signGatedUrl } from "@/lib/media/sign";
import { loadViewerAccess, isEntitled, type ViewerAccess } from "@/lib/entitlement";
import type { FeedPost, PostMedia } from "@/components/feed/PostCard";
import type { StoredMediaItem } from "./media";

/**
 * Real post reads from Supabase. Rows are readable so gated posts can show a
 * locked preview; media is resolved server-side: public posts get their public
 * URLs, gated posts get short-lived signed URLs ONLY when the viewer is
 * entitled (otherwise the post renders locked with no media). Returns empty
 * when Supabase isn't configured, so callers fall back to the demo feed.
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
  visibility: string | null;
  created_at: string;
  creator_id: string;
  media: StoredMediaItem[] | null;
  users: {
    username: string | null;
    display_name: string | null;
    is_verified: boolean;
  } | null;
}

const SELECT =
  "id, caption, category, tier_required, visibility, created_at, creator_id, media, users!inner(username, display_name, is_verified)";

async function resolveMedia(
  stored: StoredMediaItem[] | null,
  isGated: boolean,
  entitled: boolean
): Promise<PostMedia[]> {
  if (!stored || stored.length === 0) return [];
  if (isGated && !entitled) return []; // locked: never expose the file
  if (!isGated) {
    return stored.map((m) => ({ type: m.type, url: m.src, thumb: m.thumb, poster: m.poster }));
  }
  const out: PostMedia[] = [];
  for (const m of stored) {
    const url = await signGatedUrl(m.src);
    if (!url) continue;
    out.push({
      type: m.type,
      url,
      thumb: m.thumb ? (await signGatedUrl(m.thumb)) ?? undefined : undefined,
      poster: m.poster ? (await signGatedUrl(m.poster)) ?? undefined : undefined,
    });
  }
  return out;
}

async function mapRow(r: PostRow, access: ViewerAccess): Promise<FeedPost> {
  const visibility = (r.visibility ?? (r.tier_required ? "tier" : "public")) as
    | "public"
    | "followers"
    | "subscribers"
    | "tier";
  const isGated = visibility !== "public";
  const entitled = isEntitled(access, {
    creatorId: r.creator_id,
    visibility,
    tierRequired: r.tier_required,
  });
  const media = await resolveMedia(r.media, isGated, entitled);

  return {
    id: r.id,
    creatorUsername: r.users?.username ?? "creator",
    creatorName: r.users?.display_name ?? r.users?.username ?? "Creator",
    verified: r.users?.is_verified ?? false,
    caption: r.caption ?? "",
    category: r.category ?? "",
    gated: isGated && !entitled,
    likes: 0,
    comments: 0,
    createdAt: r.created_at,
    media,
  };
}

async function resolve(rows: PostRow[], viewerId: string | null): Promise<FeedPost[]> {
  if (rows.length === 0) return [];
  const access = await loadViewerAccess(viewerId);
  return Promise.all(rows.map((r) => mapRow(r, access)));
}

/**
 * Home feed: posts from creators the signed-in user follows, newest first.
 * Falls back to recent public posts when the follow graph is empty.
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
      if (rows.length > 0) return resolve(rows, userId);
    }
  }

  const { data } = await supabase
    .from("posts")
    .select(SELECT)
    .is("tier_required", null)
    .order("created_at", { ascending: false })
    .limit(40);
  return resolve((data as unknown as PostRow[]) ?? [], userId);
}

/** A specific user's own posts (for their profile). */
export async function getUserPosts(
  userId: string,
  viewerId: string | null = userId
): Promise<FeedPost[]> {
  if (!configured()) return [];
  const supabase = createClient();
  const { data } = await supabase
    .from("posts")
    .select(SELECT)
    .eq("creator_id", userId)
    .order("created_at", { ascending: false })
    .limit(40);
  return resolve((data as unknown as PostRow[]) ?? [], viewerId);
}

/** A user's own posts that carry media, for the profile Media tab. */
export async function getUserMediaPosts(
  userId: string,
  viewerId: string | null = userId
): Promise<FeedPost[]> {
  if (!configured()) return [];
  const supabase = createClient();
  const { data } = await supabase
    .from("posts")
    .select(SELECT)
    .eq("creator_id", userId)
    .not("media", "is", null)
    .order("created_at", { ascending: false })
    .limit(40);
  return resolve((data as unknown as PostRow[]) ?? [], viewerId);
}

interface LikeRow {
  posts: PostRow | null;
}

/** Posts the user has liked, newest like first, for the profile Likes tab. */
export async function getUserLikedPosts(
  userId: string,
  viewerId: string | null = userId
): Promise<FeedPost[]> {
  if (!configured()) return [];
  const supabase = createClient();
  const { data } = await supabase
    .from("likes")
    .select(`created_at, posts!inner(${SELECT})`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(40);
  const rows = ((data as unknown as LikeRow[]) ?? [])
    .map((r) => r.posts)
    .filter((p): p is PostRow => p != null);
  return resolve(rows, viewerId);
}
