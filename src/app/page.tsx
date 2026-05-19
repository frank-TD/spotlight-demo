"use client";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { useT } from "@/hooks/useT";
import { ArrowRight, Sparkles, Film, Shield, Zap, Globe } from "lucide-react";

const FEATURE_ICONS = [Film, Shield, Zap, Globe];

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
      <div className="max-w-[1280px] mx-auto px-6 md:px-12">
        {/* Hero */}
        <section className="pt-20 pb-20 text-center">
          <span className="inline-flex items-center gap-1.5 bg-primary-container text-on-primary-container px-4 py-1.5 rounded-full font-label text-label-md uppercase tracking-widest mb-8">
            <Sparkles className="w-3.5 h-3.5" /> {t.home.badge}
          </span>
          <h1 className="font-headline text-[56px] md:text-[72px] leading-[1.1] tracking-tight text-on-surface mb-6">
            {t.home.heroLine1}
            <br />
            <span className="italic text-primary">{t.home.heroLine2}</span>
          </h1>
          <p className="font-body text-lg text-on-surface-variant max-w-xl mx-auto mb-10 leading-relaxed">
            {t.home.heroDesc}
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {isLoggedIn ? (
              <button
                onClick={() => router.push("/market")}
                className="flex items-center gap-2 bg-primary text-on-primary font-label text-label-md uppercase tracking-wider px-6 py-3 rounded-lg hover:opacity-90 active:scale-95 transition-all"
              >
                {t.home.goToMarketplace} <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <Link
                  href="/register"
                  className="flex items-center gap-2 bg-primary text-on-primary font-label text-label-md uppercase tracking-wider px-6 py-3 rounded-lg hover:opacity-90 active:scale-95 transition-all"
                >
                  {t.home.startProject} <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="font-label text-label-md uppercase tracking-wider px-6 py-3 border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors"
                >
                  {t.nav.signIn}
                </Link>
              </>
            )}
          </div>
        </section>

        {/* Stats */}
        <section className="border border-outline-variant/30 rounded-2xl bg-surface-container-lowest p-8 mb-20 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-headline text-headline-md text-on-surface">{s.value}</p>
              <p className="font-label text-label-md uppercase tracking-wider text-on-surface-variant mt-2">
                {s.label}
              </p>
            </div>
          ))}
        </section>

        {/* How it works */}
        <section className="mb-24">
          <div className="text-center mb-12">
            <p className="font-label text-label-md uppercase tracking-[0.2em] text-on-surface-variant mb-3">
              {t.home.howDesc}
            </p>
            <h2 className="font-headline text-headline-md text-on-surface">{t.home.howTitle}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {t.home.steps.map((item, idx) => (
              <div
                key={idx}
                className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 hover:border-primary/40 transition-colors"
              >
                <span className="font-label text-label-md tracking-widest text-primary font-bold">
                  0{idx + 1}
                </span>
                <h3 className="font-headline text-[20px] text-on-surface mt-3 mb-2">{item.title}</h3>
                <p className="font-body text-sm text-on-surface-variant leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mb-24">
          <div className="text-center mb-12">
            <h2 className="font-headline text-headline-md text-on-surface">{t.home.featuresTitle}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {t.home.features.map((f, idx) => {
              const Icon = FEATURE_ICONS[idx];
              return (
                <div
                  key={f.title}
                  className="flex gap-4 bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 hover:border-primary/40 transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary-container flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-on-primary-container" />
                  </div>
                  <div>
                    <h3 className="font-headline text-[18px] text-on-surface mb-1">{f.title}</h3>
                    <p className="font-body text-sm text-on-surface-variant leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="mb-20 bg-primary text-on-primary rounded-2xl p-12 text-center">
          <h2 className="font-headline text-headline-md mb-3">{t.home.ctaTitle}</h2>
          <p className="font-body opacity-80 mb-8">{t.home.ctaDesc}</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/register"
              className="bg-primary-container text-on-primary-container font-label text-label-md uppercase tracking-wider px-6 py-3 rounded-lg hover:brightness-110 transition-all"
            >
              {t.home.getStartedFree}
            </Link>
            <Link
              href="/market/creators"
              className="font-label text-label-md uppercase tracking-wider px-6 py-3 border border-on-primary/30 rounded-lg hover:bg-white/10 transition-colors"
            >
              {t.home.browseCreators}
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
