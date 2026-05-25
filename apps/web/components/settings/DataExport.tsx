"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Section } from "@/components/settings/AccountSettings";

/**
 * GDPR data export. Downloads a JSON file of everything the platform holds
 * about the signed-in user (profile, posts, engagement, messages, and more).
 */
export function DataExport() {
  const { push } = useToast();
  const [busy, setBusy] = useState(false);

  async function download() {
    setBusy(true);
    try {
      const res = await fetch("/api/account/export");
      if (!res.ok) {
        push({ tone: "error", title: "Could not prepare your export. Try again." });
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pleasure-coin-data-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      push({ tone: "success", title: "Your data export is downloading" });
    } catch {
      push({ tone: "error", title: "Could not prepare your export. Try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Section
      title="Download your data"
      desc="Export a copy of your personal data as a JSON file: profile, posts, engagement, subscriptions, and messages you've sent."
    >
      <div className="flex justify-end">
        <Button
          variant="glass"
          leftIcon={<Download size={16} />}
          loading={busy}
          onClick={download}
        >
          Export my data
        </Button>
      </div>
    </Section>
  );
}
