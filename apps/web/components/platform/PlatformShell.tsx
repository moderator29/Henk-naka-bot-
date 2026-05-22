"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Compass,
  Diamond,
  Lock,
  User,
  Settings,
  Bell,
  Search,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const nav: NavItem[] = [
  { href: "/feed", label: "Feed", icon: Home },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/marketplace", label: "Marketplace", icon: Diamond },
  { href: "/staking", label: "Staking", icon: Lock },
  { href: "/profile", label: "Profile", icon: User },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PlatformShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";

  return (
    <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-[280px_1fr] xl:grid-cols-[280px_1fr_320px]">
      {/* desktop sidebar */}
      <aside className="hidden lg:flex flex-col gap-2 sticky top-0 h-screen border-r border-white/5 bg-plum/80 backdrop-blur-xl p-6">
        <div className="mb-8">
          <Logo />
        </div>
        <nav aria-label="Primary" className="flex flex-col gap-1 flex-1">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors",
                  active
                    ? "bg-gradient-primary text-white shadow-glow"
                    : "text-lilac/70 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon size={20} aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>
        <Link
          href="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-lilac/70 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Settings size={20} aria-hidden="true" />
          Settings
        </Link>
      </aside>

      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 glass-strong border-b border-white/5 px-4 sm:px-6 py-3 flex items-center gap-3">
          <div className="lg:hidden">
            <Logo size="sm" showWordmark={false} />
          </div>
          <div className="flex-1 relative max-w-xl">
            <label htmlFor="platform-search" className="sr-only">
              Search Pleasure Coin
            </label>
            <Search
              size={16}
              aria-hidden="true"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-lilac/40 pointer-events-none"
            />
            <input
              id="platform-search"
              type="search"
              placeholder="Ask anything…"
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-plum/60 border border-white/10 text-sm text-white placeholder:text-lilac/40 focus:border-magenta/50 focus:outline-none focus:ring-2 focus:ring-magenta/20"
            />
          </div>
          <button
            type="button"
            aria-label="Notifications"
            className="relative h-10 w-10 rounded-xl flex items-center justify-center text-lilac/70 hover:text-white hover:bg-white/5"
          >
            <Bell size={18} />
          </button>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-6">
          {children}
        </main>

        <nav
          aria-label="Primary (mobile)"
          className="lg:hidden fixed bottom-0 inset-x-0 z-40 glass-strong border-t border-white/5"
        >
          <ul className="flex justify-around items-center h-16">
            {nav.map(({ href, label, icon: Icon }) => {
              const active = isActive(pathname, href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex flex-col items-center gap-1 px-3 py-2 text-[0.65rem] font-medium",
                      active ? "text-magenta" : "text-lilac/60"
                    )}
                  >
                    <Icon size={20} aria-hidden="true" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* AI rail (desktop xl) */}
      <aside className="hidden xl:flex flex-col gap-4 sticky top-0 h-screen border-l border-white/5 bg-plum/80 backdrop-blur-xl p-6">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-magenta" aria-hidden="true" />
            <span className="font-display font-semibold text-white">Aura</span>
          </div>
          <p className="text-sm text-lilac/70">
            Your concierge. Refresh the feed, find someone new, shift the mood.
          </p>
        </div>
      </aside>
    </div>
  );
}
