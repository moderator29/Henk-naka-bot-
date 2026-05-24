"use client";

import { motion } from "framer-motion";

/**
 * Route transition wrapper (RPD §7.1). App Router re-mounts template.tsx on
 * every navigation, so this gives every page a soft cross-fade + 8px rise.
 * Framer Motion honors prefers-reduced-motion automatically.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}
