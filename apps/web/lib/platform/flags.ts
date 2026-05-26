import { createClient } from "@/lib/supabase/server";

/**
 * Platform-wide flags read from public.platform_settings (admin-managed).
 * Currently: maintenance mode. Public read is allowed by RLS so the banner can
 * render for everyone; only admins can change the value.
 */
export interface PlatformFlags {
  maintenance: boolean;
}

export async function getPlatformFlags(): Promise<PlatformFlags> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { maintenance: false };
  }
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("platform_settings")
      .select("value")
      .eq("key", "maintenance_mode")
      .maybeSingle<{ value: unknown }>();
    // Stored either as a bare boolean or { enabled: boolean }.
    const v = data?.value;
    const maintenance =
      v === true || (typeof v === "object" && v !== null && (v as { enabled?: boolean }).enabled === true);
    return { maintenance };
  } catch {
    return { maintenance: false };
  }
}
