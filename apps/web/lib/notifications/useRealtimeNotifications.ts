"use client";

import { useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { RealtimeChannel } from "@supabase/supabase-js";

/**
 * Live notifications: subscribes to INSERTs on the notifications table for the
 * signed-in user and fires onInsert (so likes, comments, follows, tips, and
 * subscriptions arrive in real time). Inert without Supabase env. The socket
 * carries the user's JWT so RLS lets their own notification events through.
 */
export function useRealtimeNotifications(onInsert: () => void) {
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return;

    const supabase = createBrowserClient(url, key);
    let channel: RealtimeChannel | null = null;
    let cancelled = false;

    void (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled || !session?.user) return;
      supabase.realtime.setAuth(session.access_token);

      channel = supabase
        .channel(`notifications:${session.user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${session.user.id}`,
          },
          () => onInsert()
        )
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [onInsert]);
}
