"use client";

import Link from "next/link";
import { ArrowLeft, Send, Sparkles } from "lucide-react";
import { useState, type FormEvent } from "react";
import { cn, relativeTime } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

/**
 * Thread view. Renders the bubble stream and the composer for a single
 * conversation. Real messages arrive from Supabase Realtime once auth +
 * channels are wired (sub-branch #11). Until then the surface renders the
 * empty state — never fake bubbles.
 *
 * PENDING_SUPABASE_AUTH / PENDING_SUPABASE_REALTIME.
 */

export interface ThreadMessage {
  id: string;
  senderId: string;
  body: string;
  createdAt: string | Date;
}

interface ThreadViewProps {
  conversationId: string;
  backHref: string;
  /** Real values flow once auth is wired. */
  meId?: string;
  otherDisplayName?: string;
  otherAvatarUrl?: string | null;
  otherVerified?: boolean;
  messages?: ThreadMessage[];
  onSend?: (body: string) => Promise<void> | void;
  /**
   * When true, shows the Co-Pilot "Suggest replies" control (RPD §3.2) wired
   * to /api/ai/copilot/replies. Intended for creators replying to fans.
   */
  enableReplySuggestions?: boolean;
}

export function ThreadView({
  backHref,
  meId,
  otherDisplayName,
  otherAvatarUrl,
  otherVerified,
  messages = [],
  onSend,
  enableReplySuggestions = false,
}: ThreadViewProps) {
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const fetchSuggestions = async () => {
    if (messages.length === 0) return;
    setLoadingSuggestions(true);
    setSuggestions([]);
    try {
      const payload = messages.slice(-12).map((m) => ({
        role: m.senderId === meId ? ("assistant" as const) : ("user" as const),
        content: m.body,
      }));
      const res = await fetch("/api/ai/copilot/replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payload }),
      });
      if (res.ok) {
        const data = (await res.json()) as { suggestions: string[] };
        setSuggestions(data.suggestions ?? []);
      }
    } catch {
      // leave empty — control just shows nothing new
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setSending(true);
    try {
      await onSend?.(body);
      setDraft("");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center gap-3 px-5 py-3 border-b border-white/5 bg-plum/60">
        <Link
          href={backHref}
          aria-label="Back to conversations"
          className="md:hidden h-9 w-9 rounded-lg flex items-center justify-center text-lilac hover:text-white hover:bg-white/5"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="relative h-10 w-10 rounded-full overflow-hidden bg-imperial flex-shrink-0">
          {otherAvatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={otherAvatarUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="absolute inset-0 grid place-items-center text-sm font-display text-white">
              {(otherDisplayName ?? "·").slice(0, 1).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-white truncate">
              {otherDisplayName ?? "Conversation"}
            </span>
            {otherVerified && (
              <span aria-label="Verified" className="text-cyan text-xs">
                ✓
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Bubble stream */}
      <ol className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-3">
        {messages.length === 0 ? (
          <li className="text-center text-sm text-lilac/50 mt-12">
            No messages yet. Say hi.
          </li>
        ) : (
          messages.map((m) => (
            <Bubble key={m.id} message={m} mine={meId === m.senderId} />
          ))
        )}
      </ol>

      {/* Co-Pilot reply suggestions */}
      {enableReplySuggestions && (
        <div className="px-4 pt-2 border-t border-white/5 bg-plum/80 backdrop-blur">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={fetchSuggestions}
              disabled={loadingSuggestions || messages.length === 0}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full glass text-xs font-medium text-magenta hover:text-magenta-light disabled:opacity-50"
            >
              <Sparkles size={12} />
              {loadingSuggestions ? "Thinking…" : "Suggest replies"}
            </button>
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setDraft(s);
                  setSuggestions([]);
                }}
                className="px-2.5 py-1 rounded-full bg-plum/60 border border-white/10 text-xs text-lilac/80 hover:text-white hover:border-magenta/40 max-w-[16rem] truncate"
                title={s}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Composer */}
      <form
        onSubmit={handleSubmit}
        className={cn(
          "px-4 py-3 bg-plum/80 backdrop-blur",
          !enableReplySuggestions && "border-t border-white/5"
        )}
      >
        <label htmlFor="dm-composer" className="sr-only">
          Type a message
        </label>
        <div className="flex items-end gap-2">
          <textarea
            id="dm-composer"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={1}
            placeholder="Write a message…"
            className="flex-1 resize-none rounded-xl bg-plum/60 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-lilac/40 focus:border-magenta/50 focus:outline-none focus:ring-2 focus:ring-magenta/20 max-h-40"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                (e.currentTarget.form as HTMLFormElement | null)?.requestSubmit();
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!draft.trim() || sending}
            loading={sending}
            aria-label="Send"
          >
            <Send size={16} />
          </Button>
        </div>
        <p className="text-[0.65rem] text-lilac/40 mt-1.5 px-1">
          Enter to send · Shift+Enter for new line
        </p>
      </form>
    </div>
  );
}

function Bubble({ message, mine }: { message: ThreadMessage; mine: boolean }) {
  return (
    <li className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-4 py-2.5 text-sm",
          mine
            ? "bg-gradient-primary text-white rounded-br-sm shadow-glow"
            : "glass text-lilac rounded-bl-sm"
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.body}</p>
        <time
          className={cn(
            "block text-[0.6rem] mt-1",
            mine ? "text-white/70" : "text-lilac/50"
          )}
          dateTime={
            message.createdAt instanceof Date
              ? message.createdAt.toISOString()
              : message.createdAt
          }
        >
          {relativeTime(message.createdAt)}
        </time>
      </div>
    </li>
  );
}
