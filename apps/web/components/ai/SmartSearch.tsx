"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { Search, Sparkles, Loader2 } from "lucide-react";

interface SearchResult {
  kind: "creator" | "post";
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

/**
 * Smart Search input for the platform top bar (RPD §3.3). Submits the
 * natural-language query to /api/ai/search, which parses it via Claude and
 * runs it against Supabase (pg_trgm fallback on low confidence). Renders
 * results in a dropdown. Honest empty/needs-auth states, no fabricated hits.
 */
export function SmartSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [mode, setMode] = useState<"ai" | "fulltext" | null>(null);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLFormElement>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setNote(null);
    setResults(null);
    setOpen(true);
    try {
      const res = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      if (res.status === 401) {
        setNote("Sign in to search.");
        return;
      }
      if (!res.ok) {
        setNote("Search is unavailable right now.");
        return;
      }
      const data = (await res.json()) as {
        mode: "ai" | "fulltext";
        results: SearchResult[];
      };
      setMode(data.mode);
      setResults(data.results ?? []);
    } catch {
      setNote("Couldn't reach search.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      ref={ref}
      onSubmit={onSubmit}
      className="flex-1 relative max-w-xl"
      onBlur={(e) => {
        if (!ref.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <label htmlFor="smart-search" className="sr-only">
        Search Pleasure Coin
      </label>
      {loading ? (
        <Loader2
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-magenta animate-spin pointer-events-none"
        />
      ) : (
        <Search
          size={16}
          aria-hidden="true"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-lilac/40 pointer-events-none"
        />
      )}
      <input
        id="smart-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results && setOpen(true)}
        placeholder="Ask anything… “creators under 1k who post weekly”"
        className="w-full h-10 pl-9 pr-3 rounded-xl bg-plum/60 border border-white/10 text-sm text-white placeholder:text-lilac/40 focus:border-magenta/50 focus:outline-none focus:ring-2 focus:ring-magenta/20"
      />

      {open && (results !== null || note) && (
        <div className="absolute top-12 inset-x-0 glass-strong rounded-2xl shadow-glass overflow-hidden z-50 max-h-96 overflow-y-auto">
          {note ? (
            <p className="px-4 py-6 text-center text-sm text-lilac/60">{note}</p>
          ) : results && results.length > 0 ? (
            <>
              {mode === "ai" && (
                <div className="flex items-center gap-1.5 px-4 py-2 text-[0.65rem] uppercase tracking-wider text-magenta border-b border-white/5">
                  <Sparkles size={11} /> AI-parsed
                </div>
              )}
              <ul className="divide-y divide-white/5">
                {results.map((r) => (
                  <li key={`${r.kind}-${r.id}`}>
                    <Link
                      href={r.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-white/5"
                    >
                      <span className="text-sm text-white truncate">{r.title}</span>
                      <span className="text-xs text-lilac/50 flex-shrink-0">
                        {r.subtitle}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="px-4 py-6 text-center text-sm text-lilac/60">
              No matches. Try different words.
            </p>
          )}
        </div>
      )}
    </form>
  );
}
