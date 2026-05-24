"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CreatorCard } from "./CreatorCard";
import type { TrendingCreator } from "@/lib/explore/queries";

/**
 * A horizontally scrolling track of creator cards, the way a high-end streaming
 * app lays out a row. Momentum scroll, snap, edge fades, and arrows that appear
 * on hover (desktop). Returns null when empty so rows never render bare.
 */
export function CreatorRow({
  title,
  creators,
  demo = false,
}: {
  title: string;
  creators: TrendingCreator[];
  demo?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  if (creators.length === 0) return null;

  const nudge = (dir: number) =>
    ref.current?.scrollBy({ left: dir * 300, behavior: "smooth" });

  return (
    <section className="group/row">
      <div className="flex items-center gap-3 mb-3">
        <h2 className="font-display text-lg sm:text-xl font-semibold text-white">
          {title}
        </h2>
        {demo && (
          <span className="text-[0.6rem] uppercase tracking-wider text-cyan border border-cyan/30 rounded-full px-2 py-0.5">
            Demo
          </span>
        )}
        <div className="ml-auto hidden lg:flex gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity duration-[140ms]">
          <button
            type="button"
            aria-label={`Scroll ${title} left`}
            onClick={() => nudge(-1)}
            className="h-8 w-8 rounded-full glass flex items-center justify-center text-lilac/80 hover:text-white"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            aria-label={`Scroll ${title} right`}
            onClick={() => nudge(1)}
            className="h-8 w-8 rounded-full glass flex items-center justify-center text-lilac/80 hover:text-white"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="relative">
        <div
          ref={ref}
          className="flex gap-4 overflow-x-auto scrollbar-none snap-x pb-2 -mx-1 px-1"
        >
          {creators.map((c) => (
            <div key={c.username} className="snap-start shrink-0 w-[260px]">
              <CreatorCard creator={c} />
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 -left-1 w-8 bg-gradient-to-r from-[#16092e] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 -right-1 w-8 bg-gradient-to-l from-[#16092e] to-transparent" />
      </div>
    </section>
  );
}
