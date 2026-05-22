import { Card } from "@/components/ui/Card";

export default function SettingsPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <header className="mb-8">
        <h1 className="font-display text-4xl font-bold text-white">
          <span className="text-gradient">Settings</span>
        </h1>
        <p className="mt-2 text-lilac/70">
          Account, notifications, privacy, connected wallets, AI preferences.
        </p>
      </header>
      <Card>
        <p className="text-sm text-lilac/60">
          Settings panels arrive alongside the auth + wallet sub-branches.
        </p>
      </Card>
    </div>
  );
}
