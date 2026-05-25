import { MarketingNav } from "@/components/marketing/MarketingNav";
import { Footer } from "@/components/marketing/Footer";
import { SkipToContent } from "@/components/ui/SkipToContent";
import { AgeGate } from "@/components/brand/AgeGate";
import { AuroraBackground } from "@/components/brand/AuroraBackground";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div aria-hidden className="fixed inset-0 -z-10 pointer-events-none">
        <AuroraBackground intensity="hero" />
      </div>
      <AgeGate />
      <SkipToContent />
      <MarketingNav />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  );
}
