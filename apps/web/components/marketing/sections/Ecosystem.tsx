"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { BrandIcon, type BrandIconName } from "@/components/brand/BrandIcon";
import { Card } from "@/components/ui/Card";

interface Piece {
  name: string;
  description: string;
  href: string;
  icon: BrandIconName;
  status?: string;
}

const pieces: Piece[] = [
  {
    name: "Pleasurely",
    description:
      "The creator-and-fan surface. Subscriptions, tips, and content gated by $NSFW.",
    href: "/explore",
    icon: "heart",
  },
  {
    name: "PleasureNifty",
    description:
      "NFTs from creators across the ecosystem. Buy, sell, and collect with $NSFW.",
    href: "/marketplace",
    icon: "diamond",
  },
  {
    name: "Pleasureland",
    description:
      "The metaverse layer. An interactive world for creators and holders.",
    href: "/explore",
    icon: "globe",
    status: "Linked surface",
  },
  {
    name: "Staking",
    description:
      "Lock $NSFW for 12 weeks. Earn rewards, support the network, signal your conviction.",
    href: "/staking",
    icon: "lock",
  },
];

export function Ecosystem() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white">
            One platform. <span className="text-gradient">Four cornerstones.</span>
          </h2>
          <p className="mt-4 text-lg text-lilac/70">
            Each piece of the ecosystem is now first-class inside a single
            product. Shared identity, shared wallet, shared design language.
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {pieces.map((piece, i) => (
            <motion.div
              key={piece.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <Link href={piece.href} className="block group">
                <Card hoverable className="h-full">
                  <div className="flex items-start gap-5">
                    <BrandIcon name={piece.icon} size={72} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-display text-2xl font-semibold text-white">
                          {piece.name}
                        </h3>
                        {piece.status && (
                          <span className="text-[0.65rem] uppercase tracking-wider text-cyan border border-cyan/30 px-2 py-0.5 rounded-full">
                            {piece.status}
                          </span>
                        )}
                      </div>
                      <p className="text-lilac/70 text-sm">{piece.description}</p>
                    </div>
                    <ArrowUpRight
                      size={20}
                      className="text-lilac/40 group-hover:text-magenta transition-colors flex-shrink-0"
                    />
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
