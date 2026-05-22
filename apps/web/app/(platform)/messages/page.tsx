import { MessagesShell } from "@/components/messaging/MessagesShell";

export const metadata = {
  title: "Messages",
};

/**
 * Conversation index. In auth-gated context the user picks a thread from the
 * left rail; the right rail renders an empty state. The thread view itself
 * lives at /messages/[conversationId].
 */
export default function MessagesPage() {
  return <MessagesShell />;
}
