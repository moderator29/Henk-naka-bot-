import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { GradientText } from "@/components/brand/GradientText";
import { EmailSignUpForm } from "@/components/auth/EmailSignUpForm";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { WalletAuthButton } from "@/components/auth/WalletAuthButton";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { hasHumanVerified } from "@/lib/auth/human-check";

export const metadata: Metadata = {
  title: "Create account",
};

export default function SignupPage() {
  const humanVerified = hasHumanVerified();
  return (
    <Card variant="glass" className="p-6 sm:p-8 edge-light">
      <h1 className="font-display text-3xl font-bold text-white mb-1">
        Create your <GradientText>account</GradientText>
      </h1>
      <p className="text-sm text-lilac/70 mb-6">
        One account for the whole ecosystem.
      </p>

      <div className="flex flex-col gap-3">
        <GoogleButton label="Sign up with Google" />
        <WalletAuthButton />
      </div>

      <AuthDivider label="or with email" />

      <EmailSignUpForm humanVerified={humanVerified} />
    </Card>
  );
}
