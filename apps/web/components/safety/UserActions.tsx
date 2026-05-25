"use client";

import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Flag, Ban, VolumeX, Volume2, ShieldOff } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { ReportDialog } from "@/components/safety/ReportDialog";
import { blockUser, muteUser } from "@/lib/safety/actions";

/**
 * Overflow menu for actions on another user: report, block, mute. Used on the
 * creator profile. Block/mute are optimistic with a revert on failure.
 */
export function UserActions({
  userId,
  username,
  initialBlocked = false,
  initialMuted = false,
}: {
  userId: string;
  username: string;
  initialBlocked?: boolean;
  initialMuted?: boolean;
}) {
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [blocked, setBlocked] = useState(initialBlocked);
  const [muted, setMuted] = useState(initialMuted);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  async function toggleBlock() {
    const next = !blocked;
    setBlocked(next);
    setOpen(false);
    const res = await blockUser(userId, next);
    if (!res.ok) {
      setBlocked(!next);
      push({ tone: "error", title: res.needsAuth ? "Sign in to block" : res.error ?? "Could not block" });
    } else {
      push({ tone: "success", title: next ? `Blocked @${username}` : `Unblocked @${username}` });
    }
  }

  async function toggleMute() {
    const next = !muted;
    setMuted(next);
    setOpen(false);
    const res = await muteUser(userId, next);
    if (!res.ok) {
      setMuted(!next);
      push({ tone: "error", title: res.needsAuth ? "Sign in to mute" : res.error ?? "Could not mute" });
    } else {
      push({ tone: "success", title: next ? `Muted @${username}` : `Unmuted @${username}` });
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label="More actions"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="h-10 w-10 rounded-xl grid place-items-center glass text-lilac/70 hover:text-white transition-colors"
      >
        <MoreHorizontal size={18} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-44 z-30 rounded-xl border border-white/10 bg-imperial-dark/95 backdrop-blur-xl p-1 shadow-glow"
        >
          <MenuItem icon={<Flag size={15} />} onClick={() => { setReporting(true); setOpen(false); }}>
            Report
          </MenuItem>
          <MenuItem icon={muted ? <Volume2 size={15} /> : <VolumeX size={15} />} onClick={toggleMute}>
            {muted ? "Unmute" : "Mute"}
          </MenuItem>
          <MenuItem icon={blocked ? <ShieldOff size={15} /> : <Ban size={15} />} onClick={toggleBlock}>
            {blocked ? "Unblock" : "Block"}
          </MenuItem>
        </div>
      )}

      {reporting && (
        <ReportDialog
          targetType="user"
          targetId={userId}
          label={`Report @${username}`}
          onClose={() => setReporting(false)}
        />
      )}
    </div>
  );
}

function MenuItem({
  icon,
  children,
  onClick,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-lilac/80 hover:text-white hover:bg-white/5 transition-colors"
    >
      {icon}
      {children}
    </button>
  );
}
