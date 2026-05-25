"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Video, Upload, RefreshCw, Circle, Square, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import { createPveel } from "@/lib/pveels/actions";
import { AudienceSelector, type Audience, type TierOption } from "@/components/compose/AudienceSelector";
import {
  validateFile,
  probeVideo,
  posterAt,
  PVEEL_MAX_DURATION,
  VIDEO_MAX_BYTES,
  VIDEO_RULE,
  DURATION_RULE,
} from "@/lib/media/upload";

type Mode = "choose" | "record" | "edit";
type Status = "idle" | "uploading" | "publishing" | "error";

const EXT: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

/**
 * Pveels creation studio: record in-app (camera + MediaRecorder) or upload,
 * then pick a cover frame, write a caption, choose the audience, and publish.
 * The clip uploads to the public `pveels` bucket (free) or the private
 * `gated-media` bucket (subscribers/tier) so gating holds at the storage layer.
 *
 * PENDING: true timeline trimming of a long clip needs in-browser transcoding
 * (ffmpeg.wasm, too heavy for the free tier); for now record is capped at 45s
 * and longer uploads are rejected, with a scrubable cover-frame picker.
 */
export function PveelComposer({ tiers }: { tiers: TierOption[] }) {
  const router = useRouter();
  const { push } = useToast();

  const [mode, setMode] = useState<Mode>("choose");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [posterTime, setPosterTime] = useState(0.1);
  const [duration, setDuration] = useState(0);

  const [caption, setCaption] = useState("");
  const [audience, setAudience] = useState<Audience>("public");
  const [tierId, setTierId] = useState<string | null>(null);
  const [allowComments, setAllowComments] = useState(true);
  const [allowTips, setAllowTips] = useState(true);
  const [scheduledFor, setScheduledFor] = useState("");

  const [status, setStatus] = useState<Status>("idle");
  const [stage, setStage] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Recording
  const liveRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [facing, setFacing] = useState<"user" | "environment">("user");

  const acceptFile = useCallback(
    (f: File) => {
      const v = validateFile(f, { allow: ["video"] });
      if (!v.ok) {
        push({ tone: "error", title: v.error ?? VIDEO_RULE });
        return;
      }
      setFile(f);
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
      setMode("edit");
    },
    [push]
  );

  // Cleanup object URL + camera on unmount / file change.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  async function startCamera(next: "user" | "environment" = facing) {
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: next },
        audio: true,
      });
      streamRef.current = stream;
      if (liveRef.current) {
        liveRef.current.srcObject = stream;
        await liveRef.current.play().catch(() => {});
      }
    } catch {
      push({ tone: "error", title: "Camera unavailable. Upload a clip instead." });
      setMode("choose");
    }
  }

  function enterRecord() {
    setMode("record");
    void startCamera();
  }

  function toggleRecord() {
    const stream = streamRef.current;
    if (!stream) return;
    if (!recording) {
      chunksRef.current = [];
      const mime = MediaRecorder.isTypeSupported("video/webm")
        ? "video/webm"
        : "video/mp4";
      const rec = new MediaRecorder(stream, { mimeType: mime });
      rec.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType });
        const f = new File([blob], `pveel.${rec.mimeType.includes("mp4") ? "mp4" : "webm"}`, {
          type: rec.mimeType,
        });
        stopCamera();
        acceptFile(f);
      };
      recorderRef.current = rec;
      rec.start();
      setRecording(true);
      setElapsed(0);
    } else {
      recorderRef.current?.stop();
      setRecording(false);
    }
  }

  // Recording timer + auto-stop at the cap.
  useEffect(() => {
    if (!recording) return;
    const id = window.setInterval(() => {
      setElapsed((e) => {
        const next = e + 0.1;
        if (next >= PVEEL_MAX_DURATION) {
          recorderRef.current?.stop();
          setRecording(false);
        }
        return next;
      });
    }, 100);
    return () => window.clearInterval(id);
  }, [recording]);

  function reset() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setMode("choose");
    setStatus("idle");
    setError(null);
  }

  async function publish() {
    if (!file || status === "uploading" || status === "publishing") return;
    setError(null);

    const meta = await probeVideo(file).catch(() => null);
    if (!meta) {
      setError("Could not read that video.");
      return;
    }
    if (meta.duration > PVEEL_MAX_DURATION + 0.5) {
      setError(DURATION_RULE);
      return;
    }
    if (file.size > VIDEO_MAX_BYTES) {
      setError(VIDEO_RULE);
      return;
    }

    setStatus("uploading");
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setStatus("error");
        setError("Sign in to publish.");
        return;
      }

      const gated = audience === "subscribers" || audience === "tier";
      const videoBucket = gated ? "gated-media" : "pveels";
      const ext = EXT[file.type] ?? "mp4";
      const base = `${user.id}/${crypto.randomUUID()}`;

      setStage("Uploading video");
      const { error: vErr } = await supabase.storage
        .from(videoBucket)
        .upload(`${base}.${ext}`, file, { contentType: file.type, upsert: false });
      if (vErr) throw vErr;
      const videoUrl = gated
        ? `${base}.${ext}`
        : supabase.storage.from("pveels").getPublicUrl(`${base}.${ext}`).data.publicUrl;

      setStage("Uploading cover");
      let posterUrl: string | null = null;
      const poster = await posterAt(file, posterTime * meta.duration).catch(() => null);
      if (poster) {
        const { error: pErr } = await supabase.storage
          .from("pveels")
          .upload(`${base}-poster.webp`, poster, { contentType: "image/webp", upsert: false });
        if (!pErr) {
          posterUrl = supabase.storage.from("pveels").getPublicUrl(`${base}-poster.webp`).data.publicUrl;
        }
      }

      setStatus("publishing");
      setStage("Publishing");
      const res = await createPveel({
        videoUrl,
        posterUrl,
        caption: caption.trim() || undefined,
        visibility: audience,
        tierRequired: audience === "tier" ? tierId : null,
        durationSeconds: Math.round(meta.duration),
        width: meta.width || undefined,
        height: meta.height || undefined,
        allowComments,
        allowTips,
        scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : null,
      });

      if (!res.ok) {
        setStatus("error");
        setError(res.error ?? "Could not publish.");
        return;
      }
      push({ tone: "success", title: scheduledFor ? "Pveel scheduled" : "Pveel published" });
      router.push("/pveels");
      router.refresh();
    } catch {
      setStatus("error");
      setError("Upload failed. Try again.");
    }
  }

  const busy = status === "uploading" || status === "publishing";

  return (
    <div className="max-w-xl mx-auto">
      <header className="mb-5 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-white">
          <span className="text-gradient">New Pveel</span>
        </h1>
        {mode !== "choose" && (
          <Button variant="glass" size="sm" leftIcon={<X size={15} />} onClick={reset} disabled={busy}>
            Start over
          </Button>
        )}
      </header>

      {mode === "choose" && (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={enterRecord}
            className="glass edge-light rounded-2xl p-6 flex flex-col items-center gap-3 hover:-translate-y-0.5 transition-transform"
          >
            <span className="h-14 w-14 rounded-2xl bg-gradient-primary grid place-items-center text-white">
              <Video size={24} />
            </span>
            <span className="font-display font-semibold text-white">Record</span>
            <span className="text-xs text-lilac/55 text-center">Use your camera, up to 45s</span>
          </button>
          <label className="glass edge-light rounded-2xl p-6 flex flex-col items-center gap-3 hover:-translate-y-0.5 transition-transform cursor-pointer">
            <span className="h-14 w-14 rounded-2xl glass-strong grid place-items-center text-cyan">
              <Upload size={24} />
            </span>
            <span className="font-display font-semibold text-white">Upload</span>
            <span className="text-xs text-lilac/55 text-center">MP4, WebM or MOV, under 10 MB</span>
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) acceptFile(f);
              }}
            />
          </label>
        </div>
      )}

      {mode === "record" && (
        <div className="space-y-4">
          <div className="relative aspect-[9/16] max-h-[60vh] mx-auto rounded-3xl overflow-hidden bg-black">
            <video ref={liveRef} muted playsInline className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute top-3 right-3">
              <button
                type="button"
                onClick={() => {
                  const next = facing === "user" ? "environment" : "user";
                  setFacing(next);
                  void startCamera(next);
                }}
                aria-label="Flip camera"
                className="h-10 w-10 rounded-full glass-strong grid place-items-center text-white"
              >
                <RefreshCw size={16} />
              </button>
            </div>
            {recording && (
              <span className="absolute top-3 left-3 text-xs font-medium text-white bg-red-500/80 rounded-full px-2.5 py-1">
                {elapsed.toFixed(0)}s / {PVEEL_MAX_DURATION}s
              </span>
            )}
          </div>
          <div className="flex justify-center">
            <button
              type="button"
              onClick={toggleRecord}
              aria-label={recording ? "Stop" : "Record"}
              className="h-16 w-16 rounded-full grid place-items-center bg-red-500 text-white shadow-glow active:scale-95 transition-transform"
            >
              {recording ? <Square size={24} fill="currentColor" /> : <Circle size={28} fill="currentColor" />}
            </button>
          </div>
        </div>
      )}

      {mode === "edit" && previewUrl && (
        <div className="space-y-5">
          <div className="relative aspect-[9/16] max-h-[55vh] mx-auto rounded-3xl overflow-hidden bg-black">
            <video
              src={previewUrl}
              controls
              playsInline
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
              className="absolute inset-0 h-full w-full object-contain"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="cover" className="text-sm font-medium text-lilac/80">
              Cover frame
            </label>
            <input
              id="cover"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={posterTime}
              onChange={(e) => setPosterTime(Number(e.target.value))}
              className="w-full accent-magenta"
            />
            <span className="text-xs text-lilac/50">
              {duration ? `${(posterTime * duration).toFixed(1)}s` : "Drag to choose the poster"}
            </span>
          </div>

          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="Write a caption. #hashtags work."
            className="w-full resize-none rounded-xl bg-plum/60 border border-white/10 px-4 py-3 text-base text-white placeholder:text-lilac/40 focus:border-magenta/50 focus:outline-none"
          />

          <AudienceSelector
            value={audience}
            onChange={setAudience}
            tiers={tiers}
            tierId={tierId}
            onTierChange={setTierId}
          />

          <div className="flex flex-wrap gap-4">
            <Toggle label="Allow comments" checked={allowComments} onChange={setAllowComments} />
            <Toggle label="Allow tips" checked={allowTips} onChange={setAllowTips} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="schedule" className="text-sm font-medium text-lilac/80">
              Schedule (optional)
            </label>
            <input
              id="schedule"
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              className="rounded-xl bg-plum/60 border border-white/10 px-3 py-2.5 text-sm text-white focus:border-magenta/50 focus:outline-none"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
          {busy && <p className="text-sm text-lilac/70">{stage}…</p>}

          <div className="flex justify-end">
            <Button onClick={publish} loading={busy}>
              {scheduledFor ? "Schedule Pveel" : "Publish Pveel"}
            </Button>
          </div>
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
      <span
        className={`relative h-5 w-9 rounded-full transition-colors ${checked ? "bg-magenta" : "bg-white/15"}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`}
        />
      </span>
      {label}
    </button>
  );
}
