"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { DOC_SECTIONS } from "@/app/(docs)/docs/content";

/**
 * Docs left rail.
 *
 * - Lists every section in display order.
 * - Search filters the list client-side (title + description match) to keep
 *   things instant. Real full-text search across body content lands when the
 *   docs are indexed server-side in a later phase.
 */
export function DocsSidebar() {
  const pathname = usePathname() ?? "";
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DOC_SECTIONS;
    return DOC_SECTIONS.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <aside
      aria-label="Documentation"
      className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto py-8 lg:py-12"
    >
      <div className="relative mb-4">
        <label htmlFor="docs-search" className="sr-only">
          Search documentation
        </label>
        <Search
          size={14}
          aria-hidden="true"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-lilac/40 pointer-events-none"
        />
        <input
          id="docs-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search docs…"
          className="w-full h-9 pl-8 pr-3 rounded-lg bg-plum/60 border border-white/10 text-xs text-white placeholder:text-lilac/40 focus:border-magenta/50 focus:outline-none focus:ring-2 focus:ring-magenta/20"
        />
      </div>

      <nav>
        <ul className="flex flex-col gap-0.5">
          {filtered.map((section) => {
            const href = `/docs/${section.slug}`;
            const active = pathname === href;
            return (
              <li key={section.slug}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "block px-3 py-2 rounded-lg text-sm transition-colors",
                    active
                      ? "bg-gradient-primary text-white shadow-glow font-medium"
                      : "text-lilac/70 hover:text-white hover:bg-white/5"
                  )}
                >
                  {section.title}
                </Link>
              </li>
            );
          })}
          {filtered.length === 0 && (
            <li className="px-3 py-4 text-xs text-lilac/50">No results.</li>
          )}
        </ul>
      </nav>
    </aside>
  );
}
