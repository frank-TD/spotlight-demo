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

// Archived original homepage — the black-and-gold cinematic showcase that used
// to live at `/`. Kept here after the Black + Lime editorial homepage was
// promoted to the root route, so the previous direction stays reachable.
export default function SpotlightCinematicHome() {
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
