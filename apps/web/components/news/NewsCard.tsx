"use client";

import { useState, useTransition } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Heart, MessageCircle, Share2, Megaphone, Send } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import {
  toggleAnnouncementLike,
  addAnnouncementComment,
  loadAnnouncementComments,
} from "@/lib/news/actions";
import type { NewsItem, NewsComment } from "@/lib/news/types";
import { cn, formatNumber, relativeTime } from "@/lib/utils";

export function NewsCard({ item, index = 0 }: { item: NewsItem; index?: number }) {
  const reduce = useReducedMotion();
  const { push } = useToast();
  const [liked, setLiked] = useState(item.likedByMe);
  const [, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<NewsComment[] | null>(null);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);

  const likeCount = item.likes + ((liked ? 1 : 0) - (item.likedByMe ? 1 : 0));

  const onLike = () => {
    const next = !liked;
    setLiked(next);
    startTransition(async () => {
      const res = await toggleAnnouncementLike(item.id, next);
      if (!res.ok) {
        setLiked(!next);
        if (res.needsAuth) push({ tone: "error", title: "Sign in to like" });
      }
    });
  };

  const onShare = async () => {
    const url = `${window.location.origin}/news#${item.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: item.title, url });
        return;
      }
    } catch {
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      push({ tone: "success", title: "Link copied" });
    } catch {
      push({ tone: "info", title: "Copy this link", description: url });
    }
  };

  const toggleComments = async () => {
    const next = !open;
    setOpen(next);
    if (next && comments === null) {
      setComments(await loadAnnouncementComments(item.id));
    }
  };

  const submitComment = async () => {
    const text = draft.trim();
    if (!text) return;
    setPosting(true);
    const res = await addAnnouncementComment(item.id, text);
    setPosting(false);
    if (res.ok && res.comment) {
      setComments((c) => [...(c ?? []), res.comment!]);
      setDraft("");
    } else if (res.needsAuth) {
      push({ tone: "error", title: "Sign in to comment" });
    }
  };

  return (
    <motion.article
      id={item.id}
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3), ease: [0.22, 1, 0.36, 1] }}
      className="glass edge-light rounded-2xl p-5"
    >
      <header className="flex items-center gap-2 mb-3">
        <span className="h-8 w-8 rounded-lg bg-gradient-primary grid place-items-center text-white">
          <Megaphone size={15} />
        </span>
        <div>
          <p className="text-xs uppercase tracking-wider text-cyan">Announcement</p>
          <p className="text-[0.7rem] text-lilac/50">{relativeTime(item.createdAt)}</p>
        </div>
      </header>

      <h2 className="font-display text-lg font-semibold text-white">{item.title}</h2>
      <p className="mt-1.5 text-[0.95rem] leading-relaxed text-lilac/85 whitespace-pre-wrap">
        {item.body}
      </p>

      {item.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.imageUrl}
          alt=""
          loading="lazy"
          className="mt-3 w-full max-h-[28rem] rounded-xl object-cover bg-plum/40"
        />
      )}

      <footer className="mt-4 flex items-center gap-6 text-sm">
        <button
          type="button"
          onClick={onLike}
          aria-pressed={liked}
          aria-label="Like"
          className={cn("inline-flex items-center gap-1.5 transition-colors", liked ? "text-magenta" : "text-lilac/60 hover:text-white")}
        >
          <motion.span animate={liked ? { scale: [1, 1.35, 1] } : {}} transition={{ duration: 0.3 }}>
            <Heart size={18} fill={liked ? "currentColor" : "none"} />
          </motion.span>
          {formatNumber(Math.max(0, likeCount))}
        </button>
        <button
          type="button"
          onClick={toggleComments}
          aria-expanded={open}
          aria-label="Comments"
          className={cn("inline-flex items-center gap-1.5 transition-colors", open ? "text-white" : "text-lilac/60 hover:text-white")}
        >
          <MessageCircle size={18} />
          {formatNumber(item.comments)}
        </button>
        <button
          type="button"
          onClick={onShare}
          aria-label="Share"
          className="inline-flex items-center gap-1.5 text-lilac/60 hover:text-cyan transition-colors ml-auto"
        >
          <Share2 size={18} />
        </button>
      </footer>

      {open && (
        <div className="mt-4 border-t border-white/5 pt-4 flex flex-col gap-3">
          {comments === null ? (
            <p className="text-xs text-lilac/50">Loading…</p>
          ) : comments.length === 0 ? (
            <p className="text-xs text-lilac/50">Be the first to comment.</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="text-sm">
                <span className="text-white font-medium">{c.authorName}</span>{" "}
                <span className="text-lilac/45 text-xs">@{c.authorUsername}</span>
                <p className="text-lilac/85">{c.body}</p>
              </div>
            ))
          )}
          <div className="flex items-center gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitComment()}
              placeholder="Add a comment…"
              className="flex-1 h-10 rounded-xl bg-plum/60 border border-white/10 px-3 text-sm text-white placeholder:text-lilac/40 focus:border-magenta/50 focus:outline-none"
            />
            <button
              type="button"
              onClick={submitComment}
              disabled={posting || !draft.trim()}
              aria-label="Post comment"
              className="h-10 w-10 rounded-xl grid place-items-center bg-gradient-primary text-white disabled:opacity-40"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </motion.article>
  );
}
