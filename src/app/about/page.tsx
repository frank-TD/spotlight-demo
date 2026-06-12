"use client";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Key, ListChecks } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import ScrollReveal from "@/components/home/ScrollReveal";
import SectionLabel from "@/components/home/SectionLabel";
import SiteFooter from "@/components/home/SiteFooter";
import { useT } from "@/hooks/useT";

// Company/positioning page: identity, backing, protection principles, and
// the trust facts that used to crowd the homepage (stats, disclaimer, FAQ).
export default function AboutPage() {
  const t = useT();
  const principles = [
    { icon: ShieldCheck, title: t.landing.capEscrowTitle, body: t.landing.capEscrowBody },
    { icon: ListChecks, title: t.landing.capMilestoneTitle, body: t.landing.capMilestoneBody },
    { icon: Key, title: t.landing.capIpTitle, body: t.landing.capIpBody },
  ];
  const stats = [
    { value: t.landing.momentumStat1, label: t.landing.momentumStat1Label },
    { value: t.landing.momentumStat2, label: t.landing.momentumStat2Label },
    { value: t.landing.momentumStat3, label: t.landing.momentumStat3Label },
  ];
  const faqs = [
    { q: t.landing.faqQ1, a: t.landing.faqA1 },
    { q: t.landing.faqQ2, a: t.landing.faqA2 },
  ];

  return (
    <AppShell hideFooter>
      <ScrollReveal />
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 pt-14 pb-20">
        <div className="animate-fade-up max-w-2xl">
          <SectionLabel>Spotlight</SectionLabel>
          <h1 className="font-headline text-5xl md:text-6xl text-on-surface leading-tight mt-6">
            {t.aboutPage.title}
          </h1>
          <p className="font-body text-lg text-on-surface leading-relaxed mt-7">
            {t.aboutPage.intro1}
          </p>
          <p className="font-body text-on-surface-variant leading-relaxed mt-4">
            {t.aboutPage.intro2}
          </p>
        </div>

        {/* Backing */}
        <div className="scroll-reveal mt-20 border-t border-outline-variant/40 pt-10 grid md:grid-cols-[320px_1fr] gap-6 md:gap-12">
          <h2 className="font-headline text-2xl md:text-3xl text-on-surface">
            {t.aboutPage.backingTitle}
          </h2>
          <p className="font-body text-on-surface-variant leading-relaxed max-w-2xl">
            {t.landing.faqA6}
          </p>
        </div>

        {/* Protection principles */}
        <div className="scroll-reveal mt-20">
          <SectionLabel>{t.aboutPage.principlesTitle}</SectionLabel>
        </div>
        <div className="grid md:grid-cols-3 gap-8 mt-10">
          {principles.map((p, i) => (
            <div
              key={p.title}
              className="scroll-reveal border border-outline-variant/40 rounded-2xl bg-surface-container-lowest p-8"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <span className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-primary/10 text-primary">
                <p.icon className="w-5 h-5" />
              </span>
              <h3 className="font-headline text-xl text-on-surface mt-5">{p.title}</h3>
              <p className="font-body text-sm text-on-surface-variant leading-relaxed mt-2.5">
                {p.body}
              </p>
            </div>
          ))}
        </div>

        {/* Network stats */}
        <div className="scroll-reveal mt-20 border-y border-outline-variant/40 py-12 grid grid-cols-3 gap-6 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="font-headline text-3xl md:text-4xl text-primary">{s.value}</p>
              <p className="font-label text-[10px] uppercase tracking-[0.26em] text-on-surface-variant mt-2">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Positioning FAQ */}
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-10 mt-20">
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

        {/* Closing CTA */}
        <div className="scroll-reveal text-center mt-28">
          <h2 className="font-headline text-4xl md:text-5xl text-on-surface">
            {t.aboutPage.ctaTitle}
          </h2>
          <Link
            href="/discovery"
            className="group inline-flex items-center gap-2.5 bg-primary text-on-primary font-label text-label-md uppercase tracking-widest px-7 py-4 rounded-full hover:opacity-90 active:scale-95 transition-all shadow-[0_8px_30px_rgba(212,175,55,0.25)] mt-10"
          >
            {t.homeV2.ctaPrimary}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <p className="font-label text-[10px] uppercase tracking-[0.22em] text-on-surface-variant/50 text-center mt-20">
          {t.landing.footerDisclaimer}
        </p>
      </div>
      <SiteFooter />
    </AppShell>
  );
}
