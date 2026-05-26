"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BadgeCheck, Heart, MessageCircle, Bookmark, Coins, Lock, Flag } from "lucide-react";
import { toggleLike, toggleSave } from "@/lib/engagement/actions";
import { getGatedMedia } from "@/lib/posts/actions";
import { useToast } from "@/components/ui/Toast";
import { Comments } from "./Comments";
import { TipModal } from "./TipModal";
import { ReportDialog } from "@/components/safety/ReportDialog";
import { cn, formatNumber, relativeTime } from "@/lib/utils";

export interface PostMedia {
  url: string;
  type: string;
}

export interface FeedPost {
  id: string;
  creatorUsername: string;
  creatorName: string;
  verified: boolean;
  caption: string;
  category: string;
  gated: boolean;
  audience?: "public" | "free" | "followers" | "subscribers";
  media?: PostMedia[];
  likes: number;
  comments: number;
  createdAt: string | Date;
  /** Whether the signed-in viewer has already liked / saved this post. */
  likedByMe?: boolean;
  savedByMe?: boolean;
}

/**
 * A feed post card with the brand glass treatment and live micro-interactions
 * (like fill + count bump, save toggle). Engagement is local-only in demo
 * context; real like/save/tip wire to Supabase + on-chain in a later pass.
 */
export function PostCard({ post, index = 0 }: { post: FeedPost; index?: number }) {
  const [liked, setLiked] = useState(post.likedByMe ?? false);
  const [saved, setSaved] = useState(post.savedByMe ?? false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [tipOpen, setTipOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const reduce = useReducedMotion();
  const [, startTransition] = useTransition();
  // Demo posts aren't in the database; keep their interactions local-only.
  const isReal = !post.id.startsWith("demo");

  // Gated media: resolve the viewer's entitlement and fetch signed URLs.
  const [gatedStatus, setGatedStatus] = useState<"loading" | "locked" | "unlocked">(
    post.gated ? "loading" : "unlocked"
  );
  const [gatedMedia, setGatedMedia] = useState<PostMedia[]>([]);

  useEffect(() => {
    if (!post.gated) return;
    if (!isReal) {
      setGatedStatus("locked"); // demo gated posts keep the teaser
      return;
    }
    let active = true;
    getGatedMedia(post.id)
      .then((res) => {
        if (!active) return;
        if (res.entitled) {
          setGatedMedia(res.media);
          setGatedStatus("unlocked");
        } else {
          setGatedStatus("locked");
        }
      })
      .catch(() => active && setGatedStatus("locked"));
    return () => {
      active = false;
    };
  }, [post.gated, post.id, isReal]);

  const { push } = useToast();

  const onLike = () => {
    const next = !liked;
    setLiked(next);
    if (!isReal) return;
    startTransition(async () => {
      const res = await toggleLike(post.id, next);
      if (!res.ok) {
        setLiked(!next); // revert the optimistic toggle
        if (res.needsAuth) push({ tone: "error", title: "Sign in to like posts" });
      }
    });
  };
  const onSave = () => {
    const next = !saved;
    setSaved(next);
    if (!isReal) return;
    startTransition(async () => {
      const res = await toggleSave(post.id, next);
      if (!res.ok) {
        setSaved(!next);
        if (res.needsAuth) push({ tone: "error", title: "Sign in to save posts" });
      }
    });
  };

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 18 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{
        duration: 0.42,
        delay: Math.min(index * 0.05, 0.3),
        ease: [0.22, 1, 0.36, 1],
      }}
      className="glass edge-light rounded-2xl p-5 transition-shadow hover:shadow-[var(--glow-magenta)]"
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
        {!post.gated && post.media && post.media.length > 0 && (
          <MediaGrid media={post.media} />
        )}
        {post.gated && gatedStatus === "unlocked" && gatedMedia.length > 0 && (
          <MediaGrid media={gatedMedia} />
        )}
        {post.gated && gatedStatus === "loading" && (
          <div className="mt-3 h-40 rounded-xl bg-plum/50 animate-pulse" aria-hidden="true" />
        )}
        {post.gated && gatedStatus === "locked" && (() => {
          const lock = lockCopy(post.audience ?? "subscribers", post.creatorName, post.creatorUsername);
          return (
            <div className="mt-3 relative overflow-hidden rounded-xl border border-magenta/20 bg-plum/60 h-44 grid place-items-center">
              <div className="absolute inset-0 bg-gradient-to-br from-magenta/10 to-orchid/10" />
              <div className="relative text-center px-4">
                <Lock size={22} className="mx-auto text-magenta mb-2" />
                <p className="text-sm font-medium text-white">{lock.title}</p>
                <p className="text-xs text-lilac/60 mb-3">{lock.body}</p>
                <Link
                  href={lock.href}
                  className="inline-flex items-center justify-center h-9 px-4 rounded-lg bg-gradient-primary text-white text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  {lock.cta}
                </Link>
              </div>
            </div>
          );
        })()}
      </div>

      <footer className="mt-4 flex items-center gap-6 text-sm">
        <button
          type="button"
          onClick={onLike}
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
          {formatNumber(
            post.likes + ((liked ? 1 : 0) - (post.likedByMe ? 1 : 0))
          )}
        </button>
        <button
          type="button"
          onClick={() => isReal && setCommentsOpen((v) => !v)}
          className={cn(
            "inline-flex items-center gap-1.5 transition-colors",
            commentsOpen ? "text-white" : "text-lilac/60",
            isReal && "hover:text-white"
          )}
          aria-expanded={commentsOpen}
          aria-label="Comments"
        >
          <MessageCircle size={18} />
          {formatNumber(post.comments)}
        </button>
        <button
          type="button"
          onClick={onSave}
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
          onClick={() => setTipOpen(true)}
          className="inline-flex items-center gap-1.5 text-lilac/60 hover:text-magenta transition-colors"
          aria-label="Tip"
        >
          <Coins size={18} />
        </button>
        {isReal && (
          <button
            type="button"
            onClick={() => setReportOpen(true)}
            className="inline-flex items-center text-lilac/40 hover:text-lilac/80 transition-colors"
            aria-label="Report post"
          >
            <Flag size={16} />
          </button>
        )}
      </footer>

      {commentsOpen && isReal && <Comments postId={post.id} />}
      {tipOpen && (
        <TipModal
          username={post.creatorUsername}
          creatorName={post.creatorName}
          postId={post.id}
          onClose={() => setTipOpen(false)}
        />
      )}
      {reportOpen && (
        <ReportDialog
          targetType="post"
          targetId={post.id}
          label="Report post"
          onClose={() => setReportOpen(false)}
        />
      )}
    </motion.article>
  );
}

