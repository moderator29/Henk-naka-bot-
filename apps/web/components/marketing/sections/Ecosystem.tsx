"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { BrandIcon, type BrandIconName } from "@/components/brand/BrandIcon";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface Piece {
  name: string;
  subtitle: string;
  description: string;
  bullets: string[];
  icon: BrandIconName;
  status: "Live" | "Coming" | "Reconstruction";
}

const pieces: Piece[] = [
  {
    name: "Pleasurely",
    subtitle: "Empowering content creators",
    description:
      "A social platform built for adult creators. Connect directly with your fans, monetize your work, and grow your brand in a safe, supportive home.",
    bullets: [
      "Fan-to-creator monetization",
      "Subscription tiers",
      "Built-in tipping",
      "Direct messaging",
      "Analytics dashboard",
      "$NSFW payments",
    ],
    icon: "heart",
    status: "Live",
  },
  {
    name: "PleasureNifty",
    subtitle: "The adult NFT marketplace",
    description:
      "The premier marketplace for adult digital art and collectibles. Buy, sell, and trade unique assets while backing the creators you love.",
    bullets: [
      "Limited-edition collectibles",
      "Creator royalties",
      "Secure on-chain trading",
      "Verified creator badges",
      "Fractional ownership",
      "$NSFW payments",
    ],
    icon: "diamond",
    status: "Live",
  },
  {
    name: "Pleasureland",
    subtitle: "The metaverse layer",
    description:
      "An interactive world for creators and holders. A new dimension of the ecosystem, under active reconstruction.",
    bullets: ["Immersive spaces", "Creator worlds", "Holder access", "$NSFW native"],
    icon: "globe",
    status: "Reconstruction",
  },
  {
    name: "Staking",
    subtitle: "Earn while you hold",
    description:
      "Lock $NSFW for 12 weeks and earn 10% APY. Support the network, signal conviction, and grow your position.",
    bullets: ["10% APY", "12-week lock", "Claimable rewards", "On Polygon"],
    icon: "lock",
    status: "Live",
  },
];

const statusStyle: Record<Piece["status"], string> = {
  Live: "text-emerald-300 border-emerald-400/30",
  Coming: "text-cyan border-cyan/30",
  Reconstruction: "text-amber-300 border-amber-400/30",
};

export function Ecosystem() {
  return (
    <section id="products" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white">
            Our <span className="text-gradient">ecosystem</span>
          </h2>
          <p className="mt-4 text-lg text-lilac/70">
            A set of powerful platforms creating the most comprehensive adult
            entertainment ecosystem in Web3, unified by one token and one home.
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {pieces.map((piece, i) => (
            <motion.div
              key={piece.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card className="h-full edge-light">
                <div className="flex items-start gap-5">
                  <BrandIcon name={piece.icon} size={64} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display text-2xl font-semibold text-white">
                        {piece.name}
                      </h3>
                      <span
                        className={cn(
                          "text-[0.6rem] uppercase tracking-wider border px-2 py-0.5 rounded-full",
                          statusStyle[piece.status]
                        )}
                      >
                        {piece.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-magenta-light mt-0.5">
                      {piece.subtitle}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-lilac/70 text-sm leading-relaxed">
                  {piece.description}
                </p>
                <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2">
                  {piece.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm text-lilac/80">
                      <Check size={14} className="text-magenta shrink-0" aria-hidden="true" />
                      {b}
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
