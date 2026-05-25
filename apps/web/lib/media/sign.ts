import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Issues a short-lived signed URL for a file in the private `gated-media`
 * bucket, using the service role. Callers MUST verify entitlement first; this
 * only mints the URL. Returns null when the service key isn't configured, so
 * gated media degrades to a locked state rather than crashing.
 */

export const GATED_BUCKET = "gated-media";
export const SIGNED_TTL_SECONDS = 60 * 60;

export async function signGatedUrl(path: string): Promise<string | null> {
  if (!path || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  try {
    const admin = createAdminClient();
    const { data } = await admin.storage
      .from(GATED_BUCKET)
      .createSignedUrl(path, SIGNED_TTL_SECONDS);
    return data?.signedUrl ?? null;
  } catch {
    return null;
  }
}
