import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { BrandIcon } from "@/components/brand/BrandIcon";
import { GradientText } from "@/components/brand/GradientText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Pleasureland",
  description:
    "The metaverse layer of the Pleasure Coin ecosystem. An interactive world for creators and holders, under reconstruction.",
};

const features = [
  {
    title: "Immersive creator worlds",
    body: "Step inside spaces creators build and host, beyond the feed and into a room of their own.",
  },
  {
    title: "Holder-gated spaces",
    body: "Your $NSFW and your collectibles become keys to private areas, drops, and live events.",
  },
  {
    title: "A $NSFW-native economy",
    body: "Everything inside runs on the same token you already use across the ecosystem.",
  },
  {
    title: "Events and live drops",
    body: "Premieres, auctions, and gatherings that happen in real time, in world.",
  },
];

export default function PleasurelandPage() {
  return (
    <div className="pt-16">
      <section className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
        <div className="flex justify-center mb-8">
          <BrandIcon name="globe" size={96} />
        </div>
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass edge-light text-xs font-medium text-amber-300">
          <Sparkles size={13} /> Reconstruction in progress
        </span>
        <h1 className="mt-6 font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05]">
          <GradientText>Pleasureland</GradientText>
        </h1>
        <p className="mt-5 max-w-2xl mx-auto text-lg text-lilac/75">
          The metaverse layer of the ecosystem. An interactive world for creators
          and holders, being rebuilt from the ground up as part of the unified
          platform, a new dimension where your token, your collectibles, and your
          creators come to life.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild rightIcon={<ArrowRight size={18} />}>
            <Link href="/#products">Explore the ecosystem</Link>
          </Button>
          <Button size="lg" variant="glass" asChild>
            <Link href="/docs">Read the docs</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-24 sm:pb-32">
        <div className="grid sm:grid-cols-2 gap-6">
          {features.map((f) => (
            <Card key={f.title} className="edge-light">
              <h2 className="font-display text-xl font-semibold text-white">
                {f.title}
              </h2>
              <p className="mt-2 text-sm text-lilac/70 leading-relaxed">
                {f.body}
              </p>
            </Card>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-lilac/50">
            Pleasureland is under active reconstruction. Everything else in the
            ecosystem, creators, the marketplace, staking, and the token, is live
            today.
          </p>
        </div>
      </section>
    </div>
  );
}
