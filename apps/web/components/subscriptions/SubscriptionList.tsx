"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { setAutoRenew } from "@/lib/subscriptions/actions";
import type { MySubscription } from "@/lib/subscriptions/types";
import { cn } from "@/lib/utils";

export function SubscriptionList({ initial }: { initial: MySubscription[] }) {
  const { push } = useToast();
  const [subs, setSubs] = useState(initial);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function toggleRenew(sub: MySubscription) {
    const next = !sub.autoRenew;
    setPendingId(sub.id);
    setSubs((cur) =>
      cur.map((s) => (s.id === sub.id ? { ...s, autoRenew: next } : s))
    );
    const res = await setAutoRenew(sub.id, next);
    setPendingId(null);
    if (!res.ok) {
      setSubs((cur) =>
        cur.map((s) => (s.id === sub.id ? { ...s, autoRenew: !next } : s))
      );
      push({ tone: "error", title: "Could not update renewal" });
      return;
    }
    push({
      tone: "success",
      title: next ? "Auto-renew on" : "Renewal cancelled",
      description: next
        ? `${sub.creatorName} will renew automatically.`
        : `Access stays until ${formatDate(sub.expiresAt)}.`,
    });
  }

  if (subs.length === 0) {
    return (
      <div className="glass rounded-2xl p-10 text-center flex flex-col items-center gap-4">
        <span className="h-12 w-12 rounded-2xl glass edge-light grid place-items-center text-magenta">
          <Sparkles size={22} />
        </span>
        <div>
          <p className="text-white font-medium">No subscriptions yet</p>
          <p className="text-sm text-lilac/60 mt-1">
            Subscribe to a creator to unlock their exclusive posts.
          </p>
        </div>
        <Link href="/explore">
          <Button variant="primary">Discover creators</Button>
        </Link>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {subs.map((sub) => (
        <li
          key={sub.id}
          className="glass rounded-2xl p-4 flex items-center gap-4"
        >
          <Link
            href={`/creators/${sub.creatorUsername}`}
            className="flex items-center gap-3 min-w-0 flex-1"
          >
            <Avatar name={sub.creatorName} url={sub.creatorAvatarUrl} />
            <div className="min-w-0">
              <p className="text-white font-medium truncate">
                {sub.creatorName}
              </p>
              <p className="text-xs text-lilac/55 truncate">
                {sub.tierName} · {sub.active ? "Active" : "Expired"}
                {sub.active
                  ? ` until ${formatDate(sub.expiresAt)}`
                  : ` on ${formatDate(sub.expiresAt)}`}
              </p>
            </div>
          </Link>
          <div className="flex flex-col items-end gap-1">
            <span
              className={cn(
                "text-[0.7rem] font-medium px-2 py-0.5 rounded-full",
                sub.autoRenew
                  ? "bg-cyan/15 text-cyan"
                  : "bg-white/5 text-lilac/60"
              )}
            >
              {sub.autoRenew ? "Auto-renews" : "Won't renew"}
            </span>
            <Button
              variant="glass"
              size="sm"
              loading={pendingId === sub.id}
              onClick={() => toggleRenew(sub)}
            >
              {sub.autoRenew ? "Cancel renewal" : "Resume"}
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function Avatar({ name, url }: { name: string; url: string | null }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={url}
        alt=""
        className="h-11 w-11 rounded-full object-cover flex-shrink-0"
      />
    );
  }
  return (
    <span className="h-11 w-11 rounded-full bg-gradient-primary grid place-items-center text-white font-semibold flex-shrink-0">
      {name.charAt(0).toUpperCase() || <Heart size={16} />}
    </span>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
