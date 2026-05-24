import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import type { ConversationPreview } from "@/components/messaging/MessagesShell";
import type { ThreadMessage } from "@/components/messaging/ThreadView";

/**
 * Server-side reads for the messaging surface. All queries run under the
 * caller's session, so RLS (participant-only) is enforced by Postgres.
 *
 * Each returns an empty result when Supabase isn't configured or the user
 * isn't signed in, the UI renders its empty state rather than crashing.
 * Real data flows the moment env + auth are live.
 */

function supabaseConfigured() {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

interface ConversationRow {
  id: string;
  participant_a: string;
  participant_b: string;
  last_message_at: string | null;
}

export async function listConversations(): Promise<ConversationPreview[]> {
  if (!supabaseConfigured()) return [];
  const me = await getSessionUser();
  if (!me) return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from("conversations")
    .select("id, participant_a, participant_b, last_message_at")
    .order("last_message_at", { ascending: false, nullsFirst: false });

  if (error || !data) return [];

  // Shape into previews. The other participant's profile + last-message text
  // are resolved in a follow-up join once profiles are seeded; for now we
  // return the thread skeleton (no fabricated names/messages).
  return (data as ConversationRow[]).map((row) => {
    const otherId =
      row.participant_a === me.id ? row.participant_b : row.participant_a;
    return {
      id: row.id,
      displayName: otherId.slice(0, 8),
      lastMessage: "",
      lastMessageAt: row.last_message_at ?? new Date().toISOString(),
      unreadCount: 0,
    } satisfies ConversationPreview;
  });
}

interface MessageRow {
  id: string;
  sender_id: string;
  body: string | null;
  created_at: string;
}

export async function getThreadMessages(
  conversationId: string
): Promise<ThreadMessage[]> {
  if (!supabaseConfigured()) return [];
  const me = await getSessionUser();
  if (!me) return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from("messages")
    .select("id, sender_id, body, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(200);

  if (error || !data) return [];

  return (data as MessageRow[]).map((m) => ({
    id: m.id,
    senderId: m.sender_id,
    body: m.body ?? "",
    createdAt: m.created_at,
  }));
}
