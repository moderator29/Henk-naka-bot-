import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { GradientText } from "@/components/brand/GradientText";
import { EmailSignInForm } from "@/components/auth/EmailSignInForm";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { WalletAuthButton } from "@/components/auth/WalletAuthButton";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { hasHumanVerified } from "@/lib/auth/human-check";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  const humanVerified = hasHumanVerified();
  return (
    <Card variant="glass" className="p-6 sm:p-8 edge-light">
      <h1 className="font-display text-3xl font-bold text-white mb-1">
        Welcome <GradientText>back</GradientText>
      </h1>
      <p className="text-sm text-lilac/70 mb-6">
        Sign in to pick up where you left off.
      </p>

      <div className="flex flex-col gap-3">
        <GoogleButton label="Sign in with Google" />
        <WalletAuthButton />
      </div>

      <AuthDivider label="or with email" />

      <EmailSignInForm humanVerified={humanVerified} />
    </Card>
  );
}
