import { Wrench } from "lucide-react";

/** Shown across the platform when an admin has turned on maintenance mode. */
export function MaintenanceBanner() {
  return (
    <div className="sticky top-0 z-[55] flex items-center justify-center gap-2 bg-gradient-to-r from-magenta/30 to-orchid/30 border-b border-white/10 px-4 py-2 text-center text-sm text-white backdrop-blur-xl">
      <Wrench size={15} className="flex-shrink-0" />
      <span>
        Pleasure Coin is undergoing maintenance. Some features may be temporarily
        unavailable.
      </span>
    </div>
  );
}
