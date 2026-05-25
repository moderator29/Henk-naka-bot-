"use server";

import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";

/**
 * Search actions, callable from client components. People search backs both the
 * global search surface and the "new message" picker; it matches by display
 * name OR @username (partial, via the trigram indexes from migration 0010).
 */

function configured() {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/** Strip characters that would break a PostgREST or/ilike filter. */
function sanitize(q: string): string {
  return q.replace(/[%,()*]/g, "").trim().slice(0, 60);
}

export interface PersonResult {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  verified: boolean;
}

export async function searchUsers(query: string): Promise<PersonResult[]> {
  const term = sanitize(query);
  if (term.length < 1 || !configured()) return [];

  let meId: string | null = null;
  try {
    meId = (await getSessionUser())?.id ?? null;
  } catch {
    meId = null;
  }

  const supabase = createClient();
  const { data } = await supabase
    .from("users")
    .select("id, username, display_name, avatar_url, is_verified, is_demo")
    .or(`username.ilike.%${term}%,display_name.ilike.%${term}%`)
    .limit(12);

  return ((data ?? []) as {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    is_verified: boolean;
    is_demo: boolean;
  }[])
    .filter((u) => u.id !== meId && !u.is_demo && u.username)
    .map((u) => ({
      id: u.id,
      username: u.username as string,
      displayName: u.display_name ?? (u.username as string),
      avatarUrl: u.avatar_url,
      verified: u.is_verified,
    }));
}
