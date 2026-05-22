import { Card } from "@/components/ui/Card";

export default function ProfilePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <header className="mb-8">
        <h1 className="font-display text-4xl font-bold text-white">
          Your <span className="text-gradient">profile</span>
        </h1>
        <p className="mt-2 text-lilac/70">
          Manage your account, subscriptions, wallet, and (for creators) the
          dashboard.
        </p>
      </header>
      <Card>
        <p className="text-sm text-lilac/60">
          Sign in to view your profile. Authentication ships in the next
          sub-branch.
        </p>
      </Card>
    </div>
  );
}
