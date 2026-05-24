import { MessagesShell } from "@/components/messaging/MessagesShell";
import { ThreadContainer } from "@/components/messaging/ThreadContainer";
import { listConversations, getThreadMessages } from "@/lib/messaging/queries";
import { getSessionUser } from "@/lib/auth/session";

interface ThreadPageProps {
  params: { conversationId: string };
}

export default async function ThreadPage({ params }: ThreadPageProps) {
  const { conversationId } = params;
  const [conversations, initialMessages, me] = await Promise.all([
    listConversations(),
    getThreadMessages(conversationId),
    getSessionUser(),
  ]);

  return (
    <MessagesShell
      activeConversationId={conversationId}
      conversations={conversations}
      threadSlot={
        <ThreadContainer
          conversationId={conversationId}
          backHref="/messages"
          meId={me?.id}
          initialMessages={initialMessages}
          enableReplySuggestions={!!me}
        />
      }
    />
  );
}
