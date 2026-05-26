import { createClient } from "@/lib/supabase/server";
import { DEFAULT_SETTINGS, type UserSettings } from "./settings";

function configured() {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * Read a user's saved settings, merged over defaults so a partial or missing
 * row always yields a complete, well-typed object. Server-only.
 */
export async function getUserSettings(userId: string): Promise<UserSettings> {
  if (!configured()) return DEFAULT_SETTINGS;
  const supabase = createClient();
  const { data } = await supabase
    .from("user_preferences")
    .select("settings")
    .eq("user_id", userId)
    .maybeSingle<{ settings: Partial<UserSettings> | null }>();

  const s = data?.settings ?? {};
  return {
    notifications: { ...DEFAULT_SETTINGS.notifications, ...s.notifications },
    ai: { ...DEFAULT_SETTINGS.ai, ...s.ai },
    language: s.language ?? DEFAULT_SETTINGS.language,
  };
}
