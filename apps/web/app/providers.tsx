"use client";

import { type ReactNode, useState, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "@/components/ui/Toast";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";

/**
 * Root providers, shared by every route: React Query (server + on-chain read
 * caching), Toast, Analytics. The wallet stack (wagmi + RainbowKit) is NOT
 * here, it lives in WalletProviders and is mounted only on the routes that use
 * a wallet, so the marketing pages and docs never ship the wallet bundle.
 */
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Suspense fallback={null}>
          <AnalyticsProvider>{children}</AnalyticsProvider>
        </Suspense>
      </ToastProvider>
    </QueryClientProvider>
  );
}
