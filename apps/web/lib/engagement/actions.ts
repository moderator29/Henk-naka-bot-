"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/auth/session";

/**
 * Real engagement writes: follow, like, save. Each runs under the caller's
 * session so RLS enforces "act as yourself". Notifications for the recipient
 * are created with the service role (RLS only lets a user write their own
 * notifications), after the actor is verified, and never for self-actions.
 *
 * Demo creators/posts aren't in the database, so their writes resolve to a
 * no-op result and the calling UI keeps its optimistic state.
 */

export interface EngagementResult {
  ok: boolean;
  needsAuth?: boolean;
}

async function me() {
  try {
    return await getSessionUser();
  } catch {
    return null;
  }
}

async function notify(
  recipientId: string,
  actorId: string,
  type: string,
  payload: Record<string, unknown>
) {
  if (recipientId === actorId) return;
  try {
    const admin = createAdminClient();
    await admin.from("notifications").insert({ user_id: recipientId, type, payload });
  } catch {
    // No service key configured, or insert failed: notifications are best-effort.
  }
}

export async function toggleFollow(
  username: string,
  follow: boolean
): Promise<EngagementResult> {
  const user = await me();
  if (!user) return { ok: false, needsAuth: true };

  const supabase = createClient();
  const { data: target } = await supabase
    .from("users")
    .select("id")
    .eq("username", username)
    .maybeSingle<{ id: string }>();
  if (!target) return { ok: false }; // demo creator or unknown handle

  if (follow) {
    const { error } = await supabase
      .from("follows")
      .insert({ follower_id: user.id, following_id: target.id });
    if (error && error.code !== "23505") return { ok: false };
    await notify(target.id, user.id, "follow", { actorId: user.id });
  } else {
    await supabase
      .from("follows")
      .delete()
      .eq("follower_id", user.id)
      .eq("following_id", target.id);
  }
  return { ok: true };
}

export async function toggleLike(
  postId: string,
  like: boolean
): Promise<EngagementResult> {
  const user = await me();
  if (!user) return { ok: false, needsAuth: true };

  const supabase = createClient();
  if (like) {
    const { error } = await supabase
      .from("likes")
      .insert({ post_id: postId, user_id: user.id });
    if (error && error.code !== "23505") return { ok: false };
    const { data: post } = await supabase
      .from("posts")
      .select("creator_id")
      .eq("id", postId)
      .maybeSingle<{ creator_id: string }>();
    if (post) await notify(post.creator_id, user.id, "like", { postId, actorId: user.id });
  } else {
    await supabase
      .from("likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id);
  }
  return { ok: true };
}

export async function toggleSave(
  postId: string,
  save: boolean
): Promise<EngagementResult> {
  const user = await me();
  if (!user) return { ok: false, needsAuth: true };

  const supabase = createClient();
  if (save) {
    const { error } = await supabase
      .from("saves")
      .insert({ post_id: postId, user_id: user.id });
    if (error && error.code !== "23505") return { ok: false };
  } else {
    await supabase
      .from("saves")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id);
  }
  return { ok: true };
}
