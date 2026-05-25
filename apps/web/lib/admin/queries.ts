import { createAdminClient } from "@/lib/supabase/admin";
import { getMyRole, atLeast } from "@/lib/auth/roles";

/**
 * Admin read queries. Each re-checks the role and uses the service role to read
 * platform-wide data. The /admin layout already gates access; these guard again.
 */

function adminConfigured() {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export interface AdminReport {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  details: string | null;
  status: string;
  createdAt: string;
  reporter: string;
}

export async function getReports(status?: string): Promise<AdminReport[]> {
  if (!adminConfigured() || !atLeast(await getMyRole(), "moderator")) return [];
  const admin = createAdminClient();
  let q = admin
    .from("reports")
    .select("id, target_type, target_id, reason, details, status, created_at, users:reporter_id(username, display_name)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (status) q = q.eq("status", status);
  const { data } = await q;
  return ((data ?? []) as Record<string, unknown>[]).map((r) => {
    const u = Array.isArray(r.users) ? r.users[0] : r.users;
    const user = u as { username?: string; display_name?: string } | null;
    return {
      id: r.id as string,
      targetType: r.target_type as string,
      targetId: r.target_id as string,
      reason: r.reason as string,
      details: (r.details as string) ?? null,
      status: r.status as string,
      createdAt: r.created_at as string,
      reporter: user?.display_name ?? user?.username ?? "Someone",
    };
  });
}

export interface AdminUser {
  id: string;
  username: string | null;
  displayName: string | null;
  email: string | null;
  role: string;
  isCreator: boolean;
  isSuspended: boolean;
  isDemo: boolean;
  createdAt: string;
}

export async function getUsers(query?: string): Promise<AdminUser[]> {
  if (!adminConfigured() || !atLeast(await getMyRole(), "moderator")) return [];
  const admin = createAdminClient();
  let q = admin
    .from("users")
    .select("id, username, display_name, email, is_creator, is_suspended, is_demo, created_at, user_roles(role)")
    .order("created_at", { ascending: false })
    .limit(100);
  const term = query?.replace(/[%,()*]/g, "").trim();
  if (term) q = q.or(`username.ilike.%${term}%,display_name.ilike.%${term}%,email.ilike.%${term}%`);
  const { data } = await q;
  return ((data ?? []) as Record<string, unknown>[]).map((u) => {
    const roleRow = Array.isArray(u.user_roles) ? u.user_roles[0] : u.user_roles;
    return {
      id: u.id as string,
      username: (u.username as string) ?? null,
      displayName: (u.display_name as string) ?? null,
      email: (u.email as string) ?? null,
      role: ((roleRow as { role?: string })?.role as string) ?? "user",
      isCreator: !!u.is_creator,
      isSuspended: !!u.is_suspended,
      isDemo: !!u.is_demo,
      createdAt: u.created_at as string,
    };
  });
}

export interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  detail: Record<string, unknown> | null;
  createdAt: string;
}

export async function getAuditLog(): Promise<AuditEntry[]> {
  if (!adminConfigured() || !atLeast(await getMyRole(), "admin")) return [];
  const admin = createAdminClient();
  const { data } = await admin
    .from("admin_audit_log")
    .select("id, action, target_type, target_id, detail, created_at, users:actor_id(username, display_name)")
    .order("created_at", { ascending: false })
    .limit(200);
  return ((data ?? []) as Record<string, unknown>[]).map((e) => {
    const u = Array.isArray(e.users) ? e.users[0] : e.users;
    const user = u as { username?: string; display_name?: string } | null;
    return {
      id: e.id as string,
      actor: user?.display_name ?? user?.username ?? "System",
      action: e.action as string,
      targetType: (e.target_type as string) ?? null,
      targetId: (e.target_id as string) ?? null,
      detail: (e.detail as Record<string, unknown>) ?? null,
      createdAt: e.created_at as string,
    };
  });
}
