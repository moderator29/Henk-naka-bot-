"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useRealtimeNotifications } from "@/lib/notifications/useRealtimeNotifications";

/**
 * Top-bar notifications bell: a link to the full /notifications page with a
 * live unread badge. No dropdown, the full page is the single place to read
 * and clear notifications.
 */
export function NotificationsBell() {
  const [unread, setUnread] = useState(0);

  const loadCount = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = (await res.json()) as { unread?: number };
        setUnread(data.unread ?? 0);
      }
    } catch {
      // unconfigured / offline: keep zero
    }
  }, []);

  useEffect(() => {
    loadCount();
  }, [loadCount]);

  const onRealtime = useCallback(() => setUnread((u) => u + 1), []);
  useRealtimeNotifications(onRealtime);

  return (
    <Link
      href="/notifications"
      aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
      className="relative h-10 w-10 shrink-0 rounded-xl flex items-center justify-center text-lilac/70 hover:text-white hover:bg-white/5"
    >
      <Bell size={18} />
      {unread > 0 && (
        <span
          aria-hidden="true"
          className="absolute top-1 right-1 min-w-[1rem] h-4 px-1 rounded-full bg-magenta text-white text-[0.55rem] font-semibold inline-flex items-center justify-center"
        >
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}
