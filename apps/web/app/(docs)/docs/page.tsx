import Link from "next/link";
import type { Metadata } from "next";
import { AuroraBackground } from "@/components/brand/AuroraBackground";
import { GradientText } from "@/components/brand/GradientText";
import { Card } from "@/components/ui/Card";
import { ArrowUpRight } from "lucide-react";
import { DOC_SECTIONS } from "./content";

export const metadata: Metadata = {
  title: "Docs",
  description:
    "Everything you need to know about Pleasure Coin, the unified creator platform.",
};

export default function DocsIndexPage() {
  return (
    <>
      <section className="relative -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-12 mb-12 overflow-hidden rounded-3xl">
        <AuroraBackground variant="purple" intensity="subtle" />
        <div className="relative max-w-3xl">
          <span className="text-xs uppercase tracking-wider text-cyan">
            Documentation
          </span>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl font-bold text-white leading-tight">
            Everything <GradientText>Pleasure Coin</GradientText> can do.
          </h1>
          <p className="mt-4 text-lg text-lilac/75 max-w-2xl">
            Clear, no-fluff guides for fans and creators. Pick a section from
            the left, or scan the cards below to jump in.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DOC_SECTIONS.map((section) => (
          <Link
            key={section.slug}
            href={`/docs/${section.slug}`}
            className="group"
          >
            <Card hoverable className="h-full">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h2 className="font-display text-lg font-semibold text-white">
                  {section.title}
                </h2>
                <ArrowUpRight
                  size={18}
                  className="text-lilac/40 group-hover:text-magenta flex-shrink-0 transition-colors"
                />
              </div>
              <p className="text-sm text-lilac/70">{section.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
