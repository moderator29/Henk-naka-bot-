"use client";

import { type ReactNode } from "react";
import { ToastProvider } from "@/components/ui/Toast";

/**
 * Top-level providers. Kept thin in sub-branch #3 — wagmi + RainbowKit +
 * React Query + Supabase auth context are added in sub-branches #4 and #6
 * so each PR stays reviewable.
 */
export function Providers({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
