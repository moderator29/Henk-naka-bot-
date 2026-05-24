"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";

/**
 * Update the signed-in user's profile (display name, username, bio, avatar).
 * Runs under the caller's session; RLS restricts writes to their own row.
 * Avatar uploads go to the public `avatars` storage bucket (owner creates it
 * in Supabase). Returns a typed result the client renders.
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
});

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

  let avatarUrl: string | undefined;
  const avatar = formData.get("avatar");
  if (avatar instanceof File && avatar.size > 0) {
    const path = `${me.id}/${crypto.randomUUID()}-${avatar.name}`;
    const { error: upErr } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(path, avatar, { contentType: avatar.type, upsert: true });
    if (!upErr) {
      avatarUrl = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path)
        .data.publicUrl;
    }
  }

  const { error } = await supabase
    .from("users")
    .update({
      display_name: parsed.data.displayName,
      username: parsed.data.username.toLowerCase(),
      bio: parsed.data.bio ?? null,
      ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
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
