"use client";

import Link from "next/link";
import {
  Compass,
  Home,
  Clapperboard,
  MessageCircle,
  Diamond,
  Lock,
  Coins,
  User,
  Bookmark,
  Megaphone,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { AuroraBackground } from "@/components/brand/AuroraBackground";
import { SkipToContent } from "@/components/ui/SkipToContent";
import { ConnectWallet } from "@/components/web3/ConnectWallet";
import { NotificationsBell } from "@/components/notifications/NotificationsBell";
import { SmartSearch } from "@/components/ai/SmartSearch";
import { NavRail, type RailItem } from "@/components/platform/NavRail";
import { PlatformBottomNav } from "@/components/platform/PlatformBottomNav";
import { MoreMenu } from "@/components/platform/MoreMenu";

/** Discovery first, Feed second; routes that exist today. */
const nav: RailItem[] = [
  { href: "/feed", label: "Home", icon: Home },
  { href: "/explore", label: "Discover", icon: Compass },
  { href: "/pveels", label: "Pveels", icon: Clapperboard },
  { href: "/news", label: "News", icon: Megaphone },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { href: "/marketplace", label: "Marketplace", icon: Diamond },
  { href: "/staking", label: "Staking", icon: Lock },
  { href: "/token", label: "Token", icon: Coins },
  { href: "/profile", label: "Profile", icon: User },
];

interface PlatformShellProps {
  children: React.ReactNode;
  /**
   * Real unread count flows from a server-fetched value once auth is wired.
   * Until then this stays undefined (no badge). PENDING_SUPABASE_AUTH.
   */
  unreadMessageCount?: number;
  /** Honors the user's Smart Search AI preference. */
  showSmartSearch?: boolean;
}

/**
 * The platform shell (Part 6): one continuous glass instrument with the calm
 * aurora living behind all of it. The rail and top context bar are glass chrome
 * that stay still; the content panel is the brighter focused screen set into
 * the chassis. Comfortable gutters let the aurora glow through the seams.
 */
export function PlatformShell({
  children,
  unreadMessageCount,
  showSmartSearch = true,
}: PlatformShellProps) {
  return (
    <div className="relative min-h-screen">
      <div aria-hidden="true" className="fixed inset-0 -z-10 pointer-events-none">
        <AuroraBackground intensity="app" />
      </div>
      <SkipToContent />

      <div className="relative z-10 flex min-h-screen">
        <NavRail items={nav} unreadMessageCount={unreadMessageCount} />

        <div className="flex flex-col flex-1 min-w-0 max-w-full p-2 sm:p-3">
          <header className="glass-chrome edge-light rounded-2xl px-3 sm:px-4 h-14 flex items-center gap-3 sticky top-2 sm:top-3 z-50">
            <div className="lg:hidden">
              <Logo size="sm" showWordmark={false} />
            </div>
            {showSmartSearch ? <SmartSearch /> : <div className="flex-1" />}
            <Link
              href="/messages"
              aria-label={
                unreadMessageCount && unreadMessageCount > 0
                  ? `Messages, ${unreadMessageCount} unread`
                  : "Messages"
              }
              className="relative h-10 w-10 rounded-xl flex items-center justify-center text-lilac/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              <MessageCircle size={18} />
              {typeof unreadMessageCount === "number" &&
                unreadMessageCount > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute top-1 right-1 min-w-[1rem] h-4 px-1 rounded-full bg-magenta text-white text-[0.55rem] font-semibold inline-flex items-center justify-center"
                  >
                    {unreadMessageCount > 9 ? "9+" : unreadMessageCount}
                  </span>
                )}
            </Link>
            <NotificationsBell />
            <ConnectWallet compact />
            <MoreMenu />
          </header>

          <main
            id="main-content"
            className="content-panel edge-light flex-1 min-w-0 max-w-full mt-2 sm:mt-3 p-4 sm:p-6 lg:p-8 pb-[calc(7rem+env(safe-area-inset-bottom,0px))] lg:pb-8"
          >
            {children}
          </main>
        </div>
      </div>

      <PlatformBottomNav />
    </div>
  );
}
