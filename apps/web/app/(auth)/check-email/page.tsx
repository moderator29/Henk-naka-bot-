import Link from "next/link";
import type { Metadata } from "next";
import { MailCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Check your email",
};

export default function CheckEmailPage() {
  return (
    <Card variant="glass" className="p-8 text-center">
      <div className="flex justify-center mb-4">
        <span className="h-14 w-14 rounded-2xl glass flex items-center justify-center text-cyan">
          <MailCheck size={28} />
        </span>
      </div>
      <h1 className="font-display text-2xl font-bold text-white mb-2">
        Check your email
      </h1>
      <p className="text-sm text-lilac/70 mb-6">
        We sent a confirmation link. Click it to verify your account, then sign
        in.
      </p>
      <Button asChild variant="glass" className="w-full">
        <Link href="/login">Back to sign in</Link>
      </Button>
    </Card>
  );
}
