import type { Metadata } from "next";
import { VerifyGate } from "@/components/auth/VerifyGate";

export const metadata: Metadata = {
  title: "Verify",
  robots: { index: false, follow: false },
};

interface VerifyPageProps {
  searchParams: { next?: string };
}

export default function VerifyPage({ searchParams }: VerifyPageProps) {
  // Only allow same-origin relative paths as the forward target.
  const raw = searchParams.next ?? "/signup";
  const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/signup";
  return <VerifyGate next={next} />;
}
