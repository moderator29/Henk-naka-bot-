"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { X, Camera } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { updateProfile } from "@/lib/profile/actions";

interface EditProfileFormProps {
  initial: {
    displayName: string;
    username: string;
    bio: string;
    avatarUrl?: string | null;
    coverUrl?: string | null;
  };
  onClose: () => void;
}

/**
 * Edit-profile dialog with an X-style header: tap the cover or the avatar to
 * replace the image (live preview), edit name/username/bio below. Saves via the
 * updateProfile server action (real Supabase write + Storage upload).
 */
export function EditProfileForm({ initial, onClose }: EditProfileFormProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [username, setUsername] = useState(initial.username);
  const [bio, setBio] = useState(initial.bio);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initial.avatarUrl ?? null);
  const [coverPreview, setCoverPreview] = useState<string | null>(initial.coverUrl ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const avatarInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

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

  const save = async () => {
    setSaving(true);
    setError(null);
    setFieldErrors({});
    try {
      const fd = new FormData();
      fd.set("displayName", displayName);
      fd.set("username", username);
      fd.set("bio", bio);
      if (avatar) fd.set("avatar", avatar);
      if (cover) fd.set("cover", cover);
      const res = await updateProfile(fd);
      if (!res.ok) {
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
        if (res.error) setError(res.error);
        return;
      }
      onClose();
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center p-4 bg-magenta/10 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-label="Edit profile"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md glass-strong rounded-3xl shadow-glow overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <h2 className="font-display text-xl font-bold text-white">Edit profile</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="h-8 w-8 rounded-lg grid place-items-center text-lilac/60 hover:text-white hover:bg-white/5"
          >
            <X size={16} />
          </button>
        </div>

        {/* Cover + avatar, tap to change */}
        <div className="relative">
          <button
            type="button"
            onClick={() => coverInput.current?.click()}
            aria-label="Change cover photo"
            className="block h-28 w-full overflow-hidden bg-gradient-to-br from-imperial via-plum to-imperial-dark group"
          >
            {coverPreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverPreview} alt="" className="h-full w-full object-cover opacity-80" />
            )}
            <span className="absolute inset-0 grid place-items-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={20} className="text-white" />
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
            className="absolute -bottom-7 left-6 h-20 w-20 rounded-2xl overflow-hidden ring-4 ring-plum bg-imperial grid place-items-center group"
          >
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="font-display text-2xl text-white">
                {(displayName || "?").slice(0, 1).toUpperCase()}
              </span>
            )}
            <span className="absolute inset-0 grid place-items-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={18} className="text-white" />
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

        <div className="px-6 pt-10 pb-6">
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
                className="w-full resize-none rounded-xl bg-plum/60 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-lilac/40 focus:border-magenta/50 focus:outline-none focus:ring-2 focus:ring-magenta/20"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button variant="glass" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button className="flex-1" loading={saving} onClick={save}>
              Save
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
