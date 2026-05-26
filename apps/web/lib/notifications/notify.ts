import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Notification fan-out, written with the service role (RLS only lets a user
 * write their own notifications) and gated by the recipient's preferences.
 *
 * Notifications are delivered live to the recipient via Supabase Realtime
 * (the notifications table is in the realtime publication, migration 0013).
 * Types that map to a settings toggle are suppressed when the recipient turned
 * that toggle off; everything else is always delivered. Self-actions never
 * notify.
 */

export type NotifType =
  | "follow"
  | "like"
  | "comment"
  | "tip"
  | "subscribe"
  | "message"
  | "post"
  | "broadcast"
  | "system";

// Notification type -> the user-preference toggle that gates it. Types absent
// from this map are always delivered (likes, comments, messages, subscribes).
const PREF_KEY: Partial<Record<NotifType, "follows" | "posts" | "tips">> = {
  follow: "follows",
  post: "posts",
  tip: "tips",
};

type Admin = ReturnType<typeof createAdminClient>;

interface PrefsRow {
  settings: { notifications?: Record<string, boolean> } | null;
}

async function prefAllows(
  admin: Admin,
  recipientId: string,
  type: NotifType
): Promise<boolean> {
  const key = PREF_KEY[type];
  if (!key) return true;
  const { data } = await admin
    .from("user_preferences")
    .select("settings")
    .eq("user_id", recipientId)
    .maybeSingle<PrefsRow>();
  // Default on when no row or no explicit false.
  return data?.settings?.notifications?.[key] !== false;
}

async function actorName(admin: Admin, actorId: string): Promise<string> {
  const { data } = await admin
    .from("users")
    .select("display_name, username")
    .eq("id", actorId)
    .maybeSingle<{ display_name: string | null; username: string | null }>();
  return data?.display_name ?? data?.username ?? "Someone";
}

/** Notify one recipient, honoring their preference for this type. */
export async function notify(
  recipientId: string,
  actorId: string,
  type: NotifType,
  payload: Record<string, unknown> = {}
): Promise<void> {
  if (recipientId === actorId) return;
  try {
    const admin = createAdminClient();
    if (!(await prefAllows(admin, recipientId, type))) return;
    const actor_name = await actorName(admin, actorId);
    await admin
      .from("notifications")
      .insert({ user_id: recipientId, type, payload: { ...payload, actor_name } });
  } catch {
    // Best-effort: no service key, or insert failed.
  }
}

/**
 * Fan a "new post" notification out to a creator's followers who keep the
 * "posts" toggle on. Chunked inserts keep a large follower set within request
 * limits. Best-effort and never blocks the post write.
 */
export async function notifyFollowersOfPost(
  creatorId: string,
  postId: string
): Promise<void> {
  try {
    const admin = createAdminClient();
    const [{ data: followerRows }, actor_name] = await Promise.all([
      admin.from("follows").select("follower_id").eq("following_id", creatorId),
      actorName(admin, creatorId),
    ]);
    const followerIds = (followerRows ?? []).map(
      (r) => (r as { follower_id: string }).follower_id
    );
    if (followerIds.length === 0) return;

    // Drop followers who turned off the "posts" toggle.
    const { data: prefRows } = await admin
      .from("user_preferences")
      .select("user_id, settings")
      .in("user_id", followerIds);
    const postsOff = new Set(
      (prefRows ?? [])
        .filter(
          (p) =>
            (p as PrefsRow & { user_id: string }).settings?.notifications
              ?.posts === false
        )
        .map((p) => (p as { user_id: string }).user_id)
    );

    const recipients = followerIds.filter((id) => !postsOff.has(id));
    const rows = recipients.map((id) => ({
      user_id: id,
      type: "post" as const,
      payload: { postId, actor_name },
    }));

    const CHUNK = 500;
    for (let i = 0; i < rows.length; i += CHUNK) {
      await admin.from("notifications").insert(rows.slice(i, i + CHUNK));
    }
  } catch {
    // Best-effort.
  }
}
