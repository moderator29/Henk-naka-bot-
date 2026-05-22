import { MarketingNav } from "@/components/marketing/MarketingNav";
import { Footer } from "@/components/marketing/Footer";
import { SkipToContent } from "@/components/ui/SkipToContent";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SkipToContent />
      <MarketingNav />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  );
}
