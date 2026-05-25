"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Search, X, BadgeCheck, Lock, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { searchAll, type SearchResults } from "@/lib/search/actions";

type Tab = "all" | "people" | "posts" | "pveels";

const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "people", label: "People" },
  { id: "posts", label: "Posts" },
  { id: "pveels", label: "Pveels" },
];

const RECENT_KEY = "aurora.recent-search";

/**
 * Functional global search: people (name or @username, via trigram), posts,
 * and Pveels (caption match). Live + debounced, with tabs, recent searches,
 * and clear empty/no-results states. Works without the AI key.
 */
export function SearchView({ initialQuery = "" }: { initialQuery?: string }) {
  const [q, setQ] = useState(initialQuery);
  const [tab, setTab] = useState<Tab>("all");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      setRecent(JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]"));
    } catch {
      /* ignore */
    }
  }, []);

  function remember(term: string) {
    if (term.trim().length < 2) return;
    setRecent((prev) => {
      const next = [term, ...prev.filter((t) => t !== term)].slice(0, 6);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    const term = q.trim();
    if (term.length < 1) {
      setResults(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    timer.current = setTimeout(async () => {
      const r = await searchAll(term);
      setResults(r);
      setLoading(false);
      remember(term);
    }, 280);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [q]);

  const showPeople = tab === "all" || tab === "people";
  const showPosts = tab === "all" || tab === "posts";
  const showPveels = tab === "all" || tab === "pveels";
  const total =
    (results?.people.length ?? 0) +
    (results?.posts.length ?? 0) +
    (results?.pveels.length ?? 0);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-display text-3xl font-bold text-white mb-4">
        <span className="text-gradient">Search</span>
      </h1>

      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lilac/40" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search people, posts, and Pveels"
          className="h-12 w-full rounded-2xl bg-plum/60 border border-white/10 pl-11 pr-10 text-base text-white placeholder:text-lilac/40 focus:border-magenta/50 focus:outline-none focus:ring-2 focus:ring-magenta/20"
        />
        {q && (
          <button type="button" onClick={() => setQ("")} aria-label="Clear" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-lilac/40 hover:text-white">
            <X size={16} />
          </button>
        )}
      </div>

      <div role="tablist" className="mt-4 flex items-center gap-1 border-b border-white/5">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "relative px-4 py-2.5 text-sm font-medium transition-colors",
              tab === t.id ? "text-white" : "text-lilac/60 hover:text-white"
            )}
          >
            {t.label}
            {tab === t.id && <span className="absolute bottom-0 inset-x-2 h-0.5 rounded-full bg-gradient-primary" />}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {!q.trim() ? (
          recent.length > 0 ? (
            <div>
              <p className="text-xs uppercase tracking-wider text-lilac/40 mb-2">Recent</p>
              <div className="flex flex-wrap gap-2">
                {recent.map((t) => (
                  <button key={t} type="button" onClick={() => setQ(t)} className="px-3 py-1.5 rounded-full glass text-sm text-lilac/80 hover:text-white">
                    {t}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-lilac/50">Find any creator by name or @username, plus posts and Pveels.</p>
          )
        ) : loading ? (
          <p className="text-sm text-lilac/50">Searching…</p>
        ) : results && total === 0 ? (
          <p className="text-sm text-lilac/50">No results for “{q.trim()}”.</p>
        ) : (
          <div className="flex flex-col gap-6">
            {showPeople && results && results.people.length > 0 && (
              <section>
                {tab === "all" && <SectionLabel>People</SectionLabel>}
                <ul className="flex flex-col">
                  {results.people.map((p) => (
                    <li key={p.id}>
                      <Link href={`/creators/${p.username}`} className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-white/5">
                        <span className="h-10 w-10 rounded-full overflow-hidden bg-imperial grid place-items-center text-sm font-display text-white shrink-0">
                          {p.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element -- avatar from storage
                            <img src={p.avatarUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            p.displayName.slice(0, 1).toUpperCase()
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="flex items-center gap-1 text-sm font-medium text-white">
                            {p.displayName}
                            {p.verified && <BadgeCheck size={13} className="text-cyan" />}
                          </span>
                          <span className="block text-xs text-lilac/55 truncate">@{p.username}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {showPosts && results && results.posts.length > 0 && (
              <section>
                {tab === "all" && <SectionLabel>Posts</SectionLabel>}
                <ul className="flex flex-col gap-1">
                  {results.posts.map((p) => (
                    <li key={p.id}>
                      <Link href={`/creators/${p.creatorUsername}`} className="flex items-center gap-2 px-2 py-2.5 rounded-xl hover:bg-white/5">
                        {p.gated && <Lock size={14} className="text-magenta shrink-0" />}
                        <span className="text-sm text-lilac/85 truncate">{p.caption || "Untitled post"}</span>
                        <span className="ml-auto text-xs text-lilac/45 shrink-0">@{p.creatorUsername}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {showPveels && results && results.pveels.length > 0 && (
              <section>
                {tab === "all" && <SectionLabel>Pveels</SectionLabel>}
                <ul className="flex flex-col gap-1">
                  {results.pveels.map((p) => (
                    <li key={p.id}>
                      <Link href="/pveels" className="flex items-center gap-2 px-2 py-2.5 rounded-xl hover:bg-white/5">
                        <Play size={14} className="text-cyan shrink-0" fill="currentColor" />
                        <span className="text-sm text-lilac/85 truncate">{p.caption || "Pveel"}</span>
                        <span className="ml-auto text-xs text-lilac/45 shrink-0">@{p.creatorUsername}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs uppercase tracking-wider text-lilac/40 mb-1.5">{children}</p>;
}
