"use client";
import AppShell from "@/components/layout/AppShell";
import ScrollReveal from "@/components/home/ScrollReveal";
import HeroCinematic from "@/components/home/HeroCinematic";
import FeaturedProjects from "@/components/home/FeaturedProjects";
import HowItWorksBand from "@/components/home/HowItWorksBand";
import DistributionSection from "@/components/home/DistributionSection";
import CreatorCallout from "@/components/home/CreatorCallout";
import SiteFooter from "@/components/home/SiteFooter";

// Spotlight marketing homepage — editorial showcase, five sections max:
// cinematic hero (Fund/Own/Stream + Explore/Submit CTAs), curated featured
// projects, three-step how-it-works band, AI distribution pillar, creator
// callout. Platform mechanics (agents, escrow, FAQ) moved to /how-it-works
// and /about; the full feed lives at /discovery.
export default function HomePage() {
  return (
    <AppShell hideFooter heroUnderNav>
      <ScrollReveal />
      <HeroCinematic />
      <FeaturedProjects />
      <HowItWorksBand />
      <DistributionSection />
      <CreatorCallout />
      <SiteFooter />
    </AppShell>
  );
}
