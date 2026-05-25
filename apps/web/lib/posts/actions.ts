"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdult } from "@/lib/auth/session";

/**
 * Create a post. Real Supabase insert into `posts`, with optional media
 * uploaded to the `post-media` storage bucket. Requires an authenticated,
 * verified-adult creator. Returns a typed result the client renders.
 *
 * Owner setup (run in your Supabase): create a public `post-media` storage
 * bucket. SQL/bucket creation is yours to run; this code never executes DDL.
 */

const MEDIA_BUCKET = "post-media";

const schema = z.object({
  caption: z.string().trim().max(2000),
  category: z.string().trim().max(40).optional(),
  visibility: z.enum(["public", "followers", "tier"]).default("public"),
});

export interface CreatePostResult {
  ok: boolean;
  error?: string;
  postId?: string;
}

export async function createPost(formData: FormData): Promise<CreatePostResult> {
  let user;
  try {
    user = await requireAdult();
  } catch {
    return { ok: false, error: "Sign in to post." };
  }

  const parsed = schema.safeParse({
    caption: String(formData.get("caption") ?? ""),
    category: (formData.get("category") as string) || undefined,
    visibility: (formData.get("visibility") as string) || "public",
  });
  if (!parsed.success) {
    return { ok: false, error: "Check your post and try again." };
  }

  const files = formData
    .getAll("media")
    .filter((f): f is File => f instanceof File && f.size > 0);

  if (!parsed.data.caption && files.length === 0) {
    return { ok: false, error: "Add a caption or some media." };
  }

  // Validate uploads at the boundary: images/videos only, 25MB ceiling each.
  const MAX_BYTES = 25 * 1024 * 1024;
  const ALLOWED_MEDIA = /^(image|video)\//;
  const tooBig = files.find((f) => f.size > MAX_BYTES);
  if (tooBig) {
    return { ok: false, error: "Each file must be under 25MB." };
  }
  const wrongType = files.find((f) => !ALLOWED_MEDIA.test(f.type));
  if (wrongType) {
    return { ok: false, error: "Only images and videos can be uploaded." };
  }

  const supabase = createClient();

  // Upload media to storage (best-effort; a failed upload doesn't lose the post).
  const media: { url: string; type: string }[] = [];
  for (const file of files.slice(0, 8)) {
    const path = `${user.id}/${crypto.randomUUID()}-${file.name}`;
    const { error: upErr } = await supabase.storage
      .from(MEDIA_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });
    if (!upErr) {
      const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
      media.push({ url: data.publicUrl, type: file.type });
    }
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({
      creator_id: user.id,
      caption: parsed.data.caption || null,
      category: parsed.data.category ?? null,
      media: media.length ? media : null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: "Could not publish. Try again." };
  }
  // Invalidate the surfaces that list the new post so it shows immediately.
  revalidatePath("/feed");
  revalidatePath("/profile");
  return { ok: true, postId: data.id as string };
}
