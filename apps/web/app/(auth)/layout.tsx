import Link from "next/link";
import { AuroraBackground } from "@/components/brand/AuroraBackground";
import { Logo } from "@/components/brand/Logo";
import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { WalletProviders } from "@/components/web3/WalletProviders";

/**
 * Auth surface: a calm two-pane layout on desktop (branded panel + form) and a
 * single centered card on mobile, over the drifting aurora. The logo lockup
 * gets generous room on both so it is never clipped.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WalletProviders>
      <div className="relative min-h-[100svh]">
        <div aria-hidden="true" className="fixed inset-0 -z-10 pointer-events-none">
          <AuroraBackground variant="orchid" intensity="hero" />
        </div>

        <div className="relative z-10 min-h-[100svh] lg:grid lg:grid-cols-2">
          <AuthBrandPanel />

          <div className="flex flex-col items-center justify-center px-4 py-12 sm:px-8">
            <div className="lg:hidden mb-8">
              <Logo size="lg" />
            </div>
            <main id="main-content" className="w-full max-w-md">
              {children}
            </main>
            <p className="mt-8 text-xs text-faint text-center max-w-sm">
              By continuing you confirm you are 18 or older and agree to our{" "}
              <Link href="/legal/terms" className="text-lilac/70 hover:text-white underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/legal/privacy" className="text-lilac/70 hover:text-white underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </WalletProviders>
  );
}
