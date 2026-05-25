"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatNumber } from "@/lib/utils";
import type { TrendingCreator } from "@/lib/explore/queries";

/**
 * Featured creators, shown as a continuous marquee on the public landing.
 * Real verified/trending creators from Supabase (passed in by the server page).
 * When none have onboarded yet, an honest invitation shows instead of a roster.
 * The marquee pauses on hover.
 */
export function CreatorsCarousel({ creators }: { creators: TrendingCreator[] }) {
  const row = creators.length > 0 ? [...creators, ...creators] : []; // doubled for seamless loop

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between gap-6 flex-wrap mb-10"
        >
          <div className="max-w-2xl">
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white">
              Creators who <span className="text-gradient">set the pace</span>
            </h2>
            <p className="mt-4 text-lg text-lilac/70">
              Verified creators across every category. Follow, subscribe with
              $NSFW, tip directly, message anytime.
            </p>
          </div>
          <Button variant="glass" asChild>
            <Link href="/explore">Explore all</Link>
          </Button>
        </motion.div>
      </div>

      {row.length === 0 ? (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="glass rounded-2xl p-10 text-center">
            <p className="text-white font-medium">
              The first creators are on their way.
            </p>
            <p className="mt-1 text-sm text-lilac/60">
              Verified creators appear here as they join. Want to be one of them?
            </p>
            <Button asChild className="mt-4">
              <Link href="/signup">Become a creator</Link>
            </Button>
          </div>
        </div>
      ) : (
      <div className="relative">
        {/* edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10 bg-gradient-to-r from-plum to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10 bg-gradient-to-l from-plum to-transparent" />

        <div className="flex gap-4 w-max animate-marquee hover:[animation-play-state:paused] motion-reduce:animate-none">
          {row.map((c, i) => (
            <Link
              key={`${c.username}-${i}`}
              href={`/creators/${c.username}`}
              className="group w-72 flex-shrink-0"
            >
              <div className="glass rounded-2xl p-5 h-full transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-glow group-hover:border-magenta/30">
                <div className="flex items-center gap-3">
                  <span className="h-12 w-12 rounded-full bg-imperial ring-1 ring-magenta/30 grid place-items-center font-display text-white flex-shrink-0">
                    {c.displayName.slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-white truncate">
                        {c.displayName}
                      </span>
                      {c.verified && (
                        <BadgeCheck size={14} className="text-cyan flex-shrink-0" />
                      )}
                    </div>
                    <span className="text-xs text-lilac/50">
                      {formatNumber(c.subscriberCount)} subscribers
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-sm text-lilac/70 line-clamp-2">
                  {c.tagline}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
      )}
    </section>
  );
}
