import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { BrandIcon } from "@/components/brand/BrandIcon";
import { CreatorCard } from "@/components/explore/CreatorCard";
import { CATEGORIES } from "@/lib/explore/categories";
import {
  getTrendingCreators,
  getRecentPublicPosts,
} from "@/lib/explore/queries";
import { relativeTime } from "@/lib/utils";

export const metadata = { title: "Discover" };

/**
 * Discovery — the front door (RPD §6.2). Trending creators + recent public
 * posts come from Supabase; the category grid is fixed product taxonomy; the
 * "For You" AI rail activates with the Concierge in Phase 3. Empty states are
 * honest — no fabricated creators (Rule 7).
 */
export default async function ExplorePage() {
  const [creators, posts] = await Promise.all([
    getTrendingCreators(8),
    getRecentPublicPosts(9),
  ]);

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="font-display text-4xl font-bold text-white">
          <span className="text-gradient">Discover</span> Pleasure Coin
        </h1>
        <p className="mt-2 text-lilac/70">
          Trending creators, fresh posts, and the categories that pull you in.
        </p>
      </header>

      {/* Category grid */}
      <section className="mb-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((c) => (
            <Link key={c.slug} href={`/explore/${c.slug}`}>
              <Card hoverable className="flex flex-col items-center text-center gap-3 py-6">
                <BrandIcon name={c.icon} size={48} />
                <h3 className="font-display text-sm font-semibold text-white">
                  {c.label}
                </h3>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* For You — AI */}
      <section className="mb-12">
        <Card className="border-magenta/30 bg-gradient-to-br from-magenta/10 to-orchid/10">
          <div className="flex items-start gap-4">
            <BrandIcon name="sparkle" size={56} />
            <div>
              <div className="flex items-center gap-2 text-[0.7rem] uppercase tracking-wider text-magenta mb-1">
                <Sparkles size={12} /> For You
              </div>
              <h2 className="font-display text-xl font-semibold text-white">
                Let Aura build your feed
              </h2>
              <p className="mt-1 text-sm text-lilac/70 max-w-xl">
                Tell the Concierge a vibe, a type, a feeling — it assembles a
                personalized feed in seconds. Activates with the AI features.
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* Trending creators */}
      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold text-white mb-5">
          Trending creators
        </h2>
        {creators.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {creators.map((c) => (
              <CreatorCard key={c.username} creator={c} />
            ))}
          </div>
        ) : (
          <EmptyState label="Trending creators appear here as creators onboard." />
        )}
      </section>

      {/* Recent posts */}
      <section>
        <h2 className="font-display text-2xl font-bold text-white mb-5">
          Fresh on the platform
        </h2>
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((p) => (
              <Card key={p.id} hoverable>
                {p.category && (
                  <span className="text-[0.65rem] uppercase tracking-wider text-cyan">
                    {p.category}
                  </span>
                )}
                <p className="mt-1 text-sm text-lilac/85 line-clamp-3">
                  {p.caption || "—"}
                </p>
                <time className="block mt-3 text-[0.65rem] text-lilac/40">
                  {relativeTime(p.createdAt)}
                </time>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState label="Public posts show up here as creators publish." />
        )}
      </section>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <Card className="text-center py-12 border-dashed border-2 border-white/10 bg-transparent">
      <p className="text-sm text-lilac/50">{label}</p>
    </Card>
  );
}
