"use server";

import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";

/**
 * Global keyword search across people and posts (video posts surface as
 * Pveels). Runs under the caller's session so RLS applies; excludes the viewer
 * and anyone in a block relationship. Distinct from the AI Smart Search bar.
 */

function configured() {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/** Strip characters that would break a PostgREST or/ilike filter. */
function sanitize(q: string): string {
  return q.replace(/[%,()*\\]/g, "").trim().slice(0, 60);
}

export interface PersonResult {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  verified: boolean;
}

export interface PostResult {
  id: string;
  caption: string;
  creatorUsername: string;
  creatorName: string;
  gated: boolean;
  isVideo: boolean;
}

export interface SearchResults {
  people: PersonResult[];
  posts: PostResult[];
  pveels: PostResult[];
}

export async function globalSearch(query: string): Promise<SearchResults> {
  const term = sanitize(query);
  const empty: SearchResults = { people: [], posts: [], pveels: [] };
  if (term.length < 1 || !configured()) return empty;

  const supabase = createClient();
  let meId: string | null = null;
  try {
    meId = (await getSessionUser())?.id ?? null;
  } catch {
    meId = null;
  }

  // Block relationships (either direction) are filtered out.
  const blocked = new Set<string>();
  if (meId) {
    const [{ data: b1 }, { data: b2 }] = await Promise.all([
      supabase.from("blocks").select("blocked_id").eq("blocker_id", meId),
      supabase.from("blocks").select("blocker_id").eq("blocked_id", meId),
    ]);
    for (const r of (b1 ?? []) as { blocked_id: string }[]) blocked.add(r.blocked_id);
    for (const r of (b2 ?? []) as { blocker_id: string }[]) blocked.add(r.blocker_id);
  }

  const [peopleRes, postsRes] = await Promise.all([
    supabase
      .from("users")
      .select("id, username, display_name, avatar_url, is_verified")
      .or(`username.ilike.%${term}%,display_name.ilike.%${term}%`)
      .limit(20),
    supabase
      .from("posts")
      .select(
        "id, caption, media, tier_required, users!inner(username, display_name)"
      )
      .ilike("caption", `%${term}%`)
      .order("created_at", { ascending: false })
      .limit(24),
  ]);

  const people: PersonResult[] = ((peopleRes.data ?? []) as Array<{
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    is_verified: boolean;
  }>)
    .filter((u) => u.id !== meId && !!u.username && !blocked.has(u.id))
    .slice(0, 12)
    .map((u) => ({
      id: u.id,
      username: u.username as string,
      displayName: u.display_name ?? (u.username as string),
      avatarUrl: u.avatar_url,
      verified: u.is_verified,
    }));

  const allPosts: PostResult[] = ((postsRes.data ?? []) as Array<{
    id: string;
    caption: string | null;
    media: { type?: string }[] | null;
    tier_required: string | null;
    users: { username: string | null; display_name: string | null } | { username: string | null; display_name: string | null }[] | null;
  }>).map((p) => {
    const creator = Array.isArray(p.users) ? p.users[0] : p.users;
    const isVideo = Array.isArray(p.media)
      ? p.media.some((m) => (m.type ?? "").startsWith("video/"))
      : false;
    return {
      id: p.id,
      caption: p.caption ?? "",
      creatorUsername: creator?.username ?? "creator",
      creatorName: creator?.display_name ?? creator?.username ?? "Creator",
      gated: p.tier_required != null,
      isVideo,
    };
  });

  return {
    people,
    posts: allPosts.filter((p) => !p.isVideo),
    pveels: allPosts.filter((p) => p.isVideo),
  };
}
