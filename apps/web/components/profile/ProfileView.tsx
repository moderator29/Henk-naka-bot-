"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Settings, Pencil, Wallet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatTicker } from "@/components/ui/StatTicker";
import { CreatorCard } from "@/components/explore/CreatorCard";
import { BrandIcon } from "@/components/brand/BrandIcon";
import { PostCard, type FeedPost } from "@/components/feed/PostCard";
import { EditProfileForm } from "@/components/profile/EditProfileForm";
import { DEMO_CREATORS } from "@/lib/demo/data";
import { cn } from "@/lib/utils";

type Tab = "posts" | "followers" | "following" | "suggested";

const TABS: { id: Tab; label: string }[] = [
  { id: "posts", label: "Posts" },
  { id: "followers", label: "Followers" },
  { id: "following", label: "Following" },
  { id: "suggested", label: "Suggested" },
];

interface ProfileViewProps {
  signedIn: boolean;
  email: string | null;
  profile?: {
    displayName: string | null;
    username: string | null;
    bio: string | null;
  } | null;
  posts?: FeedPost[];
  followerCount?: number;
  followingCount?: number;
}

/**
 * The user's own profile hub: identity, stats, posts, social graph, and
 * recommendations. Real profile fields + posts flow from Supabase when signed
 * in; the social graph + recommendations use the labeled demo roster until the
 * follow graph is populated.
 */
export function ProfileView({
  signedIn,
  email,
  profile,
  posts = [],
  followerCount = 0,
  followingCount = 0,
}: ProfileViewProps) {
  const [tab, setTab] = useState<Tab>("posts");
  const [editing, setEditing] = useState(false);
  const displayName =
    profile?.displayName || (signedIn ? email?.split("@")[0] ?? "You" : "You");
  const username =
    profile?.username || (signedIn ? email?.split("@")[0] ?? "you" : "you");
  const bio = profile?.bio ?? "";

  const followers = DEMO_CREATORS.slice(0, 5);
  const following = DEMO_CREATORS.slice(1, 4);
  const suggested = DEMO_CREATORS;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Cover + identity */}
      <div className="relative h-40 sm:h-52 rounded-3xl overflow-hidden bg-gradient-to-br from-imperial via-plum to-imperial-dark">
        <div className="absolute inset-0 opacity-60 bg-[radial-gradient(ellipse_at_top_left,rgba(255,31,143,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(184,71,255,0.35),transparent_55%)]" />
      </div>

      <div className="relative mx-4 sm:mx-8 -mt-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-strong rounded-2xl p-6 shadow-glow"
        >
          <div className="flex flex-col sm:flex-row gap-5 sm:items-end">
            <div className="h-24 w-24 -mt-16 rounded-2xl bg-imperial ring-2 ring-magenta/40 grid place-items-center font-display text-4xl text-white flex-shrink-0">
              {displayName.slice(0, 1).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
                {displayName}
              </h1>
              <p className="text-sm text-lilac/60">@{username}</p>
              <p className="mt-2 text-sm text-lilac/80 max-w-lg">
                {bio ||
                  (signedIn
                    ? "Add a bio to tell people what you're about."
                    : "Sign in to claim your profile, follow creators, and start posting.")}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {signedIn ? (
                <>
                  <Button
                    variant="glass"
                    leftIcon={<Pencil size={15} />}
                    onClick={() => setEditing(true)}
                  >
                    Edit
                  </Button>
                  <Button variant="glass" size="icon" aria-label="Settings" asChild>
                    <Link href="/settings">
                      <Settings size={16} />
                    </Link>
                  </Button>
                </>
              ) : (
                <Button asChild>
                  <Link href="/verify?next=/signup">Sign in</Link>
                </Button>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-white/5 pt-5">
            <Stat label="Posts" value={posts.length} />
            <Stat label="Followers" value={followerCount} />
            <Stat label="Following" value={followingCount} />
          </div>
        </motion.div>
      </div>

      {editing && (
        <EditProfileForm
          initial={{ displayName, username, bio }}
          onClose={() => setEditing(false)}
        />
      )}

      {/* Tabs */}
      <div className="mx-4 sm:mx-8 mt-8">
        <div role="tablist" aria-label="Profile sections" className="flex items-center gap-1 border-b border-white/5 mb-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "relative px-4 py-3 text-sm font-medium transition-colors",
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

        {tab === "posts" &&
          (posts.length > 0 ? (
            <div className="flex flex-col gap-5">
              {posts.map((p, i) => (
                <PostCard key={p.id} post={p} index={i} />
              ))}
            </div>
          ) : (
            <Card className="text-center py-16 border-dashed border-2 border-white/10 bg-transparent">
              <div className="flex justify-center mb-5">
                <BrandIcon name="sparkle" size={72} />
              </div>
              <h2 className="font-display text-xl font-semibold text-white mb-2">
                Share your first post
              </h2>
              <p className="text-sm text-lilac/60 max-w-md mx-auto mb-5">
                Photos, thoughts, drops, anything. Your posts show up here and
                in your followers&apos; feeds.
              </p>
              <Button asChild leftIcon={<Plus size={16} />}>
                <Link href="/compose">Create a post</Link>
              </Button>
            </Card>
          ))}

        {tab === "followers" && <PeopleGrid people={followers} preview />}
        {tab === "following" && <PeopleGrid people={following} preview />}

        {tab === "suggested" && (
          <>
            <p className="text-sm text-lilac/60 mb-4">
              Creators we think you&apos;ll love, picked by vibe.
            </p>
            <PeopleGrid people={suggested} />
          </>
        )}
      </div>

      {/* Wallet shortcut */}
      <div className="mx-4 sm:mx-8 mt-8">
        <Card hoverable className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="h-10 w-10 rounded-xl glass grid place-items-center text-cyan">
              <Wallet size={18} />
            </span>
            <div>
              <h3 className="font-display font-semibold text-white">Wallet & earnings</h3>
              <p className="text-xs text-lilac/60">Manage connected wallets, tips, and payouts.</p>
            </div>
          </div>
          <Button variant="glass" asChild>
            <Link href="/settings">Open</Link>
          </Button>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="font-display text-xl sm:text-2xl font-semibold text-white">
        <StatTicker value={value} />
      </div>
      <div className="text-[0.7rem] uppercase tracking-wider text-lilac/50 mt-0.5">
        {label}
      </div>
    </div>
  );
}

function PeopleGrid({
  people,
  preview = false,
}: {
  people: typeof DEMO_CREATORS;
  preview?: boolean;
}) {
  return (
    <>
      {preview && (
        <p className="text-xs text-lilac/40 mb-3">
          Preview, real connections appear here as you follow and get followed.
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {people.map((c) => (
          <CreatorCard key={c.username} creator={c} />
        ))}
      </div>
    </>
  );
}
