import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { GradientText } from "@/components/brand/GradientText";

/**
 * Mission statement band. The Pleasure Network thesis, elevated: creators
 * first, safe and inclusive, all powered by $NSFW.
 */
export function Mission() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <ScrollReveal>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan mb-6">
            The Pleasure Network
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-[1.15]">
            Putting the needs of creators first and foremost, we&apos;re building
            safe and inclusive adult platforms, all powered by{" "}
            <GradientText>Pleasure Coin ($NSFW)</GradientText>.
          </h2>
          <p className="mt-8 max-w-2xl mx-auto text-lg text-lilac/70">
            One token across everything: subscribe, tip, collect, and stake.
            Creators keep the relationship and the revenue; fans get a premium,
            private, on-chain home.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
