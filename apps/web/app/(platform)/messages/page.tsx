import { MessagesShell } from "@/components/messaging/MessagesShell";
import { listConversations } from "@/lib/messaging/queries";

export const metadata = {
  title: "Messages",
};

/**
 * Conversation index. Server-fetches the signed-in user's conversations
 * (empty when unauthenticated / unconfigured, never fabricated). The thread
 * view itself lives at /messages/[conversationId].
 */
export default async function MessagesPage() {
  const conversations = await listConversations();
  return <MessagesShell conversations={conversations} />;
}
