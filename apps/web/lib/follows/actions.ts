"use server";

import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";

/**
 * Follower / following list reads, callable from the client (the lists open
 * from the profile stats). Each row carries whether the viewer follows that
 * person, so the list can show a working Follow / Following control.
 */

function configured() {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export interface FollowUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  verified: boolean;
  isFollowing: boolean;
  isSelf: boolean;
}

interface UserRow {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  is_verified: boolean;
}

async function hydrate(ids: string[]): Promise<FollowUser[]> {
  if (ids.length === 0) return [];
  let meId: string | null = null;
  try {
    meId = (await getSessionUser())?.id ?? null;
  } catch {
    meId = null;
  }

  const supabase = createClient();
  const [{ data: users }, { data: myFollows }] = await Promise.all([
    supabase
      .from("users")
      .select("id, username, display_name, avatar_url, is_verified")
      .in("id", ids),
    meId
      ? supabase.from("follows").select("following_id").eq("follower_id", meId)
      : Promise.resolve({ data: [] as { following_id: string }[] }),
  ]);

  const following = new Set(
    ((myFollows ?? []) as { following_id: string }[]).map((f) => f.following_id)
  );

  return ((users ?? []) as UserRow[])
    .filter((u) => u.username)
    .map((u) => ({
      id: u.id,
      username: u.username as string,
      displayName: u.display_name ?? (u.username as string),
      avatarUrl: u.avatar_url,
      verified: u.is_verified,
      isFollowing: following.has(u.id),
      isSelf: u.id === meId,
    }));
}

export async function getFollowers(userId: string): Promise<FollowUser[]> {
  if (!configured()) return [];
  const supabase = createClient();
  const { data } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("following_id", userId)
    .order("created_at", { ascending: false })
    .limit(200);
  return hydrate(((data ?? []) as { follower_id: string }[]).map((r) => r.follower_id));
}

export async function getFollowing(userId: string): Promise<FollowUser[]> {
  if (!configured()) return [];
  const supabase = createClient();
  const { data } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", userId)
    .order("created_at", { ascending: false })
    .limit(200);
  return hydrate(((data ?? []) as { following_id: string }[]).map((r) => r.following_id));
}
