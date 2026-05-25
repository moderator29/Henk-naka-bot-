import { PveelsFeed } from "@/components/pveels/PveelsFeed";
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
          Short videos from creators land here. Post a video to start the reel.
        </p>
      </div>
    );
  }

  return <PveelsFeed pveels={pveels} />;
}
