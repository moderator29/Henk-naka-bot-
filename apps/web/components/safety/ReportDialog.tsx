"use client";

import { useState } from "react";
import { Modal, ModalContent } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { reportContent } from "@/lib/safety/actions";
import { REPORT_REASONS, type ReportTargetType } from "@/lib/safety/types";
import { cn } from "@/lib/utils";

export function ReportDialog({
  targetType,
  targetId,
  label,
  onClose,
}: {
  targetType: ReportTargetType;
  targetId: string;
  label?: string;
  onClose: () => void;
}) {
  const { push } = useToast();
  const [reason, setReason] = useState<string>("");
  const [detail, setDetail] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!reason) return;
    setBusy(true);
    const res = await reportContent({ targetType, targetId, reason, detail: detail.trim() || undefined });
    setBusy(false);
    if (res.ok) {
      push({ tone: "success", title: "Report sent", description: "Our team will review it." });
      onClose();
    } else if (res.needsAuth) {
      push({ tone: "error", title: "Sign in to report" });
    } else {
      push({ tone: "error", title: res.error ?? "Could not send report" });
    }
  }

  return (
    <Modal open onOpenChange={(o) => !o && onClose()}>
      <ModalContent title={label ?? "Report"} className="w-[calc(100vw-2rem)] max-w-md">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-lilac/70">
            Tell us what&apos;s wrong. Reports are confidential.
          </p>
          <div className="flex flex-col gap-2">
            {REPORT_REASONS.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setReason(r.value)}
                className={cn(
                  "text-left text-sm px-3 py-2 rounded-lg border transition-colors",
                  reason === r.value
                    ? "border-magenta/50 bg-magenta/10 text-white"
                    : "border-white/10 text-lilac/75 hover:text-white hover:border-white/20"
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            rows={3}
            placeholder="Add any detail (optional)"
            className="resize-none rounded-lg bg-plum/60 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-lilac/40 focus:border-magenta/50 focus:outline-none"
          />
          <Button onClick={submit} loading={busy} disabled={!reason} className="w-full">
            Submit report
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
}
