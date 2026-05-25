"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { BadgeCheck, Heart, Plus, Coins, MessageCircle, MoreHorizontal, Ban, Link2, Flag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatTicker } from "@/components/ui/StatTicker";
import { useToast } from "@/components/ui/Toast";
import { ReportModal } from "@/components/moderation/ReportModal";
import { toggleFollow } from "@/lib/engagement/actions";
import { startConversation } from "@/lib/messaging/actions";
import { blockUser, unblockUser } from "@/lib/privacy/actions";
import { formatNumber } from "@/lib/utils";
import type { CreatorProfileData } from "@/lib/creators/types";

/**
 * Cover with parallax scroll + floating profile card (RPD §6.2). Follow writes
 * through to Supabase (toggleFollow); Subscribe / Tip persist once those flows
 * are wired. Optimistic, reverts only if the user isn't signed in.
 */
export function CreatorHeader({
  creator,
  initiallyBlocked = false,
}: {
  creator: CreatorProfileData;
  initiallyBlocked?: boolean;
}) {
  const router = useRouter();
  const { push } = useToast();
  const { scrollY } = useScroll();
  const coverY = useTransform(scrollY, [0, 400], [0, 120]);
  const coverScale = useTransform(scrollY, [0, 400], [1, 1.15]);
  const [following, setFollowing] = useState(false);
  const [, startFollow] = useTransition();
  const [messaging, startMessage] = useTransition();
  const [menuOpen, setMenuOpen] = useState(false);
  const [blocked, setBlocked] = useState(initiallyBlocked);
  const [blocking, setBlocking] = useState(false);
  const [reporting, setReporting] = useState(false);

  const copyLink = async () => {
    setMenuOpen(false);
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/creators/${creator.username}`);
      push({ tone: "success", title: "Profile link copied" });
    } catch {
      push({ tone: "info", title: "Couldn't copy link" });
    }
  };

  const onBlock = async () => {
    if (!creator.id) return;
    setMenuOpen(false);
    setBlocking(true);
    const res = blocked ? await unblockUser(creator.id) : await blockUser(creator.id);
    setBlocking(false);
    if (res.needsAuth) {
      push({ tone: "error", title: "Sign in first" });
      return;
    }
    if (!res.ok) {
      push({ tone: "error", title: res.error ?? "Something went wrong" });
      return;
    }
    setBlocked(!blocked);
    push({ tone: "success", title: blocked ? `Unblocked ${creator.displayName}` : `Blocked ${creator.displayName}` });
    router.refresh();
  };

  const onFollow = () => {
    const next = !following;
    setFollowing(next);
    startFollow(async () => {
      const res = await toggleFollow(creator.username, next);
      if (res.needsAuth) setFollowing(!next);
    });
  };

  const onMessage = () => {
    if (!creator.id) return;
    startMessage(async () => {
      const res = await startConversation(creator.id!);
      if (res.ok && res.conversationId) {
        router.push(`/messages/${res.conversationId}`);
      } else if (res.needsAuth) {
        push({ tone: "error", title: "Sign in to send a message" });
      } else {
        push({ tone: "error", title: res.error ?? "Could not open chat" });
      }
    });
  };

  return (
    <div className="relative">
      {/* Parallax cover */}
      <div className="relative h-48 sm:h-64 lg:h-80 overflow-hidden rounded-3xl">
        <motion.div
          style={{ y: coverY, scale: coverScale }}
          className="absolute inset-0"
        >
          {creator.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- cover from Supabase storage; next/image source set wires in Phase 2 media
            <img
              src={creator.coverUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-imperial via-plum to-imperial-dark">
              <div className="absolute inset-0 opacity-60 bg-[radial-gradient(ellipse_at_top_left,rgba(255,31,143,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(184,71,255,0.35),transparent_55%)]" />
            </div>
          )}
        </motion.div>
      </div>

      {/* Floating card */}
      <div className="relative mx-4 sm:mx-8 -mt-16 sm:-mt-20">
        <div className="glass-strong rounded-2xl p-6 shadow-glow">
          <div className="flex flex-col sm:flex-row gap-5 sm:items-end">
            <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-2xl overflow-hidden bg-imperial ring-2 ring-magenta/40 flex-shrink-0 -mt-16 sm:-mt-20">
              {creator.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={creator.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="absolute inset-0 grid place-items-center font-display text-3xl text-white">
                  {creator.displayName.slice(0, 1).toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-white truncate">
                  {creator.displayName}
                </h1>
                {creator.verified && (
                  <BadgeCheck size={22} className="text-cyan flex-shrink-0" aria-label="Verified" />
                )}
                {creator.activeRecently && (
                  <span className="inline-flex items-center gap-1.5 text-[0.65rem] text-lilac/60 ml-1">
                    <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                    Active
                  </span>
                )}
              </div>
              <p className="text-sm text-lilac/60">@{creator.username}</p>
              {creator.tagline && (
                <p className="mt-2 text-sm text-lilac/80 max-w-xl">
                  {creator.tagline}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant={following ? "glass" : "secondary"}
                onClick={onFollow}
                leftIcon={following ? <BadgeCheck size={16} /> : <Plus size={16} />}
              >
                {following ? "Following" : "Follow"}
              </Button>
              <Button leftIcon={<Heart size={16} />}>Subscribe</Button>
              {creator.id && (
                <Button
                  variant="glass"
                  size="icon"
                  aria-label="Message"
                  onClick={onMessage}
                  loading={messaging}
                >
                  <MessageCircle size={16} />
                </Button>
              )}
              <Button variant="glass" size="icon" aria-label="Tip">
                <Coins size={16} />
              </Button>
              {creator.id && (
                <div className="relative">
                  <Button
                    variant="glass"
                    size="icon"
                    aria-label="More"
                    aria-haspopup="menu"
                    aria-expanded={menuOpen}
                    onClick={() => setMenuOpen((v) => !v)}
                  >
                    <MoreHorizontal size={16} />
                  </Button>
                  {menuOpen && (
                    <>
                      <button
                        type="button"
                        aria-hidden="true"
                        tabIndex={-1}
                        onClick={() => setMenuOpen(false)}
                        className="fixed inset-0 z-40 cursor-default"
                      />
                      <div role="menu" className="absolute right-0 top-11 z-50 w-44 glass-strong edge-light rounded-xl p-1 shadow-e3">
                        <button type="button" role="menuitem" onClick={copyLink} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-lilac/85 hover:bg-white/5">
                          <Link2 size={14} /> Copy link
                        </button>
                        <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); setReporting(true); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-lilac/85 hover:bg-white/5">
                          <Flag size={14} /> Report
                        </button>
                        <button type="button" role="menuitem" disabled={blocking} onClick={onBlock} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-300 hover:bg-red-500/10 disabled:opacity-50">
                          <Ban size={14} /> {blocked ? "Unblock" : "Block"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Animated stat counters */}
          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-white/5 pt-5">
            <Stat label="Subscribers" value={creator.subscriberCount} />
            <Stat label="Posts" value={creator.postCount} />
            <Stat
              label="$NSFW earned"
              value={creator.totalEarningsNsfw}
              format={(n) => formatNumber(n)}
            />
          </div>
        </div>
      </div>

      {reporting && creator.id && (
        <ReportModal
          targetType="user"
          targetId={creator.id}
          targetLabel={creator.displayName}
          onClose={() => setReporting(false)}
        />
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  format,
}: {
  label: string;
  value: number;
  format?: (n: number) => string;
}) {
  return (
    <div className="text-center">
      <div className="font-display text-xl sm:text-2xl font-semibold text-white">
        <StatTicker value={value} format={format} />
      </div>
      <div className="text-[0.7rem] uppercase tracking-wider text-lilac/50 mt-0.5">
        {label}
      </div>
    </div>
  );
}
