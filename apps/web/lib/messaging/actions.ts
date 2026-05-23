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
