"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Section } from "@/components/settings/AccountSettings";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { updatePrivacy } from "@/lib/profile/actions";
import { unblockUser, type BlockedUser } from "@/lib/privacy/actions";
import type { UserSettings } from "@/lib/profile/settings";

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
        checked ? "bg-gradient-primary" : "bg-white/10"
      )}
    >
      <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform", checked ? "translate-x-[22px]" : "translate-x-0.5")} />
    </button>
  );
}

function Row({ title, desc, checked, onChange }: { title: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <div>
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="text-xs text-lilac/55">{desc}</p>
      </div>
      <Switch checked={checked} onChange={onChange} label={title} />
    </div>
  );
}

/**
 * Profile & Privacy: searchability, Likes-tab visibility, online status, and
 * the block list. Toggles persist immediately; blocks are enforced for DMs
 * (migration 0012) and hide the user from search.
 */
export function PrivacySettings({
  initial,
  blocked,
}: {
  initial: UserSettings["privacy"];
  blocked: BlockedUser[];
}) {
  const router = useRouter();
  const { push } = useToast();
  const [privacy, setPrivacy] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  async function set<K extends keyof UserSettings["privacy"]>(key: K, value: boolean) {
    const next = { ...privacy, [key]: value };
    setPrivacy(next);
    setSaving(true);
    const res = await updatePrivacy(next);
    setSaving(false);
    if (!res.ok) {
      setPrivacy(privacy);
      push({ tone: "error", title: res.error ?? "Could not save" });
    }
  }

  async function unblock(u: BlockedUser) {
    setBusy(u.id);
    const res = await unblockUser(u.id);
    setBusy(null);
    if (!res.ok) {
      push({ tone: "error", title: res.error ?? "Could not unblock" });
      return;
    }
    push({ tone: "success", title: `Unblocked ${u.displayName}` });
    router.refresh();
  }

  return (
    <Section title="Profile & privacy" desc={saving ? "Saving…" : "Control who can find you and what they can see."}>
      <Row title="Appear in search" desc="Let people find you by name or @username." checked={privacy.searchable} onChange={(v) => set("searchable", v)} />
      <Row title="Show my Likes" desc="Let others see the posts you've liked." checked={privacy.showLikes} onChange={(v) => set("showLikes", v)} />
      <Row title="Show online status" desc="Show when you were recently active." checked={privacy.showOnlineStatus} onChange={(v) => set("showOnlineStatus", v)} />

      <div className="border-t border-white/5 pt-4">
        <p className="text-sm font-medium text-white mb-2">Blocked users</p>
        {blocked.length === 0 ? (
          <p className="text-xs text-lilac/55">You haven&apos;t blocked anyone. Block someone from their profile.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {blocked.map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-plum/40 px-3 py-2">
                <Link href={`/creators/${u.username}`} className="flex items-center gap-2.5 min-w-0">
                  <span className="h-8 w-8 rounded-full overflow-hidden bg-imperial grid place-items-center text-xs font-display text-white shrink-0">
                    {u.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- avatar from storage
                      <img src={u.avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      u.displayName.slice(0, 1).toUpperCase()
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm text-white truncate">{u.displayName}</span>
                    <span className="block text-xs text-lilac/50 truncate">@{u.username}</span>
                  </span>
                </Link>
                <Button variant="glass" size="sm" loading={busy === u.id} onClick={() => unblock(u)}>
                  Unblock
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Section>
  );
}
