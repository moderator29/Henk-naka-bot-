import { MarketingNav } from "@/components/marketing/MarketingNav";
import { Footer } from "@/components/marketing/Footer";
import { SkipToContent } from "@/components/ui/SkipToContent";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { AuroraBackground } from "@/components/brand/AuroraBackground";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div aria-hidden className="fixed inset-0 -z-10 pointer-events-none">
        <AuroraBackground intensity="app" />
      </div>
      <SkipToContent />
      <MarketingNav />
      <div className="pt-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[260px_1fr] gap-8 lg:gap-12">
        <DocsSidebar />
        <main id="main-content" className="min-w-0 py-12">
          {children}
        </main>
      </div>
      <Footer />
    </>
  );
}
