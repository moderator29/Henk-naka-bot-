import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PostCard } from "@/components/feed/PostCard";
import { DEMO_POSTS, demoEnabled } from "@/lib/demo/data";

export const metadata = { title: "Feed" };

/**
 * Feed surface. With auth + a real follow graph this shows posts from creators
 * the user follows. For a brand-new user with an empty graph we render a demo
 * feed (clearly labeled) so the platform feels alive, with a nudge to Discover
 * real creators. PENDING_SUPABASE_AUTH for the live follow-graph fetch.
 */
export default function FeedPage() {
  const hasFollows = false; // PENDING_SUPABASE_AUTH
  const showDemo = !hasFollows && demoEnabled();

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-6">
        <h1 className="font-display text-4xl font-bold text-white">
          Your <span className="text-gradient">feed</span>
        </h1>
        <p className="mt-2 text-lilac/70">
          Posts from creators you follow, in one place.
        </p>
      </header>

      {showDemo && (
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
      )}
    </div>
  );
}
