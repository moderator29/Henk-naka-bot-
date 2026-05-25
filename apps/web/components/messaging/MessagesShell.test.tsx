import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MessagesShell, type ConversationPreview } from "./MessagesShell";

// The inbox header's NewMessageButton pulls in router/toast/server actions;
// stub it so this test stays focused on the shell layout.
vi.mock("./NewMessageButton", () => ({
  NewMessageButton: () => null,
}));

describe("MessagesShell", () => {
  it("renders the empty state when there are no conversations", () => {
    render(<MessagesShell />);
    expect(screen.getByText("No conversations yet.")).toBeInTheDocument();
    expect(screen.getByText("Pick a conversation")).toBeInTheDocument();
  });

  it("renders the conversation list and badge counts when conversations exist", () => {
    const conversations: ConversationPreview[] = [
      {
        id: "c1",
        displayName: "Nova",
        lastMessage: "see you tonight",
        lastMessageAt: new Date(Date.now() - 60_000),
        unreadCount: 3,
      },
      {
        id: "c2",
        displayName: "Sasha",
        lastMessage: "thanks for the tip",
        lastMessageAt: new Date(Date.now() - 3600_000),
        unreadCount: 0,
        verified: true,
      },
    ];
    render(<MessagesShell conversations={conversations} />);
    expect(screen.getByText("Nova")).toBeInTheDocument();
    expect(screen.getByText("Sasha")).toBeInTheDocument();
    expect(screen.getByLabelText("3 unread")).toBeInTheDocument();
    expect(screen.queryByLabelText(/0 unread/)).toBeNull();
  });
});