function lockCopy(
  audience: "public" | "free" | "followers" | "subscribers",
  creatorName: string,
  creatorUsername: string
): { title: string; body: string; cta: string; href: string } {
  const profile = `/creators/${creatorUsername}`;
  switch (audience) {
    case "free":
      return {
        title: "Members only",
        body: "Sign in to view this post.",
        cta: "Sign in",
        href: "/login",
      };
    case "followers":
      return {
        title: "Followers only",
        body: `Follow ${creatorName} to unlock this post.`,
        cta: "View profile",
        href: profile,
      };
    default:
      return {
        title: "Subscriber-only",
        body: `Subscribe to ${creatorName} to unlock this post.`,
        cta: "View subscription tiers",
        href: profile,
      };
  }
}

function MediaGrid({ media }: { media: PostMedia[] }) {
  return (
    <div
      className={cn(
        "mt-3 grid gap-2 overflow-hidden rounded-xl",
        media.length > 1 ? "grid-cols-2" : "grid-cols-1"
      )}
    >
      {media.slice(0, 4).map((m, i) =>
        m.type.startsWith("video/") ? (
          <video
            key={i}
            src={m.url}
            controls
            playsInline
            className="w-full max-h-[28rem] rounded-lg bg-black/40 object-cover"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- user media from Supabase storage; next/image needs a configured remote loader
          <img
            key={i}
            src={m.url}
            alt=""
            loading="lazy"
            className="w-full max-h-[28rem] rounded-lg object-cover bg-plum/40"
          />
        )
      )}
    </div>
  );
}
