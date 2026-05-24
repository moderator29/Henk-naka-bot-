"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Check, ArrowRight } from "lucide-react";
import { Turnstile } from "./Turnstile";
import { Button } from "@/components/ui/Button";

/**
 * Full-screen human-verification gate. The landing "Get Started" CTA routes
 * here (/verify?next=...). On a successful Turnstile challenge it auto-advances
 * to the destination (default /signup). It never gets stuck: if the widget is
 * slow or fails to load, a manual "Continue" appears after a few seconds (the
 * real server-side check still runs on the actual sign-up submit).
 */
export function VerifyGate({ next = "/signup" }: { next?: string }) {
  const router = useRouter();
  const [verified, setVerified] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const advanced = useRef(false);

  const proceed = useCallback(() => {
    if (advanced.current) return;
    advanced.current = true;
    setAdvancing(true);
    router.push(next);
  }, [next, router]);

  const onVerify = useCallback(() => {
    setVerified(true);
    try {
      sessionStorage.setItem("aurora.verified", String(Date.now()));
    } catch {
      // sessionStorage may be unavailable; non-fatal.
    }
    setTimeout(proceed, 700);
  }, [proceed]);

  // Safety net: never hard-stuck if the widget is slow or misconfigured.
  useEffect(() => {
    const t = setTimeout(() => setShowFallback(true), 6000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="w-full max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="glass-strong rounded-3xl p-8 shadow-glow text-center"
      >
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow"
        >
          <AnimatePresence mode="wait">
            {verified ? (
              <motion.span
                key="check"
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                className="text-white"
              >
                <Check size={30} />
              </motion.span>
            ) : (
              <motion.span key="shield" className="text-white">
                <ShieldCheck size={30} />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>

        <h1 className="font-display text-3xl font-bold text-white">
          {verified ? "You're verified." : "Quick security check"}
        </h1>
        <p className="mt-2 text-sm text-lilac/70">
          {verified
            ? "Welcome to Pleasure Coin. Taking you in."
            : "We keep the platform safe with a fast human check. One tap and you're through."}
        </p>

        <div className="mt-6 flex flex-col items-center gap-4">
          {verified ? (
            <Button
              size="lg"
              className="w-full"
              loading={advancing}
              onClick={proceed}
              rightIcon={<ArrowRight size={18} />}
            >
              Continue
            </Button>
          ) : (
            <>
              <Turnstile onVerify={onVerify} onExpire={() => setVerified(false)} />
              {showFallback && (
                <button
                  type="button"
                  onClick={proceed}
                  className="text-xs text-lilac/50 hover:text-white underline"
                >
                  Having trouble? Continue to sign up
                </button>
              )}
            </>
          )}
        </div>
      </motion.div>

      <p className="mt-6 text-center text-sm text-lilac/60">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="text-magenta hover:text-magenta-light font-medium"
        >
          Sign in
        </button>
      </p>
    </div>
  );
}
