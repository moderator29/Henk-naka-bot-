import type { MetadataRoute } from "next";

/**
 * PWA manifest. Routed automatically by Next at /manifest.webmanifest.
 *
 * Icon assets point to the runtime-generated /icon and /apple-icon routes
 * until the real logo PNGs land in /public/brand/logo and the icons can be
 * baked statically. PENDING_REAL_LOGO_ASSET.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pleasure Coin",
    short_name: "Pleasure Coin",
    description:
      "The unified creator platform. AI-native, Polygon-powered, aurora-styled.",
    start_url: "/",
    display: "standalone",
    background_color: "#0F0420",
    theme_color: "#0F0420",
    orientation: "portrait",
    categories: ["social", "lifestyle"],
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
