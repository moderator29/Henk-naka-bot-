import { createClient } from "@/lib/supabase/server";
import { getSessionUser, type SessionUser } from "./session";

/**
 * Role system (mirrors 0011_roles_and_admin). The role lives in user_roles and
 * is read under the caller's session (RLS lets a user read their own role).
 * Staff = moderator and up; admin = admin and up. The /admin route and every
 * admin server action guard on these server-side, never just in the UI.
 */

export type Role = "user" | "creator" | "moderator" | "admin" | "superadmin";

const STAFF: Role[] = ["moderator", "admin", "superadmin"];
const ADMIN: Role[] = ["admin", "superadmin"];

export interface AdminContext {
  user: SessionUser;
  role: Role;
}

export async function getMyRole(): Promise<Role> {
  const user = await getSessionUser();
  if (!user) return "user";
  const supabase = createClient();
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle<{ role: Role }>();
  return data?.role ?? "user";
}

export function isStaffRole(role: Role): boolean {
  return STAFF.includes(role);
}

export function isAdminRole(role: Role): boolean {
  return ADMIN.includes(role);
}

/**
 * Returns the admin context (user + role) only for staff; otherwise null. The
 * /admin layout uses this to redirect non-staff. Server-side only.
 */
export async function getStaffContext(): Promise<AdminContext | null> {
  const user = await getSessionUser();
  if (!user) return null;
  const role = await getMyRole();
  if (!isStaffRole(role)) return null;
  return { user, role };
}
