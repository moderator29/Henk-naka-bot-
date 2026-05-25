"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Section } from "@/components/settings/AccountSettings";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { formatNumber } from "@/lib/utils";
import { setAutoRenew, cancelSubscription, type MySubscription } from "@/lib/subscriptions/actions";

/** Fan-side subscription management: renewal date, auto-renew, cancel. */
export function SubscriptionsSettings({ subscriptions }: { subscriptions: MySubscription[] }) {
  const router = useRouter();
  const { push } = useToast();
  const [busy, setBusy] = useState<string | null>(null);

  async function toggle(sub: MySubscription) {
    setBusy(sub.id);
    const res = await setAutoRenew(sub.id, !sub.autoRenew);
    setBusy(null);
    if (!res.ok) {
      push({ tone: "error", title: res.error ?? "Could not update" });
      return;
    }
    push({ tone: "success", title: sub.autoRenew ? "Auto-renew off" : "Auto-renew on" });
    router.refresh();
  }

  async function cancel(sub: MySubscription) {
    setBusy(sub.id);
    const res = await cancelSubscription(sub.id);
    setBusy(null);
    if (!res.ok) {
      push({ tone: "error", title: res.error ?? "Could not cancel" });
      return;
    }
    push({ tone: "success", title: "Subscription cancelled", description: "Access continues until it expires." });
    router.refresh();
  }

  return (
    <Section title="Subscriptions" desc="Creators you support. Manage renewals and cancel anytime.">
      {subscriptions.length === 0 ? (
        <p className="text-sm text-lilac/60">
          You&apos;re not subscribed to anyone yet.{" "}
          <Link href="/explore" className="text-magenta hover:underline">
            Discover creators
          </Link>
          .
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {subscriptions.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-plum/40 px-4 py-3">
              <div className="min-w-0">
                <Link href={`/creators/${s.creatorUsername}`} className="font-medium text-white hover:text-magenta-light">
                  {s.creatorName}
                </Link>
                <p className="text-xs text-lilac/55">
                  {s.tierName} · {formatNumber(s.priceNsfw)} $NSFW /mo ·{" "}
                  {s.active ? "renews" : "expired"} {new Date(s.expiresAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  role="switch"
                  aria-checked={s.autoRenew}
                  disabled={busy === s.id}
                  onClick={() => toggle(s)}
                  className="inline-flex items-center gap-1.5 text-xs text-lilac/70"
                  title="Auto-renew"
                >
                  <span className={`relative h-5 w-9 rounded-full transition-colors ${s.autoRenew ? "bg-magenta" : "bg-white/15"}`}>
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${s.autoRenew ? "translate-x-4" : "translate-x-0.5"}`} />
                  </span>
                  Auto
                </button>
                {s.autoRenew && (
                  <Button variant="glass" size="sm" loading={busy === s.id} onClick={() => cancel(s)}>
                    Cancel
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
