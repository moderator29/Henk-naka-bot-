import { Card } from "@/components/ui/Card";
import { ReplayOnboardingAction } from "@/components/onboarding/ReplayOnboardingAction";

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

      <div className="flex flex-col gap-4">
        <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-semibold text-white">
                Replay the welcome tour
              </h2>
              <p className="mt-1 text-sm text-lilac/60">
                15 cards covering everything Pleasure Coin can do. Take it
                again any time.
              </p>
            </div>
            <ReplayOnboardingAction />
          </div>
        </Card>

        <Card>
          <p className="text-sm text-lilac/60">
            Account, notifications, privacy, and wallet panels arrive
            alongside the auth + wallet sub-branches.
          </p>
        </Card>
      </div>
    </div>
  );
}
