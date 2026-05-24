"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Wallet } from "lucide-react";
import { AuroraBackground } from "@/components/brand/AuroraBackground";
import { GradientText } from "@/components/brand/GradientText";
import { BrandIcon } from "@/components/brand/BrandIcon";
import { Button } from "@/components/ui/Button";

const headline = ["The", "creator", "platform", "of", "tomorrow."];

export function Hero() {
  return (
    <section className="relative min-h-[100svh] flex items-center pt-16 overflow-hidden">
      <AuroraBackground variant="magenta" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center w-full">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full glass text-xs font-medium text-lilac/80"
          >
            <span className="h-2 w-2 rounded-full bg-magenta animate-pulse" />
            Project Aurora · v2 launching
          </motion.div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.05] tracking-tight text-white">
            {headline.map((word, i) => (
              <motion.span
                key={`${word}-${i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="inline-block mr-3"
              >
                {word === "creator" ? (
                  <GradientText animate>{word}</GradientText>
                ) : (
                  word
                )}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-6 max-w-xl text-lg text-lilac/80"
          >
            One platform. One wallet. One sign-in. Pleasurely, PleasureNifty,
            staking, and the $NSFW token, unified, AI-native, and built for the
            decade ahead.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mt-10 flex flex-col sm:flex-row gap-4"
          >
            <Button size="lg" asChild rightIcon={<ArrowRight size={18} />}>
              <Link href="/explore">Enter the Platform</Link>
            </Button>
            <Button size="lg" variant="glass" asChild leftIcon={<Wallet size={18} />}>
              <Link
                href="https://app.sushi.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Buy $NSFW
              </Link>
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="relative hidden lg:flex items-center justify-center"
        >
          <div className="absolute inset-0 -m-20 rounded-full bg-magenta/20 blur-3xl animate-pulse-glow" />
          <BrandIcon name="rocket" size={240} />
        </motion.div>
      </div>
    </section>
  );
}
