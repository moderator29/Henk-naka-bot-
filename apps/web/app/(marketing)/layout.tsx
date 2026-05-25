import { MarketingNav } from "@/components/marketing/MarketingNav";
import { Footer } from "@/components/marketing/Footer";
import { SkipToContent } from "@/components/ui/SkipToContent";
import { AgeGate } from "@/components/brand/AgeGate";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AgeGate />
      <SkipToContent />
      <MarketingNav />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  );
}
