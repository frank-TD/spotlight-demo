"use client";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AppShell from "@/components/layout/AppShell";
import { useT } from "@/hooks/useT";
import { Sparkles, ArrowRight, Film, Shield, Zap, Globe } from "lucide-react";

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
      <div className="max-w-7xl mx-auto px-6">
        {/* Hero */}
        <section className="pt-20 pb-16 text-center">
          <Badge variant="outline" className="mb-6 text-primary border-primary/30 bg-accent gap-1.5">
            <Sparkles className="w-3 h-3" /> {t.home.badge}
          </Badge>
          <h1 className="text-5xl font-bold tracking-tight text-foreground leading-tight mb-5">
            {t.home.heroLine1}<br />
            <span className="text-primary">{t.home.heroLine2}</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
            {t.home.heroDesc}
          </p>
          <div className="flex items-center justify-center gap-3">
            {isLoggedIn ? (
              <Button size="lg" onClick={() => router.push("/market")} className="gap-2 px-6">
                {t.home.goToMarketplace} <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <>
                <Link href="/register">
                  <Button size="lg" className="gap-2 px-6">
                    {t.home.startProject} <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="px-6">{t.nav.signIn}</Button>
                </Link>
              </>
            )}
          </div>
        </section>

        {/* Stats strip */}
        <section className="border border-border rounded-xl bg-white p-6 mb-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </section>

        {/* How it works */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-2">{t.home.howTitle}</h2>
            <p className="text-muted-foreground text-sm">{t.home.howDesc}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {t.home.steps.map((item, idx) => (
              <div key={idx} className="bg-white border border-border rounded-xl p-5">
                <span className="text-xs font-mono text-primary font-semibold">0{idx + 1}</span>
                <h3 className="text-sm font-semibold text-foreground mt-2 mb-1.5">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-2">{t.home.featuresTitle}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {t.home.features.map((f, idx) => {
              const Icon = FEATURE_ICONS[idx];
              return (
                <div key={f.title} className="flex gap-4 bg-white border border-border rounded-xl p-5">
                  <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">{f.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="mb-20 bg-primary rounded-2xl p-10 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">{t.home.ctaTitle}</h2>
          <p className="text-white/75 text-sm mb-6">{t.home.ctaDesc}</p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-primary font-semibold px-6">{t.home.getStartedFree}</Button>
            </Link>
            <Link href="/market/creators">
              <Button size="lg" variant="ghost" className="text-white border border-white/30 hover:bg-white/10 px-6">{t.home.browseCreators}</Button>
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
