"use client";
import AppShell from "@/components/layout/AppShell";
import ScrollReveal from "@/components/home/ScrollReveal";
import HeroCinematic from "@/components/home/HeroCinematic";
import TrustStrip from "@/components/home/TrustStrip";
import FeaturedProjects from "@/components/home/FeaturedProjects";
import HowItWorksBand from "@/components/home/HowItWorksBand";
import AgentShowcase from "@/components/home/AgentShowcase";
import DistributionSection from "@/components/home/DistributionSection";
import CreatorCallout from "@/components/home/CreatorCallout";
import ClosingFaq from "@/components/home/ClosingFaq";
import SiteFooter from "@/components/home/SiteFooter";

// Spotlight marketing homepage — editorial showcase: cinematic hero
// (Fund/Own/Stream + Explore/Submit CTAs), a trust strip of volume +
// escrow/backing credibility signals, curated featured projects, three-step
// how-it-works band, AI agent showcase, AI distribution pillar, creator
// callout, and a bold FAQ + oversized-wordmark footer as the closing sign-off.
// The full feed lives at /discovery.
export default function HomePage() {
  return (
    <AppShell hideFooter heroUnderNav>
      <ScrollReveal />
      <HeroCinematic />
      <TrustStrip />
      <FeaturedProjects />
      <HowItWorksBand />
      <AgentShowcase />
      <DistributionSection />
      <CreatorCallout />
      <ClosingFaq />
      <SiteFooter oversized />
    </AppShell>
  );
}
