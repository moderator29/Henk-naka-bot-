import { getMaintenance } from "@/lib/platform/flags";

/** App-wide maintenance banner, driven by the platform_settings feature flag
 * (Admin → Platform settings). Renders nothing when maintenance is off. */
export async function MaintenanceBanner() {
  const m = await getMaintenance();
  if (!m.enabled) return null;
  return (
    <div className="bg-gradient-primary text-white text-center text-sm font-medium px-4 py-2">
      {m.message || "Pleasure Coin is undergoing maintenance. Some features may be unavailable."}
    </div>
  );
}
