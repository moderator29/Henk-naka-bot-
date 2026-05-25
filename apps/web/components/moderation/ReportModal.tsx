"use client";

import { useState } from "react";
import { Modal, ModalContent } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { reportContent } from "@/lib/admin/actions";

type TargetType = "post" | "pveel" | "comment" | "message" | "user";

const REASONS = [
  "Spam or misleading",
  "Harassment or bullying",
  "Sexual content involving a minor",
  "Non-consensual content",
  "Illegal content",
  "Impersonation",
  "Other",
];

/**
 * Report content or a user. Files into the reports table for the moderation
 * queue. The reasons are tuned for an 18+ platform so severe violations are
 * easy to flag.
 */
export function ReportModal({
  targetType,
  targetId,
  targetLabel,
  onClose,
}: {
  targetType: TargetType;
  targetId: string;
  targetLabel?: string;
  onClose: () => void;
}) {
  const { push } = useToast();
  const [reason, setReason] = useState(REASONS[0]!);
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    const res = await reportContent({ targetType, targetId, reason, details: details.trim() || undefined });
    setBusy(false);
    if (res.needsAuth) {
      push({ tone: "info", title: "Sign in to report" });
      return;
    }
    if (!res.ok) {
      push({ tone: "error", title: res.error ?? "Could not submit report" });
      return;
    }
    push({ tone: "success", title: "Report submitted", description: "Our team will review it." });
    onClose();
  }

  return (
    <Modal open onOpenChange={(o) => !o && onClose()}>
      <ModalContent title={`Report ${targetLabel ?? targetType}`} className="w-[calc(100vw-2rem)] max-w-md">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-lilac/80">Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="h-11 rounded-xl bg-plum/60 border border-white/10 px-3 text-sm text-white focus:border-magenta/50 focus:outline-none"
            >
              {REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-lilac/80">Details (optional)</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="Anything that helps us review this faster"
              className="w-full resize-none rounded-xl bg-plum/60 border border-white/10 px-3 py-2.5 text-sm text-white placeholder:text-lilac/40 focus:border-magenta/50 focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="glass" onClick={onClose}>Cancel</Button>
            <Button loading={busy} onClick={submit} className="bg-red-500 hover:bg-red-500 text-white">
              Submit report
            </Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}
