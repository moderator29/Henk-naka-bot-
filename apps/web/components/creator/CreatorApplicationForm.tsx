"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { submitCreatorApplication } from "@/lib/safety/actions";

export function CreatorApplicationForm() {
  const router = useRouter();
  const { push } = useToast();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [categories, setCategories] = useState("");
  const [payoutWallet, setPayoutWallet] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    if (!displayName.trim()) return setError("Add a creator name.");
    setBusy(true);
    const res = await submitCreatorApplication({
      displayName: displayName.trim(),
      bio: bio.trim() || undefined,
      categories: categories
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
        .slice(0, 8),
      payoutWallet: payoutWallet.trim() || undefined,
    });
    setBusy(false);
    if (res.ok) {
      push({ tone: "success", title: "Application submitted" });
      router.refresh();
    } else if (res.needsAuth) {
      push({ tone: "error", title: "Sign in to apply" });
    } else {
      setError(res.error ?? "Could not submit. Try again.");
    }
  }

  return (
    <Card className="edge-light flex flex-col gap-4">
      <Field label="Creator name">
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="The name fans will see"
          className={inputCls}
        />
      </Field>
      <Field label="About you">
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          placeholder="What you create, your vibe, what subscribers get"
          className={`${inputCls} resize-none`}
        />
      </Field>
      <Field label="Categories" hint="Comma separated, up to 8">
        <input
          value={categories}
          onChange={(e) => setCategories(e.target.value)}
          placeholder="e.g. fitness, lifestyle, art"
          className={inputCls}
        />
      </Field>
      <Field label="Payout wallet" hint="Where you'll receive $NSFW (optional, add later)">
        <input
          value={payoutWallet}
          onChange={(e) => setPayoutWallet(e.target.value)}
          placeholder="0x…"
          className={`${inputCls} font-mono`}
        />
      </Field>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <Button onClick={submit} loading={busy} size="lg">
        Submit application
      </Button>
      <p className="text-xs text-lilac/45">
        Applications are reviewed by our team. You&apos;ll be notified when
        you&apos;re approved.
      </p>
    </Card>
  );
}

const inputCls =
  "w-full rounded-lg bg-plum/60 border border-white/10 px-3 py-2.5 text-sm text-white placeholder:text-lilac/40 focus:border-magenta/50 focus:outline-none";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-white">
        {label}
        {hint && <span className="ml-2 text-xs font-normal text-lilac/45">{hint}</span>}
      </span>
      {children}
    </label>
  );
}
