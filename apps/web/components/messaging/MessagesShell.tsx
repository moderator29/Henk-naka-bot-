"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { cn, relativeTime } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { BrandIcon } from "@/components/brand/BrandIcon";

/**
 * Messages two-pane shell.
 *
 * Desktop: conversation list left, thread right.
 * Mobile: list takes the full screen; tapping a thread navigates to
 * /messages/[id] which renders the same shell with activeConversationId
 * set and the list collapsed.
 *
 * Real conversations + messages arrive once auth + Supabase realtime are
 * wired (sub-branches #8 + #11). Until then the shell renders the empty
 * onboarding state — never fake threads. PENDING_SUPABASE_AUTH.
 */

export interface ConversationPreview {
  id: string;
  displayName: string;
  avatarUrl?: string | null;
  lastMessage: string;
  lastMessageAt: string | Date;
  unreadCount: number;
  verified?: boolean;
}

interface MessagesShellProps {
  activeConversationId?: string;
  conversations?: ConversationPreview[];
  /**
   * The live thread, injected by the server page (a ThreadContainer wired to
   * Supabase Realtime + the send action). When absent but a conversation is
   * active, the shell shows the empty thread prompt.
   */
  threadSlot?: ReactNode;
}

export function MessagesShell({
  activeConversationId,
  conversations = [],
  threadSlot,
}: MessagesShellProps) {
  const hasConversations = conversations.length > 0;
  const showThread = !!activeConversationId;

  return (
    <div className="-mx-4 -my-6 sm:-mx-6 lg:-mx-8 h-[calc(100svh-4rem)] lg:h-[calc(100svh-4rem)] flex">
      {/* Conversation list */}
      <aside
        className={cn(
          "flex-shrink-0 w-full md:w-80 lg:w-96 border-r border-white/5 bg-plum/40 flex flex-col",
          showThread && "hidden md:flex"
        )}
        aria-label="Conversations"
      >
        <div className="px-5 py-4 border-b border-white/5">
          <h1 className="font-display text-2xl font-bold text-white">
            Messages
          </h1>
          <p className="text-xs text-lilac/60 mt-0.5">
            Direct messages with creators and fans.
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {hasConversations ? (
            <ul className="divide-y divide-white/5">
              {conversations.map((c) => (
                <li key={c.id}>
                  <ConversationRow
                    conversation={c}
                    active={c.id === activeConversationId}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyConversationList />
          )}
        </div>
      </aside>

      {/* Thread view (desktop always visible; mobile when active) */}
      <section
        className={cn(
          "flex-1 flex flex-col bg-plum/60",
          !showThread && "hidden md:flex"
        )}
      >
        {showThread && threadSlot ? threadSlot : <ThreadPlaceholder />}
      </section>
    </div>
  );
}

function ConversationRow({
  conversation,
  active,
}: {
  conversation: ConversationPreview;
  active: boolean;
}) {
  return (
    <Link
      href={`/messages/${conversation.id}`}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex gap-3 px-5 py-4 hover:bg-white/[0.03] transition-colors",
        active && "bg-white/[0.05]"
      )}
    >
      <div className="relative h-12 w-12 rounded-full overflow-hidden bg-imperial flex-shrink-0">
        {conversation.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- avatars come from Supabase storage; next/image gets wired in Phase 2 with the real source set
          <img
            src={conversation.avatarUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-sm font-display text-white">
            {conversation.displayName.slice(0, 1).toUpperCase()}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-white truncate">
            {conversation.displayName}
          </span>
          {conversation.verified && (
            <span aria-label="Verified" className="text-cyan text-xs">
              ✓
            </span>
          )}
          <span className="ml-auto text-[0.65rem] text-lilac/50 flex-shrink-0">
            {relativeTime(conversation.lastMessageAt)}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-sm text-lilac/70 truncate">
            {conversation.lastMessage}
          </p>
          {conversation.unreadCount > 0 && (
            <span
              aria-label={`${conversation.unreadCount} unread`}
              className="ml-auto min-w-[1.25rem] h-5 px-1.5 rounded-full bg-magenta text-white text-[0.65rem] font-semibold inline-flex items-center justify-center flex-shrink-0"
            >
              {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function EmptyConversationList() {
  return (
    <div className="px-5 py-12 text-center">
      <p className="text-sm text-lilac/60">No conversations yet.</p>
      <p className="text-xs text-lilac/40 mt-1">
        Start one from any creator profile.
      </p>
    </div>
  );
}

function ThreadPlaceholder() {
  return (
    <div className="flex-1 grid place-items-center px-6">
      <Card className="max-w-md text-center py-12 bg-transparent border-dashed border-2 border-white/10">
        <div className="flex justify-center mb-5">
          <BrandIcon name="heart" size={72} />
        </div>
        <h2 className="font-display text-xl font-semibold text-white mb-2">
          Pick a conversation
        </h2>
        <p className="text-sm text-lilac/60 max-w-xs mx-auto">
          Select a thread from the left, or start a new one from a creator
          profile.
        </p>
      </Card>
    </div>
  );
}

// Re-export helper for testing the row in isolation.
export { ConversationRow };
