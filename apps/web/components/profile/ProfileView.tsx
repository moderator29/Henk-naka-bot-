"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Settings,
  Pencil,
  Wallet,
  Share2,
  BadgeCheck,
  Lock,
  Image as ImageIcon,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatTicker } from "@/components/ui/StatTicker";
import { Modal, ModalContent } from "@/components/ui/Modal";
import { PostCard, type FeedPost } from "@/components/feed/PostCard";
import { EditProfileForm } from "@/components/profile/EditProfileForm";
import { useToast } from "@/components/ui/Toast";
import { cn, relativeTime } from "@/lib/utils";

type Tab = "posts" | "media" | "likes";

const TABS: { id: Tab; label: string }[] = [
  { id: "posts", label: "Posts" },
  { id: "media", label: "Media" },
  { id: "likes", label: "Likes" },
];

interface ProfileViewProps {
  signedIn: boolean;
  email: string | null;
  isCreator?: boolean;
  profile?: {
    displayName: string | null;
    username: string | null;
    bio: string | null;
  } | null;
  posts?: FeedPost[];
  followerCount?: number;
  followingCount?: number;
}

const HUES = ["#FF1F8F", "#B847FF", "#5DD6FF", "#2A0E5A"];
function tileGradient(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return `linear-gradient(${h % 360}deg, ${HUES[h % HUES.length]}, ${HUES[(h >> 3) % HUES.length]})`;
}

/**
 * The user's own profile hub: identity, stats, and a grid of all their posts.
 * Real profile fields, posts, and follower counts flow from Supabase when
 * signed in.
 */
export function ProfileView({
  signedIn,
  email,
  isCreator = false,
  profile,
  posts = [],
  followerCount = 0,
  followingCount = 0,
}: ProfileViewProps) {
  const [tab, setTab] = useState<Tab>("posts");
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState<FeedPost | null>(null);
  const { push } = useToast();

  const displayName =
    profile?.displayName || (signedIn ? email?.split("@")[0] ?? "You" : "You");
  const username =
    profile?.username || (signedIn ? email?.split("@")[0] ?? "you" : "you");
  const bio = profile?.bio ?? "";

  async function share() {
    const url = `${window.location.origin}/creators/${username}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: displayName, url });
        return;
      }
    } catch {
      /* user dismissed */
    }
    try {
      await navigator.clipboard.writeText(url);
      push({ tone: "success", title: "Profile link copied" });
    } catch {
      push({ tone: "info", title: "Copy this link", description: url });
    }
  }

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
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="glass-strong edge-light rounded-2xl p-6 shadow-e3"
        >
          <div className="flex flex-col sm:flex-row gap-5 sm:items-end">
            <div className="h-24 w-24 -mt-16 rounded-2xl bg-imperial ring-2 ring-magenta/40 grid place-items-center font-display text-4xl text-white flex-shrink-0">
              {displayName.slice(0, 1).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-white truncate">
                  {displayName}
                </h1>
                {isCreator && (
                  <BadgeCheck size={20} className="text-cyan flex-shrink-0" aria-label="Creator" />
                )}
              </div>
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
                  <Button variant="glass" leftIcon={<Pencil size={15} />} onClick={() => setEditing(true)}>
                    Edit
                  </Button>
                  <Button variant="glass" size="icon" aria-label="Share profile" onClick={share}>
                    <Share2 size={16} />
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
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {posts.map((p) => (
                <PostTile key={p.id} post={p} onOpen={() => setSelected(p)} />
              ))}
            </div>
          ) : (
            <EmptyTab
              icon={<Plus size={28} />}
              title="Share your first post"
              body="Photos, thoughts, drops, anything. Your posts show up here and in your followers' feeds."
              action={
                <Button asChild leftIcon={<Plus size={16} />}>
                  <Link href="/compose">Create a post</Link>
                </Button>
              }
            />
          ))}

        {tab === "media" && (
          <EmptyTab
            icon={<ImageIcon size={28} />}
            title="No media yet"
            body="Photo and video posts will appear here."
          />
        )}

        {tab === "likes" && (
          <EmptyTab
            icon={<Heart size={28} />}
            title="Nothing liked yet"
            body="Posts you like will appear here."
          />
        )}
      </div>

      {/* Wallet shortcut */}
      <div className="mx-4 sm:mx-8 mt-8">
        <Card hoverable className="flex items-center justify-between gap-4 edge-light">
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
            <Link href={isCreator ? "/dashboard" : "/settings"}>Open</Link>
          </Button>
        </Card>
      </div>

      {selected && (
        <Modal open onOpenChange={(o) => !o && setSelected(null)}>
          <ModalContent title="Post" className="w-[calc(100vw-2rem)] max-w-xl">
            <PostCard post={selected} />
          </ModalContent>
        </Modal>
      )}
    </div>
  );
}

function PostTile({ post, onOpen }: { post: FeedPost; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative text-left rounded-2xl overflow-hidden glass edge-light transition-transform duration-200 hover:-translate-y-1 hover:shadow-[var(--glow-magenta)]"
    >
      <div className="relative h-28 sm:h-32" style={{ background: tileGradient(post.id) }}>
        {post.category && (
          <span className="absolute top-2 left-2 text-[0.6rem] uppercase tracking-wider px-2 py-0.5 rounded-full bg-plum/60 text-lilac/90">
            {post.category}
          </span>
        )}
        {post.gated && (
          <span className="absolute inset-0 grid place-items-center bg-plum/40 backdrop-blur-[2px] text-white">
            <Lock size={20} />
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm text-lilac/85 line-clamp-2 min-h-[2.5rem]">
          {post.caption || "Untitled post"}
        </p>
        <time className="block mt-2 text-[0.65rem] text-lilac/40">
          {relativeTime(post.createdAt)}
        </time>
      </div>
    </button>
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

function EmptyTab({
  icon,
  title,
  body,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <Card className="text-center py-16 border-dashed border-2 border-white/10 bg-transparent">
      <div className="flex justify-center mb-4">
        <span className="h-14 w-14 rounded-2xl glass edge-light grid place-items-center text-magenta">
          {icon}
        </span>
      </div>
      <h2 className="font-display text-xl font-semibold text-white mb-2">{title}</h2>
      <p className="text-sm text-lilac/60 max-w-md mx-auto">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </Card>
  );
}
