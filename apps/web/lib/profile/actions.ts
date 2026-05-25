"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/auth/session";
import { passwordSchema } from "@/lib/auth/schemas";
import { SIWE_NONCE_COOKIE } from "@/lib/auth/siwe";
import { verifyWalletSignature } from "@/lib/web3/verify";
import {
  sendPasswordChangedEmail,
  sendAccountDeletionEmail,
} from "@/lib/email/resend";
import { DEFAULT_SETTINGS, type UserSettings } from "./settings";

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

/** Persist notification / AI / language preferences. Privacy is preserved
 * (it's managed by its own panel), so saving here never wipes it. */
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

  const supabase = createClient();
  const { data: existing } = await supabase
    .from("user_preferences")
    .select("settings")
    .eq("user_id", me.id)
    .maybeSingle<{ settings: Partial<UserSettings> | null }>();

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
    privacy: { ...DEFAULT_SETTINGS.privacy, ...existing?.settings?.privacy },
    appearance: { ...DEFAULT_SETTINGS.appearance, ...existing?.settings?.appearance },
    hiddenCategories: existing?.settings?.hiddenCategories ?? DEFAULT_SETTINGS.hiddenCategories,
    language: String(formData.get("language") ?? "en"),
  };

  const { error } = await supabase
    .from("user_preferences")
    .upsert({ user_id: me.id, settings }, { onConflict: "user_id" });
  if (error) return { ok: false, error: "Could not save preferences." };
  return { ok: true };
}

/** Persist privacy settings, preserving the rest of the settings object. */
export async function updatePrivacy(
  privacy: UserSettings["privacy"]
): Promise<{ ok: boolean; error?: string }> {
  let me;
  try {
    me = await getSessionUser();
  } catch {
    me = null;
  }
  if (!me) return { ok: false, error: "Sign in first." };

  const supabase = createClient();
  const { data: existing } = await supabase
    .from("user_preferences")
    .select("settings")
    .eq("user_id", me.id)
    .maybeSingle<{ settings: Partial<UserSettings> | null }>();

  const merged: UserSettings = {
    ...DEFAULT_SETTINGS,
    ...existing?.settings,
    privacy: { ...DEFAULT_SETTINGS.privacy, ...privacy },
  } as UserSettings;

  const { error } = await supabase
    .from("user_preferences")
    .upsert({ user_id: me.id, settings: merged }, { onConflict: "user_id" });
  if (error) return { ok: false, error: "Could not save privacy settings." };
  return { ok: true };
}

async function mergeSettings(
  patch: Partial<UserSettings>
): Promise<{ ok: boolean; error?: string }> {
  let me;
  try {
    me = await getSessionUser();
  } catch {
    me = null;
  }
  if (!me) return { ok: false, error: "Sign in first." };

  const supabase = createClient();
  const { data: existing } = await supabase
    .from("user_preferences")
    .select("settings")
    .eq("user_id", me.id)
    .maybeSingle<{ settings: Partial<UserSettings> | null }>();

  const merged: UserSettings = {
    ...DEFAULT_SETTINGS,
    ...existing?.settings,
    ...patch,
  } as UserSettings;

  const { error } = await supabase
    .from("user_preferences")
    .upsert({ user_id: me.id, settings: merged }, { onConflict: "user_id" });
  if (error) return { ok: false, error: "Could not save." };
  revalidatePath("/settings");
  return { ok: true };
}

/** Persist appearance (reduce-motion) preferences. */
export async function updateAppearance(
  appearance: UserSettings["appearance"]
): Promise<{ ok: boolean; error?: string }> {
  return mergeSettings({ appearance });
}

/** Persist the list of categories to hide from feed + discovery. */
export async function updateHiddenCategories(
  hiddenCategories: string[]
): Promise<{ ok: boolean; error?: string }> {
  return mergeSettings({ hiddenCategories: hiddenCategories.slice(0, 50) });
}

/** Clear the AI personalization memory the Concierge has built up. */
export async function resetAiMemory(): Promise<{ ok: boolean; error?: string }> {
  let me;
  try {
    me = await getSessionUser();
  } catch {
    me = null;
  }
  if (!me) return { ok: false, error: "Sign in first." };
  const supabase = createClient();
  const { error } = await supabase
    .from("user_preferences")
    .update({ ai_persona_memory: null })
    .eq("user_id", me.id);
  if (error) return { ok: false, error: "Could not reset." };
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

export interface LinkWalletResult {
  ok: boolean;
  error?: string;
  address?: string;
}

/**
 * Link a wallet to the signed-in account by proving ownership with a SIWE
 * signature (same nonce + signature flow as wallet sign-in). The address is
 * only saved after the signature verifies, so a user can't claim a wallet they
 * don't control. Refuses an address already linked to a different account.
 */
export async function linkWallet(formData: FormData): Promise<LinkWalletResult> {
  let me;
  try {
    me = await getSessionUser();
  } catch {
    me = null;
  }
  if (!me) return { ok: false, error: "Sign in to link a wallet." };

  const message = String(formData.get("message") ?? "");
  const signature = String(formData.get("signature") ?? "");
  if (!message || !signature) {
    return { ok: false, error: "Missing signature. Try again." };
  }

  const nonce = cookies().get(SIWE_NONCE_COOKIE)?.value;
  if (!nonce) {
    return { ok: false, error: "Link request expired. Try again." };
  }

  const address = await verifyWalletSignature({ message, signature, nonce });
  // Single-use: clear the nonce so the signature can't be replayed.
  cookies().delete(SIWE_NONCE_COOKIE);
  if (!address) {
    return { ok: false, error: "Could not verify that signature." };
  }

  const supabase = createClient();
  // Case-insensitive: wallet sign-in stores a checksummed address, linking stores lowercase.
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .ilike("wallet_address", address)
    .maybeSingle<{ id: string }>();
  if (existing && existing.id !== me.id) {
    return { ok: false, error: "That wallet is already linked to another account." };
  }

  const { error } = await supabase
    .from("users")
    .update({ wallet_address: address })
    .eq("id", me.id);
  if (error) return { ok: false, error: "Could not link wallet. Try again." };
  return { ok: true, address };
}

/** Remove the wallet linked to the signed-in account. */
export async function unlinkWallet(): Promise<{ ok: boolean; error?: string }> {
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
    .update({ wallet_address: null })
    .eq("id", me.id);
  if (error) return { ok: false, error: "Could not unlink wallet. Try again." };
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
