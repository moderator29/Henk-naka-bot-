"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { GradientText } from "@/components/brand/GradientText";

const FAQS: { q: string; a: string }[] = [
  {
    q: "What is $NSFW?",
    a: "$NSFW is the utility token that powers the whole Pleasure Coin ecosystem on Polygon. You use it to subscribe to creators, tip, buy and sell NFTs, and stake for rewards. One token, used everywhere.",
  },
  {
    q: "How do I buy $NSFW?",
    a: "Connect a wallet on Polygon and swap for $NSFW on a DEX like SushiSwap, or use the in-app trade screen. You only need a little POL for gas. The contract is published on the token page and PolygonScan.",
  },
  {
    q: "What is staking and how does the 12-week lock work?",
    a: "Staking locks your $NSFW for 12 weeks and earns 10% APY. During the lock your tokens stay yours but cannot be withdrawn until the unlock date. Rewards accrue continuously and you can claim them, then unstake once the term ends.",
  },
  {
    q: "What is Pleasurely?",
    a: "Pleasurely is the creator platform: a direct creator-to-fan home with subscriptions, tips, posts, and messaging. Creators keep the relationship and the revenue; fans get a clean, premium feed.",
  },
  {
    q: "What is PleasureNifty?",
    a: "PleasureNifty is the adult NFT marketplace. Buy, sell, and trade limited-edition collectibles, all priced in $NSFW and settled on Polygon.",
  },
  {
    q: "Is my content and data safe?",
    a: "Yes. The platform is strictly 18+, verified at signup. Your data is protected with row-level security, you control your profile and connected wallets, and you can export or permanently delete your account at any time.",
  },
  {
    q: "How do creators get paid?",
    a: "Creators earn in $NSFW from subscriptions and tips, paid to their connected payout wallet. There are no middlemen holding your money; settlement is on-chain on Polygon.",
  },
  {
    q: "What wallets are supported?",
    a: "MetaMask, Coinbase Wallet, and any WalletConnect-compatible wallet (including most mobile wallets). Connect once and you are signed in across the whole ecosystem.",
  },
  {
    q: "What chains does it run on?",
    a: "Everything runs on Polygon for fast, low-cost transactions. The $NSFW token, staking, and the NFT marketplace all settle on Polygon mainnet.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-display text-4xl sm:text-5xl font-bold text-center text-white">
          Questions and <GradientText>answers</GradientText>
        </h2>
        <p className="mt-4 text-center text-lilac/70">
          Everything you need to know before you dive in.
        </p>

        <div className="mt-12 flex flex-col gap-3">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={item.q}
                className="glass edge-light rounded-2xl overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 px-5 py-5 text-left"
                >
                  <span className="font-medium text-white">{item.q}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                    className={isOpen ? "text-magenta" : "text-lilac/60"}
                  >
                    <Plus size={20} aria-hidden="true" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-sm leading-relaxed text-lilac/75">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
