"use client";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/layout/AppShell";
import ScrollReveal from "@/components/home/ScrollReveal";
import SectionLabel from "@/components/home/SectionLabel";
import ReleaseSlateCard from "@/components/home/ReleaseSlateCard";
import SiteFooter from "@/components/home/SiteFooter";
import { DISTRIBUTION_PLATFORMS, DISTRIBUTION_REGIONS } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import { useT } from "@/hooks/useT";

// AI Distribution marketing page — the platform's second pillar. Explains the
// hand-off → AI release plan → reporting loop, shows the real platform/region
// coverage from the distribution flow, and routes owners into /assets.
export default function DistributionPage() {
  const t = useT();
  const router = useRouter();
  const isLoggedIn = useStore((s) => s.isLoggedIn);
  const steps = [
    { num: "01", title: t.distribution.step1T, body: t.distribution.step1B },
    { num: "02", title: t.distribution.step2T, body: t.distribution.step2B },
    { num: "03", title: t.distribution.step3T, body: t.distribution.step3B },
  ];

  // Owners go to their assets (where the per-film distribute flow lives);
  // anonymous visitors register first.
  const distribute = () => {
    if (!isLoggedIn) {
      toast.info(t.distribution.ctaToast);
      router.push("/register");
      return;
    }
    router.push("/assets");
  };

  return (
    <AppShell hideFooter>
      <ScrollReveal />
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 pt-14 pb-20">
        {/* Header */}
        <div className="animate-fade-up grid md:grid-cols-[6fr_5fr] gap-12 md:gap-20 items-center">
          <div>
            <SectionLabel>{t.distribution.title}</SectionLabel>
            <h1 className="font-headline text-5xl md:text-[64px] text-on-surface leading-[1.06] mt-6">
              {t.homeV2.distTitle1}
              <br />
              <span
                className="italic"
                style={{
                  background: "linear-gradient(135deg, #d4af37 0%, #f3d57f 60%, #d4af37 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {t.homeV2.distTitle2}
              </span>
            </h1>
            <p className="font-body text-on-surface-variant leading-relaxed mt-6 max-w-lg">
              {t.distribution.intro}
            </p>
          </div>
          <div className="animate-fade-up" style={{ animationDelay: "150ms" }}>
            <ReleaseSlateCard />
          </div>
        </div>

        {/* Three steps */}
        <div className="grid md:grid-cols-3 gap-10 md:gap-12 mt-24">
          {steps.map((s, i) => (
            <div
              key={s.num}
              className="scroll-reveal border-t border-outline-variant/40 pt-7"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <div
                className="font-label text-[56px] leading-[0.9] select-none"
                style={{ WebkitTextStroke: "1.2px rgba(212,175,55,0.55)", color: "transparent" }}
                aria-hidden="true"
              >
                {s.num}
              </div>
              <h2 className="font-headline text-2xl text-on-surface mt-4">{s.title}</h2>
              <p className="font-body text-sm text-on-surface-variant leading-relaxed mt-3">
                {s.body}
              </p>
            </div>
          ))}
        </div>

        {/* Coverage: platforms + regions from the real distribution flow */}
        <div className="scroll-reveal mt-24">
          <h2 className="font-headline text-3xl text-on-surface">
            {t.distribution.platformsTitle}
          </h2>
          <div className="flex flex-wrap gap-3 mt-8">
            {DISTRIBUTION_PLATFORMS.map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center gap-2.5 border border-outline-variant rounded-full px-5 py-2.5 font-body text-sm text-on-surface"
              >
                {p.name}
                <span className="font-label text-[9px] uppercase tracking-[0.2em] text-on-surface-variant/60">
                  {p.region}
                </span>
              </span>
            ))}
          </div>
          <p className="font-label text-[11px] uppercase tracking-[0.26em] text-on-surface-variant/70 mt-10">
            {t.distribution.regionsTitle}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4">
            {DISTRIBUTION_REGIONS.map((r) => (
              <span key={r.id} className="font-body text-sm text-on-surface-variant">
                {r.name}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="scroll-reveal text-center mt-28 border-t border-outline-variant/40 pt-20">
          <h2 className="font-headline text-4xl md:text-5xl text-on-surface">
            {t.distribution.ctaTitle}
          </h2>
          <button
            type="button"
            onClick={distribute}
            className="group inline-flex items-center gap-2.5 bg-primary text-on-primary font-label text-label-md uppercase tracking-widest px-7 py-4 rounded-full hover:opacity-90 active:scale-95 transition-all shadow-[0_8px_30px_rgba(212,175,55,0.25)] mt-10"
          >
            {t.distribution.cta}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
      <SiteFooter />
    </AppShell>
  );
}
