"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { deleteAccount } from "@/lib/profile/actions";

export function DangerZone() {
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const phrase = "delete my account";
  const ready = confirm.trim().toLowerCase() === phrase;

  async function remove() {
    if (!ready || busy) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("confirm", confirm);
      const res = await deleteAccount(fd);
      // On success the action redirects; only an error result returns here.
      if (res && !res.ok) {
        push({ tone: "error", title: res.error });
        setBusy(false);
      }
    } catch {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl p-6 flex flex-col gap-4 border border-red-500/25 bg-red-500/[0.04]">
      <div className="flex items-start gap-3">
        <span className="h-9 w-9 rounded-xl bg-red-500/10 text-red-400 grid place-items-center shrink-0">
          <AlertTriangle size={18} />
        </span>
        <div>
          <h2 className="font-display text-lg font-semibold text-white">Delete account</h2>
          <p className="text-sm text-lilac/60 mt-0.5">
            Permanently removes your profile, posts, follows, and data. This
            cannot be undone.
          </p>
        </div>
      </div>

      {!open ? (
        <div className="flex justify-end">
          <Button variant="glass" className="text-red-300 hover:text-red-200" onClick={() => setOpen(true)}>
            Delete my account
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <Input
            label={`Type "${phrase}" to confirm`}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder={phrase}
          />
          <div className="flex justify-end gap-2">
            <Button variant="glass" onClick={() => { setOpen(false); setConfirm(""); }}>
              Cancel
            </Button>
            <Button
              loading={busy}
              disabled={!ready}
              onClick={remove}
              className="bg-red-500 hover:bg-red-500 text-white"
            >
              Permanently delete
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
