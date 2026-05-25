"use client";

import { useState, useTransition, type MouseEvent } from "react";
import { motion } from "framer-motion";
import { Check, Plus } from "lucide-react";
import { toggleFollow } from "@/lib/engagement/actions";
import { cn } from "@/lib/utils";

/**
 * Follow control with optimistic feedback: outline at rest, fills with the
 * brand gradient on follow with a small scale confirm. Writes through to
 * Supabase via toggleFollow; demo creators (not in the DB) keep the optimistic
 * state. Reverts only if the user isn't signed in.
 */
export function FollowPill({
  username,
  className,
}: {
  username: string;
  className?: string;
}) {
  const [following, setFollowing] = useState(false);
  const [, startTransition] = useTransition();

  const onClick = (e: MouseEvent) => {
    // Sits inside a card-wide link; don't navigate when toggling.
    e.preventDefault();
    e.stopPropagation();
    const next = !following;
    setFollowing(next); // optimistic
    startTransition(async () => {
      const res = await toggleFollow(username, next);
      if (res.needsAuth) setFollowing(!next); // revert if not signed in
    });
  };

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      aria-pressed={following}
      aria-label={following ? `Following ${username}` : `Follow ${username}`}
      onClick={onClick}
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
