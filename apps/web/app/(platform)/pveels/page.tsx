import { PveelsFeed } from "@/components/pveels/PveelsFeed";
import { getForYouPveels, getFollowingPveels } from "@/lib/pveels/queries";
import { getSessionUser } from "@/lib/auth/session";
import { demoEnabled, demoPveels } from "@/lib/demo/data";

export const metadata = { title: "Pveels" };

/**
 * Pveels, the vertical short-video surface. Reads real clips from Supabase
 * (For You + Following), with playback URLs resolved server-side and gated
 * clips locked unless the viewer is entitled. Falls back to a labeled demo
 * set when there's no live content yet.
 */
export default async function PveelsPage() {
  const me = await getSessionUser();

  const [forYouLive, followingLive] = await Promise.all([
    getForYouPveels(me?.id ?? null),
    me ? getFollowingPveels(me.id) : Promise.resolve([]),
  ]);

  const forYou =
    forYouLive.length > 0 ? forYouLive : demoEnabled() ? demoPveels() : [];

  return (
    <PveelsFeed forYou={forYou} following={followingLive} signedIn={!!me} />
  );
}
