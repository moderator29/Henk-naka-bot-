"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdult, getSessionUser } from "@/lib/auth/session";

/**
 * Create a post. Real Supabase insert into `posts`. Public media goes to the
 * public `post-media` bucket and is stored as a public URL. Subscriber-only
 * (gated) media goes to the PRIVATE `post-media-private` bucket and is stored
 * as a storage path with no public URL; entitled viewers fetch a short-lived
 * signed URL via getGatedMedia. Requires an authenticated, verified-adult user.
 *
 * Owner setup (run in your Supabase): a public `post-media` bucket and a
 * private `post-media-private` bucket (see 0010_gated_media.sql). This code
 * never executes DDL.
 */

const MEDIA_BUCKET = "post-media";
const PRIVATE_BUCKET = "post-media-private";

const schema = z.object({
  caption: z.string().trim().max(2000),
  category: z.string().trim().max(40).optional(),
  /** A tier id to gate behind, or absent for a public post. */
  tierRequired: z.string().uuid().optional(),
});

export interface CreatePostResult {
  ok: boolean;
  error?: string;
  postId?: string;
}

interface StoredMedia {
  url?: string;
  path?: string;
  type: string;
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
    tierRequired: (formData.get("tierRequired") as string) || undefined,
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

  // Confirm a gating tier belongs to this creator before trusting it.
  let gatedTierId: string | null = null;
  if (parsed.data.tierRequired) {
    const { data: tier } = await supabase
      .from("subscription_tiers")
      .select("id")
      .eq("id", parsed.data.tierRequired)
      .eq("creator_id", user.id)
      .eq("is_active", true)
      .maybeSingle();
    if (!tier) {
      return { ok: false, error: "That subscription tier isn't available." };
    }
    gatedTierId = parsed.data.tierRequired;
  }

  // Upload media. Gated media goes to the private bucket (service role) and is
  // stored as a path; public media goes to the public bucket as a URL.
  const isGated = gatedTierId !== null;
  const admin = isGated ? createAdminClient() : null;
  const media: StoredMedia[] = [];
  for (const file of files.slice(0, 8)) {
    const path = `${user.id}/${crypto.randomUUID()}-${file.name}`;
    if (isGated && admin) {
      const { error: upErr } = await admin.storage
        .from(PRIVATE_BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false });
      if (!upErr) media.push({ path, type: file.type });
    } else {
      const { error: upErr } = await supabase.storage
        .from(MEDIA_BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false });
      if (!upErr) {
        const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
        media.push({ url: data.publicUrl, type: file.type });
      }
    }
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({
      creator_id: user.id,
      caption: parsed.data.caption || null,
      category: parsed.data.category ?? null,
      tier_required: gatedTierId,
      media: media.length ? media : null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: "Could not publish. Try again." };
  }
  revalidatePath("/feed");
  revalidatePath("/profile");
  return { ok: true, postId: data.id as string };
}

export interface GatedMediaResult {
  entitled: boolean;
  media: { url: string; type: string }[];
}

/**
 * Resolve a gated post's media for the current viewer. Returns signed URLs only
 * when the viewer is the creator or has an active subscription to the post's
 * required tier; otherwise entitled:false and the card shows the locked state.
 * Storage paths are never returned to the client.
 */
export async function getGatedMedia(postId: string): Promise<GatedMediaResult> {
  if (!postId || postId.startsWith("demo")) {
    return { entitled: true, media: [] };
  }

  let user = null;
  try {
    user = await getSessionUser();
  } catch {
    user = null;
  }

  const supabase = createClient();
  const { data: post } = await supabase
    .from("posts")
    .select("creator_id, tier_required, media")
    .eq("id", postId)
    .maybeSingle<{
      creator_id: string;
      tier_required: string | null;
      media: StoredMedia[] | null;
    }>();
  if (!post) return { entitled: false, media: [] };

  const stored = Array.isArray(post.media) ? post.media : [];

  // Not gated: media are already public URLs.
  if (post.tier_required == null) {
    return {
      entitled: true,
      media: stored
        .filter((m) => !!m.url)
        .map((m) => ({ url: m.url as string, type: m.type })),
    };
  }

  let entitled = false;
  if (user && user.id === post.creator_id) {
    entitled = true;
  } else if (user) {
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("fan_id", user.id)
      .eq("tier_id", post.tier_required)
      .gt("expires_at", new Date().toISOString())
      .limit(1)
      .maybeSingle();
    entitled = !!sub;
  }
  if (!entitled) return { entitled: false, media: [] };

  const admin = createAdminClient();
  const media: { url: string; type: string }[] = [];
  for (const m of stored) {
    if (!m.path) continue;
    const { data } = await admin.storage
      .from(PRIVATE_BUCKET)
      .createSignedUrl(m.path, 3600);
    if (data?.signedUrl) media.push({ url: data.signedUrl, type: m.type });
  }
  return { entitled: true, media };
}
