"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Compass,
  Home,
  Plus,
  Clapperboard,
  User,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Mobile glass tab bar (Part 6): the rail's pocket-sized counterpart, same
 * material and edge light, pinned above content with an elevated center "+"
 * that opens the composer. Home and Discover flank the left, Pveels and Profile
 * the right; Messages and notifications live in the top context bar.
 */

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const left: NavItem[] = [
  { href: "/feed", label: "Home", icon: Home },
  { href: "/explore", label: "Discover", icon: Compass },
];

const right: NavItem[] = [
  { href: "/pveels", label: "Pveels", icon: Clapperboard },
  { href: "/profile", label: "Profile", icon: User },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PlatformBottomNav() {
  const pathname = usePathname() ?? "/";

  return (
    <nav
      aria-label="Primary"
      className="lg:hidden fixed bottom-4 inset-x-4 z-40"
    >
      <div className="relative mx-auto max-w-md">
        <div className="glass-chrome edge-light rounded-full shadow-e3 flex items-center justify-between px-3 h-16">
          <div className="flex items-center gap-1">
            {left.map((item) => (
              <NavButton key={item.href} item={item} active={isActive(pathname, item.href)} />
            ))}
          </div>

          {/* Spacer for the elevated center button */}
          <div className="w-16" aria-hidden="true" />

          <div className="flex items-center gap-1">
            {right.map((item) => (
              <NavButton key={item.href} item={item} active={isActive(pathname, item.href)} />
            ))}
          </div>
        </div>

        {/* Elevated create-post button */}
        <Link
          href="/compose"
          aria-label="Create a post"
          className="absolute left-1/2 -translate-x-1/2 -top-5"
        >
          <motion.span
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.06 }}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary text-white shadow-glow-lg ring-4 ring-plum/80"
          >
            <Plus size={28} />
          </motion.span>
        </Link>
      </div>
    </nav>
  );
}

function NavButton({ item, active }: { item: NavItem; active: boolean }) {
  const { href, label, icon: Icon } = item;
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      aria-label={label}
      className={cn(
        "relative flex flex-col items-center justify-center gap-0.5 w-16 h-12 rounded-2xl text-[0.6rem] font-medium transition-colors",
        active ? "text-magenta" : "text-lilac/60 hover:text-white"
      )}
    >
      <Icon size={20} aria-hidden="true" />
      {label}
      {active && (
        <motion.span
          layoutId="bottom-nav-active"
          className="absolute -bottom-0.5 h-1 w-6 rounded-full bg-gradient-primary"
        />
      )}
    </Link>
  );
}
