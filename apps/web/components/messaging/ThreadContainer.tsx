"use client";

import { useCallback, useEffect } from "react";
import { ThreadView, type ThreadMessage } from "./ThreadView";
import { useRealtimeMessages } from "@/lib/messaging/useRealtimeMessages";
import { sendMessage, markConversationRead } from "@/lib/messaging/actions";

/**
 * Wires a thread to live data: seeds with server-rendered messages, subscribes
 * to Supabase Realtime for new ones, and sends via the server action.
 * Optimistically appends the sent message so the UI feels instant; the
 * realtime echo is de-duped by id in the hook.
 */
interface ThreadContainerProps {
  conversationId: string;
  backHref: string;
  meId?: string;
  otherDisplayName?: string;
  otherAvatarUrl?: string | null;
  otherVerified?: boolean;
  initialMessages: ThreadMessage[];
  /** Show Co-Pilot reply suggestions (creators replying to fans). */
  enableReplySuggestions?: boolean;
}

export function ThreadContainer({
  conversationId,
  backHref,
  meId,
  otherDisplayName,
  otherAvatarUrl,
  otherVerified,
  initialMessages,
  enableReplySuggestions,
}: ThreadContainerProps) {
  const { messages, append } = useRealtimeMessages(
    conversationId,
    initialMessages
  );

  // Clear unread receipts whenever the thread is open and a new inbound
  // message arrives. markConversationRead only touches messages we received.
  useEffect(() => {
    if (!meId) return;
    void markConversationRead(conversationId);
  }, [conversationId, meId, messages.length]);

  const onSend = useCallback(
    async (body: string) => {
      if (meId) {
        append({
          id: `optimistic-${Date.now()}`,
          senderId: meId,
          body,
          createdAt: new Date().toISOString(),
        });
      }
      await sendMessage(conversationId, body);
    },
    [append, conversationId, meId]
  );

  return (
    <ThreadView
      conversationId={conversationId}
      backHref={backHref}
      meId={meId}
      otherDisplayName={otherDisplayName}
      otherAvatarUrl={otherAvatarUrl}
      otherVerified={otherVerified}
      messages={messages}
      onSend={onSend}
      enableReplySuggestions={enableReplySuggestions}
    />
  );
}
