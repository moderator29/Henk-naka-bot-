import type { Metadata } from "next";
import { getMySubscriptions } from "@/lib/subscriptions/actions";
import { SubscriptionList } from "@/components/subscriptions/SubscriptionList";

export const metadata: Metadata = { title: "Subscriptions" };

export default async function SubscriptionsPage() {
  const subs = await getMySubscriptions();

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-white">
          Your subscriptions
        </h1>
        <p className="text-sm text-lilac/60 mt-1">
          Manage the creators you support. Cancelling stops the next renewal but
          keeps your access until the current period ends.
        </p>
      </header>
      <SubscriptionList initial={subs} />
    </div>
  );
}
