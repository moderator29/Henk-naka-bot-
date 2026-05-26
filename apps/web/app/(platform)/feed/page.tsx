import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FeedTabs } from "@/components/feed/FeedTabs";
import { CreatorCard } from "@/components/explore/CreatorCard";
import { getSessionUser } from "@/lib/auth/session";
import { getAllPosts, getFollowingPosts } from "@/lib/posts/queries";
import { getTrendingCreators } from "@/lib/explore/queries";

export const metadata = { title: "Feed" };

/**
 * Feed surface. "For you" shows every post on the platform; "Following" shows
 * the user's follow graph (and own posts). Real posts from Supabase, no demo.
 */
export default async function FeedPage() {
  const me = await getSessionUser();
  const [forYou, following, suggested] = await Promise.all([
    getAllPosts(me?.id ?? null),
    getFollowingPosts(me?.id ?? null),
    getTrendingCreators(4),
  ]);

  return (
    <div className="mx-auto max-w-5xl xl:grid xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-10 xl:items-start">
      <div className="w-full max-w-2xl mx-auto xl:mx-0">
        <header className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
              Your <span className="text-gradient">feed</span>
            </h1>
            <p className="mt-1.5 text-lilac/70">
              Everything happening across Pleasure Coin.
            </p>
          </div>
          <Button asChild className="hidden sm:inline-flex">
            <Link href="/compose">New post</Link>
          </Button>
        </header>

        <FeedTabs forYou={forYou} following={following} signedIn={!!me} />
      </div>

      {suggested.length > 0 && (
        <aside className="hidden xl:flex flex-col gap-4 sticky top-20">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold text-white uppercase tracking-wider">
              Suggested for you
            </h2>
            <Link href="/explore" className="text-xs text-magenta hover:text-magenta-light">
              See all
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {suggested.map((c) => (
              <CreatorCard key={c.username} creator={c} />
            ))}
          </div>
        </aside>
      )}
    </div>
  );
}
