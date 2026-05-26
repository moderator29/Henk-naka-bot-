import { createClient } from "@/lib/supabase/server";
import { DEFAULT_LEGAL, type LegalDoc } from "./content";

/**
 * Legal documents resolve to the admin-edited DB row when one exists, otherwise
 * the in-code default. This guarantees the documents always render, and lets
 * admins update them from the panel without a deploy.
 */

function configured() {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export interface ResolvedLegalDoc extends LegalDoc {
  updatedAt: string | null;
  fromDb: boolean;
}

export async function getLegalDoc(slug: string): Promise<ResolvedLegalDoc | null> {
  const fallback = DEFAULT_LEGAL[slug];
  if (!fallback) return null;

  if (configured()) {
    const supabase = createClient();
    const { data } = await supabase
      .from("legal_documents")
      .select("title, content, updated_at")
      .eq("slug", slug)
      .maybeSingle<{ title: string; content: string; updated_at: string }>();
    if (data) {
      return {
        slug,
        title: data.title,
        content: data.content,
        updatedAt: data.updated_at,
        fromDb: true,
      };
    }
  }

  return { ...fallback, updatedAt: null, fromDb: false };
}
