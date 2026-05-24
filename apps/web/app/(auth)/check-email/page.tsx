import Link from "next/link";
import type { Metadata } from "next";
import { MailCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ResendConfirmation } from "@/components/auth/ResendConfirmation";

export const metadata: Metadata = { title: "Check your email" };

export default function CheckEmailPage({
  searchParams,
}: {
  searchParams: { email?: string };
}) {
  const email = searchParams.email;

  return (
    <Card variant="glass" className="p-6 sm:p-8 text-center edge-light">
      <div className="flex justify-center mb-4">
        <span className="h-14 w-14 rounded-2xl glass edge-light flex items-center justify-center text-cyan">
          <MailCheck size={28} />
        </span>
      </div>
      <h1 className="font-display text-2xl font-bold text-white mb-2">
        Check your email
      </h1>
      <p className="text-sm text-lilac/70 mb-2">
        We sent a confirmation link
        {email ? (
          <>
            {" "}
            to <span className="text-white">{email}</span>
          </>
        ) : null}
        . Click it to verify your account, then sign in.
      </p>
      <p className="text-xs text-faint mb-6">
        It can take a minute to arrive. Check spam if you do not see it.
      </p>

      {email && (
        <div className="mb-4">
          <ResendConfirmation email={email} />
        </div>
      )}

      <Button asChild variant="glass" className="w-full">
        <Link href="/login">Back to sign in</Link>
      </Button>
    </Card>
  );
}
