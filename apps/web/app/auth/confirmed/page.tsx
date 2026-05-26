"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

/**
 * Post-confirmation interstitial. The auth callback exchanges the code for a
 * session, then forwards here; this shows a brief "Verifying…" then drops the
 * user inside the platform (never the marketing site). Reads `next` from the
 * URL on the client to avoid a Suspense boundary.
 */
export default function ConfirmedPage() {
  const router = useRouter();
  const [done, setDone] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("next") || "/feed";
    const next =
      raw.startsWith("/") && !raw.startsWith("//") && !raw.startsWith("/\\")
        ? raw
        : "/feed";
    const doneTimer = setTimeout(() => setDone(true), 1100);
    const goTimer = setTimeout(() => router.replace(next), 2000);
    return () => {
      clearTimeout(doneTimer);
      clearTimeout(goTimer);
    };
  }, [router]);

  return (
    <div className="min-h-[100svh] grid place-items-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-3xl p-10 text-center shadow-glow w-full max-w-sm"
      >
        <div className="mb-6 flex justify-center">
          <Logo size="md" />
        </div>
        <div className="mx-auto mb-5 h-14 w-14 rounded-2xl bg-gradient-primary grid place-items-center shadow-glow">
          {done ? (
            <Check size={26} className="text-white" />
          ) : (
            <Loader2 size={24} className="text-white animate-spin" />
          )}
        </div>
        <h1 className="font-display text-2xl font-bold text-white">
          {done ? "You're verified" : "Verifying…"}
        </h1>
        <p className="mt-2 text-sm text-lilac/70">
          {done ? "Taking you in." : "Confirming your account."}
        </p>
      </motion.div>
    </div>
  );
}
