"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  PanelLeft,
  PanelLeftClose,
  Plus,
  Settings,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

export interface RailItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Desktop navigation rail (Part 6). A glass plane that stays still while the
 * content panel changes. Collapses to an icon rail with a smooth width
 * transition and tooltips; the active item shows a soft gradient pill that
 * slides between items. The aurora behind the chrome glows faintly through.
 */
export function NavRail({
  items,
  unreadMessageCount,
}: {
  items: RailItem[];
  unreadMessageCount?: number;
}) {
  const pathname = usePathname() ?? "/";
  const reduce = useReducedMotion();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem("aurora.rail") === "1");
    } catch {
      /* storage unavailable; stay expanded */
    }
  }, []);

  const toggle = () =>
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem("aurora.rail", next ? "1" : "0");
      } catch {
        /* non-fatal */
      }
      return next;
    });

  const slide = { duration: reduce ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <aside
      aria-label="Primary"
      className={cn(
        "hidden lg:flex flex-col gap-1.5 glass-chrome edge-light rounded-3xl m-3 mr-0 p-3 sticky top-3 h-[calc(100vh-1.5rem)] transition-[width] duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
        collapsed ? "w-[76px]" : "w-[248px]"
      )}
    >
      <div
        className={cn(
          "flex items-center mb-2 h-10",
          collapsed ? "justify-center" : "justify-between px-1"
        )}
      >
        {!collapsed && <Logo />}
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
          aria-pressed={collapsed}
          className="h-9 w-9 shrink-0 inline-flex items-center justify-center rounded-xl text-lilac/60 hover:text-white hover:bg-white/5 transition-colors"
        >
          {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      <Link
        href="/compose"
        title={collapsed ? "Create post" : undefined}
        className={cn(
          "mb-2 inline-flex items-center justify-center gap-2 h-11 rounded-xl btn-primary text-white font-semibold",
          collapsed ? "px-0" : "px-4"
        )}
      >
        <Plus size={18} aria-hidden="true" />
        {!collapsed && <span>Create post</span>}
      </Link>

      <nav className="flex flex-col gap-1 flex-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          const showBadge =
            href === "/messages" &&
            typeof unreadMessageCount === "number" &&
            unreadMessageCount > 0;
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex items-center h-11 rounded-xl font-medium transition-colors",
                collapsed ? "justify-center px-0" : "px-3 gap-3",
                active ? "text-white" : "text-lilac/65 hover:text-white"
              )}
            >
              {active && (
                <motion.span
                  layoutId="rail-active"
                  transition={slide}
                  aria-hidden="true"
                  className="absolute inset-0 rounded-xl bg-gradient-primary opacity-90 shadow-[var(--glow-magenta)]"
                />
              )}
              <Icon size={20} aria-hidden="true" className="relative z-10 shrink-0" />
              {!collapsed && <span className="relative z-10 flex-1">{label}</span>}
              {showBadge && (
                <span
                  aria-label={`${unreadMessageCount} unread messages`}
                  className={cn(
                    "relative z-10 inline-flex items-center justify-center rounded-full bg-magenta text-white text-[0.65rem] font-semibold",
                    collapsed
                      ? "absolute top-1 right-1 h-2 w-2 p-0"
                      : "min-w-[1.25rem] h-5 px-1.5"
                  )}
                >
                  {!collapsed && (unreadMessageCount! > 99 ? "99+" : unreadMessageCount)}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/settings"
        title={collapsed ? "Settings" : undefined}
        aria-current={isActive(pathname, "/settings") ? "page" : undefined}
        className={cn(
          "flex items-center h-11 rounded-xl text-lilac/65 hover:text-white hover:bg-white/5 transition-colors",
          collapsed ? "justify-center px-0" : "px-3 gap-3"
        )}
      >
        <Settings size={20} aria-hidden="true" />
        {!collapsed && <span>Settings</span>}
      </Link>
      <form action="/auth/signout" method="post">
        <button
          type="submit"
          title={collapsed ? "Sign out" : undefined}
          className={cn(
            "w-full flex items-center h-11 rounded-xl text-lilac/55 hover:text-white hover:bg-white/5 transition-colors",
            collapsed ? "justify-center px-0" : "px-3 gap-3"
          )}
        >
          <LogOut size={20} aria-hidden="true" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </form>
    </aside>
  );
}
