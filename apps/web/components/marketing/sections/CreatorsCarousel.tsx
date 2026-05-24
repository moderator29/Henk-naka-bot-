"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

/**
 * Featured creators. Renders real verified-creator profiles once they're
 * onboarded and seeded; until then it shows the structure without inventing
 * fake people (Rule 7, no fake data).
 */
export function CreatorsCarousel() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between gap-6 flex-wrap"
        >
          <div className="max-w-2xl">
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white">
              Featured <span className="text-gradient">creators</span>
            </h2>
            <p className="mt-4 text-lg text-lilac/70">
              Verified creators across every category. Explore profiles,
              subscribe with $NSFW, tip directly.
            </p>
          </div>
          <Button variant="glass" asChild>
            <Link href="/explore">Explore all</Link>
          </Button>
        </motion.div>

        <div className="mt-12">
          <Card className="text-center py-16 border-dashed border-2 border-white/10 bg-transparent">
            <p className="text-lilac/60 text-sm font-mono uppercase tracking-wider">
              Featured creators render once profiles are onboarded
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
