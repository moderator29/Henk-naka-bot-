import { Card } from "@/components/ui/Card";
import { BrandIcon } from "@/components/brand/BrandIcon";

/**
 * Feed shell — Phase 2 wires in seeded mock-labeled data, Phase 3 wires the
 * Discovery Concierge for real personalization.
 */
export default function FeedPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-8">
        <h1 className="font-display text-4xl font-bold text-white">
          Your <span className="text-gradient">feed</span>
        </h1>
        <p className="mt-2 text-lilac/70">
          Personalized by the creators you follow and discovery from the
          Concierge.
        </p>
      </header>

      <Card className="text-center py-16 border-dashed border-2 border-white/10 bg-transparent">
        <div className="flex justify-center mb-6">
          <BrandIcon name="sparkle" size={80} />
        </div>
        <h2 className="font-display text-xl font-semibold text-white mb-2">
          Build your feed
        </h2>
        <p className="text-lilac/60 text-sm max-w-md mx-auto">
          The Discovery Concierge will assemble your feed once you finish
          onboarding.
        </p>
      </Card>
    </div>
  );
}
