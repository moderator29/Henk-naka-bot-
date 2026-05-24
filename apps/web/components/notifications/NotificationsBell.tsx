"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Heart,
  UserPlus,
  Coins,
  MessageCircle,
  FileText,
  Info,
  type LucideIcon,
} from "lucide-react";
import { cn, relativeTime } from "@/lib/utils";
import {
  describeNotification,
  type AppNotification,
  type NotificationType,
} from "@/lib/notifications/types";

const ICONS: Record<NotificationType, LucideIcon> = {
  follow: UserPlus,
  subscribe: Heart,
  tip: Coins,
  message: MessageCircle,
  post: FileText,
  system: Info,
};

/**
 * Top-bar notifications bell with an unread badge and a dropdown of recent
 * items. Fetches from /api/notifications on open; mark-all-read posts to
 * /api/notifications/read. Empty + signed-out states are honest — no
 * fabricated notifications.
 */
export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = (await res.json()) as {
          items: AppNotification[];
          unread: number;
        };
        setItems(data.items ?? []);
        setUnread(data.unread ?? 0);
      }
    } catch {
      // network/unconfigured — keep empty state
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial unread count on mount.
  useEffect(() => {
    load();
  }, [load]);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) load();
  };

  const markAllRead = async () => {
    setUnread(0);
    setItems((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
    try {
      await fetch("/api/notifications/read", { method: "POST" });
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label={unread > 0 ? `Notifications — ${unread} unread` : "Notifications"}
        aria-expanded={open}
        onClick={toggle}
        className="relative h-10 w-10 rounded-xl flex items-center justify-center text-lilac/70 hover:text-white hover:bg-white/5"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span
            aria-hidden="true"
            className="absolute top-1 right-1 min-w-[1rem] h-4 px-1 rounded-full bg-magenta text-white text-[0.55rem] font-semibold inline-flex items-center justify-center"
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] glass-strong rounded-2xl shadow-glass overflow-hidden z-50"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <span className="font-display font-semibold text-white text-sm">
              Notifications
            </span>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs text-magenta hover:text-magenta-light"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-lilac/50">Loading…</p>
            ) : items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-lilac/50">
                You&apos;re all caught up.
              </p>
            ) : (
              <ul className="divide-y divide-white/5">
                {items.map((n) => {
                  const Icon = ICONS[n.type] ?? Info;
                  return (
                    <li
                      key={n.id}
                      className={cn(
                        "flex gap-3 px-4 py-3",
                        !n.readAt && "bg-magenta/[0.06]"
                      )}
                    >
                      <span className="h-8 w-8 rounded-lg glass flex items-center justify-center text-magenta flex-shrink-0">
                        <Icon size={15} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-lilac/90">
                          {describeNotification(n)}
                        </p>
                        <time className="text-[0.65rem] text-lilac/40">
                          {relativeTime(n.createdAt)}
                        </time>
                      </div>
                      {!n.readAt && (
                        <span className="h-2 w-2 rounded-full bg-magenta mt-1.5 flex-shrink-0" />
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="border-t border-white/5 px-4 py-2.5 text-center">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="text-xs text-lilac/70 hover:text-white"
            >
              See all
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
