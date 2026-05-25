"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Flag,
  BadgeCheck,
  ScrollText,
  ShieldCheck,
  ArrowLeft,
  Coins,
  Megaphone,
  Settings,
  Sparkles,
  Activity,
  Database,
  BookText,
} from "lucide-react";
import type { Role } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: typeof Users;
  adminOnly?: boolean;
}

const ITEMS: NavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/reports", label: "Moderation", icon: Flag },
  { href: "/admin/creators", label: "Creators", icon: BadgeCheck },
  { href: "/admin/transactions", label: "Transactions", icon: Coins },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone, adminOnly: true },
  { href: "/admin/ai", label: "AI", icon: Sparkles },
  { href: "/admin/health", label: "System health", icon: Activity },
  { href: "/admin/demo", label: "Demo data", icon: Database, adminOnly: true },
  { href: "/admin/settings", label: "Settings", icon: Settings, adminOnly: true },
  { href: "/admin/audit", label: "Audit log", icon: ScrollText },
  { href: "/admin/docs", label: "Admin docs", icon: BookText },
];

export function AdminSidebar({
  role,
  email,
}: {
  role: Role;
  email: string | null;
}) {
  const pathname = usePathname();
  const isAdmin = role === "admin" || role === "superadmin";
  const items = ITEMS.filter((i) => !i.adminOnly || isAdmin);

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden lg:flex w-64 flex-col border-r border-white/10 bg-imperial-dark/60 backdrop-blur-xl px-4 py-6">
      <div className="flex items-center gap-2 px-2 mb-6">
        <span className="h-8 w-8 rounded-xl bg-gradient-primary grid place-items-center">
          <ShieldCheck size={18} className="text-white" />
        </span>
        <div className="leading-tight">
          <p className="font-display font-semibold text-white text-sm">Admin</p>
          <p className="text-[0.65rem] uppercase tracking-wider text-cyan">
            {role}
          </p>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/admin"
              ? pathname === "/admin"
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 h-10 px-3 rounded-xl text-sm transition-colors",
                active
                  ? "bg-gradient-primary text-white"
                  : "text-lilac/65 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-2 pt-4">
        {email && (
          <p className="px-3 text-[0.7rem] text-lilac/45 truncate">{email}</p>
        )}
        <Link
          href="/feed"
          className="flex items-center gap-2 h-9 px-3 rounded-xl text-sm text-lilac/60 hover:text-white hover:bg-white/5 transition-colors"
        >
          <ArrowLeft size={16} /> Back to app
        </Link>
      </div>
    </aside>
  );
}
