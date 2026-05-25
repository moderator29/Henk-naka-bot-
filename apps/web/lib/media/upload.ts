/**
 * Client-side media validation, compression, and thumbnailing. Tuned for the
 * Supabase free tier (~1 GB total, 50 MB/file), so we cap uploads hard and
 * always store a compressed image plus a small thumbnail, and a poster frame
 * for video. Pure validation lives at the bottom and is unit-tested; the
 * canvas/video helpers run only in the browser.
 */

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
export const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"] as const;

export const IMAGE_MAX_BYTES = 3 * 1024 * 1024; // 3 MB
export const VIDEO_MAX_BYTES = 10 * 1024 * 1024; // 10 MB
export const PVEEL_MAX_DURATION = 45; // seconds

export const IMAGE_RULE = "Images must be JPEG, PNG, WebP, or GIF under 3 MB.";
export const VIDEO_RULE = "Videos must be MP4, WebM, or MOV, under 10 MB.";
export const DURATION_RULE = "Pveels must be 45 seconds or less.";

export type MediaKind = "image" | "video";

export interface ValidationResult {
  ok: boolean;
  error?: string;
  kind?: MediaKind;
}

/** Pure type + size validation (no DOM). Duration is checked separately. */
export function validateFile(
  file: { type: string; size: number },
  opts: { allow?: MediaKind[] } = {}
): ValidationResult {
  const allow = opts.allow ?? ["image", "video"];
  const isImage = (IMAGE_TYPES as readonly string[]).includes(file.type);
  const isVideo = (VIDEO_TYPES as readonly string[]).includes(file.type);

  if (isImage && allow.includes("image")) {
    if (file.size > IMAGE_MAX_BYTES) return { ok: false, error: IMAGE_RULE, kind: "image" };
    return { ok: true, kind: "image" };
  }
  if (isVideo && allow.includes("video")) {
    if (file.size > VIDEO_MAX_BYTES) return { ok: false, error: VIDEO_RULE, kind: "video" };
    return { ok: true, kind: "video" };
  }
  return {
    ok: false,
    error:
      allow.length === 1
        ? allow[0] === "image"
          ? IMAGE_RULE
          : VIDEO_RULE
        : `${IMAGE_RULE} ${VIDEO_RULE}`,
  };
}

// ---------- Browser-only helpers ----------

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), type, quality);
  });
}

function scaled(w: number, h: number, maxEdge: number): [number, number] {
  const long = Math.max(w, h);
  if (long <= maxEdge) return [w, h];
  const r = maxEdge / long;
  return [Math.round(w * r), Math.round(h * r)];
}

/**
 * Compress an image to WebP, resized to a max long edge. GIFs are left as-is to
 * preserve animation (they still pass the 3 MB cap).
 */
export async function compressImage(
  file: File,
  opts: { maxEdge?: number; quality?: number } = {}
): Promise<Blob> {
  if (file.type === "image/gif") return file;
  const maxEdge = opts.maxEdge ?? 1920;
  const quality = opts.quality ?? 0.82;
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const [w, h] = scaled(img.naturalWidth, img.naturalHeight, maxEdge);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, w, h);
    return await canvasToBlob(canvas, "image/webp", quality);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Small WebP thumbnail (~50 KB target) for feeds and grids. */
export async function makeImageThumbnail(file: File): Promise<Blob> {
  if (file.type === "image/gif") return file;
  return compressImage(file, { maxEdge: 400, quality: 0.6 });
}

export interface VideoMeta {
  duration: number;
  width: number;
  height: number;
}

export function probeVideo(file: File): Promise<VideoMeta> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = () => {
      const meta = { duration: v.duration, width: v.videoWidth, height: v.videoHeight };
      URL.revokeObjectURL(url);
      resolve(meta);
    };
    v.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read video"));
    };
    v.src = url;
  });
}

/** Capture a poster frame (WebP) at the given time from a video file. */
export function posterAt(file: File, time = 0.1): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.muted = true;
    v.onloadedmetadata = () => {
      v.currentTime = Math.min(time, Math.max(0, v.duration - 0.05));
    };
    v.onseeked = async () => {
      try {
        const [w, h] = scaled(v.videoWidth, v.videoHeight, 720);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("no ctx");
        ctx.drawImage(v, 0, 0, w, h);
        const blob = await canvasToBlob(canvas, "image/webp", 0.7);
        URL.revokeObjectURL(url);
        resolve(blob);
      } catch (e) {
        URL.revokeObjectURL(url);
        reject(e);
      }
    };
    v.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read video"));
    };
    v.src = url;
  });
}
