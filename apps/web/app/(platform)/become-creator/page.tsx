import Link from "next/link";
import { BadgeCheck, Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getCreatorApplicationStatus } from "@/lib/safety/actions";
import { CreatorApplicationForm } from "@/components/creator/CreatorApplicationForm";

export const metadata = { title: "Become a creator" };

export default async function BecomeCreatorPage() {
  const status = await getCreatorApplicationStatus();

  return (
    <div className="max-w-xl mx-auto">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold text-white">
          Become a <span className="text-gradient">creator</span>
        </h1>
        <p className="mt-2 text-sm text-lilac/65">
          Set up tiers, post subscriber-only content, earn $NSFW from
          subscriptions and tips, and unlock the creator tools.
        </p>
      </header>

      {status.isCreator ? (
        <Card className="edge-light text-center py-12 flex flex-col items-center gap-4">
          <span className="h-12 w-12 rounded-2xl glass edge-light grid place-items-center text-cyan">
            <BadgeCheck size={24} />
          </span>
          <p className="text-white font-medium">You&apos;re already a creator.</p>
          <Button asChild>
            <Link href="/dashboard">Open creator dashboard</Link>
          </Button>
        </Card>
      ) : status.pending ? (
        <Card className="edge-light text-center py-12 flex flex-col items-center gap-4">
          <span className="h-12 w-12 rounded-2xl glass edge-light grid place-items-center text-magenta">
            <Clock size={22} />
          </span>
          <div>
            <p className="text-white font-medium">Application under review</p>
            <p className="text-sm text-lilac/60 mt-1">
              Our team is reviewing your application. You&apos;ll get a
              notification when it&apos;s approved.
            </p>
          </div>
        </Card>
      ) : (
        <>
          {status.lastStatus === "rejected" && (
            <div className="mb-4 rounded-xl border border-yellow-500/30 bg-yellow-500/5 px-4 py-3 text-sm text-yellow-200">
              Your last application wasn&apos;t approved.
              {status.reviewNote ? ` Note: ${status.reviewNote}` : ""} You can
              update your details and apply again.
            </div>
          )}
          <CreatorApplicationForm />
        </>
      )}
    </div>
  );
}
