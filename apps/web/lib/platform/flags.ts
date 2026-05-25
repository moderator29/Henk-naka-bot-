import { createClient } from "@/lib/supabase/server";

/**
 * Reads platform feature flags from platform_settings (world-readable under
 * RLS). Used app-wide, e.g. the maintenance banner. Degrades to defaults when
 * Supabase isn't configured or the key is unset.
 */

export interface Maintenance {
  enabled: boolean;
  message: string;
}

function configured() {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function getMaintenance(): Promise<Maintenance> {
  const off = { enabled: false, message: "" };
  if (!configured()) return off;
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("platform_settings")
      .select("value")
      .eq("key", "maintenance")
      .maybeSingle<{ value: Maintenance | null }>();
    if (!data?.value) return off;
    return { enabled: !!data.value.enabled, message: data.value.message ?? "" };
  } catch {
    return off;
  }
}
