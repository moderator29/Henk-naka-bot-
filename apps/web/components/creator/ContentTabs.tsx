"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { cn, relativeTime } from "@/lib/utils";
import type { CreatorPostCard } from "@/lib/creators/types";

type Tab = "posts" | "media" | "nfts" | "liked";

const TABS: { id: Tab; label: string }[] = [
  { id: "posts", label: "Posts" },
  { id: "media", label: "Media" },
  { id: "nfts", label: "NFTs" },
  { id: "liked", label: "Liked" },
];

export function ContentTabs({ posts }: { posts: CreatorPostCard[] }) {
  const [tab, setTab] = useState<Tab>("posts");

  return (
    <div>
      <div
        role="tablist"
        aria-label="Creator content"
        className="flex items-center gap-1 border-b border-white/5 mb-6"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "px-4 py-3 text-sm font-medium relative transition-colors",
              tab === t.id ? "text-white" : "text-lilac/60 hover:text-white"
            )}
          >
            {t.label}
            {tab === t.id && (
              <span className="absolute bottom-0 inset-x-2 h-0.5 rounded-full bg-gradient-primary" />
            )}
          </button>
        ))}
      </div>

      {tab === "posts" ? (
        posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((p) => (
              <article
                key={p.id}
                className="glass rounded-2xl p-5 hover:-translate-y-1 hover:shadow-glow transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  {p.category && (
                    <span className="text-[0.65rem] uppercase tracking-wider text-cyan">
                      {p.category}
                    </span>
                  )}
                  {p.gated && (
                    <span className="inline-flex items-center gap-1 text-[0.65rem] text-magenta">
                      <Lock size={12} /> Tier
                    </span>
                  )}
                </div>
                <p
                  className={cn(
                    "text-sm text-lilac/85",
                    p.gated && "blur-[3px] select-none"
                  )}
                >
                  {p.caption || "—"}
                </p>
                <time className="block mt-3 text-[0.65rem] text-lilac/40">
                  {relativeTime(p.createdAt)}
                </time>
              </article>
            ))}
          </div>
        ) : (
          <EmptyTab label="No posts yet." />
        )
      ) : (
        <EmptyTab
          label={
            tab === "media"
              ? "Media gallery appears here."
              : tab === "nfts"
                ? "NFTs this creator minted appear here."
                : "Posts this creator liked appear here."
          }
        />
      )}
    </div>
  );
}

function EmptyTab({ label }: { label: string }) {
  return (
    <div className="glass rounded-2xl py-16 text-center">
      <p className="text-sm text-lilac/50">{label}</p>
    </div>
  );
}
