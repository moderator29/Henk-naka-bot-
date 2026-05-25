import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * Closing call to action. Full-bleed magenta-to-orchid band with the two
 * primary paths: buy the token, or enter the app (auth-gated).
 */
export function FinalCTA() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-primary px-6 py-16 sm:px-12 sm:py-20 text-center">
          <div className="absolute inset-0 opacity-30 mix-blend-overlay bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.5),transparent_60%)]" />
          <div className="relative">
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
              Ready to join the revolution?
            </h2>
            <p className="mt-5 max-w-xl mx-auto text-lg text-white/85">
              Get your $NSFW today and become part of the future of adult
              entertainment, one platform, one wallet, one home.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="glass"
                asChild
                rightIcon={<ArrowRight size={18} />}
                className="bg-plum/30 hover:bg-plum/40 border-white/30"
              >
                <Link
                  href="https://app.sushi.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Buy $NSFW now
                </Link>
              </Button>
              <Button
                size="lg"
                asChild
                className="bg-white text-plum hover:bg-white/90"
              >
                <Link href="/verify?next=/signup">Launch app</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
