"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  /** Optional stagger delay applied via the parent's transition */
  delay?: number;
  /** Distance traveled on reveal, in pixels */
  offset?: number;
  className?: string;
  as?: "div" | "section" | "article" | "li" | "ul";
}

const baseVariants = (offset: number, delay: number): Variants => ({
  hidden: { opacity: 0, y: offset },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.42,
      delay,
      ease: [0.22, 1, 0.36, 1],
    },
  },
});

/**
 * Wraps children in a Framer Motion section that fades + rises into view
 * once per page load (RPD §7.8). Children stagger via the `delay` prop.
 * `prefers-reduced-motion` is honoured by Framer Motion's defaults.
 */
export function ScrollReveal({
  children,
  delay = 0,
  offset = 16,
  className,
  as = "div",
}: ScrollRevealProps) {
  const MotionTag = motion[as];
  const reduce = useReducedMotion();

  // Reduced motion: render in place, no transform or fade.
  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10%" }}
      variants={baseVariants(offset, delay)}
      className={className}
    >
      {children}
    </MotionTag>
  );
}
