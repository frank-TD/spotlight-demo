"use client";
import AppShell from "@/components/layout/AppShell";
import ScrollReveal from "@/components/home/ScrollReveal";
import HeroSection from "@/components/home/HeroSection";
import TrustLogosSection from "@/components/home/TrustLogosSection";
import TrendingSection from "@/components/home/TrendingSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import DealAgentsSection from "@/components/home/DealAgentsSection";
import TwoRolesSection from "@/components/home/TwoRolesSection";
import CommissionStudioSection from "@/components/home/CommissionStudioSection";
import AigcStudioShowcase from "@/components/home/AigcStudioShowcase";
import EndlessInspiration from "@/components/home/EndlessInspiration";
import FaqSection from "@/components/home/FaqSection";
import SiteFooter from "@/components/home/SiteFooter";

// Spotlight marketing homepage — cinematic dark landing built around the
// UX review's 8 priorities (identity correction, Marlow/Wren moat
// moment, horizontal genre rows, role split, FAQ). Reached by clicking
// the gold "Spotlight" wordmark in the top nav.
export default function HomePage() {
  return (
    <AppShell hideFooter heroUnderNav>
      <ScrollReveal />
      <HeroSection />
      <div className="max-w-[1280px] mx-auto px-2 md:px-6">
        <TrustLogosSection />
        <TrendingSection />
        <HowItWorksSection />
        <DealAgentsSection />
        <TwoRolesSection />
        <CommissionStudioSection />
        <AigcStudioShowcase />
        <EndlessInspiration />
        <FaqSection />
      </div>
      <SiteFooter />
    </AppShell>
  );
}
