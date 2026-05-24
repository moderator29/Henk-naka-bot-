import type { MetadataRoute } from "next";

/**
 * PWA manifest. Routed automatically by Next at /manifest.webmanifest.
 *
 * Icons use the processed brand logo in /public/brand/logo.
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
        src: "/brand/logo/logo-mark.png",
        sizes: "any",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
