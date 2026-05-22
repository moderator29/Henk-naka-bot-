import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { DOC_SECTIONS } from "../content";
import { DocBlocks, slugify } from "@/components/docs/DocBlocks";
import { DocsTableOfContents } from "@/components/docs/DocsTableOfContents";

interface SectionPageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return DOC_SECTIONS.map((s) => ({ slug: s.slug }));
}

export function generateMetadata({ params }: SectionPageProps): Metadata {
  const section = DOC_SECTIONS.find((s) => s.slug === params.slug);
  if (!section) return { title: "Docs" };
  return {
    title: section.title,
    description: section.description,
  };
}

export default function DocsSectionPage({ params }: SectionPageProps) {
  const index = DOC_SECTIONS.findIndex((s) => s.slug === params.slug);
  if (index === -1) notFound();
  const section = DOC_SECTIONS[index]!;

  const toc = section.blocks
    .filter((b) => b.type === "h2" || b.type === "h3")
    .map((b) => ({
      id: slugify(b.text ?? ""),
      text: b.text ?? "",
      level: b.type === "h2" ? (2 as const) : (3 as const),
    }));

  const prev = index > 0 ? DOC_SECTIONS[index - 1] : null;
  const next =
    index < DOC_SECTIONS.length - 1 ? DOC_SECTIONS[index + 1] : null;

  return (
    <div className="grid xl:grid-cols-[1fr_14rem] gap-12">
      <article>
        <Link
          href="/docs"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-lilac/60 hover:text-white mb-6"
        >
          <ArrowLeft size={14} />
          All docs
        </Link>

        <header className="mb-8">
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white leading-tight tracking-tight">
            {section.title}
          </h1>
          <p className="mt-3 text-lg text-lilac/70 max-w-2xl">
            {section.description}
          </p>
        </header>

        <DocBlocks blocks={section.blocks} />

        <nav
          aria-label="Section navigation"
          className="mt-16 pt-8 border-t border-white/5 flex flex-wrap items-center justify-between gap-4"
        >
          {prev ? (
            <Link
              href={`/docs/${prev.slug}`}
              className="group inline-flex items-center gap-2 text-sm text-lilac/70 hover:text-white"
            >
              <ArrowLeft size={16} />
              <span>
                <span className="block text-[0.65rem] uppercase tracking-wider text-lilac/40">
                  Previous
                </span>
                <span className="block font-medium">{prev.title}</span>
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={`/docs/${next.slug}`}
              className="group inline-flex items-center gap-2 text-sm text-lilac/70 hover:text-white text-right"
            >
              <span>
                <span className="block text-[0.65rem] uppercase tracking-wider text-lilac/40">
                  Next
                </span>
                <span className="block font-medium">{next.title}</span>
              </span>
              <ArrowRight size={16} />
            </Link>
          )}
        </nav>
      </article>

      <DocsTableOfContents items={toc} />
    </div>
  );
}
