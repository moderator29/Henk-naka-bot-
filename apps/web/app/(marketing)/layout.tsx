import { MarketingNav } from "@/components/marketing/MarketingNav";
import { Footer } from "@/components/marketing/Footer";
import { SkipToContent } from "@/components/ui/SkipToContent";
import { AgeGate } from "@/components/brand/AgeGate";
import { AuroraBackground } from "@/components/brand/AuroraBackground";
import { getSessionUser } from "@/lib/auth/session";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser().catch(() => null);
  return (
    <>
      <div aria-hidden className="fixed inset-0 -z-10 pointer-events-none">
        <AuroraBackground intensity="hero" />
      </div>
      <AgeGate />
      <SkipToContent />
      <MarketingNav signedIn={!!user} />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  );
}
