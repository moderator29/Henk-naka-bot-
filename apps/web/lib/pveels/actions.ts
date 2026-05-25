"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/auth/session";
import type { CommentItem } from "@/lib/engagement/types";

/**
 * Pveel engagement writes (like, save, view, comment), each under the caller's
 * session so RLS applies. Cached counts on the pveel row are maintained by DB
 * triggers (migration 0009). Demo clips aren't in the database, so their writes
 * resolve to a no-op and the UI keeps its optimistic state.
 */

export interface PveelEngagementResult {
  ok: boolean;
  needsAuth?: boolean;
}

function isDemo(id: string) {
  return id.startsWith("demo") || id.startsWith("pv-");
}

async function me() {
  try {
    return await getSessionUser();
  } catch {
    return null;
  }
}

async function notifyCreator(
  pveelId: string,
  actorId: string,
  type: string,
  extra: Record<string, unknown> = {}
) {
  try {
    const admin = createAdminClient();
    const { data: pveel } = await admin
      .from("pveels")
      .select("creator_id")
      .eq("id", pveelId)
      .maybeSingle<{ creator_id: string }>();
    if (!pveel || pveel.creator_id === actorId) return;
    const { data: actor } = await admin
      .from("users")
      .select("display_name, username")
      .eq("id", actorId)
      .maybeSingle<{ display_name: string | null; username: string | null }>();
    const actor_name = actor?.display_name ?? actor?.username ?? "Someone";
    await admin.from("notifications").insert({
      user_id: pveel.creator_id,
      type,
      payload: { pveelId, actorId, actor_name, ...extra },
    });
  } catch {
    /* best-effort */
  }
}

export async function togglePveelLike(
  pveelId: string,
  like: boolean
): Promise<PveelEngagementResult> {
  if (isDemo(pveelId)) return { ok: true };
  const user = await me();
  if (!user) return { ok: false, needsAuth: true };

  const supabase = createClient();
  if (like) {
    const { error } = await supabase
      .from("pveel_likes")
      .insert({ pveel_id: pveelId, user_id: user.id });
    if (error && error.code !== "23505") return { ok: false };
    await notifyCreator(pveelId, user.id, "pveel_like");
  } else {
    await supabase
      .from("pveel_likes")
      .delete()
      .eq("pveel_id", pveelId)
      .eq("user_id", user.id);
  }
  return { ok: true };
}

export async function togglePveelSave(
  pveelId: string,
  save: boolean
): Promise<PveelEngagementResult> {
  if (isDemo(pveelId)) return { ok: true };
  const user = await me();
  if (!user) return { ok: false, needsAuth: true };

  const supabase = createClient();
  if (save) {
    const { error } = await supabase
      .from("pveel_saves")
      .insert({ pveel_id: pveelId, user_id: user.id });
    if (error && error.code !== "23505") return { ok: false };
  } else {
    await supabase
      .from("pveel_saves")
      .delete()
      .eq("pveel_id", pveelId)
      .eq("user_id", user.id);
  }
  return { ok: true };
}

/** Record a view once the clip is watched past the threshold. Deduped per user
 * by the table's primary key, so re-watches don't inflate the count. */
export async function recordPveelView(pveelId: string): Promise<void> {
  if (isDemo(pveelId)) return;
  const user = await me();
  if (!user) return;
  const supabase = createClient();
  await supabase
    .from("pveel_views")
    .insert({ pveel_id: pveelId, user_id: user.id })
    .select("pveel_id")
    .maybeSingle();
}

interface PveelCommentRow {
  id: string;
  body: string;
  created_at: string;
  users: { display_name: string | null; username: string | null } | null;
}

function mapComment(r: PveelCommentRow): CommentItem {
  return {
    id: r.id,
    body: r.body,
    createdAt: r.created_at,
    authorName: r.users?.display_name ?? r.users?.username ?? "Someone",
    authorUsername: r.users?.username ?? "user",
  };
}

export async function loadPveelComments(pveelId: string): Promise<CommentItem[]> {
  if (isDemo(pveelId)) return [];
  const supabase = createClient();
  const { data } = await supabase
    .from("pveel_comments")
    .select("id, body, created_at, users!inner(display_name, username)")
    .eq("pveel_id", pveelId)
    .order("created_at", { ascending: true })
    .limit(100);
  return ((data as unknown as PveelCommentRow[]) ?? []).map(mapComment);
}

export async function addPveelComment(
  pveelId: string,
  body: string
): Promise<{ ok: boolean; needsAuth?: boolean; comment?: CommentItem }> {
  if (isDemo(pveelId)) return { ok: false };
  const user = await me();
  if (!user) return { ok: false, needsAuth: true };
  const text = body.trim();
  if (!text || text.length > 1000) return { ok: false };

  const supabase = createClient();
  const { data, error } = await supabase
    .from("pveel_comments")
    .insert({ pveel_id: pveelId, user_id: user.id, body: text })
    .select("id, body, created_at, users!inner(display_name, username)")
    .maybeSingle();
  if (error || !data) return { ok: false };
  await notifyCreator(pveelId, user.id, "pveel_comment");
  return { ok: true, comment: mapComment(data as unknown as PveelCommentRow) };
}
