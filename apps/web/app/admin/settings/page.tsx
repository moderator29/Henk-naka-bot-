import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMyRole, atLeast } from "@/lib/auth/roles";
import { PlatformSettingsForm } from "@/components/admin/PlatformSettingsForm";

export const metadata = { title: "Admin · Platform settings" };

export default async function AdminSettingsPage() {
  if (!atLeast(await getMyRole(), "admin")) redirect("/admin");

  let maintenance = { enabled: false, message: "" };
  let feeBps = 0;
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const admin = createAdminClient();
    const { data } = await admin.from("platform_settings").select("key, value").in("key", ["maintenance", "fee"]);
    for (const row of (data ?? []) as { key: string; value: Record<string, unknown> | null }[]) {
      if (row.key === "maintenance" && row.value) {
        maintenance = { enabled: !!row.value.enabled, message: (row.value.message as string) ?? "" };
      }
      if (row.key === "fee" && row.value) feeBps = Number(row.value.bps) || 0;
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-white mb-1">Platform settings</h1>
      <p className="text-sm text-lilac/60 mb-6">Feature flags and platform-wide configuration.</p>
      <PlatformSettingsForm maintenance={maintenance} feeBps={feeBps} />
    </div>
  );
}
