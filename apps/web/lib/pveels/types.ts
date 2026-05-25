/**
 * Shared, serializable Pveel shape the viewing feed renders. The server
 * resolves `playbackUrl` (a public URL for free clips, a short-lived signed URL
 * for gated clips the viewer is entitled to, or null when locked) and the
 * `gated` flag, so the client never sees a gated file it shouldn't.
 */

export type PveelVisibility = "public" | "followers" | "subscribers" | "tier";

export interface PveelView {
  id: string;
  creatorUsername: string;
  creatorName: string;
  verified: boolean;
  caption: string;
  category: string | null;
  hashtags: string[];
  visibility: PveelVisibility;
  tierRequired: string | null;
  /** True when this viewer is NOT entitled: render the locked state, no file. */
  gated: boolean;
  /** Resolved, playable URL (signed for gated). Null when locked or demo. */
  playbackUrl: string | null;
  posterUrl: string | null;
  durationSeconds: number | null;
  width: number | null;
  height: number | null;
  allowComments: boolean;
  allowTips: boolean;
  likes: number;
  comments: number;
  saves: number;
  views: number;
  liked: boolean;
  saved: boolean;
  createdAt: string;
  isDemo: boolean;
  /** Accent pair for the canvas shown for demo clips or while a poster loads. */
  accent: [string, string];
}

const HUES = ["#FF1F8F", "#B847FF", "#5DD6FF", "#E9D5FF", "#2A0E5A"] as const;

/** Deterministic accent pair from an id, so a clip's fallback canvas is stable. */
export function accentFor(seed: string): [string, string] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return [HUES[h % HUES.length]!, HUES[(h >> 3) % HUES.length]!];
}
