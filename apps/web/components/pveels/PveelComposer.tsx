"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Video, Upload, Circle, Square, X, Globe, Users, UserCheck, Lock, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createPost } from "@/lib/posts/actions";
import type { MyTier } from "@/lib/subscriptions/actions";
import { cn } from "@/lib/utils";

type Audience = "public" | "free" | "followers" | "subscribers";

const AUDIENCES: { value: Audience; label: string; icon: LucideIcon; needsTier?: boolean }[] = [
  { value: "public", label: "Public", icon: Globe },
  { value: "free", label: "Free", icon: Users },
  { value: "followers", label: "Followers", icon: UserCheck },
  { value: "subscribers", label: "Subscribers", icon: Lock, needsTier: true },
];

const MAX_BYTES = 25 * 1024 * 1024;

/**
 * Pveel creation studio: record from the camera or upload a video, add a
 * caption, pick the audience, publish. A Pveel is a video post, so it submits
 * through createPost and appears in the Pveels feed and the creator's profile.
 */
export function PveelComposer({ tiers }: { tiers: MyTier[] }) {
  const router = useRouter();
  const [video, setVideo] = useState<{ file: File; url: string } | null>(null);
  const [caption, setCaption] = useState("");
  const [audience, setAudience] = useState<Audience>("public");
  const [tierId, setTierId] = useState(tiers[0]?.id ?? "");
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const liveRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const hasTiers = tiers.length > 0;

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (video) URL.revokeObjectURL(video.url);
    };
  }, [video]);

  function pickFile(f?: File) {
    if (!f) return;
    if (!f.type.startsWith("video/")) return setError("Choose a video file.");
    if (f.size > MAX_BYTES) return setError("Video must be under 25MB.");
    setError(null);
    setVideo({ file: f, url: URL.createObjectURL(f) });
  }

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (liveRef.current) {
        liveRef.current.srcObject = stream;
        await liveRef.current.play().catch(() => {});
      }
      chunksRef.current = [];
      const rec = new MediaRecorder(stream);
      rec.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        if (blob.size > MAX_BYTES) {
          setError("Recording is over 25MB. Try a shorter clip.");
          return;
        }
        const file = new File([blob], `pveel-${Date.now()}.webm`, { type: "video/webm" });
        setVideo({ file, url: URL.createObjectURL(blob) });
      };
      recorderRef.current = rec;
      rec.start();
      setRecording(true);
    } catch {
      setError("Couldn't access the camera. Upload a video instead.");
    }
  }

  function stopRecording() {
    recorderRef.current?.stop();
    setRecording(false);
  }

  async function publish() {
    setError(null);
    if (!video) return setError("Record or upload a video first.");
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("caption", caption);
      fd.set("audience", audience);
      if (audience === "subscribers" && tierId) fd.set("tierRequired", tierId);
      fd.append("media", video.file);
      const res = await createPost(fd);
      if (res.ok) {
        router.push("/pveels");
      } else {
        setError(res.error ?? "Could not publish.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="glass-strong rounded-3xl p-4 sm:p-6 shadow-glow flex flex-col gap-4">
      {/* Preview / live / placeholder. Capped shorter on phones so the caption,
          audience, and Post button stay on-screen above the bottom nav. */}
      <div className="relative rounded-2xl overflow-hidden bg-black/50 aspect-[9/16] max-h-[38vh] sm:max-h-[60vh] mx-auto w-full max-w-[220px] sm:max-w-sm grid place-items-center">
        {video ? (
          <video ref={previewRef} src={video.url} controls playsInline className="h-full w-full object-contain" />
        ) : recording ? (
          <video ref={liveRef} muted playsInline className="h-full w-full object-cover" />
        ) : (
          <div className="text-center text-lilac/50 px-6">
            <Video size={28} className="mx-auto mb-2" />
            <p className="text-sm">Record a clip or upload a video</p>
          </div>
        )}
        {video && (
          <button
            type="button"
            aria-label="Discard"
            onClick={() => setVideo(null)}
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/60 text-white grid place-items-center"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {!video && (
        <div className="flex items-center justify-center gap-2">
          {recording ? (
            <Button variant="primary" onClick={stopRecording} leftIcon={<Square size={16} />}>
              Stop recording
            </Button>
          ) : (
            <>
              <Button variant="glass" onClick={startRecording} leftIcon={<Circle size={16} className="text-red-400" />}>
                Record
              </Button>
              <Button variant="glass" onClick={() => fileRef.current?.click()} leftIcon={<Upload size={16} />}>
                Upload
              </Button>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => pickFile(e.target.files?.[0])}
          />
        </div>
      )}
      {!video && (
        <p className="text-center text-xs text-lilac/50">
          MP4 or WebM · up to 25MB
        </p>
      )}

      <textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        rows={2}
        placeholder="Add a caption…"
        className="resize-none rounded-xl bg-plum/60 border border-white/10 px-3 py-2.5 text-sm text-white placeholder:text-lilac/40 focus:border-magenta/50 focus:outline-none"
      />

      <div className="flex flex-wrap items-center gap-2">
        {AUDIENCES.map(({ value, label, icon: Icon, needsTier }) => {
          const disabled = needsTier && !hasTiers;
          return (
            <button
              key={value}
              type="button"
              disabled={disabled}
              onClick={() => setAudience(value)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                audience === value ? "bg-gradient-primary text-white" : "glass text-lilac/70 hover:text-white",
                disabled && "opacity-40 cursor-not-allowed"
              )}
            >
              <Icon size={13} /> {label}
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
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        )}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex items-center justify-between gap-3">
        <Link href="/pveels" className="text-sm text-lilac/60 hover:text-white">Cancel</Link>
        <Button onClick={publish} loading={busy} disabled={!video} size="lg">
          Post Pveel
        </Button>
      </div>
    </div>
  );
}
