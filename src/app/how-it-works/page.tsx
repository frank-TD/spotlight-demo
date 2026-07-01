"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Wand2 } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import ScrollReveal from "@/components/home/ScrollReveal";
import SectionLabel from "@/components/home/SectionLabel";
import DealAgentsSection from "@/components/home/DealAgentsSection";
import SiteFooter from "@/components/home/SiteFooter";
import { useStore } from "@/lib/store";
import { useT } from "@/hooks/useT";
import { cn } from "@/lib/utils";

type Role = "backer" | "creator";

// Two role-specific journeys behind a view toggle (per the guest flow). Copy is
// hardcoded English for this design pass, matching the marketplace convention.
const JOURNEY: Record<
  Role,
  {
    toggle: string;
    caption: string;
    steps: { num: string; title: string; body: string }[];
    ctaTitle: string;
    ctaBody: string;
    ctaLabel: string;
  }
> = {
  backer: {
    toggle: "For Backers",
    caption: "Fund it",
    steps: [
      {
        num: "01",
        title: "Post your brief",
        body: "Describe the film you want made — format, budget, references and timeline. Marlow, your deal agent, shapes it into a clear, biddable brief.",
      },
      {
        num: "02",
        title: "Match with creators",
        body: "Browse creator portfolios or field incoming bids. Compare them side by side while the agents surface the strongest fits.",
      },
      {
        num: "03",
        title: "Fund in escrow",
        body: "Lock your budget in escrow. Funds release stage by stage as the work is delivered — never everything up front.",
      },
      {
        num: "04",
        title: "Approve & distribute",
        body: "Review each cut, request revisions, and approve delivery. Take the finished film straight to distribution.",
      },
    ],
    ctaTitle: "Ready to fund your film?",
    ctaBody: "Post a brief and let creators come to you — browsing is free, and every stage is protected by escrow.",
    ctaLabel: "Fund a project",
  },
  creator: {
    toggle: "For Creators",
    caption: "Get funded",
    steps: [
      {
        num: "01",
        title: "Build your portfolio",
        body: "Showcase your best work and specialties so backers — and the matching agents — can discover you.",
      },
      {
        num: "02",
        title: "Find briefs & pitch",
        body: "Discover open briefs across genres and budgets, then pitch. Attach AIGC previews to stand out from the field.",
      },
      {
        num: "03",
        title: "Create with AIGC",
        body: "Generate moodboards, shots, voiceover and music in the AIGC studio, then assemble your delivery.",
      },
      {
        num: "04",
        title: "Deliver & get paid",
        body: "Submit each stage, clear review, and get paid from escrow as milestones are approved.",
      },
    ],
    ctaTitle: "Ready to get funded?",
    ctaBody: "Build a portfolio, bid on briefs, and create with AI — get paid from escrow as each milestone lands.",
    ctaLabel: "Get funded",
  },
};

