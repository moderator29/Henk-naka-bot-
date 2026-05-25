"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { updatePreferences, resetAiMemory } from "@/lib/profile/actions";
import type { UserSettings } from "@/lib/profile/settings";
import { Section } from "./AccountSettings";
import { cn } from "@/lib/utils";

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
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
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-200",
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

function Row({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        {desc && <p className="text-xs text-lilac/55">{desc}</p>}
      </div>
      <Switch checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

export function PreferencesSettings({ initial }: { initial: UserSettings }) {
  const { push } = useToast();
  const [s, setS] = useState<UserSettings>(initial);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  async function resetMemory() {
    setResetting(true);
    const res = await resetAiMemory();
    setResetting(false);
    push(
      res.ok
        ? { tone: "success", title: "Personalization reset" }
        : { tone: "error", title: res.error ?? "Could not reset" }
    );
  }

  const setNotif = (k: keyof UserSettings["notifications"], v: boolean) =>
    setS((p) => ({ ...p, notifications: { ...p.notifications, [k]: v } }));
  const setAi = (k: keyof UserSettings["ai"], v: boolean) =>
    setS((p) => ({ ...p, ai: { ...p.ai, [k]: v } }));

  async function save() {
    setSaving(true);
    try {
      const fd = new FormData();
      if (s.notifications.follows) fd.set("notif_follows", "on");
      if (s.notifications.posts) fd.set("notif_posts", "on");
      if (s.notifications.tips) fd.set("notif_tips", "on");
      if (s.notifications.renewals) fd.set("notif_renewals", "on");
      if (s.ai.concierge) fd.set("ai_concierge", "on");
      if (s.ai.search) fd.set("ai_search", "on");
      if (s.ai.copilot) fd.set("ai_copilot", "on");
      fd.set("language", s.language);
      const res = await updatePreferences(fd);
      push(
        res.ok
          ? { tone: "success", title: "Preferences saved" }
          : { tone: "error", title: res.error ?? "Could not save" }
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Section title="Notifications" desc="Choose what you hear about.">
        <Row label="New followers" checked={s.notifications.follows} onChange={(v) => setNotif("follows", v)} />
        <Row label="Posts from creators you subscribe to" checked={s.notifications.posts} onChange={(v) => setNotif("posts", v)} />
        <Row label="Tips received" checked={s.notifications.tips} onChange={(v) => setNotif("tips", v)} />
        <Row label="Subscription renewal reminders" checked={s.notifications.renewals} onChange={(v) => setNotif("renewals", v)} />
      </Section>

      <Section title="AI features" desc="Aura and the AI tools across the platform.">
        <Row label="Discovery Concierge" desc="Aura builds and refines your feed from your interests and follows." checked={s.ai.concierge} onChange={(v) => setAi("concierge", v)} />
        <Row label="Smart Search" desc="Natural-language search across the platform." checked={s.ai.search} onChange={(v) => setAi("search", v)} />
        <Row label="Creator Co-Pilot" desc="Reply suggestions and creator tools." checked={s.ai.copilot} onChange={(v) => setAi("copilot", v)} />
        <div className="border-t border-white/5 pt-3 flex items-center justify-between gap-4">
          <p className="text-xs text-lilac/55">
            Aura remembers your tastes to personalize recommendations. You can clear that anytime.
          </p>
          <Button variant="glass" size="sm" loading={resetting} onClick={resetMemory}>
            Reset personalization
          </Button>
        </div>
      </Section>

      <Section title="Language" desc="Display language for the interface.">
        <select
          value={s.language}
          onChange={(e) => setS((p) => ({ ...p, language: e.target.value }))}
          className="h-11 w-full sm:w-64 rounded-xl bg-plum/60 border border-white/10 px-3 text-base text-white focus:border-magenta/50 focus:outline-none"
        >
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
          <option value="pt">Português</option>
          <option value="ja">日本語</option>
        </select>
        <div className="flex justify-end">
          <Button loading={saving} onClick={save}>
            Save preferences
          </Button>
        </div>
      </Section>
    </>
  );
}
