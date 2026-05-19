"use client";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import MouseGlow from "@/components/home/MouseGlow";
import ScrollReveal from "@/components/home/ScrollReveal";
import { useT } from "@/hooks/useT";
import { ArrowRight, Sparkles, Film, FileVideo, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";

const AVATAR_STACK = [
  { initials: "AS", bg: "bg-rose-100", text: "text-rose-700" },
  { initials: "MR", bg: "bg-sky-100", text: "text-sky-700" },
  { initials: "YT", bg: "bg-emerald-100", text: "text-emerald-700" },
  { initials: "SO", bg: "bg-amber-100", text: "text-amber-700" },
];

export default function HomePage() {
  const { isLoggedIn } = useStore();
  const router = useRouter();
  const t = useT();

  const STATS = [
    { label: t.home.stats.activeCreators, value: "2,400+" },
    { label: t.home.stats.projectsCompleted, value: "18,000+" },
    { label: t.home.stats.avgDelivery, value: t.home.stats.avgDeliveryValue },
    { label: t.home.stats.satisfaction, value: "98.2%" },
  ];

  return (
    <AppShell>
      <MouseGlow />
      <ScrollReveal />

      {/* Hero with mesh background */}
      <section className="bg-mesh -mx-6 md:-mx-12 px-6 md:px-12 pb-32 pt-20 relative">
        <div
          className="animate-hero-reveal max-w-5xl mx-auto text-center"
          style={{ animationDelay: "0.1s" }}
        >
          <span className="inline-flex items-center gap-1.5 bg-tertiary-container text-on-tertiary-container px-4 py-1.5 rounded-full font-label text-label-md uppercase tracking-widest mb-8">
            <Sparkles className="w-3.5 h-3.5" /> {t.home.badge}
          </span>
          <h1 className="font-headline text-[56px] md:text-[88px] leading-[1.05] tracking-tight text-on-surface">
            {t.home.heroLine1}
            <br />
            <span className="italic font-normal text-primary">{t.home.heroLine2}</span>
          </h1>
          <p className="animate-subtle-float font-body text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto mt-8 leading-relaxed">
            {t.home.heroDesc}
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap mt-12">
            {isLoggedIn ? (
              <button
                onClick={() => router.push("/market")}
                className="group glow-hover flex items-center gap-3 bg-primary text-on-primary font-label text-lg uppercase tracking-widest px-10 py-5 rounded-lg hover:scale-105 active:scale-95 transition-transform"
              >
                {t.home.goToMarketplace}
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
            ) : (
              <>
                <Link
                  href="/register"
                  className="group glow-hover flex items-center gap-3 bg-primary text-on-primary font-label text-lg uppercase tracking-widest px-10 py-5 rounded-lg hover:scale-105 active:scale-95 transition-transform"
                >
                  {t.home.startProject}
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/login"
                  className="font-label text-lg uppercase tracking-widest px-10 py-5 border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors"
                >
                  {t.nav.signIn}
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-[1280px] mx-auto px-6 md:px-12">
        {/* Stats card overlapping hero */}
        <section className="-mt-24 mb-24 relative z-10">
          <div className="scroll-reveal bg-surface-container-lowest border border-outline-variant rounded-2xl py-10 md:py-12 px-10 md:px-16 flex flex-col md:flex-row justify-between items-center gap-10 md:gap-0 text-center shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            {STATS.map((s, i) => (
              <div key={s.label} className="flex items-center gap-8 md:gap-12">
                <div className="flex flex-col items-center">
                  <span className="font-headline text-[40px] md:text-[48px] font-bold text-primary leading-none mb-2">
                    {s.value}
                  </span>
                  <span className="font-label text-label-md uppercase tracking-widest text-on-surface-variant">
                    {s.label}
                  </span>
                </div>
                {i < STATS.length - 1 && (
                  <div className="hidden md:block w-px h-16 bg-outline-variant opacity-50" />
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Bento "How it works" */}
      <section className="bg-surface-container-low -mx-6 md:-mx-12 px-6 md:px-12 py-24">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-16">
            <p className="font-label text-label-md uppercase tracking-[0.2em] text-on-surface-variant mb-3">
              {t.home.howDesc}
            </p>
            <h2 className="font-headline text-[40px] md:text-[56px] font-bold text-on-surface leading-tight">
              {t.home.howTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Step 1 — 8 col, white card with visual at bottom */}
            <div className="md:col-span-8 group bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 hover:border-primary transition-colors scroll-reveal">
              <div className="flex flex-col h-full">
                <span className="font-label text-[40px] text-primary-fixed-dim leading-none">01</span>
                <h3 className="font-headline text-[28px] font-semibold mt-4 mb-2 text-on-surface">
                  {t.home.steps[0].title}
                </h3>
                <p className="font-body text-on-surface-variant max-w-md leading-relaxed">
                  {t.home.steps[0].desc}
                </p>
                <div className="mt-8 aspect-[21/9] rounded-xl overflow-hidden bg-gradient-to-br from-primary-container via-primary-fixed to-tertiary-container flex items-center justify-center group-hover:scale-[1.01] transition-transform duration-700">
                  <ScrollText className="w-16 h-16 text-primary/60" />
                </div>
              </div>
            </div>

            {/* Step 2 — 4 col, primary brown bg, avatar stack */}
            <div className="md:col-span-4 bg-primary text-on-primary rounded-2xl p-8 scroll-reveal">
              <div className="flex flex-col h-full">
                <span className="font-label text-[40px] opacity-50 leading-none">02</span>
                <h3 className="font-headline text-[28px] font-semibold mt-4 mb-2">
                  {t.home.steps[1].title}
                </h3>
                <p className="font-body text-on-primary/80 leading-relaxed mb-8">
                  {t.home.steps[1].desc}
                </p>
                <div className="mt-auto flex -space-x-3">
                  {AVATAR_STACK.map((a) => (
                    <div
                      key={a.initials}
                      className={cn(
                        "w-12 h-12 rounded-full border-2 border-primary flex items-center justify-center text-sm font-bold",
                        a.bg,
                        a.text
                      )}
                    >
                      {a.initials}
                    </div>
                  ))}
                  <div className="w-12 h-12 rounded-full border-2 border-primary bg-surface-container text-on-surface-variant flex items-center justify-center font-label text-xs">
                    +12
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 — 4 col, tertiary container, progress widget */}
            <div className="md:col-span-4 bg-tertiary-container rounded-2xl p-8 scroll-reveal">
              <div className="flex flex-col h-full">
                <span className="font-label text-[40px] text-on-tertiary-container opacity-50 leading-none">
                  03
                </span>
                <h3 className="font-headline text-[28px] font-semibold mt-4 mb-2 text-on-tertiary-container">
                  {t.home.steps[2].title}
                </h3>
                <p className="font-body text-on-tertiary-container/80 leading-relaxed">
                  {t.home.steps[2].desc}
                </p>
                <div className="mt-auto pt-8">
                  <div className="bg-white/40 p-4 rounded-xl border border-white/60">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                        {t.market.activeOrder}
                      </span>
                      <span className="font-label text-[10px] uppercase tracking-widest text-primary font-bold">
                        {t.common.inProgress}
                      </span>
                    </div>
                    <div className="w-full bg-white rounded-full h-1.5 overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: "60%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 — 8 col, side image */}
            <div className="md:col-span-8 group bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 hover:border-primary transition-colors scroll-reveal">
              <div className="flex flex-col md:flex-row gap-8 items-center h-full">
                <div className="flex-1">
                  <span className="font-label text-[40px] text-primary-fixed-dim leading-none">04</span>
                  <h3 className="font-headline text-[28px] font-semibold mt-4 mb-2 text-on-surface">
                    {t.home.steps[3].title}
                  </h3>
                  <p className="font-body text-on-surface-variant leading-relaxed">
                    {t.home.steps[3].desc}
                  </p>
                </div>
                <div className="w-full md:w-64 h-48 rounded-xl overflow-hidden bg-gradient-to-br from-secondary-container via-secondary-fixed to-primary-fixed flex items-center justify-center group-hover:scale-[1.02] transition-transform duration-700">
                  <Film className="w-14 h-14 text-primary/60" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-24">
        <section className="scroll-reveal bg-primary text-on-primary rounded-2xl p-12 md:p-16 text-center relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <FileVideo className="w-64 h-64" />
          </div>
          <div className="relative z-10">
            <h2 className="font-headline text-[36px] md:text-[44px] mb-4 leading-tight">
              {t.home.ctaTitle}
            </h2>
            <p className="font-body text-on-primary/80 mb-10 max-w-xl mx-auto leading-relaxed">
              {t.home.ctaDesc}
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                href="/register"
                className="bg-primary-container text-on-primary-container font-label text-label-md uppercase tracking-widest px-6 py-3 rounded-lg hover:brightness-110 transition-all"
              >
                {t.home.getStartedFree}
              </Link>
              <Link
                href="/market/creators"
                className="font-label text-label-md uppercase tracking-widest px-6 py-3 border border-on-primary/30 rounded-lg hover:bg-white/10 transition-colors"
              >
                {t.home.browseCreators}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
