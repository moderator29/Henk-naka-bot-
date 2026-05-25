"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuroraBackground } from "@/components/brand/AuroraBackground";

const KEY = "pc.agegate";

/** The Pleasurely "P" mark, rebuilt as a clean gradient glyph. */
function PleasurelyMark() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="relative h-11 w-11 rounded-2xl bg-gradient-to-br from-orchid to-magenta grid place-items-center shadow-[var(--glow-orchid)]">
        <span className="font-display text-2xl font-extrabold text-white leading-none">P</span>
        <span className="absolute inset-0 rounded-2xl ring-1 ring-white/15" />
      </span>
      <span className="font-display text-2xl font-bold text-white tracking-tight">
        Pleasurely
      </span>
    </span>
  );
}

/**
 * First-visit 18+ age gate. A cinematic glass confirmation over the aurora,
 * shown once (localStorage). Mirrors the classic adult-site entry screen but
 * elevated to the brand. Reduced-motion safe via the shared aurora.
 */
export function AgeGate() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setOpen(true);
    } catch {
      /* storage unavailable: don't block */
    }
  }, []);

  const confirm = () => {
    try {
      localStorage.setItem(KEY, new Date().toISOString());
    } catch {
      /* non-fatal */
    }
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] grid place-items-center px-4"
          role="dialog"
          aria-modal="true"
          aria-label="Age verification"
        >
          <div className="absolute inset-0 -z-10">
            <AuroraBackground variant="orchid" intensity="hero" />
            <div className="absolute inset-0 bg-plum/70" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md glass-strong edge-light rounded-3xl p-8 text-center shadow-e4"
          >
            <div className="flex justify-center mb-8">
              <PleasurelyMark />
            </div>

            <h1 className="font-display text-2xl font-bold text-white leading-snug">
              You are about to enter a site that contains age-restricted
              content.
            </h1>
            <p className="mt-3 text-sm text-lilac/70">
              You must be 18 or older to enter.
            </p>

            <div className="my-7 h-px bg-white/10" />

            <button
              type="button"
              onClick={confirm}
              className="w-full h-14 rounded-pill btn-primary text-white text-base font-bold"
            >
              I am 18 or older
            </button>

            <a
              href="https://www.google.com"
              className="mt-4 inline-block text-xs text-lilac/45 hover:text-lilac/70 transition-colors"
            >
              I am under 18, take me back
            </a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
