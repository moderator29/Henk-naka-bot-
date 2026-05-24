import { NextResponse } from "next/server";
import { getNotifications, getUnreadCount } from "@/lib/notifications/queries";

/** Recent notifications + unread count for the bell dropdown. */
export async function GET() {
  const [items, unread] = await Promise.all([
    getNotifications(20),
    getUnreadCount(),
  ]);
  return NextResponse.json(
    { items, unread },
    { headers: { "Cache-Control": "no-store" } }
  );
}
