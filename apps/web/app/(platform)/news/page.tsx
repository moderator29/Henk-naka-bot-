import { Megaphone } from "lucide-react";
import { NewsCard } from "@/components/news/NewsCard";
import { listNews } from "@/lib/news/queries";

export const metadata = { title: "News" };

/**
 * Platform news: broadcasts published by the team from the admin panel. Each
 * item is likeable, commentable, and shareable. Real data only.
 */
export default async function NewsPage() {
  const items = await listNews();

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold text-white">
          <span className="text-gradient">News</span>
        </h1>
        <p className="mt-2 text-lilac/70">
          Announcements and updates from the Pleasure Coin team.
        </p>
      </header>

      {items.length > 0 ? (
        <div className="flex flex-col gap-5">
          {items.map((item, i) => (
            <NewsCard key={item.id} item={item} index={i} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl glass p-10 text-center flex flex-col items-center gap-4">
          <span className="h-12 w-12 rounded-2xl glass edge-light grid place-items-center text-magenta">
            <Megaphone size={22} />
          </span>
          <div>
            <p className="text-white font-medium">No news yet</p>
            <p className="text-sm text-lilac/60 mt-1">
              Platform announcements will show up here.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
