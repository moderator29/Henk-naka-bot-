"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { BadgeCheck, Heart, MessageCircle, Bookmark, Coins, Lock } from "lucide-react";
import { cn, formatNumber, relativeTime } from "@/lib/utils";

export interface FeedPost {
  id: string;
  creatorUsername: string;
  creatorName: string;
  verified: boolean;
  caption: string;
  category: string;
  gated: boolean;
  likes: number;
  comments: number;
  createdAt: string | Date;
}

/**
 * A feed post card with the brand glass treatment and live micro-interactions
 * (like fill + count bump, save toggle). Engagement is local-only in demo
 * context; real like/save/tip wire to Supabase + on-chain in a later pass.
 */
export function PostCard({ post, index = 0 }: { post: FeedPost; index?: number }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.05, 0.3), ease: [0.16, 1, 0.3, 1] }}
      className="glass rounded-2xl p-5 transition-shadow hover:shadow-glow"
    >
      <header className="flex items-center gap-3">
        <Link
          href={`/creators/${post.creatorUsername}`}
          className="relative h-11 w-11 rounded-full overflow-hidden bg-imperial ring-1 ring-magenta/30 flex-shrink-0 grid place-items-center font-display text-white"
        >
          {post.creatorName.slice(0, 1).toUpperCase()}
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={`/creators/${post.creatorUsername}`}
            className="flex items-center gap-1.5"
          >
            <span className="font-semibold text-white truncate hover:text-magenta-light transition-colors">
              {post.creatorName}
            </span>
            {post.verified && (
              <BadgeCheck size={15} className="text-cyan flex-shrink-0" aria-label="Verified" />
            )}
          </Link>
          <span className="text-xs text-lilac/50">
            @{post.creatorUsername} · {relativeTime(post.createdAt)}
          </span>
        </div>
        {post.category && (
          <span className="text-[0.65rem] uppercase tracking-wider text-cyan border border-cyan/20 rounded-full px-2 py-0.5">
            {post.category}
          </span>
        )}
      </header>

      <div className="mt-4">
        <p className="text-[0.95rem] leading-relaxed text-lilac/90">
          {post.caption}
        </p>
        {post.gated && (
          <div className="mt-3 relative overflow-hidden rounded-xl border border-magenta/20 bg-plum/60 h-40 grid place-items-center">
            <div className="absolute inset-0 bg-gradient-to-br from-magenta/10 to-orchid/10" />
            <div className="relative text-center">
              <Lock size={22} className="mx-auto text-magenta mb-2" />
              <p className="text-sm font-medium text-white">Subscriber-only</p>
              <p className="text-xs text-lilac/60">Subscribe to unlock this post</p>
            </div>
          </div>
        )}
      </div>

      <footer className="mt-4 flex items-center gap-6 text-sm">
        <button
          type="button"
          onClick={() => setLiked((v) => !v)}
          className={cn(
            "inline-flex items-center gap-1.5 transition-colors",
            liked ? "text-magenta" : "text-lilac/60 hover:text-white"
          )}
          aria-pressed={liked}
          aria-label="Like"
        >
          <motion.span animate={liked ? { scale: [1, 1.35, 1] } : {}} transition={{ duration: 0.3 }}>
            <Heart size={18} fill={liked ? "currentColor" : "none"} />
          </motion.span>
          {formatNumber(post.likes + (liked ? 1 : 0))}
        </button>
        <span className="inline-flex items-center gap-1.5 text-lilac/60">
          <MessageCircle size={18} />
          {formatNumber(post.comments)}
        </span>
        <button
          type="button"
          onClick={() => setSaved((v) => !v)}
          className={cn(
            "inline-flex items-center gap-1.5 transition-colors ml-auto",
            saved ? "text-cyan" : "text-lilac/60 hover:text-white"
          )}
          aria-pressed={saved}
          aria-label="Save"
        >
          <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-lilac/60 hover:text-magenta transition-colors"
          aria-label="Tip"
        >
          <Coins size={18} />
        </button>
      </footer>
    </motion.article>
  );
}
