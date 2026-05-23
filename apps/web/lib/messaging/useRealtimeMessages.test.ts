import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRealtimeMessages } from "./useRealtimeMessages";
import type { ThreadMessage } from "@/components/messaging/ThreadView";

const seed: ThreadMessage[] = [
  { id: "1", senderId: "a", body: "hey", createdAt: new Date().toISOString() },
];

describe("useRealtimeMessages", () => {
  it("returns the seeded messages and stays inert without Supabase env", () => {
    const { result } = renderHook(() => useRealtimeMessages("conv-1", seed));
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0]?.body).toBe("hey");
  });

  it("append adds a message and de-dupes by id", () => {
    const { result } = renderHook(() => useRealtimeMessages("conv-1", seed));
    act(() => {
      result.current.append({
        id: "2",
        senderId: "b",
        body: "yo",
        createdAt: new Date().toISOString(),
      });
    });
    expect(result.current.messages).toHaveLength(2);

    act(() => {
      result.current.append({
        id: "2",
        senderId: "b",
        body: "yo (dup)",
        createdAt: new Date().toISOString(),
      });
    });
    expect(result.current.messages).toHaveLength(2);
  });
});
