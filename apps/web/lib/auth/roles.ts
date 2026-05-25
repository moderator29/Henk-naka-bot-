import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "./session";

/**
 * Role helpers for admin/moderation access control. Roles live in the
 * `user_roles` table (migration 0013); a user can read their own role under
 * RLS. Admin routes call requireAdmin/requireModerator on the SERVER so access
 * is enforced in the layout + every admin action, never just hidden in the UI.
 */

export type Role = "user" | "creator" | "moderator" | "admin" | "superadmin";

const RANK: Record<Role, number> = {
  user: 0,
  creator: 1,
  moderator: 2,
  admin: 3,
  superadmin: 4,
};

function configured() {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function getMyRole(): Promise<Role> {
  if (!configured()) return "user";
  const me = await getSessionUser().catch(() => null);
  if (!me) return "user";
  const supabase = createClient();
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", me.id)
    .maybeSingle<{ role: Role }>();
  return data?.role ?? "user";
}

export function atLeast(role: Role, min: Role): boolean {
  return RANK[role] >= RANK[min];
}

export async function isModerator(): Promise<boolean> {
  return atLeast(await getMyRole(), "moderator");
}

export async function isAdmin(): Promise<boolean> {
  return atLeast(await getMyRole(), "admin");
}
