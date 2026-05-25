"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdult } from "@/lib/auth/session";

const sendSchema = z.object({
  conversationId: z.string().uuid(),
  body: z.string().trim().min(1).max(4000),
});

export interface SendResult {
  ok: boolean;
  error?: string;
}

/**
 * Sends a text message into a conversation. RLS guarantees the sender is a
 * participant; we additionally enforce sender_id = the authed adult user.
 * The conversations.last_message_at bump happens via the DB trigger (0002).
 */
export async function sendMessage(
  conversationId: string,
  body: string
): Promise<SendResult> {
  const parsed = sendSchema.safeParse({ conversationId, body });
  if (!parsed.success) {
    return { ok: false, error: "Invalid message." };
  }

  let user;
  try {
    user = await requireAdult();
  } catch {
    return { ok: false, error: "You must be signed in." };
  }

  const supabase = createClient();
  const { error } = await supabase.from("messages").insert({
    conversation_id: parsed.data.conversationId,
    sender_id: user.id,
    body: parsed.data.body,
  });

  if (error) {
    return { ok: false, error: "Could not send. Try again." };
  }
  return { ok: true };
}

const startSchema = z.object({ otherUserId: z.string().uuid() });

export interface StartResult {
  ok: boolean;
  conversationId?: string;
  needsAuth?: boolean;
  error?: string;
}

/**
 * Finds or creates the one canonical conversation between the caller and
 * another user, returning its id so the UI can navigate to the thread.
 *
 * Participants are stored sorted (a < b) to match the conv_canonical_pair
 * check + unique index, so the same pair always resolves to one thread. On a
 * concurrent-create race the unique index fires; we recover by re-selecting.
 */
export async function startConversation(
  otherUserId: string
): Promise<StartResult> {
  const parsed = startSchema.safeParse({ otherUserId });
  if (!parsed.success) return { ok: false, error: "Invalid user." };

  let user;
  try {
    user = await requireAdult();
  } catch {
    return { ok: false, needsAuth: true, error: "You must be signed in." };
  }

  if (user.id === parsed.data.otherUserId) {
    return { ok: false, error: "You can't message yourself." };
  }

  const supabase = createClient();
  const [a, b] = [user.id, parsed.data.otherUserId].sort();

  const findExisting = () =>
    supabase
      .from("conversations")
      .select("id")
      .eq("participant_a", a)
      .eq("participant_b", b)
      .maybeSingle<{ id: string }>();

  const { data: existing } = await findExisting();
  if (existing) return { ok: true, conversationId: existing.id };

  const { data: created, error } = await supabase
    .from("conversations")
    .insert({ participant_a: a, participant_b: b })
    .select("id")
    .maybeSingle<{ id: string }>();

  if (created) return { ok: true, conversationId: created.id };

  if (error) {
    // Likely a concurrent insert hitting the unique pair index, re-select.
    const { data: again } = await findExisting();
    if (again) return { ok: true, conversationId: again.id };
  }
  return { ok: false, error: "Could not start the conversation." };
}

/**
 * Marks every inbound, still-unread message in a conversation as read.
 * The recipient-only UPDATE policy (0002) restricts this to messages the
 * caller did not send, so read receipts can't be spoofed for your own.
 */
export async function markConversationRead(
  conversationId: string
): Promise<{ ok: boolean }> {
  const parsed = z.string().uuid().safeParse(conversationId);
  if (!parsed.success) return { ok: false };

  let user;
  try {
    user = await requireAdult();
  } catch {
    return { ok: false };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", parsed.data)
    .neq("sender_id", user.id)
    .is("read_at", null);

  return { ok: !error };
}
