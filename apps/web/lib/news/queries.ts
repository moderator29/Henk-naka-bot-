import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import type { NewsItem } from "./types";

/**
 * Real news/broadcast reads. Announcements are public; counts come from the
 * announcement_likes / announcement_comments tables, and likedByMe from the
 * viewer's own likes. Returns [] when Supabase isn't configured.
 */

function configured() {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

interface NewsRow {
  id: string;
  title: string;
  body: string;
  image_url: string | null;
  created_at: string;
  announcement_likes: { count: number }[] | null;
  announcement_comments: { count: number }[] | null;
}

export async function listNews(): Promise<NewsItem[]> {
  if (!configured()) return [];
  const supabase = createClient();
  const viewer = await getSessionUser().catch(() => null);

  const { data } = await supabase
    .from("announcements")
    .select(
      "id, title, body, image_url, created_at, announcement_likes(count), announcement_comments(count)"
    )
    .order("created_at", { ascending: false })
    .limit(50);

  const rows = (data as unknown as NewsRow[]) ?? [];
  let liked = new Set<string>();
  if (viewer && rows.length > 0) {
    const { data: myLikes } = await supabase
      .from("announcement_likes")
      .select("announcement_id")
      .eq("user_id", viewer.id)
      .in(
        "announcement_id",
        rows.map((r) => r.id)
      );
    liked = new Set((myLikes ?? []).map((l) => l.announcement_id as string));
  }

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    body: r.body,
    imageUrl: r.image_url,
    createdAt: r.created_at,
    likes: r.announcement_likes?.[0]?.count ?? 0,
    comments: r.announcement_comments?.[0]?.count ?? 0,
    likedByMe: liked.has(r.id),
  }));
}
