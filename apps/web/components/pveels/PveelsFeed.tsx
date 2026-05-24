"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { BadgeCheck, Heart, MessageCircle, Coins, Share2, Play, Music2 } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";

export interface Pveel {
  id: string;
  creatorUsername: string;
  creatorName: string;
  verified: boolean;
  caption: string;
  track: string;
  likes: number;
  comments: number;
  tips: number;
  /** Accent pair for the placeholder canvas until real video lands. */
  accent: [string, string];
}

/**
 * Pveels, the vertical reels surface. Full-screen snap-scrolling cards with a
 * TikTok-style right action rail. Video sources wire to Supabase Storage / Mux
 * later (post-MVP per RPD §8); until then each pveel renders an animated
 * aurora canvas placeholder, clearly part of the demo set.
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
  const [liked, setLiked] = useState(false);

  return (
    <section className="relative h-[calc(100svh-4rem)] snap-start snap-always grid place-items-center overflow-hidden">
      {/* Animated placeholder canvas */}
      <div className="absolute inset-2 sm:inset-4 rounded-3xl overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${pveel.accent[0]}66, transparent 60%), radial-gradient(circle at 70% 70%, ${pveel.accent[1]}66, transparent 60%), #0F0420`,
          }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 grid place-items-center">
          <span className="h-16 w-16 rounded-full glass-strong grid place-items-center text-white/80">
            <Play size={26} fill="currentColor" />
          </span>
        </div>
        <span className="absolute top-4 left-4 text-[0.6rem] uppercase tracking-wider text-white/70 bg-black/30 rounded-full px-2 py-0.5">
          Pveel · demo
        </span>

        {/* Bottom gradient + meta */}
        <div className="absolute inset-x-0 bottom-0 p-5 pb-6 bg-gradient-to-t from-black/70 to-transparent">
          <Link
            href={`/creators/${pveel.creatorUsername}`}
            className="inline-flex items-center gap-2"
          >
            <span className="h-9 w-9 rounded-full bg-imperial ring-1 ring-white/30 grid place-items-center text-sm font-display text-white">
              {pveel.creatorName.slice(0, 1).toUpperCase()}
            </span>
            <span className="font-semibold text-white">{pveel.creatorName}</span>
            {pveel.verified && <BadgeCheck size={15} className="text-cyan" />}
          </Link>
          <p className="mt-2 text-sm text-white/90 max-w-md">{pveel.caption}</p>
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-white/70">
            <Music2 size={12} /> {pveel.track}
          </p>
        </div>

        {/* Right action rail */}
        <div className="absolute right-4 bottom-24 flex flex-col items-center gap-5">
          <RailButton
            label={formatNumber(pveel.likes + (liked ? 1 : 0))}
            active={liked}
            onClick={() => setLiked((v) => !v)}
            ariaLabel="Like"
          >
            <motion.span animate={liked ? { scale: [1, 1.4, 1] } : {}} transition={{ duration: 0.3 }}>
              <Heart size={26} fill={liked ? "currentColor" : "none"} />
            </motion.span>
          </RailButton>
          <RailButton label={formatNumber(pveel.comments)} ariaLabel="Comments">
            <MessageCircle size={26} />
          </RailButton>
          <RailButton label={formatNumber(pveel.tips)} ariaLabel="Tip">
            <Coins size={26} />
          </RailButton>
          <RailButton label="Share" ariaLabel="Share">
            <Share2 size={24} />
          </RailButton>
        </div>
      </div>

      {index === 0 && (
        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[0.65rem] text-lilac/40">
          Swipe up for more
        </span>
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
