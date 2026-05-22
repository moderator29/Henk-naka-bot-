import { Card } from "@/components/ui/Card";
import { BrandIcon, type BrandIconName } from "@/components/brand/BrandIcon";

const categories: { name: string; icon: BrandIconName }[] = [
  { name: "Trending", icon: "sparkle" },
  { name: "New & Rising", icon: "rocket" },
  { name: "Top Creators", icon: "crown" },
  { name: "NFTs", icon: "diamond" },
  { name: "Metaverse", icon: "globe" },
  { name: "Premium", icon: "lock" },
];

export default function ExplorePage() {
  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-8">
        <h1 className="font-display text-4xl font-bold text-white">
          <span className="text-gradient">Explore</span> Pleasure Coin
        </h1>
        <p className="mt-2 text-lilac/70">
          Discover creators, drops, and what&apos;s moving across the
          ecosystem.
        </p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {categories.map((c) => (
          <Card
            key={c.name}
            hoverable
            className="flex flex-col items-center text-center gap-4 py-8"
          >
            <BrandIcon name={c.icon} size={64} />
            <h3 className="font-display text-lg font-semibold text-white">
              {c.name}
            </h3>
          </Card>
        ))}
      </div>
    </div>
  );
}
