import { Suspense } from "react";
import { Hero } from "@/components/marketing/sections/Hero";
import { LiveTicker } from "@/components/marketing/sections/LiveTicker";
import { Mission } from "@/components/marketing/sections/Mission";
import { Ecosystem } from "@/components/marketing/sections/Ecosystem";
import { AIShowcase } from "@/components/marketing/sections/AIShowcase";
import { CreatorsCarousel } from "@/components/marketing/sections/CreatorsCarousel";
import { StakingCTA } from "@/components/marketing/sections/StakingCTA";
import { Journey } from "@/components/marketing/sections/Journey";
import { FAQ } from "@/components/marketing/sections/FAQ";
import { FinalCTA } from "@/components/marketing/sections/FinalCTA";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Suspense fallback={<div className="h-24" />}>
        <LiveTicker />
      </Suspense>
      <Mission />
      <Ecosystem />
      <AIShowcase />
      <CreatorsCarousel />
      <StakingCTA />
      <Journey />
      <FAQ />
      <FinalCTA />
    </>
  );
}
