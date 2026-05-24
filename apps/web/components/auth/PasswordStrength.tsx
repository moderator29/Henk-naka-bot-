"use client";

import { cn } from "@/lib/utils";

export function scorePassword(pw: string): number {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

const LABELS = ["Too weak", "Weak", "Fair", "Good", "Strong"] as const;
const COLORS = [
  "bg-red-500",
  "bg-red-400",
  "bg-amber-400",
  "bg-lime-400",
  "bg-emerald-400",
] as const;

/** Four-segment strength meter. Renders nothing until the user types. */
export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const score = scorePassword(password);
  return (
    <div className="flex flex-col gap-1.5" aria-live="polite">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors duration-200",
              i < score ? COLORS[score] : "bg-white/10"
            )}
          />
        ))}
      </div>
      <span className="text-xs text-lilac/50">{LABELS[score]}</span>
    </div>
  );
}
