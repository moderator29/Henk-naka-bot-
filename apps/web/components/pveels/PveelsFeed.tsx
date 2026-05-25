"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  BadgeCheck,
  Heart,
  MessageCircle,
  Coins,
  Bookmark,
  Share2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Lock,
  Music2,
  X,
  Send,
  Plus,
  Flag,
} from "lucide-react";
import { cn, formatNumber, relativeTime } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { TipModal } from "@/components/feed/TipModal";
import { ReportModal } from "@/components/moderation/ReportModal";
import {
  togglePveelLike,
  togglePveelSave,
  recordPveelView,
  loadPveelComments,
  addPveelComment,
} from "@/lib/pveels/actions";
import type { CommentItem } from "@/lib/engagement/types";
import type { PveelView } from "@/lib/pveels/types";

type Tab = "foryou" | "following";

/**
 * Pveels viewing surface: a full-screen, snap-scrolling vertical feed with real
 * video playback (autoplay on focus, pause off-focus), a TikTok-style action
 * rail, gated locked states, and For You / Following tabs. Demo clips render an
 * animated aurora canvas. Only the active clip and its neighbours mount a
 * <video> element, so the feed stays light.
 */
export function PveelsFeed({
  forYou,
  following,
  signedIn,
}: {
  forYou: PveelView[];
  following: PveelView[];
  signedIn: boolean;
}) {
  const [tab, setTab] = useState<Tab>("foryou");
  const [muted, setMuted] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  // Persisted mute preference (browsers require muted autoplay, so default on).
  useEffect(() => {
    const saved = window.localStorage.getItem("pveels-muted");
    if (saved != null) setMuted(saved === "1");
  }, []);
  const toggleMute = useCallback(() => {
    setMuted((m) => {
      window.localStorage.setItem("pveels-muted", m ? "0" : "1");
      return !m;
    });
  }, []);

  const list = tab === "foryou" ? forYou : following;

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-6 relative">
      {/* Box-shape create button: opens the Pveels creation studio */}
      <Link
        href="/pveels/create"
        aria-label="Create a Pveel"
        className="absolute top-3 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-white shadow-glow transition-transform hover:scale-105 active:scale-95"
      >
        <Plus size={20} />
      </Link>

      {/* Tabs */}
      <div className="absolute top-3 inset-x-0 z-20 flex justify-center pointer-events-none">
        <div role="tablist" aria-label="Pveels feeds" className="pointer-events-auto flex items-center gap-1 glass-chrome rounded-full p-1">
          {(["foryou", "following"] as Tab[]).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => {
                setTab(t);
                setActiveIndex(0);
              }}
              className={cn(
                "relative px-4 py-1.5 text-sm font-medium rounded-full transition-colors",
                tab === t ? "text-white" : "text-white/60 hover:text-white"
              )}
            >
              {t === "foryou" ? "For You" : "Following"}
              {tab === t && (
                <motion.span
                  layoutId="pveels-tab"
                  className="absolute inset-0 -z-10 rounded-full bg-white/10"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyFeed tab={tab} signedIn={signedIn} />
      ) : (
        <div className="h-[calc(100svh-4rem)] overflow-y-auto snap-y snap-mandatory scrollbar-none">
          {list.map((p, i) => (
            <PveelCard
              key={p.id}
              pveel={p}
              first={i === 0}
              muted={muted}
              onToggleMute={toggleMute}
              active={activeIndex === i}
              near={Math.abs(activeIndex - i) <= 1}
              onVisible={() => setActiveIndex(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyFeed({ tab, signedIn }: { tab: Tab; signedIn: boolean }) {
  return (
    <div className="h-[calc(100svh-4rem)] grid place-items-center text-center px-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white mb-2">
          {tab === "following" ? "Nothing here yet" : "Pveels"}
        </h1>
        <p className="text-lilac/60 max-w-sm mx-auto">
          {tab === "following"
            ? signedIn
              ? "Follow some creators and their Pveels show up here."
              : "Sign in and follow creators to build your Following feed."
            : "Short videos from creators land here. Check back soon."}
        </p>
        <div className="mt-5">
          <Link href="/explore" className="btn-primary inline-flex h-11 items-center rounded-xl px-5 text-sm font-semibold text-white shadow-glow">
            Discover creators
          </Link>
        </div>
      </div>
    </div>
  );
}

function PveelCard({
  pveel,
  first,
  muted,
  onToggleMute,
  active,
  near,
  onVisible,
}: {
  pveel: PveelView;
  first: boolean;
  muted: boolean;
  onToggleMute: () => void;
  active: boolean;
  /** Active clip or an immediate neighbour, mount the video; else poster only. */
  near: boolean;
  onVisible: () => void;
}) {
  const { push } = useToast();
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const viewLogged = useRef(false);
  const lastTap = useRef(0);

  const [liked, setLiked] = useState(pveel.liked);
  const [saved, setSaved] = useState(pveel.saved);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [burst, setBurst] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [tipOpen, setTipOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const hasVideo = !!pveel.playbackUrl && !pveel.gated;

  // Becomes active when ~60% visible.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio >= 0.6) onVisible();
        }
      },
      { threshold: [0, 0.6, 1] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [onVisible]);

  // Play when active, pause otherwise. `near` is a dep so a freshly-mounted
  // video (a card scrolled into the window) starts playing if it's active.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = muted;
    if (active && !paused) {
      void v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [active, paused, muted, near]);

  const onLike = () => {
    const next = !liked;
    setLiked(next);
    if (next) {
      setBurst((b) => b + 1);
      setTimeout(() => setBurst((b) => Math.max(0, b - 1)), 700);
    }
    void togglePveelLike(pveel.id, next).then((r) => {
      if (r.needsAuth) push({ tone: "info", title: "Sign in to like" });
    });
  };

  const onSave = () => {
    const next = !saved;
    setSaved(next);
    void togglePveelSave(pveel.id, next).then((r) => {
      if (r.needsAuth) push({ tone: "info", title: "Sign in to save" });
    });
  };

  const onTapMedia = () => {
    const now = Date.now();
    if (now - lastTap.current < 280) {
      if (!liked) onLike();
      else {
        setBurst((b) => b + 1);
        setTimeout(() => setBurst((b) => Math.max(0, b - 1)), 700);
      }
      lastTap.current = 0;
      return;
    }
    lastTap.current = now;
    if (hasVideo) setPaused((p) => !p);
  };

  const onTime = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setProgress((v.currentTime / v.duration) * 100);
    if (!viewLogged.current && v.currentTime > 3) {
      viewLogged.current = true;
      void recordPveelView(pveel.id);
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    v.currentTime = ratio * v.duration;
    setProgress(ratio * 100);
  };

  return (
    <section
      ref={sectionRef}
      className="relative h-[calc(100svh-4rem)] snap-start snap-always grid place-items-center overflow-hidden"
    >
      <div className="absolute inset-2 sm:inset-4 rounded-3xl overflow-hidden bg-plum">
        {/* Media layer. Only the active clip + its neighbours mount a <video>;
            far cards show the poster so we never keep dozens of players alive. */}
        {pveel.gated ? (
          <LockedMedia pveel={pveel} />
        ) : hasVideo && near ? (
          <video
            ref={videoRef}
            src={pveel.playbackUrl ?? undefined}
            poster={pveel.posterUrl ?? undefined}
            loop
            playsInline
            preload="metadata"
            muted={muted}
            onClick={onTapMedia}
            onTimeUpdate={onTime}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : hasVideo ? (
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${pveel.accent[0]}, ${pveel.accent[1]})` }}>
            {pveel.posterUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- poster from storage
              <img src={pveel.posterUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
            )}
          </div>
        ) : (
          <DemoCanvas accent={pveel.accent} onClick={onTapMedia} paused={paused} reduce={!!reduce} />
        )}

        {/* Double-tap heart burst */}
        <AnimatePresence>
          {burst > 0 && (
            <motion.div
              key={burst}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1.1, opacity: 1 }}
              exit={{ scale: 1.4, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 grid place-items-center pointer-events-none text-white"
            >
              <Heart size={96} fill="currentColor" className="drop-shadow-[0_0_24px_rgba(255,31,143,0.7)]" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pause indicator */}
        {hasVideo && paused && (
          <div className="absolute inset-0 grid place-items-center pointer-events-none">
            <span className="h-16 w-16 rounded-full glass-strong grid place-items-center text-white/90">
              <Play size={26} fill="currentColor" />
            </span>
          </div>
        )}

        {pveel.isDemo && (
          <span className="absolute top-4 left-4 text-[0.6rem] uppercase tracking-wider text-white/70 bg-black/30 rounded-full px-2 py-0.5">
            Pveel · demo
          </span>
        )}

        {/* Mute toggle */}
        {hasVideo && (
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? "Unmute" : "Mute"}
            className="absolute top-4 right-4 h-9 w-9 rounded-full glass-strong grid place-items-center text-white/90"
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        )}

        {/* Bottom gradient + meta */}
        <div className="absolute inset-x-0 bottom-0 p-5 pb-8 bg-gradient-to-t from-black/75 to-transparent pr-20">
          <Link href={`/creators/${pveel.creatorUsername}`} className="inline-flex items-center gap-2">
            <span className="h-9 w-9 rounded-full bg-imperial ring-1 ring-white/30 grid place-items-center text-sm font-display text-white">
              {pveel.creatorName.slice(0, 1).toUpperCase()}
            </span>
            <span className="font-semibold text-white">{pveel.creatorName}</span>
            {pveel.verified && <BadgeCheck size={15} className="text-cyan" />}
          </Link>
          {pveel.caption && (
            <p className={cn("mt-2 text-sm text-white/90 max-w-md", !expanded && "line-clamp-2")}>
              {pveel.caption}{" "}
              {pveel.caption.length > 90 && (
                <button type="button" onClick={() => setExpanded((v) => !v)} className="text-white/60 font-medium">
                  {expanded ? "less" : "more"}
                </button>
              )}
            </p>
          )}
          {pveel.category && (
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-white/70">
              <Music2 size={12} /> {pveel.category}
            </p>
          )}
        </div>

        {/* Right action rail */}
        <div className="absolute right-4 bottom-28 flex flex-col items-center gap-5">
          <RailButton label={formatNumber(pveel.likes + (liked && !pveel.liked ? 1 : 0))} active={liked} ariaLabel="Like" onClick={onLike}>
            <motion.span animate={liked ? { scale: [1, 1.4, 1] } : {}} transition={{ duration: 0.3 }}>
              <Heart size={26} fill={liked ? "currentColor" : "none"} />
            </motion.span>
          </RailButton>
          {pveel.allowComments && (
            <RailButton label={formatNumber(pveel.comments)} ariaLabel="Comments" onClick={() => setCommentsOpen(true)}>
              <MessageCircle size={26} />
            </RailButton>
          )}
          {pveel.allowTips && (
            <RailButton label="Tip" ariaLabel="Tip" onClick={() => setTipOpen(true)}>
              <Coins size={26} />
            </RailButton>
          )}
          <RailButton label={formatNumber(pveel.saves + (saved && !pveel.saved ? 1 : 0))} active={saved} ariaLabel="Save" onClick={onSave}>
            <Bookmark size={24} fill={saved ? "currentColor" : "none"} />
          </RailButton>
          <RailButton label="Share" ariaLabel="Share" onClick={() => share(pveel, push)}>
            <Share2 size={24} />
          </RailButton>
          {!pveel.isDemo && (
            <RailButton label="Report" ariaLabel="Report" onClick={() => setReportOpen(true)}>
              <Flag size={22} />
            </RailButton>
          )}
        </div>

        {/* Scrub bar */}
        {hasVideo && (
          <div className="absolute inset-x-0 bottom-0 px-1 pb-1 cursor-pointer" onClick={seek}>
            <div className="h-1 rounded-full bg-white/20 overflow-hidden">
              <div className="h-full bg-gradient-primary" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      {first && (
        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[0.65rem] text-lilac/40">
          Swipe up for more
        </span>
      )}

      {commentsOpen && (
        <CommentsSheet pveel={pveel} onClose={() => setCommentsOpen(false)} />
      )}
      {tipOpen && (
        <TipModal
          username={pveel.creatorUsername}
          creatorName={pveel.creatorName}
          onClose={() => setTipOpen(false)}
        />
      )}
      {reportOpen && (
        <ReportModal
          targetType="pveel"
          targetId={pveel.id}
          targetLabel="Pveel"
          onClose={() => setReportOpen(false)}
        />
      )}
    </section>
  );
}

function LockedMedia({ pveel }: { pveel: PveelView }) {
  return (
    <div className="absolute inset-0">
      <div
        className="absolute inset-0"
        style={{
          background: pveel.posterUrl
            ? undefined
            : `radial-gradient(circle at 30% 30%, ${pveel.accent[0]}55, transparent 60%), radial-gradient(circle at 70% 70%, ${pveel.accent[1]}55, transparent 60%), #0F0420`,
        }}
      />
      {pveel.posterUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- creator poster from storage
        <img src={pveel.posterUrl} alt="" className="absolute inset-0 h-full w-full object-cover blur-xl scale-110" />
      )}
      <div className="absolute inset-0 bg-plum/50 backdrop-blur-[2px] grid place-items-center text-center px-6">
        <div>
          <Lock size={26} className="mx-auto text-magenta mb-3" />
          <p className="font-display text-lg font-semibold text-white">Subscribers only</p>
          <p className="text-sm text-white/70 mt-1 max-w-xs mx-auto">
            Subscribe to {pveel.creatorName} to watch this Pveel.
          </p>
          <Link
            href={`/creators/${pveel.creatorUsername}`}
            className="btn-primary inline-flex h-11 items-center rounded-xl px-5 mt-4 text-sm font-semibold text-white shadow-glow"
          >
            View subscription
          </Link>
        </div>
      </div>
    </div>
  );
}

function DemoCanvas({
  accent,
  onClick,
  paused,
  reduce,
}: {
  accent: [string, string];
  onClick: () => void;
  paused: boolean;
  reduce: boolean;
}) {
  return (
    <div className="absolute inset-0" onClick={onClick}>
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${accent[0]}66, transparent 60%), radial-gradient(circle at 70% 70%, ${accent[1]}66, transparent 60%), #0F0420`,
        }}
        animate={reduce || paused ? {} : { scale: [1, 1.08, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 grid place-items-center pointer-events-none">
        <span className="h-16 w-16 rounded-full glass-strong grid place-items-center text-white/80">
          {paused ? <Play size={26} fill="currentColor" /> : <Pause size={24} />}
        </span>
      </div>
    </div>
  );
}

function RailButton({
  children,
  label,
  active,
  ariaLabel,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  active?: boolean;
  ariaLabel: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={active}
      className={cn(
        "flex flex-col items-center gap-1 text-white/90 transition-transform active:scale-90",
        active && "text-magenta"
      )}
    >
      <span className="h-12 w-12 rounded-full glass-strong grid place-items-center">{children}</span>
      <span className="text-[0.65rem] font-medium">{label}</span>
    </button>
  );
}

async function share(pveel: PveelView, push: ReturnType<typeof useToast>["push"]) {
  const url = `${window.location.origin}/creators/${pveel.creatorUsername}`;
  try {
    if (navigator.share) {
      await navigator.share({ title: pveel.creatorName, url });
      return;
    }
  } catch {
    /* dismissed */
  }
  try {
    await navigator.clipboard.writeText(url);
    push({ tone: "success", title: "Link copied" });
  } catch {
    push({ tone: "info", title: "Copy this link", description: url });
  }
}

function CommentsSheet({ pveel, onClose }: { pveel: PveelView; onClose: () => void }) {
  const { push } = useToast();
  const [comments, setComments] = useState<CommentItem[] | null>(null);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    void loadPveelComments(pveel.id).then((c) => {
      if (alive) setComments(c);
    });
    return () => {
      alive = false;
    };
  }, [pveel.id]);

  async function send() {
    const text = body.trim();
    if (!text || busy) return;
    setBusy(true);
    const res = await addPveelComment(pveel.id, text);
    setBusy(false);
    if (res.needsAuth) {
      push({ tone: "info", title: "Sign in to comment" });
      return;
    }
    if (!res.ok || !res.comment) {
      push({ tone: "error", title: "Could not post comment" });
      return;
    }
    setComments((prev) => [...(prev ?? []), res.comment!]);
    setBody("");
  }

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-end" onClick={onClose}>
      <div
        className="glass-strong edge-light rounded-t-3xl max-h-[70%] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
          <h2 className="font-display font-semibold text-white">Comments</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-lilac/60 hover:text-white">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
          {comments === null ? (
            <p className="text-sm text-lilac/50">Loading…</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-lilac/50">{pveel.isDemo ? "Comments open once this is a real Pveel." : "Be the first to comment."}</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-2.5">
                <span className="h-8 w-8 rounded-full bg-imperial grid place-items-center text-xs font-display text-white shrink-0">
                  {c.authorName.slice(0, 1).toUpperCase()}
                </span>
                <div>
                  <p className="text-sm text-white">
                    <span className="font-medium">{c.authorName}</span>{" "}
                    <span className="text-lilac/40 text-xs">{relativeTime(c.createdAt)}</span>
                  </p>
                  <p className="text-sm text-lilac/85">{c.body}</p>
                </div>
              </div>
            ))
          )}
        </div>
        {!pveel.isDemo && (
          <div className="flex items-center gap-2 p-3 border-t border-white/5">
            <input
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Add a comment"
              className="flex-1 rounded-xl bg-plum/60 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-lilac/40 focus:border-magenta/50 focus:outline-none"
            />
            <button
              type="button"
              onClick={send}
              disabled={busy || !body.trim()}
              aria-label="Send"
              className="h-9 w-9 rounded-xl bg-gradient-primary grid place-items-center text-white disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
