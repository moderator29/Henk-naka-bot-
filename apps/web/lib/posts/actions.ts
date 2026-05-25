"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdult } from "@/lib/auth/session";

/**
 * Create a post. The client validates, compresses, and uploads media to
 * Storage first (the public `post-media` bucket for public posts, the private
 * `gated-media` bucket for gated posts), then calls this with the resulting
 * URLs/paths + metadata. Requires an authenticated, verified-adult creator.
 */

const mediaItem = z.object({
  type: z.enum(["image", "video"]),
  src: z.string().min(1),
  thumb: z.string().optional(),
  poster: z.string().optional(),
});

const schema = z.object({
  caption: z.string().trim().max(2000).optional(),
  category: z.string().trim().max(40).optional(),
  visibility: z.enum(["public", "followers", "subscribers", "tier"]).default("public"),
  tierRequired: z.string().uuid().nullable().optional(),
  allowComments: z.boolean().default(true),
  allowTips: z.boolean().default(true),
  scheduledFor: z.string().datetime().nullable().optional(),
  media: z.array(mediaItem).max(8).optional(),
});

export interface CreatePostResult {
  ok: boolean;
  error?: string;
  postId?: string;
}

function extractHashtags(caption: string): string[] {
  const found = caption.match(/#[\p{L}0-9_]+/gu) ?? [];
  const tags = found.map((t) => t.slice(1).toLowerCase());
  return Array.from(new Set(tags)).slice(0, 20);
}

export async function createPost(input: z.input<typeof schema>): Promise<CreatePostResult> {
  let user;
  try {
    user = await requireAdult();
  } catch {
    return { ok: false, error: "Sign in to post." };
  }

  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Check your post and try again." };
  const d = parsed.data;

  const caption = d.caption ?? "";
  const media = d.media ?? [];
  if (!caption.trim() && media.length === 0) {
    return { ok: false, error: "Add a caption or some media." };
  }

  const tier_required = d.visibility === "tier" ? d.tierRequired ?? null : null;
  if (d.visibility === "tier" && !tier_required) {
    return { ok: false, error: "Pick a tier for this post." };
  }

  const hashtags = extractHashtags(caption);

  const supabase = createClient();
  const { data, error } = await supabase
    .from("posts")
    .insert({
      creator_id: user.id,
      caption: caption.trim() || null,
      category: d.category ?? null,
      visibility: d.visibility,
      tier_required,
      allow_comments: d.allowComments,
      allow_tips: d.allowTips,
      hashtags: hashtags.length ? hashtags : null,
      scheduled_for: d.scheduledFor ?? null,
      media: media.length ? media : null,
    })
    .select("id")
    .single();

  if (error || !data) return { ok: false, error: "Could not publish. Try again." };
  revalidatePath("/feed");
  revalidatePath("/profile");
  return { ok: true, postId: data.id as string };
}
