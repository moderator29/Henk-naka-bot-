import Link from "next/link";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PostCard } from "@/components/feed/PostCard";
import { getSessionUser } from "@/lib/auth/session";
import { getBookmarkedPosts } from "@/lib/posts/queries";

export const metadata = { title: "Bookmarks" };

export default async function BookmarksPage() {
  const me = await getSessionUser();
  const posts = me ? await getBookmarkedPosts(me.id) : [];

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold text-white">
          <span className="text-gradient">Bookmarks</span>
        </h1>
        <p className="mt-2 text-lilac/70">Posts you saved to come back to.</p>
      </header>

      {posts.length > 0 ? (
        <div className="flex flex-col gap-5">
          {posts.map((p, i) => (
            <PostCard key={p.id} post={p} index={i} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl glass p-10 text-center flex flex-col items-center gap-4">
          <span className="h-12 w-12 rounded-2xl glass edge-light grid place-items-center text-cyan">
            <Bookmark size={22} />
          </span>
          <div>
            <p className="text-white font-medium">Nothing saved yet</p>
            <p className="text-sm text-lilac/60 mt-1">
              Tap the bookmark icon on any post to save it here.
            </p>
          </div>
          <Button asChild>
            <Link href="/explore">Discover posts</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
