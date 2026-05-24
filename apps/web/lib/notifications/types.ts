/**
 * Client-safe notification types + the pure formatter. Kept separate from
 * queries.ts so client components (the bell dropdown) can import these without
 * pulling in the server-only Supabase client (next/headers).
 */

export type NotificationType =
  | "follow"
  | "subscribe"
  | "tip"
  | "post"
  | "message"
  | "system";

export interface AppNotification {
  id: string;
  type: NotificationType;
  payload: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
}

/** Human-readable line for a notification. Pure formatting over the payload. */
export function describeNotification(n: AppNotification): string {
  const actor =
    (n.payload?.actor_name as string) ?? (n.payload?.actor as string) ?? "Someone";
  switch (n.type) {
    case "follow":
      return `${actor} started following you`;
    case "subscribe":
      return `${actor} subscribed to your tier`;
    case "tip":
      return `${actor} tipped you${n.payload?.amount ? ` ${n.payload.amount} $NSFW` : ""}`;
    case "post":
      return `${actor} posted something new`;
    case "message":
      return `${actor} sent you a message`;
    default:
      return (n.payload?.message as string) ?? "You have a new notification";
  }
}
