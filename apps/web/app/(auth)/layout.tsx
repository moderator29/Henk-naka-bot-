import Link from "next/link";
import { AuroraBackground } from "@/components/brand/AuroraBackground";
import { Logo } from "@/components/brand/Logo";

/**
 * Auth surface layout. Centered glass card over a drifting aurora, the
 * first impression for a signed-out visitor. Logo top-left, links home.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-[100svh] flex flex-col items-center justify-center px-4 py-12">
      <AuroraBackground variant="orchid" intensity="normal" />
      <div className="absolute top-6 left-6">
        <Logo />
      </div>
      <main id="main-content" className="w-full max-w-md">
        {children}
      </main>
      <p className="mt-8 text-xs text-lilac/50 text-center max-w-sm">
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
  );
}
