"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { updateProfile } from "@/lib/profile/actions";

interface EditProfileFormProps {
  initial: { displayName: string; username: string; bio: string };
  onClose: () => void;
}

/**
 * Inline edit-profile dialog. Updates display name, username, bio, and avatar
 * via the updateProfile server action (real Supabase write + avatar upload).
 */
export function EditProfileForm({ initial, onClose }: EditProfileFormProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [username, setUsername] = useState(initial.username);
  const [bio, setBio] = useState(initial.bio);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Lock body scroll while open and close on Escape.
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
        className="w-full max-w-md glass-strong rounded-3xl p-6 shadow-glow"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
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
          <div className="flex flex-col gap-1.5">
            <label htmlFor="avatar" className="text-sm font-medium text-lilac/80">
              Profile photo
            </label>
            <input
              id="avatar"
              type="file"
              accept="image/*"
              onChange={(e) => setAvatar(e.target.files?.[0] ?? null)}
              className="text-sm text-lilac/70 file:mr-3 file:rounded-lg file:border-0 file:bg-white/5 file:px-3 file:py-1.5 file:text-lilac"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="cover" className="text-sm font-medium text-lilac/80">
              Cover photo
            </label>
            <input
              id="cover"
              type="file"
              accept="image/*"
              onChange={(e) => setCover(e.target.files?.[0] ?? null)}
              className="text-sm text-lilac/70 file:mr-3 file:rounded-lg file:border-0 file:bg-white/5 file:px-3 file:py-1.5 file:text-lilac"
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
      </motion.div>
    </div>
  );
}
