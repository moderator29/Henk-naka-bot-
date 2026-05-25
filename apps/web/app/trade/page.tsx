import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuroraBackground } from "@/components/brand/AuroraBackground";
import { Logo } from "@/components/brand/Logo";
import { TradeTerminal } from "@/components/trade/TradeTerminal";

export const metadata: Metadata = {
  title: "Trade $NSFW",
  description: "Trade $NSFW: live price, candlestick chart, and an in-app swap on Polygon.",
};

export default function TradePage() {
  return (
    <div className="relative min-h-[100svh]">
      <div aria-hidden className="fixed inset-0 -z-10 pointer-events-none">
        <AuroraBackground intensity="app" />
      </div>

      <header className="flex items-center gap-4 px-4 sm:px-6 lg:px-8 h-16">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-lilac/70 hover:text-white"
        >
          <ArrowLeft size={16} /> Back
        </Link>
        <div className="mx-auto">
          <Logo size="sm" />
        </div>
        <div className="w-12" aria-hidden />
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="mb-5">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
            Trade <span className="text-gradient">$NSFW</span>
          </h1>
          <p className="mt-1 text-lilac/70">
            Live price, the chart, and a swap, all in one place. Connect your
            wallet to trade on Polygon.
          </p>
        </div>
        <TradeTerminal />
      </main>
    </div>
  );
}
