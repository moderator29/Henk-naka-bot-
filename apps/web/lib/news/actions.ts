"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/auth/session";
import { getStaffContext, isAdminRole } from "@/lib/auth/roles";
import { logAdminAction } from "@/lib/admin/audit";
import { sendBroadcastEmail } from "@/lib/email/resend";
import type { NewsComment } from "./types";

/**
 * Broadcast (admin) + news engagement. Broadcasting inserts an announcement and
 * fans it out to every targeted user's notifications (real rows) and email
 * (env-gated), so it lands in their notification area, the /news feed, and
 * their inbox. Likes/comments run under the caller's session (RLS scoped).
 */

const MEDIA_BUCKET = "post-media";

export interface BroadcastResult {
  ok: boolean;
  error?: string;
  recipients?: number;
}

const broadcastSchema = z.object({
  title: z.string().trim().min(1).max(140),
  body: z.string().trim().min(1).max(4000),
  audience: z.enum(["all", "creators", "fans"]).default("all"),
});

export async function createBroadcast(formData: FormData): Promise<BroadcastResult> {
  const ctx = await getStaffContext();
  if (!ctx || !isAdminRole(ctx.role)) {
    return { ok: false, error: "Admins only." };
  }

  const parsed = broadcastSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    body: String(formData.get("body") ?? ""),
    audience: (formData.get("audience") as string) || "all",
  });
  if (!parsed.success) return { ok: false, error: "Add a title and message." };

  const admin = createAdminClient();

  // Optional image (no video). Stored in the public media bucket.
  let imageUrl: string | null = null;
  const image = formData.get("image");
  if (image instanceof File && image.size > 0) {
    if (!/^image\//.test(image.type)) {
      return { ok: false, error: "Only images can be attached." };
    }
    if (image.size > 10 * 1024 * 1024) {
      return { ok: false, error: "Image must be under 10MB." };
    }
    const path = `announcements/${crypto.randomUUID()}-${image.name}`;
    const { error: upErr } = await admin.storage
      .from(MEDIA_BUCKET)
      .upload(path, image, { contentType: image.type, upsert: false });
    if (!upErr) {
      imageUrl = admin.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
    }
  }

  const { data: created, error } = await admin
    .from("announcements")
    .insert({
      title: parsed.data.title,
      body: parsed.data.body,
      audience: parsed.data.audience,
      image_url: imageUrl,
      created_by: ctx.user.id,
    })
    .select("id")
    .single();
  if (error || !created) return { ok: false, error: "Could not create the broadcast." };

  // Target audience.
  let usersQuery = admin.from("users").select("id, email");
  if (parsed.data.audience === "creators") usersQuery = usersQuery.eq("is_creator", true);
  if (parsed.data.audience === "fans") usersQuery = usersQuery.eq("is_creator", false);
  const { data: users } = await usersQuery;
  const recipients = users ?? [];

  // Fan out to notifications (one row per user) in chunks.
  const notifRows = recipients.map((u) => ({
    user_id: u.id as string,
    type: "broadcast",
    payload: {
      title: parsed.data.title,
      message: parsed.data.body.slice(0, 200),
      announcementId: created.id,
    },
  }));
  for (let i = 0; i < notifRows.length; i += 500) {
    await admin.from("notifications").insert(notifRows.slice(i, i + 500));
  }

  // Fan out to email (best-effort, env-gated no-op without RESEND_API_KEY).
  await Promise.allSettled(
    recipients
      .filter((u) => !!u.email)
      .map((u) => sendBroadcastEmail(u.email as string, parsed.data.title, parsed.data.body))
  );

  await logAdminAction(
    ctx.user.id,
    "broadcast",
    { type: "announcement", id: created.id },
    { audience: parsed.data.audience, recipients: recipients.length }
  );

  revalidatePath("/news");
  revalidatePath("/admin/announcements");
  return { ok: true, recipients: recipients.length };
}

async function me() {
  try {
    return await getSessionUser();
  } catch {
    return null;
  }
}

export async function toggleAnnouncementLike(
  announcementId: string,
  like: boolean
): Promise<{ ok: boolean; needsAuth?: boolean }> {
  const user = await me();
  if (!user) return { ok: false, needsAuth: true };
  const supabase = createClient();
  if (like) {
    const { error } = await supabase
      .from("announcement_likes")
      .insert({ announcement_id: announcementId, user_id: user.id });
    if (error && error.code !== "23505") return { ok: false };
  } else {
    await supabase
      .from("announcement_likes")
      .delete()
      .eq("announcement_id", announcementId)
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

function mapComment(r: CommentRow): NewsComment {
  return {
    id: r.id,
    body: r.body,
    createdAt: r.created_at,
    authorName: r.users?.display_name ?? r.users?.username ?? "Someone",
    authorUsername: r.users?.username ?? "user",
  };
}

export async function loadAnnouncementComments(
  announcementId: string
): Promise<NewsComment[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("announcement_comments")
    .select("id, body, created_at, users!inner(display_name, username)")
    .eq("announcement_id", announcementId)
    .order("created_at", { ascending: true })
    .limit(100);
  return ((data as unknown as CommentRow[]) ?? []).map(mapComment);
}

export async function addAnnouncementComment(
  announcementId: string,
  body: string
): Promise<{ ok: boolean; needsAuth?: boolean; comment?: NewsComment }> {
  const user = await me();
  if (!user) return { ok: false, needsAuth: true };
  const text = body.trim();
  if (!text || text.length > 1000) return { ok: false };

  const supabase = createClient();
  const { data, error } = await supabase
    .from("announcement_comments")
    .insert({ announcement_id: announcementId, user_id: user.id, body: text })
    .select("id, body, created_at, users!inner(display_name, username)")
    .maybeSingle();
  if (error || !data) return { ok: false };
  return { ok: true, comment: mapComment(data as unknown as CommentRow) };
}
