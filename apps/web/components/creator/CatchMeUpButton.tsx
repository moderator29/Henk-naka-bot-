"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * "Catch me up on what they've posted lately" — the AI summary entry point
 * (RPD §6.2). The streaming summary is produced by the Subscription
 * Intelligence / Concierge AI route in Phase 3. Until that route is wired this
 * surfaces the state honestly rather than streaming fabricated text.
 * PENDING_AI_SUMMARY.
 */
export function CatchMeUpButton({ displayName }: { displayName: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="glass"
        leftIcon={<Sparkles size={16} />}
        onClick={() => setOpen((v) => !v)}
      >
        Catch me up on {displayName.split(" ")[0]}
      </Button>
      {open && (
        <div className="glass rounded-xl p-4 text-sm text-lilac/70">
          AI recaps of recent posts activate with the AI features. You&apos;ll
          get a plain-language summary of everything new since your last visit.
        </div>
      )}
    </div>
  );
}
