"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

/** Download a JSON export of all your data (GDPR). */
export function DataExport() {
  const { push } = useToast();
  const [busy, setBusy] = useState(false);

  async function download() {
    setBusy(true);
    try {
      const res = await fetch("/api/account/export");
      if (!res.ok) {
        push({ tone: "error", title: "Could not export right now." });
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "pleasure-coin-data.json";
      a.click();
      URL.revokeObjectURL(url);
      push({ tone: "success", title: "Export downloaded" });
    } catch {
      push({ tone: "error", title: "Export failed. Try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-white">Download your data</p>
        <p className="text-xs text-lilac/55 mt-0.5">
          A full JSON export of your profile, posts, follows, and activity.
        </p>
      </div>
      <Button variant="glass" size="sm" loading={busy} onClick={download} leftIcon={<Download size={14} />}>
        Export
      </Button>
    </div>
  );
}
