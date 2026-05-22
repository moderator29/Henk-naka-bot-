import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThreadView, type ThreadMessage } from "./ThreadView";

describe("ThreadView", () => {
  it("renders an empty placeholder when no messages", () => {
    render(<ThreadView conversationId="c1" backHref="/messages" />);
    expect(screen.getByText("No messages yet. Say hi.")).toBeInTheDocument();
  });

  it("renders bubbles and distinguishes mine vs theirs", () => {
    const messages: ThreadMessage[] = [
      { id: "1", senderId: "me", body: "hey", createdAt: new Date() },
      { id: "2", senderId: "other", body: "yo", createdAt: new Date() },
    ];
    render(
      <ThreadView
        conversationId="c1"
        backHref="/messages"
        meId="me"
        messages={messages}
      />
    );
    expect(screen.getByText("hey")).toBeInTheDocument();
    expect(screen.getByText("yo")).toBeInTheDocument();
  });

  it("submits the composer and clears the draft", async () => {
    const onSend = vi.fn().mockResolvedValue(undefined);
    render(
      <ThreadView conversationId="c1" backHref="/messages" onSend={onSend} />
    );
    const input = screen.getByLabelText("Type a message") as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: "hello world" } });
    fireEvent.submit(input.closest("form")!);
    await new Promise((r) => setTimeout(r, 0));
    expect(onSend).toHaveBeenCalledWith("hello world");
  });

  it("does not submit empty drafts", async () => {
    const onSend = vi.fn();
    render(
      <ThreadView conversationId="c1" backHref="/messages" onSend={onSend} />
    );
    const input = screen.getByLabelText("Type a message") as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.submit(input.closest("form")!);
    expect(onSend).not.toHaveBeenCalled();
  });
});
