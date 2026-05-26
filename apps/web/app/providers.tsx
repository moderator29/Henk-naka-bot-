"use client";

import { type ReactNode, useState, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { ToastProvider } from "@/components/ui/Toast";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { TranslateProvider } from "@/components/i18n/TranslateController";
import { wagmiConfig } from "@/lib/web3/wagmi";
import "@rainbow-me/rainbowkit/styles.css";

/**
 * Top-level providers: wagmi (wallet state) → React Query (server + on-chain
 * read caching) → RainbowKit (brand-themed connect modal) → Toast.
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
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#FF1F8F",
            accentColorForeground: "#FFFFFF",
            borderRadius: "large",
            fontStack: "system",
            overlayBlur: "large",
          })}
        >
          <ToastProvider>
            <Suspense fallback={null}>
              <AnalyticsProvider>
                <TranslateProvider>{children}</TranslateProvider>
              </AnalyticsProvider>
            </Suspense>
          </ToastProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
