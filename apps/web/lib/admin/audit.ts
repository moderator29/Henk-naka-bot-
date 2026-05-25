import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Append-only admin audit log writer. Call after any sensitive admin action
 * (suspend, role change, content removal, report resolution, announcement).
 * Uses the service role so the row is always written; callers must have
 * already passed the requireAdmin/requireModerator gate. Best-effort: a
 * logging failure never blocks the action.
 */
export async function logAdminAction(
  actorId: string,
  action: string,
  opts: { targetType?: string; targetId?: string; detail?: Record<string, unknown> } = {}
): Promise<void> {
  try {
    const admin = createAdminClient();
    await admin.from("admin_audit_log").insert({
      actor_id: actorId,
      action,
      target_type: opts.targetType ?? null,
      target_id: opts.targetId ?? null,
      detail: opts.detail ?? null,
    });
  } catch {
    /* best-effort */
  }
}
