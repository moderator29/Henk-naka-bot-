import { getSessionUser } from "@/lib/auth/session";
import { getUserPosts } from "@/lib/posts/queries";
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
  } | null = null;
  let isCreator = false;
  let posts: Awaited<ReturnType<typeof getUserPosts>> = [];
  let followerCount = 0;
  let followingCount = 0;

  if (me && configured()) {
    const supabase = createClient();
    const [{ data: row }, userPosts, followers, following] = await Promise.all([
      supabase
        .from("users")
        .select("display_name, username, bio, is_creator")
        .eq("id", me.id)
        .maybeSingle<{
          display_name: string | null;
          username: string | null;
          bio: string | null;
          is_creator: boolean | null;
        }>(),
      getUserPosts(me.id),
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
      };
      isCreator = row.is_creator ?? false;
    }
    posts = userPosts;
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
      followerCount={followerCount}
      followingCount={followingCount}
    />
  );
}
