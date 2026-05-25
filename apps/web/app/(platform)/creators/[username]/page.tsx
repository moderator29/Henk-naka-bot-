import type { Metadata } from "next";
import { Info } from "lucide-react";
import { CreatorHeader } from "@/components/creator/CreatorHeader";
import { TierSelector } from "@/components/creator/TierSelector";
import { ContentTabs } from "@/components/creator/ContentTabs";
import { CatchMeUpButton } from "@/components/creator/CatchMeUpButton";
import { getCreatorByUsername } from "@/lib/creators/queries";
import { SAMPLE_PREVIEW_DATA } from "@/lib/creators/sample";
import { demoCreatorProfile, demoEnabled } from "@/lib/demo/data";

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

export default async function CreatorProfilePage({
  params,
}: CreatorPageProps) {
  const real = await getCreatorByUsername(params.username);
  const demo = demoEnabled() ? demoCreatorProfile(params.username) : null;
  const creator = real ?? demo ?? SAMPLE_PREVIEW_DATA;

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-6">
      {creator.isPreview && (
        <div className="mx-4 sm:mx-8 mb-2 mt-2 flex items-center gap-2 rounded-xl glass px-4 py-2.5 text-xs text-lilac/70">
          <Info size={14} className="text-cyan flex-shrink-0" />
          <span>
            Preview, a sample profile showing the creator surface. Real
            profiles render here once creators are onboarded.
          </span>
        </div>
      )}

      <CreatorHeader creator={creator} />

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
            <TierSelector tiers={creator.tiers} />
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
