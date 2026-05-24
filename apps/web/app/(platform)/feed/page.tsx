import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BrandIcon } from "@/components/brand/BrandIcon";

/**
 * Feed surface, followed-creator content lives here. With auth and a real
 * follow graph (sub-branches #8 + Phase 2) this fills in. For a user with an
 * empty graph, the surface gracefully points them back to Discover, which is
 * now the platform's front door.
 */
export default function FeedPage() {
  // PENDING_SUPABASE_AUTH, once auth is wired, fetch the requesting user's
  // follow graph + recent posts here. Until then we always render the empty
  // encouragement state.
  const hasFollows = false;

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-8">
        <h1 className="font-display text-4xl font-bold text-white">
          Your <span className="text-gradient">feed</span>
        </h1>
        <p className="mt-2 text-lilac/70">
          Posts from creators you follow, in one place.
        </p>
      </header>

      {!hasFollows && <EmptyFeedEncouragement />}
    </div>
  );
}

function EmptyFeedEncouragement() {
  return (
    <Card className="relative overflow-hidden border-magenta/20">
      <div className="relative grid sm:grid-cols-[auto_1fr] gap-6 items-center">
        <BrandIcon name="sparkle" size={88} />
        <div>
          <h2 className="font-display text-2xl font-semibold text-white">
            Your feed is quiet.
          </h2>
          <p className="mt-2 text-lilac/70">
            Discover creators you&apos;ll love and follow a few, your feed
            will fill up the moment they post.
          </p>
          <div className="mt-5">
            <Button asChild rightIcon={<ArrowRight size={18} />}>
              <Link href="/explore">Discover creators</Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
