import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { GradientText } from "@/components/brand/GradientText";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = { title: "Set a new password" };

export default function ResetPasswordPage() {
  return (
    <Card variant="glass" className="p-6 sm:p-8 edge-light">
      <h1 className="font-display text-3xl font-bold text-white mb-1">
        Set a new <GradientText>password</GradientText>
      </h1>
      <p className="text-sm text-lilac/70 mb-6">
        Choose a strong password you do not use anywhere else.
      </p>
      <ResetPasswordForm />
    </Card>
  );
}
