import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { CreatorRow } from "@/components/explore/CreatorRow";
import { ConciergePrompt } from "@/components/explore/ConciergePrompt";
import { CATEGORIES } from "@/lib/explore/categories";
import {
  getTrendingCreators,
  getRecentPublicPosts,
  type TrendingCreator,
} from "@/lib/explore/queries";
import { cn, relativeTime } from "@/lib/utils";
import {
  DEMO_CREATORS,
  DEMO_POSTS,
  demoEnabled,
  type DemoCreator,
} from "@/lib/demo/data";

export const metadata = { title: "Discover" };

function groupByCategory(creators: DemoCreator[]): [string, DemoCreator[]][] {
  const map = new Map<string, DemoCreator[]>();
  for (const c of creators) {
    for (const cat of c.categories) {
      map.set(cat, [...(map.get(cat) ?? []), c]);
    }
  }
  return [...map.entries()].filter(([, list]) => list.length > 0);
}

/**
 * Curation slugs are ordering views (show everyone); content slugs filter by
 * the creator's own category tags. Keeps the chips honest: a content chip with
 * no matching creators shows an empty state rather than an unrelated list.
 */
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
 * Discovery, the front door (RPD §6.2, Part 5 signature moment 3). A calm
 * Concierge prompt, then horizontally scrolling rows of creators that reveal in
 * a downward stagger. Live data from Supabase; clearly-labeled demo creators
 * fill in until real creators onboard.
 */
export default async function ExplorePage({
  searchParams,
}: {
  searchParams?: { cat?: string };
}) {
  const [liveCreators, posts] = await Promise.all([
    getTrendingCreators(12),
    getRecentPublicPosts(10),
  ]);

  const usingDemo = liveCreators.length === 0 && demoEnabled();
  const allTrending: TrendingCreator[] = usingDemo ? DEMO_CREATORS : liveCreators;
  const usingDemoPosts = posts.length === 0 && demoEnabled();

  // Active category filter from the chips. Unknown slugs fall back to "no filter".
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

  // Per-category demo rows only make sense in the unfiltered (or curation) view.
  const showCategoryRows =
    usingDemo && (!activeCat || CURATION_SLUGS.has(activeCat));
  const categoryRows = showCategoryRows ? groupByCategory(DEMO_CREATORS) : [];

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
            demo={usingDemo}
          />
        ) : activeCat ? (
          <Card className="text-center py-12 border-dashed border-2 border-white/10 bg-transparent">
            <p className="text-sm text-lilac/60">
              No {activeLabel} creators yet.
            </p>
            <p className="text-xs text-lilac/40 mt-1">
              Try another category or{" "}
              <Link href="/explore" className="text-magenta hover:underline">
                clear the filter
              </Link>
              .
            </p>
          </Card>
        ) : null}
      </ScrollReveal>

      {categoryRows.map(([cat, list]) => (
        <ScrollReveal key={cat} delay={delay()}>
          <CreatorRow title={`Popular ${cat} creators`} creators={list} demo />
        </ScrollReveal>
      ))}

      {/* Fresh posts */}
      <ScrollReveal delay={delay()}>
        <section>
          <div className="flex items-center gap-3 mb-3">
            <h2 className="font-display text-lg sm:text-xl font-semibold text-white">
              Fresh on the platform
            </h2>
            {usingDemoPosts && (
              <span className="text-[0.6rem] uppercase tracking-wider text-cyan border border-cyan/30 rounded-full px-2 py-0.5">
                Demo
              </span>
            )}
          </div>
          {posts.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto scrollbar-none -mx-1 px-1 pb-2">
              {posts.map((p) => (
                <Link
                  key={p.id}
                  href={`/feed`}
                  className="snap-start shrink-0 w-[280px]"
                >
                  <Card hoverable className="h-full">
                    {p.category && (
                      <span className="text-[0.65rem] uppercase tracking-wider text-cyan">
                        {p.category}
                      </span>
                    )}
                    <p className="mt-1 text-sm text-lilac/85 line-clamp-3">
                      {p.caption || "New post"}
                    </p>
                    <time className="block mt-3 text-[0.65rem] text-lilac/40">
                      {relativeTime(p.createdAt)}
                    </time>
                  </Card>
                </Link>
              ))}
            </div>
          ) : usingDemoPosts ? (
            <div className="flex gap-4 overflow-x-auto scrollbar-none -mx-1 px-1 pb-2">
              {DEMO_POSTS.map((p) => (
                <Link
                  key={p.id}
                  href={`/creators/${p.creatorUsername}`}
                  className="snap-start shrink-0 w-[280px]"
                >
                  <Card hoverable className="h-full">
                    <span className="text-[0.65rem] uppercase tracking-wider text-cyan">
                      {p.category}
                    </span>
                    <p className="mt-1 text-sm text-lilac/85 line-clamp-3">
                      {p.caption}
                    </p>
                    <p className="mt-3 text-[0.65rem] text-lilac/40">
                      {p.creatorName}
                    </p>
                  </Card>
                </Link>
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
