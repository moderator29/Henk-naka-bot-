import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { GradientText } from "@/components/brand/GradientText";
import { EmailSignUpForm } from "@/components/auth/EmailSignUpForm";
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
        <WalletAuthButton />
      </div>

      <AuthDivider label="or with email" />

      <EmailSignUpForm humanVerified={humanVerified} />

      <p className="mt-5 text-center text-xs text-lilac/45">
        You must be 18+. By creating an account you agree to our{" "}
        <a href="/legal/terms" className="underline hover:text-lilac/70">Terms</a>{" "}
        and{" "}
        <a href="/legal/privacy" className="underline hover:text-lilac/70">Privacy Policy</a>.
      </p>
    </Card>
  );
}
