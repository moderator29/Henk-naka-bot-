import { Info, AlertTriangle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DocBlock } from "@/app/(docs)/docs/content";

/**
 * Renders a stream of DocBlocks. Headings get a slug-friendly id (used by
 * DocsTableOfContents for anchor scrolling) and a visible "#" link on hover.
 */
export function DocBlocks({ blocks }: { blocks: DocBlock[] }) {
  return (
    <div className="space-y-5 text-lilac/85 text-base leading-relaxed">
      {blocks.map((block, i) => renderBlock(block, i))}
    </div>
  );
}

function renderBlock(block: DocBlock, key: number) {
  switch (block.type) {
    case "p":
      return (
        <p key={key} className="max-w-prose">
          {block.text}
        </p>
      );
    case "h2": {
      const id = slugify(block.text ?? "");
      return (
        <h2
          key={key}
          id={id}
          className="font-display text-2xl font-bold text-white mt-12 mb-2 scroll-mt-24 group"
        >
          <a
            href={`#${id}`}
            className="text-lilac/30 hover:text-magenta mr-2 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label={`Link to ${block.text}`}
          >
            #
          </a>
          {block.text}
        </h2>
      );
    }
    case "h3": {
      const id = slugify(block.text ?? "");
      return (
        <h3
          key={key}
          id={id}
          className="font-display text-lg font-semibold text-white mt-8 mb-1 scroll-mt-24"
        >
          {block.text}
        </h3>
      );
    }
    case "ul":
      return (
        <ul
          key={key}
          className="list-disc pl-6 space-y-1.5 marker:text-magenta max-w-prose"
        >
          {(block.items ?? []).map((item, j) => (
            <li key={j}>{item}</li>
          ))}
        </ul>
      );
    case "callout": {
      const Icon =
        block.tone === "warning"
          ? AlertTriangle
          : block.tone === "tip"
            ? Sparkles
            : Info;
      const tone = block.tone ?? "info";
      const toneClasses: Record<typeof tone, string> = {
        info: "border-cyan/30 text-cyan",
        tip: "border-magenta/30 text-magenta",
        warning: "border-amber-400/40 text-amber-300",
      };
      return (
        <aside
          key={key}
          className={cn(
            "glass rounded-2xl p-5 max-w-prose flex gap-3",
            toneClasses[tone]
          )}
        >
          <Icon size={20} aria-hidden="true" className="flex-shrink-0 mt-0.5" />
          <p className="text-sm text-lilac/85">{block.text}</p>
        </aside>
      );
    }
    default:
      return null;
  }
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
