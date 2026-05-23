import Link from "next/link";
import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { GradientText } from "@/components/brand/GradientText";
import { EmailSignUpForm } from "@/components/auth/EmailSignUpForm";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { WalletAuthButton } from "@/components/auth/WalletAuthButton";
import { AuthDivider } from "@/components/auth/AuthDivider";

export const metadata: Metadata = {
  title: "Create account",
};

export default function SignupPage() {
  return (
    <Card variant="glass" className="p-8">
      <h1 className="font-display text-3xl font-bold text-white mb-1">
        Join <GradientText>Pleasure Coin</GradientText>
      </h1>
      <p className="text-sm text-lilac/70 mb-6">
        One account for the whole ecosystem.
      </p>

      <div className="flex flex-col gap-3">
        <GoogleButton label="Sign up with Google" />
        <WalletAuthButton />
      </div>

      <AuthDivider label="or with email" />

      <EmailSignUpForm />

      <p className="mt-6 text-sm text-lilac/70 text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-magenta hover:text-magenta-light font-medium">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
