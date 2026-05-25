"use client";

import { useEffect, useRef, useState } from "react";
import { Tag, Search, Check, X } from "lucide-react";
import { POST_CATEGORIES, filterCategories } from "@/lib/posts/categories";
import { cn } from "@/lib/utils";

/**
 * Searchable post-type picker. The list is long (~100), so it filters as you
 * type. Stores the chosen type in the post's category field.
 */
export function CategoryPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const results = filterCategories(q).slice(0, 60);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <div
        className={cn(
          "inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium transition-colors border",
          value
            ? "border-magenta/40 bg-magenta/10 text-white"
            : "border-white/10 bg-plum/60 text-lilac/70 hover:text-white"
        )}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="inline-flex items-center gap-1.5"
        >
          <Tag size={13} />
          {value || "Post type"}
        </button>
        {value && (
          <button
            type="button"
            aria-label="Clear type"
            onClick={() => onChange("")}
            className="ml-1 text-lilac/50 hover:text-white"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute z-30 mt-2 w-64 right-0 rounded-xl border border-white/10 bg-imperial-dark/95 backdrop-blur-xl p-2 shadow-glow">
          <div className="relative mb-2">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-lilac/40" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={`Search ${POST_CATEGORIES.length} types`}
              className="h-9 w-full rounded-lg bg-plum/60 border border-white/10 pl-8 pr-2 text-sm text-white placeholder:text-lilac/40 focus:border-magenta/50 focus:outline-none"
            />
          </div>
          <ul role="listbox" className="max-h-56 overflow-y-auto flex flex-col">
            {results.length === 0 && (
              <li className="px-2 py-2 text-xs text-lilac/50">No matching types.</li>
            )}
            {results.map((c) => (
              <li key={c}>
                <button
                  type="button"
                  role="option"
                  aria-selected={value === c}
                  onClick={() => {
                    onChange(c);
                    setOpen(false);
                    setQ("");
                  }}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-sm text-lilac/80 hover:text-white hover:bg-white/5 transition-colors"
                >
                  {c}
                  {value === c && <Check size={14} className="text-cyan" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
