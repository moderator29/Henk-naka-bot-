import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PostCard } from "@/components/feed/PostCard";
import { CreatorCard } from "@/components/explore/CreatorCard";
import { getSessionUser } from "@/lib/auth/session";
import { getFeedPosts } from "@/lib/posts/queries";
import { getTrendingCreators, type TrendingCreator } from "@/lib/explore/queries";
import { DEMO_CREATORS, DEMO_POSTS, demoEnabled } from "@/lib/demo/data";

export const metadata = { title: "Feed" };

/**
 * Feed surface. Shows real posts from creators the user follows (or recent
 * public posts) when Supabase has data. For a brand-new platform with no posts
 * yet, falls back to a clearly-labeled demo feed so it never looks broken.
 */
export default async function FeedPage() {
  const me = await getSessionUser();
  const [realPosts, liveCreators] = await Promise.all([
    getFeedPosts(me?.id ?? null),
    getTrendingCreators(4),
  ]);
  const showDemo = realPosts.length === 0 && demoEnabled();
  const suggested: TrendingCreator[] =
    liveCreators.length > 0
      ? liveCreators
      : demoEnabled()
        ? DEMO_CREATORS.slice(0, 3)
        : [];

  return (
    <div className="mx-auto max-w-5xl xl:grid xl:grid-cols-[minmax(0,1fr)_300px] xl:gap-8 xl:items-start">
      <div className="w-full max-w-2xl mx-auto xl:mx-0">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold text-white">
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

      {realPosts.length > 0 ? (
        <div className="flex flex-col gap-5">
          {realPosts.map((p, i) => (
            <PostCard key={p.id} post={p} index={i} />
          ))}
        </div>
      ) : showDemo ? (
        <>
          <div className="mb-5 flex items-center justify-between gap-4 rounded-xl glass px-4 py-3">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles size={16} className="text-magenta" />
              <span className="text-lilac/80">
                A taste of the feed. Follow creators to make it yours.
              </span>
            </div>
            <Button size="sm" variant="glass" asChild rightIcon={<ArrowRight size={16} />}>
              <Link href="/explore">Discover</Link>
            </Button>
          </div>

          <div className="flex flex-col gap-5">
            {DEMO_POSTS.map((p, i) => (
              <PostCard
                key={p.id}
                index={i}
                post={{
                  id: p.id,
                  creatorUsername: p.creatorUsername,
                  creatorName: p.creatorName,
                  verified: p.verified,
                  caption: p.caption,
                  category: p.category,
                  gated: p.gated,
                  likes: p.likes,
                  comments: p.comments,
                  createdAt: new Date(Date.now() - p.minutesAgo * 60_000),
                }}
              />
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-lilac/40">
            Demo content. Real posts from creators you follow appear here once
            you sign in and follow people.
          </p>
        </>
      ) : (
        <div className="rounded-2xl glass p-10 text-center">
          <p className="text-lilac/70">No posts yet. Be the first to post.</p>
          <Button asChild className="mt-4">
            <Link href="/compose">Create a post</Link>
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
            <Link
              href="/explore"
              className="text-xs text-magenta hover:text-magenta-light"
            >
              See all
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {suggested.map((c) => (
              <CreatorCard key={c.username} creator={c} />
            ))}
          </div>
          <Link
            href="/staking"
            className="glass edge-light rounded-2xl p-4 hover:shadow-[var(--glow-orchid)] transition-shadow"
          >
            <p className="text-xs uppercase tracking-wider text-cyan">Earn</p>
            <p className="mt-1 font-display font-semibold text-white">
              Stake $NSFW for 10% APY
            </p>
            <p className="mt-1 text-sm text-lilac/60">
              Lock for 12 weeks, earn while you hold.
            </p>
          </Link>
        </aside>
      )}
    </div>
  );
}
