"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu,
  X,
  Home,
  Compass,
  Clapperboard,
  User,
  Bell,
  Search as SearchIcon,
  Megaphone,
  MessageCircle,
  Bookmark,
  Heart,
  Diamond,
  Lock,
  Coins,
  CandlestickChart,
  LayoutDashboard,
  Crown,
  Sparkles,
  Settings,
  LogOut,
  Languages,
  type LucideIcon,
} from "lucide-react";
import { useTranslate } from "@/components/i18n/TranslateController";
import { LANGUAGES } from "@/lib/i18n/languages";
import { cn } from "@/lib/utils";

interface Item {
  href?: string;
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
}

/**
 * Mobile navigation drawer. The bottom bar holds the primary destinations;
 * this opens from the left as a solid (non-glass) panel listing every feature
 * so nothing is unreachable on a phone. Hidden on desktop, which uses the rail.
 */
export function MoreMenu() {
  const [open, setOpen] = useState(false);
  const { lang, setLang } = useTranslate();
  const pathname = usePathname() ?? "/";

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
      heading: "Browse",
      items: [
        { href: "/feed", label: "Home", icon: Home },
        { href: "/explore", label: "Discover", icon: Compass },
        { href: "/pveels", label: "Pveels", icon: Clapperboard },
        { href: "/profile", label: "Profile", icon: User },
      ],
    },
    {
      heading: "You",
      items: [
        { href: "/notifications", label: "Notifications", icon: Bell },
        { href: "/messages", label: "Messages", icon: MessageCircle },
        { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
        { href: "/subscriptions", label: "Subscriptions", icon: Heart },
        { href: "/news", label: "News", icon: Megaphone },
        { href: "/search", label: "Search", icon: SearchIcon },
      ],
    },
    {
      heading: "Ecosystem",
      items: [
        { href: "/marketplace", label: "Marketplace", icon: Diamond },
        { href: "/staking", label: "Staking", icon: Lock },
        { href: "/token", label: "Token", icon: Coins },
        { href: "/trade", label: "Trade $NSFW", icon: CandlestickChart },
      ],
    },
    {
      heading: "Creator",
      items: [
        { href: "/dashboard", label: "Creator dashboard", icon: LayoutDashboard },
        { href: "/become-creator", label: "Become a creator", icon: Crown },
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
        aria-label="Menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="lg:hidden h-10 w-10 shrink-0 rounded-xl flex items-center justify-center text-white hover:bg-white/10 transition-colors"
      >
        <Menu size={20} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="lg:hidden fixed inset-0 z-[60] bg-black/70"
            />
            <motion.div
              role="menu"
              aria-label="Navigation"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="lg:hidden fixed inset-y-0 left-0 z-[61] w-[80%] max-w-xs bg-imperial-dark border-r border-white/10 shadow-2xl flex flex-col p-4 pt-[calc(env(safe-area-inset-top,0px)+1rem)]"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-display text-lg font-bold text-white">Menu</span>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setOpen(false)}
                  className="h-9 w-9 rounded-lg grid place-items-center text-lilac/70 hover:text-white hover:bg-white/10"
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
                      {g.items.map((item) => {
                        const active = item.href
                          ? pathname === item.href || pathname.startsWith(`${item.href}/`)
                          : false;
                        const cls = cn(
                          "flex items-center gap-3 h-11 px-3 rounded-xl text-sm transition-colors text-left",
                          active
                            ? "bg-white/10 text-white"
                            : "text-lilac/80 hover:text-white hover:bg-white/5"
                        );
                        return item.href ? (
                          <Link
                            key={item.label}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            aria-current={active ? "page" : undefined}
                            className={cls}
                          >
                            <item.icon size={18} className="shrink-0" /> {item.label}
                          </Link>
                        ) : (
                          <button key={item.label} type="button" onClick={item.onClick} className={cls}>
                            <item.icon size={18} className="shrink-0" /> {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-3 mt-3 flex flex-col">
                <div className="flex items-center gap-3 h-11 px-3 rounded-xl text-sm text-lilac/80">
                  <Languages size={18} className="shrink-0" />
                  <span className="shrink-0">Language</span>
                  <select
                    aria-label="Translate the platform"
                    value={lang}
                    onChange={(e) => {
                      setLang(e.target.value);
                      setOpen(false);
                    }}
                    className="ml-auto h-9 rounded-lg bg-plum/80 border border-white/10 px-2 text-sm text-white focus:border-magenta/50 focus:outline-none"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>
                <Link
                  href="/settings"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 h-11 px-3 rounded-xl text-sm text-lilac/80 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Settings size={18} /> Settings
                </Link>
                <form action="/auth/signout" method="post">
                  <button
                    type="submit"
                    className="w-full flex items-center gap-3 h-11 px-3 rounded-xl text-sm text-lilac/70 hover:text-white hover:bg-white/5 transition-colors"
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
