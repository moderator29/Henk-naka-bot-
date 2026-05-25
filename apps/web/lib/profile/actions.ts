"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/auth/session";
import { isAdult, parseDateOfBirth } from "@/lib/auth/age";
import { maybePurgeDemoContent } from "@/lib/admin/demo";
import { passwordSchema } from "@/lib/auth/schemas";
import {
  sendPasswordChangedEmail,
  sendAccountDeletionEmail,
} from "@/lib/email/resend";
import type { UserSettings } from "./settings";

/**
 * Profile + account actions for the signed-in user. Profile writes run under
 * the caller's session (RLS restricts to their own row); the account delete
 * uses the service role to cascade-remove their data and auth identity. Media
 * uploads go to the public `avatars` storage bucket.
 */

const AVATAR_BUCKET = "avatars";

const schema = z.object({
  displayName: z.string().trim().min(1, "Add a display name").max(60),
  username: z
    .string()
    .trim()
    .min(3, "At least 3 characters")
    .max(30)
    .regex(/^[a-z0-9_]+$/i, "Letters, numbers, and underscores only"),
  bio: z.string().trim().max(300).optional(),
  country: z.string().trim().max(60).optional(),
});

async function uploadImage(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  file: File,
  prefix: string
): Promise<string | undefined> {
  const path = `${userId}/${prefix}-${crypto.randomUUID()}-${file.name}`;
  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: true });
  if (error) return undefined;
  return supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path).data.publicUrl;
}

