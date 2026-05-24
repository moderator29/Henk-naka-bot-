import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import type { AppNotification, NotificationType } from "./types";

/**
 * Notification reads (server-only). RLS restricts the notifications table to
 * the owning user (policy from 0001), so these run under the caller's session.
 * Returns empty / zero when Supabase isn't configured or the user isn't signed
 * in, never fabricated notifications.
 *
 * Types + the describeNotification formatter live in ./types so client
 * components can import them without pulling in this server-only module
 * (which imports next/headers via the Supabase server client).
 */

export type { AppNotification, NotificationType } from "./types";
export { describeNotification } from "./types";

function configured() {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function getNotifications(limit = 20): Promise<AppNotification[]> {
  if (!configured()) return [];
  const me = await getSessionUser();
  if (!me) return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("id, type, payload, read_at, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((n) => ({
    id: n.id as string,
    type: (n.type as NotificationType) ?? "system",
    payload: (n.payload as Record<string, unknown> | null) ?? null,
    readAt: (n.read_at as string) ?? null,
    createdAt: n.created_at as string,
  }));
}

export async function getUnreadCount(): Promise<number> {
  if (!configured()) return 0;
  const me = await getSessionUser();
  if (!me) return 0;

  const supabase = createClient();
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .is("read_at", null);

  if (error) return 0;
  return count ?? 0;
}
