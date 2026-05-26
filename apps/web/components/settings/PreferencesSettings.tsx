"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { useTranslate } from "@/components/i18n/TranslateController";
import { updatePreferences } from "@/lib/profile/actions";
import { LANGUAGES } from "@/lib/i18n/languages";
import type { UserSettings } from "@/lib/profile/settings";
import { Section } from "./AccountSettings";
import { cn } from "@/lib/utils";

function toFormData(s: UserSettings): FormData {
  const fd = new FormData();
  if (s.notifications.follows) fd.set("notif_follows", "on");
  if (s.notifications.posts) fd.set("notif_posts", "on");
  if (s.notifications.tips) fd.set("notif_tips", "on");
  if (s.notifications.renewals) fd.set("notif_renewals", "on");
  if (s.ai.concierge) fd.set("ai_concierge", "on");
  if (s.ai.search) fd.set("ai_search", "on");
  if (s.ai.copilot) fd.set("ai_copilot", "on");
  fd.set("language", s.language);
  return fd;
}

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
  const router = useRouter();
  const { setLang } = useTranslate();
  const [s, setS] = useState<UserSettings>(initial);
  const [, startTransition] = useTransition();

  // Persist immediately on every change. AI/language changes refresh the server
  // tree so the gating (Concierge, Smart Search, Co-Pilot, language) updates live.
  function commit(next: UserSettings, refresh = false) {
    const prev = s;
    setS(next);
    startTransition(async () => {
      const res = await updatePreferences(toFormData(next));
      if (!res.ok) {
        setS(prev);
        push({ tone: "error", title: res.error ?? "Could not save" });
        return;
      }
      if (refresh) router.refresh();
    });
  }

  const setNotif = (k: keyof UserSettings["notifications"], v: boolean) =>
    commit({ ...s, notifications: { ...s.notifications, [k]: v } });
  const setAi = (k: keyof UserSettings["ai"], v: boolean) =>
    commit({ ...s, ai: { ...s.ai, [k]: v } }, true);

  return (
    <>
      <Section title="Notifications" desc="Choose what you hear about. Saved automatically.">
        <Row label="New followers" checked={s.notifications.follows} onChange={(v) => setNotif("follows", v)} />
        <Row label="Posts from creators you follow" checked={s.notifications.posts} onChange={(v) => setNotif("posts", v)} />
        <Row label="Tips received" checked={s.notifications.tips} onChange={(v) => setNotif("tips", v)} />
        <Row label="Subscription renewal reminders" checked={s.notifications.renewals} onChange={(v) => setNotif("renewals", v)} />
      </Section>

      <Section title="AI features" desc="Aura and the AI tools across the platform. Saved automatically.">
        <Row label="Discovery Concierge" desc="Aura builds and refines your feed." checked={s.ai.concierge} onChange={(v) => setAi("concierge", v)} />
        <Row label="Smart Search" desc="Natural-language search across the platform." checked={s.ai.search} onChange={(v) => setAi("search", v)} />
        <Row label="Creator Co-Pilot" desc="Reply suggestions and creator tools." checked={s.ai.copilot} onChange={(v) => setAi("copilot", v)} />
      </Section>

      <Section title="Language" desc="Display language. Powers the translate control across the app.">
        <select
          value={s.language}
          onChange={(e) => {
            commit({ ...s, language: e.target.value });
            setLang(e.target.value);
          }}
          className="h-11 w-full sm:w-64 rounded-xl bg-plum/60 border border-white/10 px-3 text-base text-white focus:border-magenta/50 focus:outline-none"
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
      </Section>
    </>
  );
}
