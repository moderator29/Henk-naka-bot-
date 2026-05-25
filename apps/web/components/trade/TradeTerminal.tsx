"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, Check } from "lucide-react";
import { CandlestickChart } from "./CandlestickChart";
import { SwapPanel } from "./SwapPanel";
import { useToast } from "@/components/ui/Toast";
import { NSFW } from "@/lib/trade/config";
import type { Candle } from "@/lib/market/coingecko";
import { cn } from "@/lib/utils";

const RANGES: { label: string; days: number }[] = [
  { label: "1D", days: 1 },
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
];

function fmtPrice(n: number | null): string {
  if (n == null) return "—";
  if (n >= 1) return `$${n.toFixed(4)}`;
  return `$${n.toPrecision(4)}`;
}

export function TradeTerminal() {
  const { push } = useToast();
  const [days, setDays] = useState(7);
  const [candles, setCandles] = useState<Candle[] | null>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [change, setChange] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    setCandles(null);
    fetch(`/api/trade/ohlc?days=${days}`)
      .then((r) => r.json())
      .then((j) => {
        if (active) setCandles(j.candles ?? []);
      })
      .catch(() => active && setCandles([]));
    return () => {
      active = false;
    };
  }, [days]);

  const loadPrice = useCallback(() => {
    fetch("/api/trade/price")
      .then((r) => r.json())
      .then((j) => {
        setPrice(j.price ?? null);
        setChange(j.change24h ?? null);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadPrice();
    const t = setInterval(loadPrice, 30_000);
    return () => clearInterval(t);
  }, [loadPrice]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(NSFW.address);
      setCopied(true);
      push({ tone: "success", title: "Contract copied" });
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="glass-chrome edge-light rounded-2xl p-4 sm:p-5 flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex items-center gap-3">
          <span className="h-10 w-10 rounded-full bg-gradient-primary grid place-items-center font-display font-bold text-white">
            N
          </span>
          <div>
            <div className="font-display font-semibold text-white leading-tight">$NSFW</div>
            <div className="text-xs text-lilac/50">Pleasure Coin · Polygon</div>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-display text-2xl sm:text-3xl font-bold text-white tabular-nums">
            {fmtPrice(price)}
          </span>
          {change != null && (
            <span className={cn("text-sm font-medium", change >= 0 ? "text-emerald-400" : "text-red-400")}>
              {change >= 0 ? "+" : ""}
              {change.toFixed(2)}%
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={copy}
          className="ml-auto inline-flex items-center gap-1.5 text-xs text-lilac/50 hover:text-white font-mono"
        >
          {NSFW.address.slice(0, 6)}…{NSFW.address.slice(-4)}
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-4 items-start">
        {/* Chart */}
        <div className="content-panel edge-light p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-lilac/60">Price chart</div>
            <div className="flex gap-1 p-1 rounded-lg bg-white/5">
              {RANGES.map((r) => (
                <button
                  key={r.days}
                  type="button"
                  onClick={() => setDays(r.days)}
                  className={cn(
                    "h-7 px-2.5 rounded-md text-xs font-semibold transition-colors",
                    days === r.days ? "bg-gradient-primary text-white" : "text-lilac/60 hover:text-white"
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          {candles === null ? (
            <div className="h-[380px] grid place-items-center text-sm text-lilac/40">Loading chart…</div>
          ) : (
            <CandlestickChart candles={candles} />
          )}
        </div>

        {/* Swap */}
        <SwapPanel />
      </div>
    </div>
  );
}
