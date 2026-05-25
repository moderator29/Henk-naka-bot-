import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Append-only admin audit log. Writes via the service role so the record can't
 * be tampered with from the client. Every sensitive admin action calls this.
 */
export async function logAdminAction(
  actorId: string,
  action: string,
  target?: { type?: string; id?: string },
  detail?: Record<string, unknown>
): Promise<void> {
  try {
    const admin = createAdminClient();
    await admin.from("admin_audit_log").insert({
      actor_id: actorId,
      action,
      target_type: target?.type ?? null,
      target_id: target?.id ?? null,
      detail: detail ?? null,
    });
  } catch {
    // Best-effort: never let logging failure block the action itself.
  }
}
