"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BrandIcon } from "@/components/brand/BrandIcon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

/**
 * Staking CTA. APY / total-staked figures come from the staking contract,
 * which is PENDING_CONTRACT_ADDRESS, so we describe the mechanism without
 * showing a fabricated APY. Real numbers appear once the contract is wired.
 */
export function StakingCTA() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.6 }}
        >
          <Card className="relative overflow-hidden border-orchid/30">
            <div className="absolute inset-0 bg-gradient-to-br from-orchid/10 via-transparent to-cyan/10" />
            <div className="absolute -right-12 -bottom-12 opacity-30 hidden md:block">
              <BrandIcon name="lock" size={220} />
            </div>

            <div className="relative grid md:grid-cols-[1fr_auto] items-center gap-8">
              <div>
                <span className="text-xs uppercase tracking-wider text-cyan">
                  12-Week Staking
                </span>
                <h2 className="mt-2 font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white max-w-xl">
                  Lock conviction. <span className="text-gradient">Earn rewards.</span>
                </h2>
                <p className="mt-4 max-w-xl text-lilac/70">
                  Stake $NSFW for 12 weeks, claim rewards as they accrue, and
                  withdraw after a short unlock window. Connect your wallet on
                  the staking page to see your live balance and position.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button size="lg" asChild>
                    <Link href="/staking">Open staking</Link>
                  </Button>
                  <Button size="lg" variant="ghost" asChild>
                    <Link href="/docs/staking">How it works</Link>
                  </Button>
                </div>
              </div>
              <div className="md:hidden">
                <BrandIcon name="lock" size={140} />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
