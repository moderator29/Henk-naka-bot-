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

interface ParticipantRow {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  is_verified: boolean;
}

interface PreviewMessageRow {
  conversation_id: string;
  sender_id: string;
  body: string | null;
  created_at: string;
  read_at: string | null;
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

  if (error || !data || data.length === 0) return [];

  const rows = data as ConversationRow[];
  const otherIdFor = (row: ConversationRow) =>
    row.participant_a === me.id ? row.participant_b : row.participant_a;

  const otherIds = Array.from(new Set(rows.map(otherIdFor)));
  const convIds = rows.map((r) => r.id);

  // One round-trip each for the other participants' public profiles and the
  // recent messages across all threads, so we avoid an N+1 per conversation.
  const [{ data: users }, { data: msgs }] = await Promise.all([
    supabase
      .from("users")
      .select("id, username, display_name, avatar_url, is_verified")
      .in("id", otherIds),
    supabase
      .from("messages")
      .select("conversation_id, sender_id, body, created_at, read_at")
      .in("conversation_id", convIds)
      .order("created_at", { ascending: false }),
  ]);

  const userById = new Map(
    ((users ?? []) as ParticipantRow[]).map((u) => [u.id, u])
  );

  const lastByConv = new Map<string, { body: string; createdAt: string }>();
  const unreadByConv = new Map<string, number>();
  for (const m of (msgs ?? []) as PreviewMessageRow[]) {
    if (!lastByConv.has(m.conversation_id)) {
      lastByConv.set(m.conversation_id, {
        body: m.body ?? "",
        createdAt: m.created_at,
      });
    }
    if (m.sender_id !== me.id && m.read_at == null) {
      unreadByConv.set(
        m.conversation_id,
        (unreadByConv.get(m.conversation_id) ?? 0) + 1
      );
    }
  }

  return rows.map((row) => {
    const other = userById.get(otherIdFor(row));
    const last = lastByConv.get(row.id);
    return {
      id: row.id,
      displayName: other?.display_name ?? other?.username ?? "Member",
      avatarUrl: other?.avatar_url ?? null,
      verified: !!other?.is_verified,
      lastMessage: last?.body ?? "",
      lastMessageAt:
        row.last_message_at ?? last?.createdAt ?? new Date().toISOString(),
      unreadCount: unreadByConv.get(row.id) ?? 0,
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
