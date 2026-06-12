"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import ScrollReveal from "@/components/home/ScrollReveal";
import SectionLabel from "@/components/home/SectionLabel";
import DealAgentsSection from "@/components/home/DealAgentsSection";
import SiteFooter from "@/components/home/SiteFooter";
import { useT } from "@/hooks/useT";

// The full process story moved off the homepage: four steps in detail, the
// Marlow/Wren negotiation replay, the mechanics FAQ, and the distribution
// hand-off — for visitors who want to understand before they explore.
export default function HowItWorksPage() {
  const t = useT();
  const steps = [
    { num: "01", title: t.landing.processStep1Title, body: t.landing.processStep1Body },
    { num: "02", title: t.landing.processStep2Title, body: t.landing.processStep2Body },
    { num: "03", title: t.landing.processStep3Title, body: t.landing.processStep3Body },
    { num: "04", title: t.landing.processStep4Title, body: t.landing.processStep4Body },
  ];
  const faqs = [
    { q: t.landing.faqQ3, a: t.landing.faqA3 },
    { q: t.landing.faqQ4, a: t.landing.faqA4 },
    { q: t.landing.faqQ5, a: t.landing.faqA5 },
  ];

  return (
    <AppShell hideFooter>
      <ScrollReveal />
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 pt-14 pb-8">
        <div className="animate-fade-up max-w-2xl">
          <SectionLabel>{t.landing.processLabel}</SectionLabel>
          <h1 className="font-headline text-5xl md:text-6xl text-on-surface leading-tight mt-6">
            {t.howItWorks.title}
          </h1>
          <p className="font-body text-on-surface-variant leading-relaxed mt-5">
            {t.howItWorks.intro}
          </p>
        </div>

        {/* Four steps, editorial rows */}
        <div className="mt-20">
          {steps.map((s, i) => (
            <div
              key={s.num}
              className="scroll-reveal grid md:grid-cols-[140px_1fr] gap-4 md:gap-10 py-10 border-t border-outline-variant/40"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div
                className="font-label text-[64px] md:text-[80px] leading-[0.9] select-none"
                style={{ WebkitTextStroke: "1.2px rgba(212,175,55,0.55)", color: "transparent" }}
                aria-hidden="true"
              >
                {s.num}
              </div>
              <div className="max-w-2xl">
                <h2 className="font-headline text-2xl md:text-3xl text-on-surface">{s.title}</h2>
                <p className="font-body text-on-surface-variant leading-relaxed mt-3">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Marlow / Wren negotiation replay (moved from the homepage) */}
      <div className="max-w-[1280px] mx-auto px-2 md:px-6">
        <DealAgentsSection />
      </div>

      <div className="max-w-[1280px] mx-auto px-6 md:px-12 pb-20">
        {/* Mechanics FAQ */}
        <div className="scroll-reveal">
          <SectionLabel>{t.howItWorks.faqLabel}</SectionLabel>
        </div>
        <div className="grid md:grid-cols-3 gap-x-10 gap-y-10 mt-10">
          {faqs.map((f, i) => (
            <div
              key={f.q}
              className="scroll-reveal border-t border-outline-variant/40 pt-6"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <h3 className="font-headline text-xl text-on-surface">{f.q}</h3>
              <p className="font-body text-sm text-on-surface-variant leading-relaxed mt-3">
                {f.a}
              </p>
            </div>
          ))}
        </div>

        {/* Distribution hand-off */}
        <div
          id="distribution"
          className="scroll-reveal mt-24 border border-outline-variant/40 rounded-2xl bg-surface-container-lowest px-8 md:px-12 py-12 flex flex-col md:flex-row md:items-center justify-between gap-8"
        >
          <div className="max-w-xl">
            <h2 className="font-headline text-3xl text-on-surface">{t.howItWorks.distTitle}</h2>
            <p className="font-body text-on-surface-variant leading-relaxed mt-3">
              {t.howItWorks.distBody}
            </p>
          </div>
          <Link
            href="/distribution"
            className="group inline-flex items-center gap-2.5 font-label text-label-md uppercase tracking-widest text-on-primary-container border border-primary/60 px-7 py-4 rounded-full hover:bg-primary/10 transition-colors shrink-0"
          >
            {t.howItWorks.distCta}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Closing CTA */}
        <div className="scroll-reveal text-center mt-28">
          <h2 className="font-headline text-4xl md:text-5xl text-on-surface">
            {t.howItWorks.ctaTitle}
          </h2>
          <Link
            href="/discovery"
            className="group inline-flex items-center gap-2.5 bg-primary text-on-primary font-label text-label-md uppercase tracking-widest px-7 py-4 rounded-full hover:opacity-90 active:scale-95 transition-all shadow-[0_8px_30px_rgba(212,175,55,0.25)] mt-10"
          >
            {t.homeV2.ctaPrimary}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
      <SiteFooter />
    </AppShell>
  );
}
