"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { updateProfile } from "@/lib/profile/actions";

interface Props {
  initial: {
    displayName: string;
    username: string;
    bio: string;
    country: string;
  };
}

export function AccountSettings({ initial }: Props) {
  const router = useRouter();
  const { push } = useToast();
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [username, setUsername] = useState(initial.username);
  const [bio, setBio] = useState(initial.bio);
  const [country, setCountry] = useState(initial.country);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function save() {
    setSaving(true);
    setFieldErrors({});
    try {
      const fd = new FormData();
      fd.set("displayName", displayName);
      fd.set("username", username);
      fd.set("bio", bio);
      fd.set("country", country);
      if (avatar) fd.set("avatar", avatar);
      if (cover) fd.set("cover", cover);
      const res = await updateProfile(fd);
      if (!res.ok) {
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
        push({ tone: "error", title: res.error ?? "Could not save", description: res.fieldErrors ? "Check the highlighted fields." : undefined });
        return;
      }
      push({ tone: "success", title: "Profile saved" });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section title="Edit profile" desc="Your public identity across the platform.">
      <div className="grid sm:grid-cols-2 gap-4">
        <Input label="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} error={fieldErrors.displayName} />
        <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} error={fieldErrors.username} hint="Letters, numbers, underscores" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="set-bio" className="text-sm font-medium text-lilac/80">Bio</label>
        <textarea
          id="set-bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          maxLength={300}
          placeholder="Tell people what you're about"
          className="w-full resize-none rounded-xl bg-plum/60 border border-white/10 px-4 py-3 text-base text-white placeholder:text-lilac/40 focus:border-magenta/50 focus:outline-none focus:ring-2 focus:ring-magenta/20"
        />
      </div>
      <Input label="Location" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Where you're based" />
      <div className="grid sm:grid-cols-2 gap-4">
        <FileField label="Avatar" onChange={setAvatar} />
        <FileField label="Cover image" onChange={setCover} />
      </div>
      <div className="flex justify-end">
        <Button loading={saving} onClick={save}>Save changes</Button>
      </div>
    </Section>
  );
}

function FileField({ label, onChange }: { label: string; onChange: (f: File | null) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-lilac/80">{label}</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className="text-sm text-lilac/70 file:mr-3 file:rounded-lg file:border-0 file:bg-white/5 file:px-3 file:py-2 file:text-lilac"
      />
    </div>
  );
}

export function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="glass edge-light rounded-2xl p-6 flex flex-col gap-4">
      <div>
        <h2 className="font-display text-lg font-semibold text-white">{title}</h2>
        {desc && <p className="text-sm text-lilac/60 mt-0.5">{desc}</p>}
      </div>
      {children}
    </section>
  );
}
