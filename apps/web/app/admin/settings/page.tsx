import { getPlatformSettings } from "@/lib/admin/queries";
import { PlatformSettingsForm } from "@/components/admin/PlatformSettingsForm";

export const metadata = { title: "Platform settings · Admin" };

export default async function AdminSettingsPage() {
  const settings = await getPlatformSettings();
  return (
    <div className="max-w-2xl">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-white">Platform settings</h1>
        <p className="text-sm text-lilac/60 mt-1">
          Feature flags and platform-wide controls. Changes are audited.
        </p>
      </header>
      <PlatformSettingsForm
        feeBps={Number((settings.platform_fee_bps as number) ?? 500)}
        maintenance={Boolean((settings.maintenance_mode as boolean) ?? false)}
        signupsEnabled={Boolean((settings.signups_enabled as boolean) ?? true)}
      />
    </div>
  );
}
