import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadViewerAccess, isEntitled, type ViewerAccess } from "@/lib/entitlement";
import { accentFor, type PveelView, type PveelVisibility } from "./types";

/**
 * Real Pveel reads from Supabase. Rows are world-readable so a non-subscriber
 * sees a locked preview; the server resolves a playable URL only when the
 * viewer is entitled (public URL for free clips, a short-lived signed URL from
 * the private `gated-media` bucket for gated clips). Returns empty when
 * Supabase isn't configured so callers fall back to the labeled demo set.
 *
 * GATED FILE CONVENTION: a gated pveel stores the object PATH inside the
 * `gated-media` bucket in `video_url`; a public pveel stores a full public URL.
 */

const GATED_BUCKET = "gated-media";
const SIGNED_TTL_SECONDS = 60 * 60;

function configured() {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

interface PveelRow {
  id: string;
  creator_id: string;
  video_url: string;
  poster_url: string | null;
  caption: string | null;
  category: string | null;
  hashtags: string[] | null;
  visibility: string;
  tier_required: string | null;
  duration_seconds: number | null;
  width: number | null;
  height: number | null;
  allow_comments: boolean;
  allow_tips: boolean;
  view_count: number;
  like_count: number;
  comment_count: number;
  save_count: number;
  created_at: string;
  is_demo: boolean;
  users: {
    username: string | null;
    display_name: string | null;
    is_verified: boolean;
  } | null;
}

const SELECT =
  "id, creator_id, video_url, poster_url, caption, category, hashtags, visibility, tier_required, duration_seconds, width, height, allow_comments, allow_tips, view_count, like_count, comment_count, save_count, created_at, is_demo, users!inner(username, display_name, is_verified)";

/** Issues a short-lived signed URL for a gated file (service role, after the
 * entitlement check upstream). Returns null when the service key is absent. */
async function signGatedUrl(path: string): Promise<string | null> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  try {
    const admin = createAdminClient();
    const { data } = await admin.storage
      .from(GATED_BUCKET)
      .createSignedUrl(path, SIGNED_TTL_SECONDS);
    return data?.signedUrl ?? null;
  } catch {
    return null;
  }
}

async function mapRow(
  r: PveelRow,
  access: ViewerAccess,
  liked: Set<string>,
  saved: Set<string>
): Promise<PveelView> {
  const visibility = (r.visibility as PveelVisibility) ?? "public";
  const entitled = isEntitled(access, {
    creatorId: r.creator_id,
    visibility,
    tierRequired: r.tier_required,
  });

  let playbackUrl: string | null = null;
  if (entitled) {
    playbackUrl =
      visibility === "public" ? r.video_url : await signGatedUrl(r.video_url);
  }

  return {
    id: r.id,
    creatorUsername: r.users?.username ?? "creator",
    creatorName: r.users?.display_name ?? r.users?.username ?? "Creator",
    verified: r.users?.is_verified ?? false,
    caption: r.caption ?? "",
    category: r.category,
    hashtags: r.hashtags ?? [],
    visibility,
    tierRequired: r.tier_required,
    gated: !entitled,
    playbackUrl,
    posterUrl: r.poster_url,
    durationSeconds: r.duration_seconds,
    width: r.width,
    height: r.height,
    allowComments: r.allow_comments,
    allowTips: r.allow_tips,
    likes: r.like_count,
    comments: r.comment_count,
    saves: r.save_count,
    views: r.view_count,
    liked: liked.has(r.id),
    saved: saved.has(r.id),
    createdAt: r.created_at,
    isDemo: r.is_demo,
    accent: accentFor(r.id),
  };
}

/** Resolves a batch of rows to PveelViews with one viewer-access load and one
 * likes/saves read, then per-row playback resolution. */
async function resolve(
  rows: PveelRow[],
  viewerId: string | null
): Promise<PveelView[]> {
  if (rows.length === 0) return [];
  const access = await loadViewerAccess(viewerId);

  let liked = new Set<string>();
  let saved = new Set<string>();
  if (viewerId) {
    const supabase = createClient();
    const ids = rows.map((r) => r.id);
    const [{ data: l }, { data: s }] = await Promise.all([
      supabase.from("pveel_likes").select("pveel_id").eq("user_id", viewerId).in("pveel_id", ids),
      supabase.from("pveel_saves").select("pveel_id").eq("user_id", viewerId).in("pveel_id", ids),
    ]);
    liked = new Set(((l ?? []) as { pveel_id: string }[]).map((r) => r.pveel_id));
    saved = new Set(((s ?? []) as { pveel_id: string }[]).map((r) => r.pveel_id));
  }

  return Promise.all(rows.map((r) => mapRow(r, access, liked, saved)));
}

/** For You: recent clips, newest first (heuristic ranking; AI personalization
 * layers on later, see PENDING_ANTHROPIC_KEY in the AI step). */
export async function getForYouPveels(viewerId: string | null): Promise<PveelView[]> {
  if (!configured()) return [];
  const supabase = createClient();
  const { data } = await supabase
    .from("pveels")
    .select(SELECT)
    .is("scheduled_for", null)
    .order("created_at", { ascending: false })
    .limit(30);
  return resolve((data as unknown as PveelRow[]) ?? [], viewerId);
}

/** Following: clips from creators the viewer follows, newest first. */
export async function getFollowingPveels(viewerId: string): Promise<PveelView[]> {
  if (!configured()) return [];
  const supabase = createClient();
  const { data: follows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", viewerId);
  const ids = ((follows ?? []) as { following_id: string }[]).map((f) => f.following_id);
  if (ids.length === 0) return [];
  const { data } = await supabase
    .from("pveels")
    .select(SELECT)
    .in("creator_id", ids)
    .is("scheduled_for", null)
    .order("created_at", { ascending: false })
    .limit(30);
  return resolve((data as unknown as PveelRow[]) ?? [], viewerId);
}

/** A creator's own clips (for the profile Pveels tab / viewer scoped to them). */
export async function getCreatorPveels(
  creatorId: string,
  viewerId: string | null
): Promise<PveelView[]> {
  if (!configured()) return [];
  const supabase = createClient();
  const { data } = await supabase
    .from("pveels")
    .select(SELECT)
    .eq("creator_id", creatorId)
    .is("scheduled_for", null)
    .order("created_at", { ascending: false })
    .limit(40);
  return resolve((data as unknown as PveelRow[]) ?? [], viewerId);
}
