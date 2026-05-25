"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * "Catch me up on what they've posted lately" — the Subscription Intelligence
 * recap entry point (RPD §3.5 / §6.2). Calls /api/ai/summary; the route returns
 * an honest pending state until the Anthropic key lands, then the real recap.
 */
export function CatchMeUpButton({
  displayName,
  username,
}: {
  displayName: string;
  username: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function run() {
    setOpen(true);
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const json = await res.json();
      setMessage(json.summary ?? json.error ?? "No recap available right now.");
    } catch {
      setMessage("Couldn't reach the recap service. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="glass"
        leftIcon={<Sparkles size={16} />}
        loading={loading}
        onClick={run}
      >
        Catch me up on {displayName.split(" ")[0]}
      </Button>
      {open && message && (
        <div className="glass edge-light rounded-xl p-4 text-sm text-lilac/75">
          {message}
        </div>
      )}
    </div>
  );
}
