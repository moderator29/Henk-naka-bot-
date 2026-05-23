"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { BrandIcon } from "@/components/brand/BrandIcon";
import { Card } from "@/components/ui/Card";

const features = [
  {
    title: "Discovery Concierge",
    audience: "For fans",
    description:
      "A short conversation builds your feed. Summon it anytime to shift the mood, refresh, or discover something new.",
  },
  {
    title: "Creator Co-Pilot",
    audience: "For creators",
    description:
      "Posting times, caption variations, reply suggestions, pricing guidance, and a plain-language weekly digest.",
  },
  {
    title: "Smart Search",
    audience: "Everyone",
    description:
      "Type what you want in plain English. “Creators under 1k followers who post weekly,” translated to results.",
  },
  {
    title: "Earnings Forecaster",
    audience: "For creators",
    description:
      "Project next month's earnings with scenario sliders. Transparent math, never magic.",
  },
  {
    title: "Subscription Intelligence",
    audience: "For fans",
    description:
      "Tracks every active sub, summarizes what each creator posted since you last visited, reminds before renewal.",
  },
];

export function AIShowcase() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="absolute inset-0 -z-10 opacity-50">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[40rem] w-[40rem] rounded-full bg-orchid/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass mb-6 text-xs font-medium">
            <Sparkles size={14} className="text-magenta" />
            <span className="text-lilac/80">AI Cornerstones</span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white">
            Five surfaces. <span className="text-gradient">All shipping at MVP.</span>
          </h2>
          <p className="mt-4 text-lg text-lilac/70">
            AI woven through the product, not bolted on. Each feature solves a
            real job for a real person.
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
            >
              <Card hoverable className="h-full">
                <BrandIcon name="sparkle" size={56} className="mb-4" />
                <div className="text-[0.7rem] uppercase tracking-wider text-cyan mb-2">
                  {feature.audience}
                </div>
                <h3 className="font-display text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-lilac/70">{feature.description}</p>
              </Card>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Card className="h-full border-magenta/30 bg-gradient-to-br from-magenta/10 to-orchid/10">
              <div className="text-[0.7rem] uppercase tracking-wider text-magenta mb-2">
                Post-MVP roadmap
              </div>
              <h3 className="font-display text-xl font-semibold text-white mb-3">
                And there&apos;s more coming
              </h3>
              <ul className="space-y-1.5 text-sm text-lilac/80">
                <li>· Mood Mode</li>
                <li>· AI Greeter</li>
                <li>· Trend Pulse</li>
                <li>· Caption Translator</li>
                <li>· Visual Search</li>
              </ul>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