// The full process story moved off the homepage: a role-toggled journey, the
// Marlow/Wren negotiation replay, the mechanics FAQ, and the distribution
// hand-off — for visitors who want to understand before they explore.
export default function HowItWorksPage() {
  const t = useT();
  const { switchRole } = useStore();
  const [role, setRole] = useState<Role>("backer");
  const view = JOURNEY[role];

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
          <h1 className="font-headline text-5xl md:text-6xl font-extrabold uppercase tracking-tight text-on-surface leading-[1.02] mt-6">
            {t.howItWorks.title}
          </h1>
          <p className="font-body text-on-surface-variant leading-relaxed mt-5">
            {t.howItWorks.intro}
          </p>
        </div>

        {/* Role view toggle — swaps the journey and the closing CTA below */}
        <div className="mt-10 animate-fade-up" style={{ animationDelay: "120ms" }}>
          <div
            className="inline-grid grid-cols-2 gap-1 p-1 rounded-2xl border border-outline-variant/40 bg-surface-container-low"
            role="tablist"
            aria-label="Choose your perspective"
          >
            {(["backer", "creator"] as Role[]).map((r) => {
              const active = role === r;
              return (
                <button
                  key={r}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setRole(r)}
                  className={cn(
                    "flex flex-col items-center px-8 md:px-12 py-3 rounded-xl transition-colors",
                    active
                      ? "bg-primary text-on-primary shadow-[0_8px_24px_rgba(198,255,52,0.22)]"
                      : "text-on-surface-variant hover:text-on-surface"
                  )}
                >
                  <span className="font-headline text-[19px] leading-none">{JOURNEY[r].toggle}</span>
                  <span
                    className={cn(
                      "mt-1.5 font-label text-[10px] uppercase tracking-[0.2em]",
                      active ? "text-on-primary/80" : "text-on-surface-variant/70"
                    )}
                  >
                    {JOURNEY[r].caption}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Role-specific journey — keyed by role so the rows re-animate on toggle */}
        <div key={role} className="mt-12">
          {view.steps.map((s, i) => (
            <div
              key={s.num}
              className="animate-fade-up grid md:grid-cols-[140px_1fr] gap-4 md:gap-10 py-10 border-t border-outline-variant/40"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div
                className="font-headline text-[64px] md:text-[80px] font-extrabold leading-[0.9] select-none"
                style={{ WebkitTextStroke: "1.2px rgba(244,240,232,0.2)", color: "transparent" }}
                aria-hidden="true"
              >
                {s.num}
              </div>
              <div className="max-w-2xl">
                <span className="block w-9 h-[3px] bg-primary mb-4" aria-hidden="true" />
                <h2 className="font-headline text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-on-surface">
                  {s.title}
                </h2>
                <p className="font-body text-on-surface-variant leading-relaxed mt-3">{s.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Per-view CTA — Fund a project / Get funded, plus the AIGC demo link on the creator side */}
        <div className="mt-10 border border-outline-variant/40 rounded-2xl bg-surface-container-lowest px-8 md:px-12 py-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="font-headline text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-on-surface">
              {view.ctaTitle}
            </h2>
            <p className="font-body text-on-surface-variant leading-relaxed mt-3">{view.ctaBody}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {role === "creator" && (
              <Link
                href="/discovery/workspace"
                className="group inline-flex items-center justify-center gap-2 font-label text-label-md uppercase tracking-widest text-on-primary-container border border-primary/60 px-7 py-4 rounded-full hover:bg-primary/10 transition-colors"
              >
                <Wand2 className="w-4 h-4" />
                See the AIGC studio
              </Link>
            )}
            <Link
              href="/market"
              onClick={() => switchRole(role)}
              className="group inline-flex items-center justify-center gap-2.5 bg-primary text-on-primary font-label text-label-md uppercase tracking-widest px-7 py-4 rounded-full hover:opacity-90 active:scale-95 transition-all shadow-[0_8px_30px_rgba(198,255,52,0.25)]"
            >
              {view.ctaLabel}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Marlow / Wren negotiation replay (moved from the homepage) */}
      <div id="agents" className="max-w-[1280px] mx-auto px-2 md:px-6 scroll-mt-24">
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
            <h2 className="font-headline text-3xl font-extrabold uppercase tracking-tight text-on-surface">{t.howItWorks.distTitle}</h2>
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

        {/* Closing CTA — into the marketplace */}
        <div className="scroll-reveal text-center mt-28">
          <h2 className="font-headline text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-on-surface">
            {t.howItWorks.ctaTitle}
          </h2>
          <Link
            href="/market"
            className="group inline-flex items-center gap-2.5 bg-primary text-on-primary font-label text-label-md uppercase tracking-widest px-7 py-4 rounded-full hover:opacity-90 active:scale-95 transition-all shadow-[0_8px_30px_rgba(198,255,52,0.25)] mt-10"
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
