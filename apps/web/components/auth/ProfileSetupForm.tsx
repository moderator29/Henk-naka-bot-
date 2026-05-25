"use client";

import { useRef, useState } from "react";
import { ImagePlus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { setupProfile } from "@/lib/profile/actions";
import { maxDateOfBirthInput } from "@/lib/auth/age";

export function ProfileSetupForm() {
  const [avatar, setAvatar] = useState<{ file: File; url: string } | null>(null);
  const [cover, setCover] = useState<{ file: File; url: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function action(formData: FormData) {
    setErrors({});
    setFormError(null);
    if (avatar) formData.set("avatar", avatar.file);
    if (cover) formData.set("cover", cover.file);
    setBusy(true);
    const res = await setupProfile(formData);
    setBusy(false);
    if (res.ok) {
      window.location.href = "/explore";
    } else if (res.fieldErrors) {
      setErrors(res.fieldErrors);
    } else {
      setFormError(res.error ?? "Could not save. Try again.");
    }
  }

  return (
    <Card className="edge-light">
      <form ref={formRef} action={action} className="flex flex-col gap-4">
        {/* Cover + avatar */}
        <div className="relative">
          <label className="block h-28 rounded-xl overflow-hidden bg-gradient-to-br from-imperial to-plum cursor-pointer">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover.url} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="h-full w-full grid place-items-center text-xs text-lilac/60">
                <ImagePlus size={18} /> Add a cover
              </span>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setCover({ file: f, url: URL.createObjectURL(f) });
              }}
            />
          </label>
          <label className="absolute -bottom-6 left-4 h-16 w-16 rounded-2xl overflow-hidden ring-2 ring-magenta/40 bg-imperial cursor-pointer grid place-items-center">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar.url} alt="" className="h-full w-full object-cover" />
            ) : (
              <ImagePlus size={16} className="text-lilac/60" />
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setAvatar({ file: f, url: URL.createObjectURL(f) });
              }}
            />
          </label>
        </div>

        <div className="pt-6 flex flex-col gap-4">
          <Field label="Username" error={errors.username}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-lilac/40">@</span>
              <input
                name="username"
                placeholder="yourname"
                autoCapitalize="none"
                className={`${inputCls} pl-7`}
              />
            </div>
          </Field>
          <Field label="Display name" error={errors.displayName}>
            <input name="displayName" placeholder="The name people see" className={inputCls} />
          </Field>
          <Field label="Bio" error={errors.bio}>
            <textarea name="bio" rows={3} placeholder="A line about you" className={`${inputCls} resize-none`} />
          </Field>
          <Field label="Date of birth" hint="You must be 18 or older" error={errors.dateOfBirth}>
            <input
              type="date"
              name="dateOfBirth"
              max={maxDateOfBirthInput()}
              className={`${inputCls} [color-scheme:dark]`}
            />
          </Field>
        </div>

        {formError && <p className="text-sm text-red-400">{formError}</p>}
        <Button type="submit" size="lg" loading={busy}>
          Enter Pleasure Coin
        </Button>
      </form>
    </Card>
  );
}

const inputCls =
  "w-full rounded-lg bg-plum/60 border border-white/10 px-3 py-2.5 text-sm text-white placeholder:text-lilac/40 focus:border-magenta/50 focus:outline-none";

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-white">
        {label}
        {hint && <span className="ml-2 text-xs font-normal text-lilac/45">{hint}</span>}
      </span>
      {children}
      {error && <span className="text-xs text-red-400">{error}</span>}
    </label>
  );
}
