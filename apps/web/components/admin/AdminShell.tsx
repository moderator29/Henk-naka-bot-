"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Flag,
  ShieldCheck,
  Megaphone,
  ScrollText,
  BookOpen,
  ArrowLeft,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

/**
 * Admin panel shell: a calm, on-brand sidebar + content area for the core team.
 * Only routes that exist are listed (no dead links). Access is gated
 * server-side in the layout; this is just the chrome.
 */
const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/reports", label: "Reports & moderation", icon: Flag },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { href: "/admin/audit", label: "Audit log", icon: ScrollText },
  { href: "/admin/docs", label: "Admin docs", icon: BookOpen },
];

export function AdminShell({ role, children }: { role: string; children: React.ReactNode }) {
  const pathname = usePathname() ?? "/admin";
  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-plum text-lilac flex">
      <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-white/5 bg-plum/60 p-4 sticky top-0 h-screen">
        <div className="flex items-center gap-2 px-1 mb-6">
          <Logo size="sm" showWordmark={false} />
          <div>
            <p className="font-display font-semibold text-white leading-none">Admin</p>
            <p className="text-[0.65rem] uppercase tracking-wider text-magenta mt-1">{role}</p>
          </div>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 h-10 px-3 rounded-xl text-sm font-medium transition-colors",
                isActive(href) ? "bg-gradient-primary text-white" : "text-lilac/65 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon size={17} /> {label}
            </Link>
          ))}
        </nav>
        <Link href="/feed" className="flex items-center gap-2 h-10 px-3 rounded-xl text-sm text-lilac/55 hover:text-white hover:bg-white/5">
          <ArrowLeft size={16} /> Back to app
        </Link>
      </aside>

      <main className="flex-1 min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden sticky top-0 z-20 flex items-center gap-2 border-b border-white/5 bg-plum/80 backdrop-blur px-4 h-14">
          <ShieldCheck size={18} className="text-magenta" />
          <span className="font-display font-semibold text-white">Admin</span>
          <Link href="/feed" className="ml-auto text-sm text-lilac/60 hover:text-white">Exit</Link>
        </div>
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
