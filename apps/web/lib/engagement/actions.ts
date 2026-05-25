"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/auth/session";
import type { CommentItem } from "./types";

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

interface CommentRow {
  id: string;
  body: string;
  created_at: string;
  users: { display_name: string | null; username: string | null } | null;
}

function mapComment(r: CommentRow): CommentItem {
  return {
    id: r.id,
    body: r.body,
    createdAt: r.created_at,
    authorName: r.users?.display_name ?? r.users?.username ?? "Someone",
    authorUsername: r.users?.username ?? "user",
  };
}

export async function loadComments(postId: string): Promise<CommentItem[]> {
  if (postId.startsWith("demo")) return [];
  const supabase = createClient();
  const { data } = await supabase
    .from("comments")
    .select("id, body, created_at, users!inner(display_name, username)")
    .eq("post_id", postId)
    .order("created_at", { ascending: true })
    .limit(100);
  return ((data as unknown as CommentRow[]) ?? []).map(mapComment);
}

export async function addComment(
  postId: string,
  body: string
): Promise<{ ok: boolean; needsAuth?: boolean; comment?: CommentItem }> {
  const user = await me();
  if (!user) return { ok: false, needsAuth: true };
  const text = body.trim();
  if (!text || text.length > 1000 || postId.startsWith("demo")) {
    return { ok: false };
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("comments")
    .insert({ post_id: postId, user_id: user.id, body: text })
    .select("id, body, created_at, users!inner(display_name, username)")
    .maybeSingle();
  if (error || !data) return { ok: false };

  const { data: post } = await supabase
    .from("posts")
    .select("creator_id")
    .eq("id", postId)
    .maybeSingle<{ creator_id: string }>();
  if (post) await notify(post.creator_id, user.id, "comment", { postId, actorId: user.id });

  return { ok: true, comment: mapComment(data as unknown as CommentRow) };
}

export async function getTipRecipient(
  username: string
): Promise<{ userId: string; wallet: string | null } | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("users")
    .select("id, wallet_address")
    .eq("username", username)
    .maybeSingle<{ id: string; wallet_address: string | null }>();
  return data ? { userId: data.id, wallet: data.wallet_address } : null;
}

/** Record an on-chain tip after the wallet transfer confirms. */
export async function recordTip(
  toUsername: string,
  amountNsfw: string,
  txHash: string,
  postId?: string
): Promise<EngagementResult> {
  const user = await me();
  if (!user) return { ok: false, needsAuth: true };

  const recipient = await getTipRecipient(toUsername);
  if (!recipient) return { ok: false };

  const supabase = createClient();
  const { error } = await supabase.from("tips").insert({
    from_user: user.id,
    to_user: recipient.userId,
    amount_nsfw: amountNsfw,
    tx_hash: txHash,
    post_id: postId && !postId.startsWith("demo") ? postId : null,
  });
  if (error) return { ok: false };
  await notify(recipient.userId, user.id, "tip", {
    amountNsfw,
    txHash,
    actorId: user.id,
  });
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
