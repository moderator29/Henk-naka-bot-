"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { PostCard, type FeedPost } from "./PostCard";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/**
 * Home feed with two tabs: "For you" shows every post on the platform (the
 * default, so new users always have something to see), "Following" shows posts
 * from creators the user follows plus their own. Both are fetched on the server
 * and switched client-side, with honest empty states.
 */
export function FeedTabs({
  forYou,
  following,
  signedIn,
}: {
  forYou: FeedPost[];
  following: FeedPost[];
  signedIn: boolean;
}) {
  const [tab, setTab] = useState<"forYou" | "following">("forYou");
  const posts = tab === "forYou" ? forYou : following;

  return (
    <>
      <div className="mb-5 flex items-center gap-1 rounded-2xl glass p-1">
        <TabButton active={tab === "forYou"} onClick={() => setTab("forYou")}>
          For you
        </TabButton>
        <TabButton active={tab === "following"} onClick={() => setTab("following")}>
          Following
        </TabButton>
      </div>

      {posts.length > 0 ? (
        <div className="flex flex-col gap-5">
          {posts.map((p, i) => (
            <PostCard key={p.id} post={p} index={i} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl glass edge-light p-10 text-center">
          <p className="text-white font-medium">
            {tab === "following" ? "Nothing from your follows yet" : "No posts yet"}
          </p>
          <p className="mt-1 text-sm text-lilac/60">
            {tab === "following"
              ? "Follow creators and their posts land here."
              : signedIn
                ? "Be the first, share a post."
                : "Sign in to start posting and following."}
          </p>
          <Button asChild className="mt-4" rightIcon={<ArrowRight size={16} />}>
            <Link href={tab === "following" ? "/explore" : "/compose"}>
              {tab === "following" ? "Discover creators" : "Create a post"}
            </Link>
          </Button>
        </div>
      )}
    </>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex-1 h-9 rounded-xl text-sm font-semibold transition-colors",
        active ? "bg-gradient-primary text-white shadow-glow" : "text-lilac/70 hover:text-white"
      )}
    >
      {children}
    </button>
  );
}
