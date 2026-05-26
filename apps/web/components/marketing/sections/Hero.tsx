"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Wallet, BookOpen } from "lucide-react";
import { GradientText } from "@/components/brand/GradientText";
import { Button } from "@/components/ui/Button";

const headline = ["The", "creator", "platform", "of", "tomorrow."];

export function Hero() {
  return (
    <section className="relative min-h-[100svh] flex items-center pt-16 overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center w-full">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full glass text-xs font-medium text-lilac/80"
          >
            <span className="h-2 w-2 rounded-full bg-magenta" />
            Now live · Powered by $NSFW
          </motion.div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight text-white">
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
            <Button size="lg" asChild>
              <Link href="/verify?next=/signup">
                Get Started <ArrowRight size={18} />
              </Link>
            </Button>
            <Button size="lg" variant="glass" asChild>
              <Link href="/trade">
                <Wallet size={18} /> Buy $NSFW
              </Link>
            </Button>
            <Button size="lg" variant="ghost" asChild>
              <Link href="/docs">
                <BookOpen size={18} /> Read the docs
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
          <Image
            src="/brand/logo/logo-full.png"
            alt="Pleasure Coin"
            width={854}
            height={666}
            priority
            className="relative w-[min(26rem,80%)] h-auto drop-shadow-[0_0_60px_rgba(255,31,143,0.45)]"
          />
        </motion.div>
      </div>
    </section>
  );
}
