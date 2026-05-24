import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FollowPill } from "./FollowPill";
import { formatNumber } from "@/lib/utils";
import type { TrendingCreator } from "@/lib/explore/queries";

export function CreatorCard({ creator }: { creator: TrendingCreator }) {
  return (
    <Link href={`/creators/${creator.username}`} className="block group h-full">
      <Card hoverable className="h-full flex flex-col">
        <div className="flex items-start gap-3">
          <div className="relative h-12 w-12 rounded-full overflow-hidden bg-imperial flex-shrink-0 ring-1 ring-magenta/30">
            {creator.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- avatar from Supabase storage
              <img src={creator.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="absolute inset-0 grid place-items-center font-display text-white">
                {creator.displayName.slice(0, 1).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <span className="font-medium text-white truncate">
                {creator.displayName}
              </span>
              {creator.verified && (
                <BadgeCheck size={15} className="text-cyan flex-shrink-0" aria-label="Verified" />
              )}
            </div>
            <span className="text-xs text-lilac/50">
              {formatNumber(creator.subscriberCount)} subscribers
            </span>
          </div>
        </div>
        {creator.tagline && (
          <p className="mt-3 text-sm text-lilac/70 line-clamp-2 flex-1">
            {creator.tagline}
          </p>
        )}
        <div className="mt-4">
          <FollowPill username={creator.username} className="w-full justify-center" />
        </div>
      </Card>
    </Link>
  );
}
