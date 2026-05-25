import type { Metadata } from "next";
import Link from "next/link";
import { UserX } from "lucide-react";
import { CreatorHeader } from "@/components/creator/CreatorHeader";
import { TierSelector } from "@/components/creator/TierSelector";
import { ContentTabs } from "@/components/creator/ContentTabs";
import { CatchMeUpButton } from "@/components/creator/CatchMeUpButton";
import { Button } from "@/components/ui/Button";
import {
  getCreatorByUsername,
  getViewerRelation,
  type ViewerRelation,
} from "@/lib/creators/queries";

interface CreatorPageProps {
  params: { username: string };
}

export async function generateMetadata({
  params,
}: CreatorPageProps): Promise<Metadata> {
  const creator = await getCreatorByUsername(params.username);
  const name = creator?.displayName ?? params.username;
  return {
    title: `${name} · Creator`,
    description: creator?.tagline ?? `${name} on Pleasure Coin`,
  };
}

export default async function CreatorProfilePage({ params }: CreatorPageProps) {
  const creator = await getCreatorByUsername(params.username);

  if (!creator) {
    return (
      <div className="max-w-md mx-auto py-20 text-center flex flex-col items-center gap-4">
        <span className="h-14 w-14 rounded-2xl glass edge-light grid place-items-center text-lilac/60">
          <UserX size={26} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold text-white">
            Creator not found
          </h1>
          <p className="mt-1 text-sm text-lilac/60">
            @{params.username} isn&apos;t a creator yet, or the handle is wrong.
          </p>
        </div>
        <Button asChild>
          <Link href="/explore">Discover creators</Link>
        </Button>
      </div>
    );
  }

  const relation: ViewerRelation = creator.id
    ? await getViewerRelation(creator.id)
    : { following: false, subscribedTierIds: [] };

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-6">
      <CreatorHeader creator={creator} relation={relation} />

      <div className="mx-4 sm:mx-8 mt-8 grid lg:grid-cols-[1fr_340px] gap-8 pb-12">
        <div className="order-2 lg:order-1">
          <ContentTabs posts={creator.posts} />
        </div>

        <aside className="order-1 lg:order-2 flex flex-col gap-6">
          <CatchMeUpButton displayName={creator.displayName} username={creator.username} />
          <div>
            <h2 className="font-display text-lg font-semibold text-white mb-3">
              Subscription tiers
            </h2>
            <TierSelector
              tiers={creator.tiers}
              subscribedTierIds={relation.subscribedTierIds}
            />
          </div>
          {creator.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {creator.categories.map((c) => (
                <span
                  key={c}
                  className="text-xs px-3 py-1 rounded-full glass text-lilac/70"
                >
                  {c}
                </span>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
