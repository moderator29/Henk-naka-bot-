"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImagePlus, Paperclip, X, Globe, Users, UserCheck, Lock, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmojiPicker } from "./EmojiPicker";
import { CategoryPicker } from "./CategoryPicker";
import { createPost } from "@/lib/posts/actions";
import type { MyTier } from "@/lib/subscriptions/actions";
import { cn } from "@/lib/utils";

interface Attachment {
  file: File;
  url: string;
  isImage: boolean;
}

type Audience = "public" | "free" | "followers" | "subscribers";

const AUDIENCES: { value: Audience; label: string; icon: LucideIcon; needsTier?: boolean }[] = [
  { value: "public", label: "Public", icon: Globe },
  { value: "free", label: "Free", icon: Users },
  { value: "followers", label: "Followers", icon: UserCheck },
  { value: "subscribers", label: "Subscribers", icon: Lock, needsTier: true },
];

/**
 * Post composer. Caption + emojis + image/file attachments + visibility.
 * Public posts go out to everyone; "Subscribers" gates the post (and its media)
 * behind one of the creator's tiers. Submits to the createPost server action
 * (real Supabase insert + storage upload). Honest success / error states.
 */
export function Composer({ tiers }: { tiers: MyTier[] }) {
  const router = useRouter();
  const captionRef = useRef<HTMLTextAreaElement>(null);
  const [caption, setCaption] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [audience, setAudience] = useState<Audience>("public");
  const [tierId, setTierId] = useState<string>(tiers[0]?.id ?? "");
  const [category, setCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasTiers = tiers.length > 0;

  const MAX_BYTES = 25 * 1024 * 1024;

  const addFiles = (files: FileList | null, asImage: boolean) => {
    if (!files) return;
    const all = Array.from(files);
    const oversize = all.filter((f) => f.size > MAX_BYTES);
    setError(
      oversize.length > 0
        ? `Each file must be under 25MB. "${oversize[0]!.name}" is too large.`
        : null
    );
    const next = all
      .filter((f) => f.size <= MAX_BYTES)
      .map((file) => ({
        file,
        url: URL.createObjectURL(file),
        isImage: asImage || file.type.startsWith("image/"),
      }));
    setAttachments((prev) => [...prev, ...next].slice(0, 8));
  };

  const removeAttachment = (i: number) => {
    setAttachments((prev) => {
      const copy = [...prev];
      const [removed] = copy.splice(i, 1);
      if (removed) URL.revokeObjectURL(removed.url);
      return copy;
    });
  };

  const insertEmoji = (emoji: string) => {
    const el = captionRef.current;
    if (!el) {
      setCaption((c) => c + emoji);
      return;
    }
    const start = el.selectionStart ?? caption.length;
    const end = el.selectionEnd ?? caption.length;
    setCaption(caption.slice(0, start) + emoji + caption.slice(end));
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = start + emoji.length;
    });
  };

  const submit = async () => {
    setError(null);
    if (!caption.trim() && attachments.length === 0) {
      setError("Add a caption or some media.");
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.set("caption", caption);
      fd.set("category", category);
      fd.set("audience", audience);
      if (audience === "subscribers" && tierId) fd.set("tierRequired", tierId);
      attachments.forEach((a) => fd.append("media", a.file));
      const res = await createPost(fd);
      if (!res.ok) {
        setError(res.error ?? "Could not publish.");
        return;
      }
      router.push("/feed");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass-strong rounded-3xl p-6 shadow-glow">
      <textarea
        ref={captionRef}
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        rows={5}
        placeholder="Share something with your people…"
        className="w-full resize-none bg-transparent text-lg text-white placeholder:text-lilac/40 focus:outline-none"
        autoFocus
      />

      {attachments.length > 0 && (
        <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
          {attachments.map((a, i) => (
            <div key={i} className="relative group rounded-xl overflow-hidden bg-plum/60 aspect-square">
              {a.isImage ? (
                // eslint-disable-next-line @next/next/no-img-element -- local object URL preview before upload
                <img src={a.url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full grid place-items-center p-2 text-center">
                  <Paperclip size={20} className="text-lilac/60" />
                  <span className="mt-1 text-[0.6rem] text-lilac/50 truncate w-full">
                    {a.file.name}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeAttachment(i)}
                aria-label="Remove attachment"
                className="absolute top-1 right-1 h-6 w-6 rounded-full bg-plum/80 text-white grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-400">
          {error}
        </p>
      )}

      {/* Audience */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {AUDIENCES.map(({ value, label, icon: Icon, needsTier }) => {
          const disabled = needsTier && !hasTiers;
          return (
            <button
              key={value}
              type="button"
              disabled={disabled}
              title={disabled ? "Create a subscription tier first" : undefined}
              onClick={() => setAudience(value)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                audience === value
                  ? "bg-gradient-primary text-white"
                  : "glass text-lilac/70 hover:text-white",
                disabled && "opacity-40 cursor-not-allowed"
              )}
            >
              <Icon size={13} />
              {label}
            </button>
          );
        })}

        {audience === "subscribers" && hasTiers && (
          <select
            aria-label="Subscription tier"
            value={tierId}
            onChange={(e) => setTierId(e.target.value)}
            className="h-8 rounded-full bg-plum/60 border border-white/10 px-3 text-xs text-white focus:border-magenta/50 focus:outline-none"
          >
            {tiers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
                {t.priceUsd != null ? ` · $${t.priceUsd.toFixed(2)}/mo` : ""}
              </option>
            ))}
          </select>
        )}

        {!hasTiers && (
          <Link
            href="/dashboard"
            className="text-xs text-lilac/50 hover:text-white underline underline-offset-2"
          >
            Set up tiers for subscriber posts
          </Link>
        )}
      </div>

      <p className="mt-3 text-xs text-lilac/45">
        Images and video · up to 25MB each, 8 files
      </p>
      <div className="mt-2 flex items-center gap-2 border-t border-white/5 pt-4">
        <ImageButton onFiles={(f) => addFiles(f, true)} />
        <FileButton onFiles={(f) => addFiles(f, false)} />
        <EmojiPicker onPick={insertEmoji} />
        <div className="ml-auto">
          <CategoryPicker value={category} onChange={setCategory} />
        </div>
        <Button onClick={submit} loading={submitting} disabled={submitting}>
          Post
        </Button>
      </div>
    </div>
  );
}

function ImageButton({ onFiles }: { onFiles: (f: FileList | null) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <button
        type="button"
        aria-label="Add images"
        onClick={() => ref.current?.click()}
        className="h-10 w-10 rounded-xl flex items-center justify-center text-lilac/60 hover:text-magenta hover:bg-white/5 transition-colors"
      >
        <ImagePlus size={20} />
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => onFiles(e.target.files)}
      />
    </>
  );
}

function FileButton({ onFiles }: { onFiles: (f: FileList | null) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <button
        type="button"
        aria-label="Attach files"
        onClick={() => ref.current?.click()}
        className="h-10 w-10 rounded-xl flex items-center justify-center text-lilac/60 hover:text-magenta hover:bg-white/5 transition-colors"
      >
        <Paperclip size={20} />
      </button>
      <input
        ref={ref}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => onFiles(e.target.files)}
      />
    </>
  );
}
