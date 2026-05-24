import { getSessionUser } from "@/lib/auth/session";
import { ProfileView } from "@/components/profile/ProfileView";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const me = await getSessionUser();
  return (
    <ProfileView
      signedIn={!!me}
      email={me?.email ?? null}
    />
  );
}
