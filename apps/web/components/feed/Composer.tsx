"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Film, X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmojiPicker } from "./EmojiPicker";
import { PostCard, type FeedPost } from "./PostCard";
import { createPost } from "@/lib/posts/actions";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import {
  AudienceSelector,
  type Audience,
  type TierOption,
} from "@/components/compose/AudienceSelector";
import {
  validateFile,
  compressImage,
  makeImageThumbnail,
  posterAt,
} from "@/lib/media/upload";
import type { StoredMediaItem } from "@/lib/posts/media";

interface Attachment {
  file: File;
  url: string;
  type: "image" | "video";
}

/**
 * Post composer: rich caption + emoji, multiple validated/compressed media with
 * drag-to-reorder, the shared audience selector (public/followers/subscribers/
 * tier), comment/tip toggles, schedule, and a live preview. Media uploads
 * client-side to the public `post-media` bucket (or private `gated-media` for
 * gated posts), then createPost inserts the row.
 */
export function Composer({ tiers }: { tiers: TierOption[] }) {
  const router = useRouter();
  const { push } = useToast();
  const captionRef = useRef<HTMLTextAreaElement>(null);
  const dragIndex = useRef<number | null>(null);

  const [caption, setCaption] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [audience, setAudience] = useState<Audience>("public");
  const [tierId, setTierId] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [allowComments, setAllowComments] = useState(true);
  const [allowTips, setAllowTips] = useState(true);
  const [scheduledFor, setScheduledFor] = useState("");
  const [stage, setStage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const next: Attachment[] = [];
    for (const file of Array.from(files)) {
      const v = validateFile(file);
      if (!v.ok) {
        push({ tone: "error", title: v.error ?? "Unsupported file" });
        continue;
      }
      next.push({ file, url: URL.createObjectURL(file), type: v.kind === "video" ? "video" : "image" });
    }
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

  const reorder = (from: number, to: number) => {
    if (from === to) return;
    setAttachments((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(from, 1);
      if (moved) copy.splice(to, 0, moved);
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

  async function uploadOne(
    supabase: ReturnType<typeof createClient>,
    bucket: string,
    gated: boolean,
    userId: string,
    a: Attachment
  ): Promise<StoredMediaItem | null> {
    const base = `${userId}/${crypto.randomUUID()}`;
    const ref = (path: string) =>
      gated ? path : supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;

    if (a.type === "image") {
      const [full, thumb] = await Promise.all([compressImage(a.file), makeImageThumbnail(a.file)]);
      const fullPath = `${base}.webp`;
      const thumbPath = `${base}-thumb.webp`;
      const up1 = await supabase.storage.from(bucket).upload(fullPath, full, { contentType: "image/webp" });
      if (up1.error) return null;
      const up2 = await supabase.storage.from(bucket).upload(thumbPath, thumb, { contentType: "image/webp" });
      return {
        type: "image",
        src: ref(fullPath),
        thumb: up2.error ? undefined : ref(thumbPath),
      };
    }

    // video
    const ext = a.file.type.includes("webm") ? "webm" : a.file.type.includes("quicktime") ? "mov" : "mp4";
    const vidPath = `${base}.${ext}`;
    const up = await supabase.storage.from(bucket).upload(vidPath, a.file, { contentType: a.file.type });
    if (up.error) return null;
    let poster: string | undefined;
    const posterBlob = await posterAt(a.file, 0.1).catch(() => null);
    if (posterBlob) {
      const posterPath = `${base}-poster.webp`;
      const pu = await supabase.storage.from(bucket).upload(posterPath, posterBlob, { contentType: "image/webp" });
      if (!pu.error) poster = ref(posterPath);
    }
    return { type: "video", src: ref(vidPath), poster, thumb: poster };
  }

  const submit = async () => {
    setError(null);
    if (!caption.trim() && attachments.length === 0) {
      setError("Add a caption or some media.");
      return;
    }
    if (audience === "tier" && !tierId) {
      setError("Pick a tier for this post.");
      return;
    }
    setSubmitting(true);
    try {
      const supabase = createClient();
      const gated = audience !== "public";
      const bucket = gated ? "gated-media" : "post-media";

      let media: StoredMediaItem[] = [];
      if (attachments.length > 0) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setError("Sign in to post.");
          setSubmitting(false);
          return;
        }
        for (let i = 0; i < attachments.length; i++) {
          setStage(`Uploading ${i + 1}/${attachments.length}`);
          const item = await uploadOne(supabase, bucket, gated, user.id, attachments[i]!);
          if (item) media.push(item);
        }
      }

      setStage("Publishing");
      const res = await createPost({
        caption,
        category: category || undefined,
        visibility: audience,
        tierRequired: audience === "tier" ? tierId : null,
        allowComments,
        allowTips,
        scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : null,
        media,
      });
      if (!res.ok) {
        setError(res.error ?? "Could not publish.");
        return;
      }
      push({ tone: "success", title: scheduledFor ? "Post scheduled" : "Posted" });
      router.push("/feed");
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
      setStage("");
    }
  };

  const preview: FeedPost = {
    id: "demo-preview",
    creatorUsername: "you",
    creatorName: "You",
    verified: false,
    caption,
    category,
    gated: false,
    likes: 0,
    comments: 0,
    createdAt: new Date(),
    media: attachments.map((a) => ({ type: a.type, url: a.url, poster: a.type === "video" ? a.url : undefined })),
  };

  return (
    <div className="space-y-5">
      <div className="glass-strong rounded-3xl p-6 shadow-glow">
        <textarea
          ref={captionRef}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={4}
          placeholder="Share something with your people…"
          className="w-full resize-none bg-transparent text-lg text-white placeholder:text-lilac/40 focus:outline-none"
          autoFocus
        />

        {attachments.length > 0 && (
          <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
            {attachments.map((a, i) => (
              <div
                key={a.url}
                draggable
                onDragStart={() => (dragIndex.current = i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragIndex.current != null) reorder(dragIndex.current, i);
                  dragIndex.current = null;
                }}
                className="relative group rounded-xl overflow-hidden bg-plum/60 aspect-square cursor-grab active:cursor-grabbing"
              >
                {a.type === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element -- local object URL preview before upload
                  <img src={a.url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <video src={a.url} muted className="h-full w-full object-cover" />
                )}
                <span className="absolute top-1 left-1 text-white/80">
                  <GripVertical size={14} />
                </span>
                <button
                  type="button"
                  onClick={() => removeAttachment(i)}
                  aria-label="Remove"
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
        {submitting && stage && <p className="mt-3 text-sm text-lilac/70">{stage}…</p>}

        <div className="mt-4 border-t border-white/5 pt-4">
          <AudienceSelector
            value={audience}
            onChange={setAudience}
            tiers={tiers}
            tierId={tierId}
            onTierChange={setTierId}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-4">
          <Toggle label="Allow comments" checked={allowComments} onChange={setAllowComments} />
          <Toggle label="Allow tips" checked={allowTips} onChange={setAllowTips} />
        </div>

        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category (optional)"
            className="h-10 rounded-lg bg-plum/60 border border-white/10 px-3 text-sm text-white placeholder:text-lilac/40 focus:border-magenta/50 focus:outline-none"
          />
          <input
            type="datetime-local"
            value={scheduledFor}
            onChange={(e) => setScheduledFor(e.target.value)}
            aria-label="Schedule"
            className="h-10 rounded-lg bg-plum/60 border border-white/10 px-3 text-sm text-white focus:border-magenta/50 focus:outline-none"
          />
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-white/5 pt-4">
          <ImageButton onFiles={addFiles} />
          <VideoButton onFiles={addFiles} />
          <EmojiPicker onPick={insertEmoji} />
          <Button onClick={submit} loading={submitting} disabled={submitting} className="ml-auto">
            {scheduledFor ? "Schedule" : "Post"}
          </Button>
        </div>
      </div>

      {(caption.trim() || attachments.length > 0) && (
        <div>
          <p className="text-xs uppercase tracking-wider text-lilac/40 mb-2">Preview</p>
          <PostCard post={preview} />
        </div>
      )}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2 text-sm text-lilac/80"
    >
      <span className={`relative h-5 w-9 rounded-full transition-colors ${checked ? "bg-magenta" : "bg-white/15"}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`} />
      </span>
      {label}
    </button>
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
      <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
    </>
  );
}

function VideoButton({ onFiles }: { onFiles: (f: FileList | null) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <button
        type="button"
        aria-label="Add video"
        onClick={() => ref.current?.click()}
        className="h-10 w-10 rounded-xl flex items-center justify-center text-lilac/60 hover:text-magenta hover:bg-white/5 transition-colors"
      >
        <Film size={20} />
      </button>
      <input ref={ref} type="file" accept="video/mp4,video/webm,video/quicktime" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
    </>
  );
}
