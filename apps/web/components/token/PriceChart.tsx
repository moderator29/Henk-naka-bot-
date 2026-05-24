"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import {
  TIMEFRAMES,
  type PricePoint,
  type Timeframe,
} from "@/lib/market/price-history";

interface PriceChartProps {
  initial: PricePoint[];
  initialTimeframe?: Timeframe;
}

/**
 * $NSFW price chart with a timeframe selector. Seeds with server-fetched data
 * and refetches from /api/market/price-history on timeframe change. Shows an
 * honest "data unavailable" panel when the provider returns nothing, no
 * fabricated series.
 */
export function PriceChart({
  initial,
  initialTimeframe = "7",
}: PriceChartProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>(initialTimeframe);
  const [points, setPoints] = useState<PricePoint[]>(initial);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (timeframe === initialTimeframe) {
      setPoints(initial);
      return;
    }
    let active = true;
    setLoading(true);
    fetch(`/api/market/price-history?days=${timeframe}`)
      .then((r) => r.json())
      .then((d: { points: PricePoint[] }) => {
        if (active) setPoints(d.points ?? []);
      })
      .catch(() => {
        if (active) setPoints([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [timeframe, initial, initialTimeframe]);

  const hasData = points.length > 1;

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-semibold text-white">
          $NSFW price
        </h2>
        <div
          role="tablist"
          aria-label="Chart timeframe"
          className="flex items-center gap-1 rounded-lg bg-plum/60 p-1"
        >
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.value}
              role="tab"
              aria-selected={timeframe === tf.value}
              onClick={() => setTimeframe(tf.value)}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                timeframe === tf.value
                  ? "bg-gradient-primary text-white"
                  : "text-lilac/60 hover:text-white"
              )}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF1F8F" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#FF1F8F" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="t"
                tickFormatter={(t: number) =>
                  new Date(t).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }
                tick={{ fill: "#E9D5FF80", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                minTickGap={40}
              />
              <YAxis
                domain={["auto", "auto"]}
                tick={{ fill: "#E9D5FF80", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={60}
                tickFormatter={(v: number) => `$${v.toPrecision(2)}`}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(15,4,32,0.95)",
                  border: "1px solid rgba(255,31,143,0.3)",
                  borderRadius: 12,
                  color: "#fff",
                }}
                labelFormatter={(label) =>
                  new Date(Number(label)).toLocaleString()
                }
                formatter={(value) => [`$${Number(value).toFixed(6)}`, "Price"]}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#FF1F8F"
                strokeWidth={2}
                fill="url(#priceFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full grid place-items-center text-center">
            <p className="text-sm text-lilac/50 font-mono">
              {loading ? "Loading…" : "Price data unavailable right now"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
