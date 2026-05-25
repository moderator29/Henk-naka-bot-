import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StatTicker } from "@/components/ui/StatTicker";
import { getTokenStats } from "@/lib/market/token-stats";

/**
 * Live $NSFW ticker, price, 24h change, market cap, holders. Server-rendered
 * with a 60s revalidate so CoinGecko isn't hit on every visit. Any metric the
 * provider doesn't return shows a dash, never a fabricated number.
 */
export const revalidate = 60;

export async function LiveTicker() {
  const stats = await getTokenStats();

  return (
    <section className="relative -mt-8 z-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="glass-strong edge-light rounded-2xl px-6 py-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 items-center">
          <Stat label="$NSFW">
            {stats.price != null ? (
              <StatTicker value={stats.price} formatPreset="price6" duration={1.4} />
            ) : (
              <Dash />
            )}
          </Stat>
          <Stat label="24h">
            {stats.change24h != null ? (
              <span className={stats.change24h >= 0 ? "text-cyan" : "text-magenta-light"}>
                {stats.change24h >= 0 ? "+" : ""}
                {stats.change24h.toFixed(2)}%
              </span>
            ) : (
              <Dash />
            )}
          </Stat>
          <Stat label="Market Cap">
            {stats.marketCap != null ? (
              <StatTicker value={stats.marketCap} formatPreset="usdCompact" />
            ) : (
              <Dash />
            )}
          </Stat>
          <Stat label="Holders">
            {stats.holders != null ? <StatTicker value={stats.holders} /> : <Dash />}
          </Stat>
          <Stat label="Total Supply">
            <StatTicker value={69_000_000_000} formatPreset="compact" />
          </Stat>
          <div className="col-span-2 sm:col-span-3 lg:col-span-1 flex items-center lg:justify-end">
            <Link
              href="/trade"
              className="inline-flex items-center gap-1.5 h-11 px-5 rounded-pill btn-primary text-white text-sm font-semibold w-full lg:w-auto justify-center"
            >
              Trade $NSFW
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wider text-lilac/50">{label}</span>
      <span className="font-display text-2xl font-semibold text-white">{children}</span>
    </div>
  );
}

function Dash() {
  return <span className="text-lilac/40 text-base">, </span>;
}
