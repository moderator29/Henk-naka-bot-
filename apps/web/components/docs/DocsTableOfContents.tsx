"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

interface DocsTableOfContentsProps {
  items: TocItem[];
}

/**
 * Right-rail "on this page" table of contents. Highlights the section that
 * currently owns the viewport via IntersectionObserver. Hidden on
 * narrow screens — the sidebar is enough on mobile.
 */
export function DocsTableOfContents({ items }: DocsTableOfContentsProps) {
  const [active, setActive] = useState<string | null>(
    items[0]?.id ?? null
  );

  useEffect(() => {
    if (items.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              (a.target as HTMLElement).offsetTop -
              (b.target as HTMLElement).offsetTop
          );
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-100px 0px -65% 0px", threshold: 0 }
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <aside
      aria-label="On this page"
      className="hidden xl:block sticky top-24 self-start w-56 flex-shrink-0"
    >
      <div className="text-xs font-semibold uppercase tracking-wider text-lilac/50 mb-3">
        On this page
      </div>
      <ol className="flex flex-col gap-1.5">
        {items.map((item) => (
          <li key={item.id} className={item.level === 3 ? "pl-3" : ""}>
            <a
              href={`#${item.id}`}
              className={cn(
                "block text-sm transition-colors",
                active === item.id
                  ? "text-magenta font-medium"
                  : "text-lilac/60 hover:text-white"
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </aside>
  );
}
