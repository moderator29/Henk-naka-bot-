import { createClient } from "@/lib/supabase/server";

/**
 * Builds live grounding for the AI from the signed-in user's own data + what's
 * trending, so recommendations are specific and stay fresh as the platform
 * grows. Honors the user's AI personalization toggle (Settings > AI): when off,
 * we pass only non-personal trending context. Personalization memory lives in
 * user_preferences.ai_persona_memory.
 */

interface PrefsRow {
  settings: { ai?: { concierge?: boolean } } | null;
  categories_interest: unknown;
  ai_persona_memory: { summary?: string } | null;
}

export interface Grounding {
  /** Whether AI personalization is enabled for this user. */
  personalized: boolean;
  /** Formatted context block to append to the system prompt (may be empty). */
  context: string;
}

function asStringList(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string");
  return [];
}

export async function loadUserGrounding(userId: string | null): Promise<Grounding> {
  const supabase = createClient();

  // Trending creators are non-personal and always safe to include.
  const { data: trending } = await supabase
    .from("creator_profiles")
    .select("subscriber_count, users:user_id(username, display_name)")
    .order("subscriber_count", { ascending: false })
    .limit(6);
  const trendingNames = ((trending ?? []) as {
    users: { username: string | null; display_name: string | null } | { username: string | null; display_name: string | null }[] | null;
  }[])
    .map((r) => {
      const u = Array.isArray(r.users) ? r.users[0] : r.users;
      return u?.display_name ?? u?.username ?? null;
    })
    .filter((n): n is string => !!n);

  const parts: string[] = [];
  if (trendingNames.length) {
    parts.push(`Trending creators right now: ${trendingNames.join(", ")}.`);
  }

  if (!userId) {
    return { personalized: false, context: parts.join("\n") };
  }

  const { data: prefRow } = await supabase
    .from("user_preferences")
    .select("settings, categories_interest, ai_persona_memory")
    .eq("user_id", userId)
    .maybeSingle<PrefsRow>();

  const personalized = prefRow?.settings?.ai?.concierge !== false;
  if (!personalized) {
    return { personalized: false, context: parts.join("\n") };
  }

  const interests = asStringList(prefRow?.categories_interest);
  if (interests.length) parts.push(`Their stated interests: ${interests.join(", ")}.`);

  // Who they follow (by name), to inform recommendations.
  const { data: follows } = await supabase
    .from("follows")
    .select("users:following_id(username, display_name)")
    .eq("follower_id", userId)
    .limit(15);
  const followNames = ((follows ?? []) as {
    users: { username: string | null; display_name: string | null } | { username: string | null; display_name: string | null }[] | null;
  }[])
    .map((r) => {
      const u = Array.isArray(r.users) ? r.users[0] : r.users;
      return u?.display_name ?? u?.username ?? null;
    })
    .filter((n): n is string => !!n);
  if (followNames.length) parts.push(`Creators they follow: ${followNames.join(", ")}.`);

  const memory = prefRow?.ai_persona_memory?.summary;
  if (memory) parts.push(`What you remember about them: ${memory}`);

  return { personalized: true, context: parts.join("\n") };
}
