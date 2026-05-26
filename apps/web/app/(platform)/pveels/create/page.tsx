import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PveelComposer } from "@/components/pveels/PveelComposer";
import { getMyTiers } from "@/lib/subscriptions/actions";

export const metadata = { title: "New Pveel" };

export default async function CreatePveelPage() {
  const tiers = await getMyTiers();
  return (
    <div className="max-w-xl mx-auto">
      <header className="mb-6 flex items-center gap-3">
        <Link
          href="/pveels"
          aria-label="Back to Pveels"
          className="h-9 w-9 rounded-lg flex items-center justify-center text-lilac/70 hover:text-white hover:bg-white/5"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="font-display text-3xl font-bold text-white">
          New <span className="text-gradient">Pveel</span>
        </h1>
      </header>
      <PveelComposer tiers={tiers} />
    </div>
  );
}
