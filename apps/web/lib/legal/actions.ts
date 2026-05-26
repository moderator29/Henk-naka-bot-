"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStaffContext, isAdminRole } from "@/lib/auth/roles";
import { logAdminAction } from "@/lib/admin/audit";
import { LEGAL_SLUGS } from "./content";

/**
 * Admin edit of a legal document. Upserts into legal_documents (which then
 * overrides the in-code default everywhere it renders) and bumps the version.
 */

const schema = z.object({
  slug: z.enum(LEGAL_SLUGS),
  title: z.string().trim().min(1).max(140),
  content: z.string().trim().min(1).max(60000),
});

export async function saveLegalDoc(
  slug: string,
  title: string,
  content: string
): Promise<{ ok: boolean; error?: string }> {
  const ctx = await getStaffContext();
  if (!ctx || !isAdminRole(ctx.role)) return { ok: false, error: "Admins only." };

  const parsed = schema.safeParse({ slug, title, content });
  if (!parsed.success) return { ok: false, error: "Check the document." };

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("legal_documents")
    .select("version")
    .eq("slug", parsed.data.slug)
    .maybeSingle<{ version: number }>();

  const { error } = await admin.from("legal_documents").upsert(
    {
      slug: parsed.data.slug,
      title: parsed.data.title,
      content: parsed.data.content,
      version: (existing?.version ?? 0) + 1,
      updated_at: new Date().toISOString(),
      updated_by: ctx.user.id,
    },
    { onConflict: "slug" }
  );
  if (error) return { ok: false, error: "Could not save." };

  await logAdminAction(ctx.user.id, "edit_legal", { type: "legal", id: parsed.data.slug });
  revalidatePath(`/legal/${parsed.data.slug}`);
  revalidatePath("/admin/legal");
  return { ok: true };
}
