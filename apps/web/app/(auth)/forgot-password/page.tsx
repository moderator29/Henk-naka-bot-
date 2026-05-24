import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { GradientText } from "@/components/brand/GradientText";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return (
    <Card variant="glass" className="p-6 sm:p-8 edge-light">
      <h1 className="font-display text-3xl font-bold text-white mb-1">
        Reset your <GradientText>password</GradientText>
      </h1>
      <p className="text-sm text-lilac/70 mb-6">
        Enter your email and we will send you a reset link.
      </p>
      <ForgotPasswordForm />
    </Card>
  );
}
