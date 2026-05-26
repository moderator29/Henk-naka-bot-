import { MessagesShell } from "@/components/messaging/MessagesShell";
import { ThreadContainer } from "@/components/messaging/ThreadContainer";
import { listConversations, getThreadMessages } from "@/lib/messaging/queries";
import { getSessionUser } from "@/lib/auth/session";
import { getUserSettings } from "@/lib/profile/queries";

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
  const copilotOn = me ? (await getUserSettings(me.id)).ai.copilot : false;

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
          enableReplySuggestions={copilotOn}
        />
      }
    />
  );
}
