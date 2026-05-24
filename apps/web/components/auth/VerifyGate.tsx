"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Check, ArrowRight } from "lucide-react";
import { Turnstile } from "./Turnstile";
import { Button } from "@/components/ui/Button";

/**
 * Full-screen human-verification gate. The landing "Get Started" CTA routes
 * here (/verify?next=...); on a successful Turnstile challenge it stores a
 * short-lived client flag and forwards to the destination (default /signup).
 */
export function VerifyGate({ next = "/signup" }: { next?: string }) {
  const router = useRouter();
  const [verified, setVerified] = useState(false);
  const [advancing, setAdvancing] = useState(false);

  const onVerify = () => {
    setVerified(true);
    try {
      sessionStorage.setItem("aurora.verified", String(Date.now()));
    } catch {
      // sessionStorage may be unavailable; non-fatal.
    }
  };

  const proceed = () => {
    setAdvancing(true);
    router.push(next);
  };

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
            ? "Welcome to Pleasure Coin. Let's get you in."
            : "We keep the platform safe with a fast human check. One tap and you're through."}
        </p>

        <div className="mt-6 flex flex-col items-center gap-4">
          {!verified ? (
            <Turnstile onVerify={onVerify} onExpire={() => setVerified(false)} />
          ) : (
            <Button
              size="lg"
              className="w-full"
              loading={advancing}
              onClick={proceed}
              rightIcon={<ArrowRight size={18} />}
            >
              Continue
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
