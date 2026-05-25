import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { display, inter, mono } from "@/lib/fonts";
import { Providers } from "./providers";
import { REDUCE_MOTION_COOKIE } from "@/lib/profile/settings";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  title: {
    default: "Pleasure Coin, The Unified Creator Platform",
    template: "%s · Pleasure Coin",
  },
  description:
    "One platform for creators, fans, NFTs, staking, and the $NSFW token on Polygon. AI-native, aurora-styled.",
  openGraph: {
    title: "Pleasure Coin",
    description:
      "The unified creator platform. AI-native. Polygon-powered.",
    siteName: "Pleasure Coin",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Pinch-zoom stays enabled for accessibility; we prevent unwanted auto-zoom
  // on input focus by keeping form controls at 16px on small screens (see CSS).
  themeColor: "#0F0420",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const reduceMotion = cookies().get(REDUCE_MOTION_COOKIE)?.value === "1";
  return (
    <html
      lang="en"
      className={`${inter.variable} ${mono.variable} ${display.variable}${reduceMotion ? " reduce-motion" : ""}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-plum text-lilac">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
