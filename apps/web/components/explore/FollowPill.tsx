"use client";

import { useState, type MouseEvent } from "react";
import { motion } from "framer-motion";
import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Follow control with optimistic feedback: outline at rest, fills with the
 * brand gradient on follow with a small scale confirm. The real follow write
 * lands with the engagement step (PENDING_ENGAGEMENT_WRITE); for now this is a
 * local optimistic toggle so the surface feels live.
 */
export function FollowPill({
  username,
  className,
}: {
  username: string;
  className?: string;
}) {
  const [following, setFollowing] = useState(false);

  const toggle = (e: MouseEvent) => {
    // Sits inside a card-wide link; don't navigate when toggling.
    e.preventDefault();
    e.stopPropagation();
    setFollowing((f) => !f);
  };

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      aria-pressed={following}
      aria-label={following ? `Following ${username}` : `Follow ${username}`}
      onClick={toggle}
      className={cn(
        "inline-flex items-center gap-1 h-8 px-3 rounded-pill text-xs font-semibold transition-colors",
        following
          ? "bg-gradient-primary text-white"
          : "border border-white/15 text-lilac/80 hover:text-white hover:border-white/35",
        className
      )}
    >
      {following ? (
        <>
          <Check size={13} aria-hidden="true" /> Following
        </>
      ) : (
        <>
          <Plus size={13} aria-hidden="true" /> Follow
        </>
      )}
    </motion.button>
  );
}
