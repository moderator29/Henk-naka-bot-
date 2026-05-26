"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { updateProfile } from "@/lib/profile/actions";

interface EditProfileFormProps {
  initial: {
    displayName: string;
    username: string;
    bio: string;
    telegramUrl?: string | null;
    xUrl?: string | null;
    avatarUrl?: string | null;
    coverUrl?: string | null;
  };
}

/**
 * Edit-profile form, rendered as a full page (not a modal). Tap the cover or
 * avatar to replace the image with a live preview, edit the fields, save via
 * the updateProfile server action (real Supabase write + Storage upload), then
 * return to the profile.
 */
export function EditProfileForm({ initial }: EditProfileFormProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [username, setUsername] = useState(initial.username);
  const [bio, setBio] = useState(initial.bio);
  const [telegram, setTelegram] = useState(initial.telegramUrl ?? "");
  const [x, setX] = useState(initial.xUrl ?? "");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initial.avatarUrl ?? null);
  const [coverPreview, setCoverPreview] = useState<string | null>(initial.coverUrl ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const avatarInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);

  const pickAvatar = (f?: File) => {
    if (!f) return;
    setAvatar(f);
    setAvatarPreview(URL.createObjectURL(f));
  };
  const pickCover = (f?: File) => {
    if (!f) return;
    setCover(f);
    setCoverPreview(URL.createObjectURL(f));
  };

  const cancel = () => router.push("/profile");

  const save = async () => {
    setSaving(true);
    setError(null);
    setFieldErrors({});
    try {
      const fd = new FormData();
      fd.set("displayName", displayName);
      fd.set("username", username);
      fd.set("bio", bio);
      fd.set("telegram", telegram);
      fd.set("x", x);
      if (avatar) fd.set("avatar", avatar);
      if (cover) fd.set("cover", cover);
      const res = await updateProfile(fd);
      if (!res.ok) {
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
        if (res.error) setError(res.error);
        return;
      }
      router.push("/profile");
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-strong rounded-3xl shadow-glow overflow-hidden">
      {/* Cover + avatar, tap to change */}
      <div className="relative">
        <button
          type="button"
          onClick={() => coverInput.current?.click()}
          aria-label="Change cover photo"
          className="block h-36 sm:h-44 w-full overflow-hidden bg-gradient-to-br from-imperial via-plum to-imperial-dark group"
        >
          {coverPreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverPreview} alt="" className="h-full w-full object-cover opacity-80" />
          )}
          <span className="absolute inset-0 grid place-items-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera size={22} className="text-white" />
          </span>
        </button>
        <input
          ref={coverInput}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => pickCover(e.target.files?.[0])}
        />

        <button
          type="button"
          onClick={() => avatarInput.current?.click()}
          aria-label="Change profile photo"
          className="absolute -bottom-8 left-6 h-24 w-24 rounded-2xl overflow-hidden ring-4 ring-plum bg-imperial grid place-items-center group"
        >
          {avatarPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="font-display text-3xl text-white">
              {(displayName || "?").slice(0, 1).toUpperCase()}
            </span>
          )}
          <span className="absolute inset-0 grid place-items-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera size={20} className="text-white" />
          </span>
        </button>
        <input
          ref={avatarInput}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => pickAvatar(e.target.files?.[0])}
        />
      </div>

      <div className="px-5 sm:px-6 pt-12 pb-6">
        {error && (
          <p role="alert" className="mb-4 text-sm text-red-400">
            {error}
          </p>
        )}
        <div className="flex flex-col gap-4">
          <Input
            label="Display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            error={fieldErrors.displayName}
          />
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={fieldErrors.username}
            hint="Letters, numbers, and underscores"
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="bio" className="text-sm font-medium text-lilac/80">
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={300}
              placeholder="Tell people what you're about"
              className="w-full resize-none rounded-xl bg-plum/60 border border-white/10 px-4 py-3 text-base text-white placeholder:text-lilac/40 focus:border-magenta/50 focus:outline-none focus:ring-2 focus:ring-magenta/20"
            />
          </div>
          <Input
            label="Telegram"
            value={telegram}
            onChange={(e) => setTelegram(e.target.value)}
            error={fieldErrors.telegram}
            hint="Your handle or t.me link. Optional."
            placeholder="@yourhandle"
          />
          <Input
            label="X (Twitter)"
            value={x}
            onChange={(e) => setX(e.target.value)}
            error={fieldErrors.x}
            hint="Your handle or x.com link. Optional."
            placeholder="@yourhandle"
          />
        </div>

        <div className="mt-6 flex gap-3">
          <Button variant="glass" className="flex-1" onClick={cancel}>
            Cancel
          </Button>
          <Button className="flex-1" loading={saving} onClick={save}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
