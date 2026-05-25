import { Gem } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The Subscriber badge, shown wherever an active subscriber appears (profile
 * header, name). Brand gradient pill so it reads as premium, never loud.
 */
export function SubscriberBadge({
  className,
  withLabel = false,
  size = 14,
}: {
  className?: string;
  withLabel?: boolean;
  size?: number;
}) {
  if (withLabel) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-gradient-primary px-2 py-0.5 text-[0.65rem] font-semibold text-white",
          className
        )}
      >
        <Gem size={size - 2} /> Subscriber
      </span>
    );
  }
  return (
    <span
      aria-label="Subscriber"
      title="Subscriber"
      className={cn("inline-grid place-items-center text-magenta", className)}
    >
      <Gem size={size} />
    </span>
  );
}
