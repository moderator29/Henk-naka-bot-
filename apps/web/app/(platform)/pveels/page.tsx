import Link from "next/link";
import { Plus } from "lucide-react";
import { PveelsFeed } from "@/components/pveels/PveelsFeed";
import { Button } from "@/components/ui/Button";
import { getPveels } from "@/lib/posts/queries";
import { getSessionUser } from "@/lib/auth/session";

export const metadata = { title: "Pveels" };

/**
 * Pveels, the vertical short-video surface. Plays real public posts that
 * contain a video. Honest empty state until creators post video.
 */
export default async function PveelsPage() {
  const me = await getSessionUser();
  const pveels = await getPveels(me?.id ?? null);

  if (pveels.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-24">
        <h1 className="font-display text-3xl font-bold text-white mb-2">
          <span className="text-gradient">Pveels</span>
        </h1>
        <p className="text-lilac/60">
          Short videos from creators land here. Be the first, post a Pveel.
        </p>
        <Button asChild className="mt-5" leftIcon={<Plus size={16} />}>
          <Link href="/pveels/create">Create a Pveel</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      <PveelsFeed pveels={pveels} />
      <Link
        href="/pveels/create"
        aria-label="Create a Pveel"
        className="fixed bottom-28 lg:bottom-8 right-4 lg:right-8 z-40 h-14 w-14 rounded-full bg-gradient-primary text-white shadow-glow-lg grid place-items-center hover:scale-105 active:scale-95 transition-transform"
      >
        <Plus size={24} />
      </Link>
    </div>
  );
}
