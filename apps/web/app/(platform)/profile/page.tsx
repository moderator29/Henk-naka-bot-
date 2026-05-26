import { getSessionUser } from "@/lib/auth/session";
import { getUserPosts, getLikedPosts } from "@/lib/posts/queries";
import { createClient } from "@/lib/supabase/server";
import { ProfileView } from "@/components/profile/ProfileView";

export const metadata = { title: "Profile" };

function configured() {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export default async function ProfilePage() {
  const me = await getSessionUser();

  let profile: {
    displayName: string | null;
    username: string | null;
    bio: string | null;
    avatarUrl: string | null;
    coverUrl: string | null;
  } | null = null;
  let isCreator = false;
  let posts: Awaited<ReturnType<typeof getUserPosts>> = [];
  let likedPosts: Awaited<ReturnType<typeof getLikedPosts>> = [];
  let followerCount = 0;
  let followingCount = 0;

  if (me && configured()) {
    const supabase = createClient();
    const [{ data: row }, userPosts, userLikes, followers, following] = await Promise.all([
      supabase
        .from("users")
        .select("display_name, username, bio, is_creator, avatar_url, cover_url")
        .eq("id", me.id)
        .maybeSingle<{
          display_name: string | null;
          username: string | null;
          bio: string | null;
          is_creator: boolean | null;
          avatar_url: string | null;
          cover_url: string | null;
        }>(),
      getUserPosts(me.id),
      getLikedPosts(me.id),
      supabase
        .from("follows")
        .select("follower_id", { count: "exact", head: true })
        .eq("following_id", me.id),
      supabase
        .from("follows")
        .select("following_id", { count: "exact", head: true })
        .eq("follower_id", me.id),
    ]);
    if (row) {
      profile = {
        displayName: row.display_name,
        username: row.username,
        bio: row.bio,
        avatarUrl: row.avatar_url,
        coverUrl: row.cover_url,
      };
      isCreator = row.is_creator ?? false;
    }
    posts = userPosts;
    likedPosts = userLikes;
    followerCount = followers.count ?? 0;
    followingCount = following.count ?? 0;
  }

  return (
    <ProfileView
      signedIn={!!me}
      email={me?.email ?? null}
      isCreator={isCreator}
      profile={profile}
      posts={posts}
      likedPosts={likedPosts}
      followerCount={followerCount}
      followingCount={followingCount}
    />
  );
}
