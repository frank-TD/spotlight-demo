"use client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, Play } from "lucide-react";
import SectionLabel from "./SectionLabel";
import { useT } from "@/hooks/useT";

export default function AigcStudioShowcase() {
  const t = useT();
  const router = useRouter();

  const cards = [
    {
      title: t.landing.aigcCard1Title,
      tags: t.landing.aigcCard1Tags,
      sub: t.landing.aigcCard1Sub,
      seed: "glass-strawberry",
    },
    {
      title: t.landing.aigcCard2Title,
      tags: t.landing.aigcCard2Tags,
      sub: t.landing.aigcCard2Sub,
      seed: "golden-hour-coast",
    },
    {
      title: t.landing.aigcCard3Title,
      tags: t.landing.aigcCard3Tags,
      sub: t.landing.aigcCard3Sub,
      seed: "saturn-field",
    },
    {
      title: t.landing.aigcCard4Title,
      tags: t.landing.aigcCard4Tags,
      sub: t.landing.aigcCard4Sub,
      seed: "kaiju-city",
    },
  ];

  return (
    <section className="py-24 md:py-32">
      <div className="text-center space-y-4 mb-16">
        <div className="flex justify-center">
          <SectionLabel>{t.landing.aigcLabel}</SectionLabel>
        </div>
        <h2 className="font-headline text-4xl md:text-6xl text-on-surface leading-[1.05]">
          {t.landing.aigcTitle1}
          <br />
          <span className="italic text-primary">{t.landing.aigcTitle2}</span>
        </h2>
        <p className="font-body text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
          {t.landing.aigcSub}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {cards.map((c, i) => (
          <figure
            key={c.seed}
            onClick={() => toast.info(t.discovery.playbackToast)}
            className="group relative rounded-2xl overflow-hidden aspect-[3/4] bg-surface-container border border-outline-variant/40 hover:border-primary/40 transition-all cursor-pointer animate-fade-up"
            style={{ animationDelay: `${i * 90}ms` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://picsum.photos/seed/${c.seed}/600/800`}
              alt={c.title}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-primary/90 text-on-primary shadow-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="w-6 h-6 ml-1" fill="currentColor" />
            </span>
            <figcaption className="absolute inset-x-0 bottom-0 p-4">
              <p className="font-label text-[10px] uppercase tracking-[0.22em] text-primary/80 mb-1.5">
                {c.tags}
              </p>
              <h3 className="font-headline italic text-xl text-white leading-tight">{c.title}</h3>
              <p className="font-body text-[12px] text-white/65 mt-1.5">{c.sub}</p>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={() => router.push("/discovery/workspace")}
          className="group inline-flex items-center gap-2.5 bg-primary text-on-primary font-label text-label-md uppercase tracking-widest px-7 py-4 rounded-full hover:opacity-90 active:scale-95 transition-all shadow-[0_8px_30px_rgba(212,175,55,0.25)]"
        >
          {t.landing.aigcCta}
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </section>
  );
}
