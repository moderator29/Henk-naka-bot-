"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { BadgeCheck, Heart, MessageCircle, Coins } from "lucide-react";
import { toggleLike } from "@/lib/engagement/actions";
import { useToast } from "@/components/ui/Toast";
import { TipModal } from "@/components/feed/TipModal";
import { cn, formatNumber } from "@/lib/utils";

export interface Pveel {
  id: string;
  creatorUsername: string;
  creatorName: string;
  verified: boolean;
  caption: string;
  videoUrl: string;
  likes: number;
  comments: number;
  tips: number;
  likedByMe: boolean;
}

/**
 * Pveels, the vertical reels surface. Full-screen snap-scrolling cards that
 * play the creator's real uploaded video, with a TikTok-style action rail.
 * Like and tip write through for real.
 */
export function PveelsFeed({ pveels }: { pveels: Pveel[] }) {
  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-6 h-[calc(100svh-4rem)] overflow-y-auto snap-y snap-mandatory scrollbar-none">
      {pveels.map((p, i) => (
        <PveelCard key={p.id} pveel={p} index={i} />
      ))}
    </div>
  );
}

function PveelCard({ pveel, index }: { pveel: Pveel; index: number }) {
  const { push } = useToast();
  const [liked, setLiked] = useState(pveel.likedByMe);
  const [tipOpen, setTipOpen] = useState(false);
  const [, start] = useTransition();

  const onLike = () => {
    const next = !liked;
    setLiked(next);
    start(async () => {
      const res = await toggleLike(pveel.id, next);
      if (!res.ok) {
        setLiked(!next);
        if (res.needsAuth) push({ tone: "error", title: "Sign in to like" });
      }
    });
  };

  return (
    <section className="relative h-[calc(100svh-4rem)] snap-start snap-always grid place-items-center overflow-hidden">
      <div className="absolute inset-2 sm:inset-4 rounded-3xl overflow-hidden bg-black">
        <video
          src={pveel.videoUrl}
          className="absolute inset-0 h-full w-full object-cover"
          loop
          muted
          playsInline
          controls
          preload="metadata"
        />

        {/* Bottom gradient + meta */}
        <div className="absolute inset-x-0 bottom-0 p-5 pb-6 bg-gradient-to-t from-black/70 to-transparent pointer-events-none">
          <Link
            href={`/creators/${pveel.creatorUsername}`}
            className="inline-flex items-center gap-2 pointer-events-auto"
          >
            <span className="h-9 w-9 rounded-full bg-imperial ring-1 ring-white/30 grid place-items-center text-sm font-display text-white">
              {pveel.creatorName.slice(0, 1).toUpperCase()}
            </span>
            <span className="font-semibold text-white">{pveel.creatorName}</span>
            {pveel.verified && <BadgeCheck size={15} className="text-cyan" />}
          </Link>
          {pveel.caption && (
            <p className="mt-2 text-sm text-white/90 max-w-md">{pveel.caption}</p>
          )}
        </div>

        {/* Right action rail */}
        <div className="absolute right-4 bottom-24 flex flex-col items-center gap-5">
          <RailButton
            label={formatNumber(pveel.likes + ((liked ? 1 : 0) - (pveel.likedByMe ? 1 : 0)))}
            active={liked}
            onClick={onLike}
            ariaLabel="Like"
          >
            <motion.span animate={liked ? { scale: [1, 1.4, 1] } : {}} transition={{ duration: 0.3 }}>
              <Heart size={26} fill={liked ? "currentColor" : "none"} />
            </motion.span>
          </RailButton>
          <RailButton label={formatNumber(pveel.comments)} ariaLabel="Comments">
            <MessageCircle size={26} />
          </RailButton>
          <RailButton label={formatNumber(pveel.tips)} ariaLabel="Tip" onClick={() => setTipOpen(true)}>
            <Coins size={26} />
          </RailButton>
        </div>
      </div>

      {index === 0 && (
        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[0.65rem] text-lilac/40">
          Swipe up for more
        </span>
      )}

      {tipOpen && (
        <TipModal
          username={pveel.creatorUsername}
          creatorName={pveel.creatorName}
          postId={pveel.id}
          onClose={() => setTipOpen(false)}
        />
      )}
    </section>
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
      <span className="h-12 w-12 rounded-full glass-strong grid place-items-center">
        {children}
      </span>
      <span className="text-[0.65rem] font-medium">{label}</span>
    </button>
  );
}
