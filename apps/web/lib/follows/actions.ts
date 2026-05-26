"use server";

import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";

/**
 * Follower / following lists for the tappable counts on a profile. Read under
 * the caller's session; each row carries whether the viewer already follows
 * that person so the list can offer follow-back.
 */

export interface FollowPerson {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  followedByMe: boolean;
  isMe: boolean;
}

interface UserEmbed {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
}

export async function getFollowList(
  userId: string,
  type: "followers" | "following"
): Promise<FollowPerson[]> {
  const supabase = createClient();
  const viewer = await getSessionUser().catch(() => null);

  // followers: people who follow userId; following: people userId follows.
  const column = type === "followers" ? "follower_id" : "following_id";
  const matchColumn = type === "followers" ? "following_id" : "follower_id";
  const { data } = await supabase
    .from("follows")
    .select(`users:${column}(id, username, display_name, avatar_url)`)
    .eq(matchColumn, userId)
    .limit(100);

  const people = ((data ?? []) as { users: UserEmbed | UserEmbed[] | null }[])
    .map((r) => (Array.isArray(r.users) ? r.users[0] : r.users))
    .filter((u): u is UserEmbed => !!u && !!u.username);

  // Which of these the viewer already follows.
  let myFollows = new Set<string>();
  if (viewer && people.length > 0) {
    const { data: mine } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", viewer.id)
      .in(
        "following_id",
        people.map((p) => p.id)
      );
    myFollows = new Set((mine ?? []).map((f) => f.following_id as string));
  }

  return people.map((u) => ({
    id: u.id,
    username: u.username as string,
    displayName: u.display_name ?? (u.username as string),
    avatarUrl: u.avatar_url,
    followedByMe: myFollows.has(u.id),
    isMe: viewer?.id === u.id,
  }));
}
