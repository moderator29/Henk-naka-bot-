import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { CreatorRow } from "@/components/explore/CreatorRow";
import { ConciergePrompt } from "@/components/explore/ConciergePrompt";
import { PostCard } from "@/components/feed/PostCard";
import { CATEGORIES } from "@/lib/explore/categories";
import { getTrendingCreators } from "@/lib/explore/queries";
import { getAllPosts } from "@/lib/posts/queries";
import { getSessionUser } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

export const metadata = { title: "Discover" };

const CURATION_SLUGS = new Set(["trending", "new", "top"]);
const CONTENT_KEYWORDS: Record<string, string[]> = {
  nfts: ["nft"],
  metaverse: ["meta", "verse", "world", "land"],
  premium: ["premium", "vip", "exclusive", "insider"],
};

function matchesCategory(creator: { categories: string[] }, slug: string) {
  if (CURATION_SLUGS.has(slug)) return true;
  const keywords = CONTENT_KEYWORDS[slug] ?? [];
  return creator.categories.some((c) =>
    keywords.some((k) => c.toLowerCase().includes(k))
  );
}

/**
 * Discovery, the front door (RPD §6.2). A calm Concierge prompt, then real
 * trending creators and fresh public posts from Supabase, with honest empty
 * states. No demo content.
 */
export default async function ExplorePage({
  searchParams,
}: {
  searchParams?: { cat?: string };
}) {
  const me = await getSessionUser();
  const [allTrending, posts] = await Promise.all([
    getTrendingCreators(12),
    getAllPosts(me?.id ?? null),
  ]);

  const activeCat =
    searchParams?.cat && CATEGORIES.some((c) => c.slug === searchParams.cat)
      ? searchParams.cat
      : null;
  const activeLabel = activeCat
    ? CATEGORIES.find((c) => c.slug === activeCat)?.label ?? null
    : null;

  const trending = activeCat
    ? allTrending.filter((c) => matchesCategory(c, activeCat))
    : allTrending;

  let row = 0;
  const delay = () => 0.06 * row++;

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-10">
      <ScrollReveal delay={delay()}>
        <header className="flex flex-col gap-4">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
              <span className="text-gradient">Discover</span>
            </h1>
            <p className="mt-1 text-lilac/70">
              Creators worth your time, picked by vibe, not by follower count.
            </p>
          </div>
          <ConciergePrompt />
        </header>
      </ScrollReveal>

      {/* Category quick filters */}
      <ScrollReveal delay={delay()}>
        <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-1 px-1 pb-1">
          {CATEGORIES.map((c) => {
            const active = activeCat === c.slug;
            return (
              <Link
                key={c.slug}
                href={active ? "/explore" : `/explore?cat=${c.slug}`}
                aria-pressed={active}
                className={cn(
                  "shrink-0 rounded-pill border px-4 h-9 inline-flex items-center text-sm transition-colors",
                  active
                    ? "border-magenta/50 bg-magenta/15 text-white"
                    : "border-white/10 text-lilac/80 hover:text-white hover:border-white/30"
                )}
              >
                {c.label}
              </Link>
            );
          })}
        </div>
      </ScrollReveal>

      <ScrollReveal delay={delay()}>
        {trending.length > 0 ? (
          <CreatorRow
            title={activeLabel ? `${activeLabel} creators` : "Trending now"}
            creators={trending}
          />
        ) : (
          <Card className="text-center py-12 border-dashed border-2 border-white/10 bg-transparent">
            <p className="text-sm text-lilac/60">
              {activeLabel ? `No ${activeLabel} creators yet.` : "No creators yet."}
            </p>
            <p className="text-xs text-lilac/40 mt-1">
              {activeCat ? (
                <>
                  Try another category or{" "}
                  <Link href="/explore" className="text-magenta hover:underline">
                    clear the filter
                  </Link>
                  .
                </>
              ) : (
                "Creators appear here as they join and publish."
              )}
            </p>
          </Card>
        )}
      </ScrollReveal>

      {/* Fresh posts — full, interactive cards (like, comment, save, tip). */}
      <ScrollReveal delay={delay()}>
        <section className="max-w-2xl">
          <h2 className="font-display text-lg sm:text-xl font-semibold text-white mb-3">
            Fresh on the platform
          </h2>
          {posts.length > 0 ? (
            <div className="flex flex-col gap-5">
              {posts.map((p, i) => (
                <PostCard key={p.id} post={p} index={i} />
              ))}
            </div>
          ) : (
            <Card className="text-center py-12 border-dashed border-2 border-white/10 bg-transparent">
              <p className="text-sm text-lilac/50">
                Public posts show up here as creators publish.
              </p>
            </Card>
          )}
        </section>
      </ScrollReveal>
    </div>
  );
}
