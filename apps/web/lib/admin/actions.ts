"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/auth/session";
import { getMyRole, atLeast, type Role } from "@/lib/auth/roles";
import { logAdminAction } from "./audit";

/**
 * Admin + moderation actions. Every mutating action re-checks the caller's
 * role server-side (defence in depth on top of the /admin layout gate), then
 * uses the service role to act platform-wide, and writes an audit-log entry.
 */

export interface AdminResult {
  ok: boolean;
  error?: string;
}

async function gate(min: Role): Promise<string | null> {
  const me = await getSessionUser().catch(() => null);
  if (!me) return null;
  if (!atLeast(await getMyRole(), min)) return null;
  return me.id;
}

// ---------- User-facing: file a report ----------
const reportSchema = z.object({
  targetType: z.enum(["post", "pveel", "comment", "message", "user"]),
  targetId: z.string().uuid(),
  reason: z.string().trim().min(1).max(120),
  details: z.string().trim().max(1000).optional(),
});

export async function reportContent(
  input: z.input<typeof reportSchema>
): Promise<AdminResult & { needsAuth?: boolean }> {
  const me = await getSessionUser().catch(() => null);
  if (!me) return { ok: false, needsAuth: true };
  const parsed = reportSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid report." };
  const supabase = createClient();
  const { error } = await supabase.from("reports").insert({
    reporter_id: me.id,
    target_type: parsed.data.targetType,
    target_id: parsed.data.targetId,
    reason: parsed.data.reason,
    details: parsed.data.details ?? null,
  });
  if (error) return { ok: false, error: "Could not submit report." };
  return { ok: true };
}

// ---------- Moderation ----------
export async function setReportStatus(
  reportId: string,
  status: "open" | "reviewing" | "resolved" | "dismissed"
): Promise<AdminResult> {
  const actor = await gate("moderator");
  if (!actor) return { ok: false, error: "Not authorized." };
  const admin = createAdminClient();
  const { error } = await admin
    .from("reports")
    .update({
      status,
      resolved_by: status === "resolved" || status === "dismissed" ? actor : null,
      resolved_at: status === "resolved" || status === "dismissed" ? new Date().toISOString() : null,
    })
    .eq("id", reportId);
  if (error) return { ok: false, error: "Could not update report." };
  await logAdminAction(actor, "report.status", { targetType: "report", targetId: reportId, detail: { status } });
  revalidatePath("/admin/reports");
  return { ok: true };
}

export async function removeContent(
  targetType: "post" | "pveel" | "comment",
  targetId: string
): Promise<AdminResult> {
  const actor = await gate("moderator");
  if (!actor) return { ok: false, error: "Not authorized." };
  const admin = createAdminClient();
  let error;
  if (targetType === "comment") {
    ({ error } = await admin.from("comments").delete().eq("id", targetId));
  } else {
    const table = targetType === "post" ? "posts" : "pveels";
    ({ error } = await admin.from(table).update({ is_removed: true }).eq("id", targetId));
  }
  if (error) return { ok: false, error: "Could not remove content." };
  await logAdminAction(actor, "content.remove", { targetType, targetId });
  revalidatePath("/admin/reports");
  return { ok: true };
}

export async function suspendUser(userId: string, suspend: boolean): Promise<AdminResult> {
  const actor = await gate("moderator");
  if (!actor) return { ok: false, error: "Not authorized." };
  const admin = createAdminClient();
  const { error } = await admin.from("users").update({ is_suspended: suspend }).eq("id", userId);
  if (error) return { ok: false, error: "Could not update user." };
  await logAdminAction(actor, suspend ? "user.suspend" : "user.unsuspend", { targetType: "user", targetId: userId });
  revalidatePath("/admin/users");
  return { ok: true };
}

// ---------- Roles (admin only) ----------
export async function setUserRole(userId: string, role: Role): Promise<AdminResult> {
  const actor = await gate("admin");
  if (!actor) return { ok: false, error: "Not authorized." };
  const admin = createAdminClient();
  const { error } = await admin
    .from("user_roles")
    .upsert({ user_id: userId, role, granted_by: actor }, { onConflict: "user_id" });
  if (error) return { ok: false, error: "Could not set role." };
  await logAdminAction(actor, "user.role", { targetType: "user", targetId: userId, detail: { role } });
  revalidatePath("/admin/users");
  return { ok: true };
}

// ---------- Announcements (admin only) ----------
export async function createAnnouncement(input: {
  title: string;
  body: string;
  audience: "all" | "creators" | "fans";
}): Promise<AdminResult> {
  const actor = await gate("admin");
  if (!actor) return { ok: false, error: "Not authorized." };
  const title = input.title.trim();
  const body = input.body.trim();
  if (!title || !body) return { ok: false, error: "Title and body are required." };
  const admin = createAdminClient();
  const { error } = await admin
    .from("announcements")
    .insert({ title, body, audience: input.audience, created_by: actor });
  if (error) return { ok: false, error: "Could not post announcement." };
  await logAdminAction(actor, "announcement.create", { detail: { title, audience: input.audience } });
  revalidatePath("/admin/announcements");
  return { ok: true };
}

// ---------- Demo purge (admin only) ----------
export async function purgeDemoContent(): Promise<AdminResult> {
  const actor = await gate("admin");
  if (!actor) return { ok: false, error: "Not authorized." };
  const admin = createAdminClient();
  const { error } = await admin.rpc("purge_demo_content");
  if (error) return { ok: false, error: "Could not purge demo content." };
  await logAdminAction(actor, "demo.purge");
  return { ok: true };
}
