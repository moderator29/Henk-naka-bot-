import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PostCard } from "@/components/feed/PostCard";
import { CreatorCard } from "@/components/explore/CreatorCard";
import { getSessionUser } from "@/lib/auth/session";
import { getFeedPosts } from "@/lib/posts/queries";
import { getTrendingCreators } from "@/lib/explore/queries";

export const metadata = { title: "Feed" };

/**
 * Feed surface. Real posts from creators the user follows (or recent public
 * posts) from Supabase. When there's nothing yet, an honest empty state points
 * to Discover. No demo content.
 */
export default async function FeedPage() {
  const me = await getSessionUser();
  const [posts, suggested] = await Promise.all([
    getFeedPosts(me?.id ?? null),
    getTrendingCreators(4),
  ]);

  return (
    <div className="mx-auto max-w-5xl xl:grid xl:grid-cols-[minmax(0,1fr)_300px] xl:gap-8 xl:items-start">
      <div className="w-full max-w-2xl mx-auto xl:mx-0">
        <header className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
              Your <span className="text-gradient">feed</span>
            </h1>
            <p className="mt-2 text-lilac/70">
              Posts from creators you follow, in one place.
            </p>
          </div>
          <Button asChild className="hidden sm:inline-flex">
            <Link href="/compose">New post</Link>
          </Button>
        </header>

        {posts.length > 0 ? (
          <div className="flex flex-col gap-5">
            {posts.map((p, i) => (
              <PostCard key={p.id} post={p} index={i} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl glass edge-light p-10 text-center">
            <p className="text-white font-medium">Your feed is quiet</p>
            <p className="mt-1 text-sm text-lilac/60">
              Follow creators you love and their posts land here.
            </p>
            <Button asChild className="mt-4" rightIcon={<ArrowRight size={16} />}>
              <Link href="/explore">Discover creators</Link>
            </Button>
          </div>
        )}
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
