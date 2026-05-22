import { MessagesShell } from "@/components/messaging/MessagesShell";

interface ThreadPageProps {
  params: { conversationId: string };
}

export default function ThreadPage({ params }: ThreadPageProps) {
  return <MessagesShell activeConversationId={params.conversationId} />;
}