export interface UpdateProfileResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export async function updateProfile(
  formData: FormData
): Promise<UpdateProfileResult> {
  let me;
  try {
    me = await getSessionUser();
  } catch {
    me = null;
  }
  if (!me) return { ok: false, error: "Sign in to edit your profile." };

  const parsed = schema.safeParse({
    displayName: String(formData.get("displayName") ?? ""),
    username: String(formData.get("username") ?? ""),
    bio: (formData.get("bio") as string) || undefined,
    country: (formData.get("country") as string) || undefined,
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return { ok: false, fieldErrors };
  }

  const supabase = createClient();

  const avatar = formData.get("avatar");
  const cover = formData.get("cover");
  const avatarUrl =
    avatar instanceof File && avatar.size > 0
      ? await uploadImage(supabase, me.id, avatar, "avatar")
      : undefined;
  const coverUrl =
    cover instanceof File && cover.size > 0
      ? await uploadImage(supabase, me.id, cover, "cover")
      : undefined;

  const { error } = await supabase
    .from("users")
    .update({
      display_name: parsed.data.displayName,
      username: parsed.data.username.toLowerCase(),
      bio: parsed.data.bio ?? null,
      country: parsed.data.country ?? null,
      ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
      ...(coverUrl ? { cover_url: coverUrl } : {}),
    })
    .eq("id", me.id);

  if (error) {
    if (error.code === "23505") {
      return { ok: false, fieldErrors: { username: "That username is taken" } };
    }
    return { ok: false, error: "Could not save. Try again." };
  }
  return { ok: true };
}

const setupSchema = z.object({
  displayName: z.string().trim().min(1, "Add a display name").max(60),
  username: z
    .string()
    .trim()
    .min(3, "At least 3 characters")
    .max(30)
    .regex(/^[a-z0-9_]+$/i, "Letters, numbers, and underscores only"),
  bio: z.string().trim().max(300).optional(),
  dateOfBirth: z.string().min(1, "Enter your date of birth"),
});

/**
 * First-time profile setup for wallet-first accounts: captures username, names,
 * bio, and DOB. Writes the profile to the users row AND mirrors the identity
 * fields (incl. date_of_birth) into auth metadata, which is where the 18+ gate
 * (requireAdult / getSessionUser) reads age from.
 */
export async function setupProfile(
  formData: FormData
): Promise<UpdateProfileResult> {
  let me;
  try {
    me = await getSessionUser();
  } catch {
    me = null;
  }
  if (!me) return { ok: false, error: "Sign in to set up your profile." };

  const parsed = setupSchema.safeParse({
    displayName: String(formData.get("displayName") ?? ""),
    username: String(formData.get("username") ?? ""),
    bio: (formData.get("bio") as string) || undefined,
    dateOfBirth: String(formData.get("dateOfBirth") ?? ""),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return { ok: false, fieldErrors };
  }

  const dob = parseDateOfBirth(parsed.data.dateOfBirth);
  if (!dob) return { ok: false, fieldErrors: { dateOfBirth: "Enter a valid date" } };
  if (!isAdult(dob)) {
    return { ok: false, fieldErrors: { dateOfBirth: "You must be 18 or older" } };
  }

  const supabase = createClient();
  const username = parsed.data.username.toLowerCase();

  // Username uniqueness pre-check (the DB unique constraint is the backstop).
  const { data: taken } = await supabase
    .from("users")
    .select("id")
    .eq("username", username)
    .neq("id", me.id)
    .maybeSingle();
  if (taken) return { ok: false, fieldErrors: { username: "That username is taken" } };

  const avatar = formData.get("avatar");
  const cover = formData.get("cover");
  const avatarUrl =
    avatar instanceof File && avatar.size > 0
      ? await uploadImage(supabase, me.id, avatar, "avatar")
      : undefined;
  const coverUrl =
    cover instanceof File && cover.size > 0
      ? await uploadImage(supabase, me.id, cover, "cover")
      : undefined;

  const { error } = await supabase
    .from("users")
    .update({
      display_name: parsed.data.displayName,
      username,
      bio: parsed.data.bio ?? null,
      date_of_birth: parsed.data.dateOfBirth,
      ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
      ...(coverUrl ? { cover_url: coverUrl } : {}),
    })
    .eq("id", me.id);

  if (error) {
    if (error.code === "23505") {
      return { ok: false, fieldErrors: { username: "That username is taken" } };
    }
    return { ok: false, error: "Could not save. Try again." };
  }

  // Mirror identity into auth metadata so the 18+ gate sees the DOB.
  await supabase.auth.updateUser({
    data: {
      username,
      display_name: parsed.data.displayName,
      date_of_birth: parsed.data.dateOfBirth,
    },
  });

  await maybePurgeDemoContent();
  return { ok: true };
}

/** Who can start a DM with the user: everyone, or only mutual follows. */
export async function setDmPermission(
  value: "everyone" | "mutuals"
): Promise<{ ok: boolean; error?: string }> {
  if (value !== "everyone" && value !== "mutuals") {
    return { ok: false, error: "Invalid option." };
  }
  let me;
  try {
    me = await getSessionUser();
  } catch {
    me = null;
  }
  if (!me) return { ok: false, error: "Sign in first." };

  const supabase = createClient();
  const { error } = await supabase
    .from("users")
    .update({ dm_permission: value })
    .eq("id", me.id);
  return { ok: !error, error: error ? "Could not save." : undefined };
}

/** Persist notification / AI / language preferences to user_preferences. */
export async function updatePreferences(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  let me;
  try {
    me = await getSessionUser();
  } catch {
    me = null;
  }
  if (!me) return { ok: false, error: "Sign in first." };

  const on = (k: string) => formData.get(k) === "on";
  const settings: UserSettings = {
    notifications: {
      follows: on("notif_follows"),
      posts: on("notif_posts"),
      tips: on("notif_tips"),
      renewals: on("notif_renewals"),
    },
    ai: {
      concierge: on("ai_concierge"),
      search: on("ai_search"),
      copilot: on("ai_copilot"),
    },
    language: String(formData.get("language") ?? "en"),
  };

  const supabase = createClient();
  const { error } = await supabase
    .from("user_preferences")
    .upsert({ user_id: me.id, settings }, { onConflict: "user_id" });
  if (error) return { ok: false, error: "Could not save preferences." };
  return { ok: true };
}

/** Change the signed-in user's password after re-checking the current one. */
export async function changePassword(formData: FormData): Promise<{
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}> {
  let me;
  try {
    me = await getSessionUser();
  } catch {
    me = null;
  }
  if (!me?.email) return { ok: false, error: "Sign in to change your password." };

  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  const parsed = passwordSchema.safeParse(next);
  if (!parsed.success) {
    return { ok: false, fieldErrors: { newPassword: parsed.error.issues[0]?.message ?? "Invalid" } };
  }
  if (next !== confirm) {
    return { ok: false, fieldErrors: { confirmPassword: "Passwords do not match" } };
  }

  const supabase = createClient();
  // Re-authenticate to confirm the current password.
  const { error: reauth } = await supabase.auth.signInWithPassword({
    email: me.email,
    password: current,
  });
  if (reauth) {
    return { ok: false, fieldErrors: { currentPassword: "Current password is incorrect" } };
  }

  const { error } = await supabase.auth.updateUser({ password: next });
  if (error) return { ok: false, error: "Could not update password. Try again." };
  await sendPasswordChangedEmail(me.email);
  return { ok: true };
}

/**
 * Permanently delete the signed-in user's account. Requires typing the exact
 * confirmation phrase. Cascade-deletes their data (FKs ON DELETE CASCADE) and
 * removes the auth identity via the service role, then signs out.
 */
export async function deleteAccount(formData: FormData): Promise<{ ok: false; error: string } | void> {
  let me;
  try {
    me = await getSessionUser();
  } catch {
    me = null;
  }
  if (!me) return { ok: false, error: "Sign in first." };

  const confirm = String(formData.get("confirm") ?? "").trim().toLowerCase();
  if (confirm !== "delete my account") {
    return { ok: false, error: 'Type "delete my account" to confirm.' };
  }

  // Notify before we remove the account (we lose the email afterward).
  if (me.email) await sendAccountDeletionEmail(me.email);

  const admin = createAdminClient();
  // Remove the profile row first (cascades to posts, follows, tips, etc.).
  await admin.from("users").delete().eq("id", me.id);
  await admin.auth.admin.deleteUser(me.id);

  // Invalidate the local session, then leave the app.
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/?deleted=1");
}
