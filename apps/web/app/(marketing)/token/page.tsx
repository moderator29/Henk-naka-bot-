import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { AuroraBackground } from "@/components/brand/AuroraBackground";
import { GradientText } from "@/components/brand/GradientText";
import { BrandIcon, type BrandIconName } from "@/components/brand/BrandIcon";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  StatTicker,
  type StatFormatPreset,
} from "@/components/ui/StatTicker";
import { CopyAddress } from "@/components/marketing/CopyAddress";
import { PriceChart } from "@/components/token/PriceChart";
import { NSFW_TOKEN_ADDRESS } from "@/lib/web3/addresses";
import { getTokenStats } from "@/lib/market/token-stats";
import { getPriceHistory } from "@/lib/market/price-history";

export const metadata: Metadata = {
  title: "Token · $NSFW",
  description:
    "Live $NSFW data: price, market cap, volume, contract details, and utility across Pleasure Coin.",
};

export const revalidate = 60;

const POLYGONSCAN = `https://polygonscan.com/token/${NSFW_TOKEN_ADDRESS}`;
const SUSHI = "https://app.sushi.com";

export default async function TokenPage() {
  const [stats, history] = await Promise.all([
    getTokenStats(),
    getPriceHistory("7"),
  ]);

  return (
    <>
      <section className="relative pt-32 pb-12">
        <AuroraBackground variant="magenta" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
          <div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight text-white">
              The token that powers the{" "}
              <GradientText>entire ecosystem.</GradientText>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-lilac/80">
              $NSFW lives on Polygon. It pays for subscriptions, tips,
              marketplace purchases, and unlocks staking rewards. One token,
              every surface.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" asChild>
                <Link href={SUSHI} target="_blank" rel="noopener noreferrer">
                  Buy on SushiSwap
                </Link>
              </Button>
              <CopyAddress address={NSFW_TOKEN_ADDRESS} label="Contract" />
              <Button variant="ghost" asChild>
                <Link
                  href={POLYGONSCAN}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5"
                >
                  PolygonScan <ExternalLink size={14} />
                </Link>
              </Button>
            </div>
          </div>
          <div className="hidden lg:flex justify-center">
            <BrandIcon name="rocket" size={200} />
          </div>
        </div>
      </section>

      <section className="relative pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Metric label="Price" value={stats.price} formatPreset="price6" />
          <Metric
            label="24h"
            value={stats.change24h}
            formatPreset="percentSigned"
            tone={stats.change24h != null && stats.change24h >= 0 ? "up" : "down"}
          />
          <Metric label="Market Cap" value={stats.marketCap} formatPreset="usdCompact" />
          <Metric label="24h Volume" value={stats.volume24h} formatPreset="usdCompact" />
        </div>
      </section>

      <section className="relative pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PriceChart initial={history} initialTimeframe="7" />
        </div>
      </section>

      <section className="relative pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-8">
            Utility across the platform
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Utility icon="heart" title="Subscriptions & tips" body="Pay creators directly. Subscribe to tiers and tip on posts in $NSFW." />
            <Utility icon="diamond" title="NFT marketplace" body="Buy, sell, and trade creator NFTs on PleasureNifty with $NSFW." />
            <Utility icon="lock" title="Staking" body="Lock $NSFW for 12 weeks. Earn rewards. Signal long-term conviction." />
            <Utility icon="globe" title="Metaverse access" body="Token-gated experiences inside Pleasureland for holders and stakers." />
          </div>
        </div>
      </section>
    </>
  );
}

function Metric({
  label,
  value,
  formatPreset,
  tone,
}: {
  label: string;
  value: number | null;
  formatPreset: StatFormatPreset;
  tone?: "up" | "down";
}) {
  return (
    <Card>
      <div className="text-xs uppercase tracking-wider text-lilac/50 mb-2">{label}</div>
      <div
        className={`font-display text-2xl sm:text-3xl font-semibold ${
          tone === "up" ? "text-cyan" : tone === "down" ? "text-magenta-light" : "text-white"
        }`}
      >
        {value != null ? (
          <StatTicker value={value} formatPreset={formatPreset} />
        ) : (
          <span className="text-lilac/40">—</span>
        )}
      </div>
    </Card>
  );
}

function Utility({
  icon,
  title,
  body,
}: {
  icon: BrandIconName;
  title: string;
  body: string;
}) {
  return (
    <Card hoverable className="flex gap-5 items-start">
      <BrandIcon name={icon} size={64} />
      <div>
        <h3 className="font-display text-xl font-semibold text-white">{title}</h3>
        <p className="mt-2 text-lilac/70 text-sm">{body}</p>
      </div>
    </Card>
  );
}
