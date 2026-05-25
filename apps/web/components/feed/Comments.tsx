"use client";

import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { loadComments, addComment } from "@/lib/engagement/actions";
import type { CommentItem } from "@/lib/engagement/types";
import { relativeTime } from "@/lib/utils";

/** Comment thread for a real post: loads existing comments, posts new ones. */
export function Comments({ postId }: { postId: string }) {
  const { push } = useToast();
  const [comments, setComments] = useState<CommentItem[] | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let active = true;
    loadComments(postId).then((c) => {
      if (active) setComments(c);
    });
    return () => {
      active = false;
    };
  }, [postId]);

  async function send() {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const res = await addComment(postId, text);
      if (res.needsAuth) {
        push({ tone: "error", title: "Sign in to comment" });
        return;
      }
      if (res.ok && res.comment) {
        setComments((c) => [...(c ?? []), res.comment!]);
        setDraft("");
      } else {
        push({ tone: "error", title: "Could not post your comment" });
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mt-4 border-t border-white/5 pt-4">
      <div className="flex flex-col gap-3 max-h-64 overflow-y-auto scrollbar-none">
        {comments === null ? (
          <p className="text-sm text-lilac/40">Loading comments…</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-lilac/50">Be the first to comment.</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="flex gap-2.5">
              <span className="h-8 w-8 shrink-0 rounded-full bg-imperial grid place-items-center text-xs font-display text-white">
                {c.authorName.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="text-sm text-white">
                  <span className="font-medium">{c.authorName}</span>{" "}
                  <span className="text-lilac/40 text-xs">
                    @{c.authorUsername} · {relativeTime(c.createdAt)}
                  </span>
                </p>
                <p className="text-sm text-lilac/80 break-words">{c.body}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
        className="mt-3 flex items-center gap-2"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a comment…"
          maxLength={1000}
          className="flex-1 h-10 rounded-xl bg-plum/60 border border-white/10 px-3 text-sm text-white placeholder:text-lilac/40 focus:border-magenta/50 focus:outline-none focus:ring-2 focus:ring-magenta/20"
        />
        <Button type="submit" size="icon" loading={sending} disabled={!draft.trim()} aria-label="Post comment">
          <Send size={16} />
        </Button>
      </form>
    </div>
  );
}
