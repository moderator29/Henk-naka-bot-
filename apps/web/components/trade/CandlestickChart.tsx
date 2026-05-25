"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Candle } from "@/lib/market/coingecko";

const UP = "#34D399";
const DOWN = "#F43F5E";

function fmtPrice(n: number): string {
  if (n >= 1) return `$${n.toFixed(4)}`;
  return `$${n.toPrecision(4)}`;
}

/**
 * Dependency-free SVG candlestick chart: wicks, a latest-price line, a right
 * price axis, time labels, and a hover crosshair with an OHLC tooltip.
 * Responsive via a measured container width.
 */
export function CandlestickChart({
  candles,
  height = 380,
}: {
  candles: Candle[];
  height?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setWidth(w);
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  const padRight = 64;
  const padBottom = 22;
  const plotW = Math.max(0, width - padRight);
  const plotH = height - padBottom;

  const { min, max } = useMemo(() => {
    if (candles.length === 0) return { min: 0, max: 1 };
    let lo = Infinity;
    let hi = -Infinity;
    for (const c of candles) {
      lo = Math.min(lo, c.l);
      hi = Math.max(hi, c.h);
    }
    const pad = (hi - lo) * 0.08 || hi * 0.05;
    return { min: lo - pad, max: hi + pad };
  }, [candles]);

  if (candles.length === 0) {
    return (
      <div ref={ref} className="grid place-items-center text-sm text-lilac/40" style={{ height }}>
        Live chart data is unavailable right now.
      </div>
    );
  }

  const n = candles.length;
  const slot = plotW / n;
  const bodyW = Math.max(1, Math.min(14, slot * 0.66));
  const y = (p: number) => plotH - ((p - min) / (max - min)) * plotH;
  const x = (i: number) => i * slot + slot / 2;

  const last = candles[n - 1]!;
  const lastY = y(last.c);
  const ticks = 5;
  const hovered = hover != null ? candles[hover] : null;

  return (
    <div ref={ref} className="relative w-full" style={{ height }}>
      <svg
        width={width}
        height={height}
        className="block"
        onMouseMove={(e) => {
          const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          const px = e.clientX - rect.left;
          const i = Math.max(0, Math.min(n - 1, Math.floor(px / slot)));
          setHover(i);
        }}
        onMouseLeave={() => setHover(null)}
      >
        {Array.from({ length: ticks + 1 }).map((_, i) => {
          const p = min + ((max - min) * i) / ticks;
          const gy = y(p);
          return (
            <g key={i}>
              <line x1={0} x2={plotW} y1={gy} y2={gy} stroke="rgba(255,255,255,0.05)" />
              <text x={width - padRight + 6} y={gy + 3} fill="#7A6B95" fontSize="10">
                {fmtPrice(p)}
              </text>
            </g>
          );
        })}

        {candles.map((c, i) => {
          const up = c.c >= c.o;
          const color = up ? UP : DOWN;
          const cx = x(i);
          const top = Math.min(y(c.o), y(c.c));
          const h = Math.max(1, Math.abs(y(c.c) - y(c.o)));
          return (
            <g key={c.t} opacity={hover == null || hover === i ? 1 : 0.55}>
              <line x1={cx} x2={cx} y1={y(c.h)} y2={y(c.l)} stroke={color} strokeWidth={1} />
              <rect x={cx - bodyW / 2} y={top} width={bodyW} height={h} fill={color} rx={1} />
            </g>
          );
        })}

        <line x1={0} x2={plotW} y1={lastY} y2={lastY} stroke="#FF1F8F" strokeDasharray="3 3" strokeWidth={1} />
        <rect x={width - padRight} y={lastY - 9} width={padRight} height={18} fill="#FF1F8F" rx={3} />
        <text x={width - padRight + 5} y={lastY + 3} fill="#fff" fontSize="10" fontWeight="600">
          {fmtPrice(last.c)}
        </text>

        {hovered && (
          <line x1={x(hover!)} x2={x(hover!)} y1={0} y2={plotH} stroke="rgba(255,255,255,0.15)" />
        )}

        {[0, Math.floor(n / 2), n - 1].map((i) => (
          <text key={i} x={x(i)} y={height - 6} fill="#5A4D75" fontSize="10" textAnchor="middle">
            {new Date(candles[i]!.t).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </text>
        ))}
      </svg>

      {hovered && (
        <div className="pointer-events-none absolute top-2 left-2 glass rounded-lg px-3 py-2 text-[11px] text-lilac/80 flex flex-wrap gap-x-3">
          <span className="text-lilac/50">
            {new Date(hovered.t).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </span>
          <span>O {fmtPrice(hovered.o)}</span>
          <span>H {fmtPrice(hovered.h)}</span>
          <span>L {fmtPrice(hovered.l)}</span>
          <span className={hovered.c >= hovered.o ? "text-emerald-400" : "text-red-400"}>
            C {fmtPrice(hovered.c)}
          </span>
        </div>
      )}
    </div>
  );
}
