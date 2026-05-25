"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStaffContext, isAdminRole, type Role } from "@/lib/auth/roles";
import { logAdminAction } from "./audit";

/**
 * Admin mutations. Every action re-checks the caller's role server-side (never
 * trusting the UI) and writes to the append-only audit log. Writes use the
 * service role because admins act across other users' rows, which per-user RLS
 * intentionally forbids.
 */

export interface AdminResult {
  ok: boolean;
  error?: string;
}

const ASSIGNABLE: Role[] = ["user", "creator", "moderator", "admin", "superadmin"];
const ACCOUNT_STATUSES = ["active", "suspended", "banned"] as const;

/** Change a user's role. Admins can assign up to admin; only superadmins can
 * grant or revoke superadmin. */
export async function setUserRole(
  userId: string,
  role: Role
): Promise<AdminResult> {
  const ctx = await getStaffContext();
  if (!ctx || !isAdminRole(ctx.role)) return { ok: false, error: "Not allowed." };
  if (!ASSIGNABLE.includes(role)) return { ok: false, error: "Unknown role." };
  if (role === "superadmin" && ctx.role !== "superadmin") {
    return { ok: false, error: "Only a superadmin can grant superadmin." };
  }
  if (userId === ctx.user.id && ctx.role === "superadmin" && role !== "superadmin") {
    return { ok: false, error: "You can't demote yourself." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("user_roles")
    .upsert({ user_id: userId, role, granted_by: ctx.user.id }, { onConflict: "user_id" });
  if (error) return { ok: false, error: "Could not set role." };

  await logAdminAction(ctx.user.id, "set_role", { type: "user", id: userId }, { role });
  revalidatePath("/admin/users");
  return { ok: true };
}

/** Suspend, ban, or reactivate a user account. */
export async function setAccountStatus(
  userId: string,
  status: (typeof ACCOUNT_STATUSES)[number]
): Promise<AdminResult> {
  const ctx = await getStaffContext();
  if (!ctx) return { ok: false, error: "Not allowed." };
  if (!ACCOUNT_STATUSES.includes(status)) return { ok: false, error: "Unknown status." };
  if (userId === ctx.user.id) return { ok: false, error: "You can't change your own status." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("users")
    .update({ account_status: status })
    .eq("id", userId);
  if (error) return { ok: false, error: "Could not update account." };

  await logAdminAction(ctx.user.id, "set_account_status", { type: "user", id: userId }, { status });
  revalidatePath("/admin/users");
  return { ok: true };
}

/** Move a report to reviewing / resolved / dismissed. */
export async function resolveReport(
  reportId: string,
  status: "reviewing" | "resolved" | "dismissed"
): Promise<AdminResult> {
  const ctx = await getStaffContext();
  if (!ctx) return { ok: false, error: "Not allowed." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("reports")
    .update({
      status,
      resolved_by: status === "reviewing" ? null : ctx.user.id,
      resolved_at: status === "reviewing" ? null : new Date().toISOString(),
    })
    .eq("id", reportId);
  if (error) return { ok: false, error: "Could not update report." };

  await logAdminAction(ctx.user.id, "resolve_report", { type: "report", id: reportId }, { status });
  revalidatePath("/admin/reports");
  return { ok: true };
}

/** Set a post's moderation status (remove / age-restrict / restore). */
export async function setPostModeration(
  postId: string,
  status: "active" | "age_restricted" | "removed"
): Promise<AdminResult> {
  const ctx = await getStaffContext();
  if (!ctx) return { ok: false, error: "Not allowed." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("posts")
    .update({ moderation_status: status })
    .eq("id", postId);
  if (error) return { ok: false, error: "Could not moderate post." };

  await logAdminAction(ctx.user.id, "moderate_post", { type: "post", id: postId }, { status });
  revalidatePath("/admin/reports");
  return { ok: true };
}

/** Approve or reject a creator application. Approving promotes the user to a
 * creator (is_creator + creator profile + 'creator' role if not already staff). */
export async function reviewCreatorApplication(
  applicationId: string,
  approve: boolean,
  note?: string
): Promise<AdminResult> {
  const ctx = await getStaffContext();
  if (!ctx) return { ok: false, error: "Not allowed." };

  const admin = createAdminClient();
  const { data: app } = await admin
    .from("creator_applications")
    .select("id, user_id, display_name, bio, categories, payout_wallet, status")
    .eq("id", applicationId)
    .maybeSingle<{
      id: string;
      user_id: string;
      display_name: string | null;
      bio: string | null;
      categories: string[] | null;
      payout_wallet: string | null;
      status: string;
    }>();
  if (!app) return { ok: false, error: "Application not found." };

  const { error: updErr } = await admin
    .from("creator_applications")
    .update({
      status: approve ? "approved" : "rejected",
      reviewed_by: ctx.user.id,
      reviewed_at: new Date().toISOString(),
      review_note: note ?? null,
    })
    .eq("id", applicationId);
  if (updErr) return { ok: false, error: "Could not update application." };

  if (approve) {
    await admin.from("users").update({ is_creator: true }).eq("id", app.user_id);
    await admin.from("creator_profiles").upsert(
      {
        user_id: app.user_id,
        tagline: app.bio ?? null,
        categories: app.categories ?? null,
        payout_wallet: app.payout_wallet ?? null,
        onboarded_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
    // Promote to the creator role unless they already hold a higher one.
    const { data: existing } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", app.user_id)
      .maybeSingle<{ role: Role }>();
    if (!existing || existing.role === "user") {
      await admin
        .from("user_roles")
        .upsert({ user_id: app.user_id, role: "creator", granted_by: ctx.user.id }, { onConflict: "user_id" });
    }
    // Surface the outcome to the applicant.
    await admin.from("notifications").insert({
      user_id: app.user_id,
      type: "system",
      payload: { message: "Your creator application was approved. Welcome aboard." },
    });
  } else {
    await admin.from("notifications").insert({
      user_id: app.user_id,
      type: "system",
      payload: {
        message: note
          ? `Your creator application needs another look: ${note}`
          : "Your creator application wasn't approved this time.",
      },
    });
  }

  await logAdminAction(
    ctx.user.id,
    approve ? "approve_creator" : "reject_creator",
    { type: "creator_application", id: applicationId },
    { userId: app.user_id, note: note ?? null }
  );
  revalidatePath("/admin/creators");
  return { ok: true };
}
