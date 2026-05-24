import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Composer } from "@/components/feed/Composer";

export const metadata = { title: "Create a post" };

export default function ComposePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-6 flex items-center gap-3">
        <Link
          href="/feed"
          aria-label="Back to feed"
          className="h-9 w-9 rounded-lg flex items-center justify-center text-lilac/70 hover:text-white hover:bg-white/5"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="font-display text-3xl font-bold text-white">
          Create a <span className="text-gradient">post</span>
        </h1>
      </header>
      <Composer />
    </div>
  );
}
