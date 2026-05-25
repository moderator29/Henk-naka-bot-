/**
 * Stored shape of a post's media (the `posts.media` jsonb array). For public
 * posts `src`/`thumb`/`poster` are public URLs; for gated posts they are object
 * PATHS inside the private `gated-media` bucket, signed on read when the viewer
 * is entitled. Shared by the composer (writes) and the read path (resolves).
 */
export interface StoredMediaItem {
  type: "image" | "video";
  src: string;
  thumb?: string;
  poster?: string;
}
