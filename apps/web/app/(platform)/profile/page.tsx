import { getSessionUser } from "@/lib/auth/session";
import {
  getUserPosts,
  getUserMediaPosts,
  getUserLikedPosts,
} from "@/lib/posts/queries";
import { getCreatorPveels } from "@/lib/pveels/queries";
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
  let mediaPosts: Awaited<ReturnType<typeof getUserMediaPosts>> = [];
  let likedPosts: Awaited<ReturnType<typeof getUserLikedPosts>> = [];
  let pveels: Awaited<ReturnType<typeof getCreatorPveels>> = [];
  let followerCount = 0;
  let followingCount = 0;
  let isSubscriber = false;

  if (me && configured()) {
    const supabase = createClient();
    const [
      { data: row },
      userPosts,
      userMedia,
      userLikes,
      creatorPveels,
      followers,
      following,
      subs,
    ] = await Promise.all([
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
      getUserMediaPosts(me.id),
      getUserLikedPosts(me.id),
      getCreatorPveels(me.id, me.id),
      supabase
        .from("follows")
        .select("follower_id", { count: "exact", head: true })
        .eq("following_id", me.id),
      supabase
        .from("follows")
        .select("following_id", { count: "exact", head: true })
        .eq("follower_id", me.id),
      supabase
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("fan_id", me.id)
        .gt("expires_at", new Date().toISOString()),
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
    mediaPosts = userMedia;
    likedPosts = userLikes;
    pveels = creatorPveels;
    followerCount = followers.count ?? 0;
    followingCount = following.count ?? 0;
    isSubscriber = (subs.count ?? 0) > 0;
  }

  return (
    <ProfileView
      signedIn={!!me}
      email={me?.email ?? null}
      isCreator={isCreator}
      isSubscriber={isSubscriber}
      profile={profile}
      posts={posts}
      mediaPosts={mediaPosts}
      likedPosts={likedPosts}
      pveels={pveels}
      followerCount={followerCount}
      followingCount={followingCount}
    />
  );
}
