import { AuroraBackground } from "@/components/brand/AuroraBackground";
import { GradientText } from "@/components/brand/GradientText";
import { BrandIcon } from "@/components/brand/BrandIcon";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

/**
 * Landing page — Phase 2 fills in the full section sequence (LiveTicker,
 * Ecosystem, AIShowcase, Creators, StakingCTA, Journey). For now, the hero
 * exercises the layout shell so the deploy can be verified end-to-end.
 */
export default function LandingPage() {
  return (
    <section className="relative min-h-[100svh] flex items-center pt-16 overflow-hidden">
      <AuroraBackground variant="magenta" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center w-full">
        <div>
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full glass text-xs font-medium text-lilac/80">
            <span className="h-2 w-2 rounded-full bg-magenta animate-pulse" />
            Project Aurora · v2 launching
          </div>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.05] tracking-tight text-white">
            The <GradientText animate>creator</GradientText> platform of
            tomorrow.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-lilac/80">
            One platform. One wallet. One sign-in. Pleasurely, PleasureNifty,
            staking, and the $NSFW token — unified, AI-native, and built for
            the decade ahead.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Button size="lg" asChild>
              <Link href="/explore">Enter the Platform</Link>
            </Button>
            <Button size="lg" variant="glass" asChild>
              <Link
                href="https://app.sushi.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Buy $NSFW
              </Link>
            </Button>
          </div>
        </div>
        <div className="hidden lg:flex items-center justify-center">
          <BrandIcon name="rocket" size={240} />
        </div>
      </div>
    </section>
  );
}
