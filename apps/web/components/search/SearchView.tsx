"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, BadgeCheck, Lock, Clapperboard, FileText } from "lucide-react";
import { globalSearch, type SearchResults } from "@/lib/search/actions";
import { cn } from "@/lib/utils";

type Tab = "people" | "posts" | "pveels";

/** Keyword search across people, posts, and Pveels. Debounced, live results. */
export function SearchView() {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<Tab>("people");
  const [results, setResults] = useState<SearchResults>({ people: [], posts: [], pveels: [] });
  const [loading, setLoading] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    clearTimeout(debounce.current);
    if (q.trim().length < 1) {
      setResults({ people: [], posts: [], pveels: [] });
      return;
    }
    setLoading(true);
    debounce.current = setTimeout(async () => {
      setResults(await globalSearch(q));
      setLoading(false);
    }, 250);
    return () => clearTimeout(debounce.current);
  }, [q]);

  const counts = {
    people: results.people.length,
    posts: results.posts.length,
    pveels: results.pveels.length,
  };
  const tabs: { id: Tab; label: string }[] = [
    { id: "people", label: `People${counts.people ? ` (${counts.people})` : ""}` },
    { id: "posts", label: `Posts${counts.posts ? ` (${counts.posts})` : ""}` },
    { id: "pveels", label: `Pveels${counts.pveels ? ` (${counts.pveels})` : ""}` },
  ];

  const hasQuery = q.trim().length > 0;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="relative mb-5">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-lilac/40" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search people, posts, and Pveels"
          className="h-12 w-full rounded-2xl bg-white/[0.04] border border-white/10 pl-11 pr-4 text-base text-white placeholder:text-lilac/40 focus:border-magenta/50 focus:outline-none focus:ring-2 focus:ring-magenta/20"
        />
      </div>

      {hasQuery && (
        <div role="tablist" className="flex items-center gap-1 border-b border-white/5 mb-4">
          {tabs.map((t) => (
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
      )}

      {!hasQuery ? (
        <p className="text-sm text-lilac/50 text-center py-12">
          Search for creators, posts, and Pveels across the platform.
        </p>
      ) : loading ? (
        <p className="text-sm text-lilac/50 text-center py-8">Searching…</p>
      ) : (
        <div className="flex flex-col gap-2">
          {tab === "people" &&
            (results.people.length === 0 ? (
              <Empty label="No people found." />
            ) : (
              results.people.map((p) => (
                <Link
                  key={p.id}
                  href={`/creators/${p.username}`}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <span className="h-11 w-11 rounded-full overflow-hidden bg-gradient-primary grid place-items-center text-white font-semibold flex-shrink-0">
                    {p.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      p.displayName.charAt(0).toUpperCase()
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 text-white font-medium truncate">
                      {p.displayName}
                      {p.verified && <BadgeCheck size={14} className="text-cyan flex-shrink-0" />}
                    </span>
                    <span className="block text-xs text-lilac/50 truncate">@{p.username}</span>
                  </span>
                </Link>
              ))
            ))}

          {(tab === "posts" ? results.posts : tab === "pveels" ? results.pveels : []).map((p) => (
            <Link
              key={p.id}
              href={`/creators/${p.creatorUsername}`}
              className="flex items-start gap-3 p-3 rounded-xl glass hover:bg-white/5 transition-colors"
            >
              <span className="h-9 w-9 rounded-lg grid place-items-center bg-white/5 text-lilac/60 flex-shrink-0">
                {p.isVideo ? <Clapperboard size={16} /> : <FileText size={16} />}
              </span>
              <span className="min-w-0">
                <span className="block text-sm text-white truncate">{p.caption || "(no caption)"}</span>
                <span className="flex items-center gap-1.5 text-xs text-lilac/50">
                  by {p.creatorName} {p.gated && <Lock size={11} className="text-magenta" />}
                </span>
              </span>
            </Link>
          ))}
          {tab === "posts" && results.posts.length === 0 && <Empty label="No posts found." />}
          {tab === "pveels" && results.pveels.length === 0 && <Empty label="No Pveels found." />}
        </div>
      )}
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <p className="text-sm text-lilac/50 text-center py-8">{label}</p>;
}
