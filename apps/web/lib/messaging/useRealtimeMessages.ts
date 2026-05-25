"use client";

import { useEffect, useState, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { ThreadMessage } from "@/components/messaging/ThreadView";

/**
 * Subscribes to live INSERTs on the messages table for one conversation via
 * Supabase Realtime, seeded with server-rendered initial messages.
 *
 * Real subscription, activates the moment NEXT_PUBLIC_SUPABASE_* env is set.
 * Without env it returns the initial messages and stays inert (no crash),
 * labeled PENDING_SUPABASE_REALTIME at the call site.
 *
 * Messages is an RLS-protected table, so the Realtime connection must carry
 * the signed-in user's access token, otherwise Postgres filters out every
 * change event and live updates silently never arrive. We pull the token from
 * the current session and set it on the socket before subscribing.
 */

interface MessageRow {
  id: string;
  sender_id: string;
  body: string | null;
  created_at: string;
}

export function useRealtimeMessages(
  conversationId: string,
  initial: ThreadMessage[]
) {
  const [messages, setMessages] = useState<ThreadMessage[]>(initial);

  const append = useCallback((m: ThreadMessage) => {
    setMessages((prev) =>
      prev.some((p) => p.id === m.id) ? prev : [...prev, m]
    );
  }, []);

  useEffect(() => {
    setMessages(initial);
  }, [conversationId, initial]);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return; // PENDING_SUPABASE_REALTIME, inert until configured

    const supabase = createBrowserClient(url, key);
    let channel: RealtimeChannel | null = null;
    let cancelled = false;

    void (async () => {
      // Authorize the Realtime socket with the user's JWT so RLS on the
      // messages table lets the change events through.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      if (session?.access_token) {
        supabase.realtime.setAuth(session.access_token);
      }

      channel = supabase
        .channel(`conversation:${conversationId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            const row = payload.new as MessageRow;
            append({
              id: row.id,
              senderId: row.sender_id,
              body: row.body ?? "",
              createdAt: row.created_at,
            });
          }
        )
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [conversationId, append]);

  return { messages, append };
}
