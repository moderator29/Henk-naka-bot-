import type { Metadata } from "next";
import { AuroraBackground } from "@/components/brand/AuroraBackground";
import { GradientText } from "@/components/brand/GradientText";
import { Journey } from "@/components/marketing/sections/Journey";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Journey",
  description: "The story of Pleasure Coin, milestone by milestone, plus what's next.",
};

const roadmap = [
  {
    title: "Aurora launch",
    body: "The unified platform ships — Discovery, Feed, Messages, Marketplace, Staking, and the five AI cornerstones.",
  },
  {
    title: "Creator economy depth",
    body: "Earnings forecasting, advanced analytics, AI-drafted DMs, and richer tier tooling.",
  },
  {
    title: "Live 3D + Mood Mode",
    body: "Real-time 3D brand icons and a feed that reskins to time-of-day and mood.",
  },
  {
    title: "Global reach",
    body: "Caption translation and visual search open the platform to a worldwide audience.",
  },
];

export default function JourneyPage() {
  return (
    <>
      <section className="relative pt-32 pb-8">
        <AuroraBackground variant="purple" intensity="subtle" />
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-5xl sm:text-6xl font-bold text-white">
            From launch to <GradientText>Aurora.</GradientText>
          </h1>
          <p className="mt-6 text-lg text-lilac/70 max-w-2xl mx-auto">
            Every milestone that brought us here — and the roadmap that takes us
            further.
          </p>
        </div>
      </section>

      <Journey />

      <section className="relative pb-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-8 text-center">
            What&apos;s <span className="text-gradient">next</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {roadmap.map((r) => (
              <Card key={r.title} hoverable>
                <h3 className="font-display text-lg font-semibold text-white mb-2">
                  {r.title}
                </h3>
                <p className="text-sm text-lilac/70">{r.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
