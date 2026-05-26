"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu,
  X,
  Search as SearchIcon,
  Megaphone,
  MessageCircle,
  Bookmark,
  Heart,
  Diamond,
  Lock,
  Coins,
  Sparkles,
  Settings,
  LogOut,
  type LucideIcon,
} from "lucide-react";

interface Item {
  href?: string;
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
}

/**
 * Mobile "more" menu. The bottom bar holds the primary destinations (Home,
 * Discover, +, Pveels, Profile); everything else — Messages, Bookmarks,
 * Subscriptions, Marketplace, Staking, Token, the AI assistant, Settings, and
 * Sign out — lives here so every feature is reachable on mobile. Desktop uses
 * the side rail, so this is hidden there.
 */
export function MoreMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const openAura = () => {
    setOpen(false);
    window.dispatchEvent(new CustomEvent("aurora:concierge-open"));
  };

  const groups: { heading: string; items: Item[] }[] = [
    {
      heading: "You",
      items: [
        { href: "/search", label: "Search", icon: SearchIcon },
        { href: "/news", label: "News", icon: Megaphone },
        { href: "/messages", label: "Messages", icon: MessageCircle },
        { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
        { href: "/subscriptions", label: "Subscriptions", icon: Heart },
      ],
    },
    {
      heading: "Ecosystem",
      items: [
        { href: "/marketplace", label: "Marketplace", icon: Diamond },
        { href: "/staking", label: "Staking", icon: Lock },
        { href: "/token", label: "Token", icon: Coins },
      ],
    },
    {
      heading: "Assistant",
      items: [{ label: "Ask Aura (AI)", icon: Sparkles, onClick: openAura }],
    },
  ];

  return (
    <>
      <button
        type="button"
        aria-label="More"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="lg:hidden h-10 w-10 rounded-xl flex items-center justify-center text-lilac/70 hover:text-white hover:bg-white/5 transition-colors"
      >
        <Menu size={18} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="lg:hidden fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              role="menu"
              aria-label="More navigation"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="lg:hidden fixed inset-y-0 right-0 z-[61] w-[82%] max-w-xs glass-strong border-l border-white/10 flex flex-col p-4 pt-[calc(env(safe-area-inset-top,0px)+1rem)]"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-display font-semibold text-white">Menu</span>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setOpen(false)}
                  className="h-9 w-9 rounded-lg grid place-items-center text-lilac/60 hover:text-white hover:bg-white/5"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto flex flex-col gap-5">
                {groups.map((g) => (
                  <div key={g.heading}>
                    <p className="text-[0.65rem] uppercase tracking-wider text-lilac/40 px-2 mb-1">
                      {g.heading}
                    </p>
                    <div className="flex flex-col">
                      {g.items.map((item) =>
                        item.href ? (
                          <Link
                            key={item.label}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-3 h-11 px-2 rounded-xl text-sm text-lilac/80 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <item.icon size={18} /> {item.label}
                          </Link>
                        ) : (
                          <button
                            key={item.label}
                            type="button"
                            onClick={item.onClick}
                            className="flex items-center gap-3 h-11 px-2 rounded-xl text-sm text-lilac/80 hover:text-white hover:bg-white/5 transition-colors text-left"
                          >
                            <item.icon size={18} /> {item.label}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-3 mt-3 flex flex-col">
                <Link
                  href="/settings"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 h-11 px-2 rounded-xl text-sm text-lilac/80 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Settings size={18} /> Settings
                </Link>
                <form action="/auth/signout" method="post">
                  <button
                    type="submit"
                    className="w-full flex items-center gap-3 h-11 px-2 rounded-xl text-sm text-lilac/70 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <LogOut size={18} /> Sign out
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
