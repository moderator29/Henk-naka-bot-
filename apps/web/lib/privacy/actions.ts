"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";

/**
 * Block list management. Blocking is enforced at the data layer for DMs
 * (migration 0012) and hides the blocked user from search. All writes run
 * under the caller's session (RLS: a user only manages their own blocks).
 */

export interface BlockedUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface BlockResult {
  ok: boolean;
  error?: string;
  needsAuth?: boolean;
}

async function me() {
  try {
    return await getSessionUser();
  } catch {
    return null;
  }
}

export async function getBlockedUsers(): Promise<BlockedUser[]> {
  const user = await me();
  if (!user) return [];
  const supabase = createClient();
  const { data } = await supabase
    .from("blocks")
    .select("blocked_id, users:blocked_id(username, display_name, avatar_url)")
    .eq("blocker_id", user.id)
    .order("created_at", { ascending: false });

  return ((data ?? []) as {
    blocked_id: string;
    users:
      | { username: string | null; display_name: string | null; avatar_url: string | null }
      | { username: string | null; display_name: string | null; avatar_url: string | null }[]
      | null;
  }[]).map((r) => {
    const u = Array.isArray(r.users) ? r.users[0] : r.users;
    return {
      id: r.blocked_id,
      username: u?.username ?? "user",
      displayName: u?.display_name ?? u?.username ?? "User",
      avatarUrl: u?.avatar_url ?? null,
    };
  });
}

export async function blockUser(userId: string): Promise<BlockResult> {
  const parsed = z.string().uuid().safeParse(userId);
  if (!parsed.success) return { ok: false, error: "Invalid user." };
  const user = await me();
  if (!user) return { ok: false, needsAuth: true };
  if (user.id === parsed.data) return { ok: false, error: "You can't block yourself." };

  const supabase = createClient();
  const { error } = await supabase
    .from("blocks")
    .insert({ blocker_id: user.id, blocked_id: parsed.data });
  if (error && error.code !== "23505") return { ok: false, error: "Could not block." };
  // Stop following each other so blocked content leaves both feeds.
  await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", parsed.data);
  await supabase.from("follows").delete().eq("follower_id", parsed.data).eq("following_id", user.id);
  revalidatePath("/settings");
  return { ok: true };
}

export async function unblockUser(userId: string): Promise<BlockResult> {
  const parsed = z.string().uuid().safeParse(userId);
  if (!parsed.success) return { ok: false, error: "Invalid user." };
  const user = await me();
  if (!user) return { ok: false, needsAuth: true };

  const supabase = createClient();
  const { error } = await supabase
    .from("blocks")
    .delete()
    .eq("blocker_id", user.id)
    .eq("blocked_id", parsed.data);
  if (error) return { ok: false, error: "Could not unblock." };
  revalidatePath("/settings");
  return { ok: true };
}
