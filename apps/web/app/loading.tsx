import { AuroraBackground } from "@/components/brand/AuroraBackground";
import { Logo } from "@/components/brand/Logo";

/**
 * Root-level loading state. App Router shows this for any route that
 * suspends without its own loading.tsx — keeps the aurora atmosphere alive
 * while content streams in instead of flashing a blank page.
 */
export default function RootLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading Pleasure Coin"
      className="fixed inset-0 grid place-items-center"
    >
      <AuroraBackground variant="magenta" intensity="subtle" />
      <div className="relative flex flex-col items-center gap-6">
        <div className="animate-pulse-glow">
          <Logo href={null} size="lg" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-magenta animate-pulse" />
          <span
            className="h-2 w-2 rounded-full bg-orchid animate-pulse"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="h-2 w-2 rounded-full bg-cyan animate-pulse"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}
