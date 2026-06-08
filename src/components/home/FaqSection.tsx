"use client";
import { useT } from "@/hooks/useT";
import SectionLabel from "./SectionLabel";

export default function FaqSection() {
  const t = useT();
  const items = [
    { q: t.landing.faqQ1, a: t.landing.faqA1 },
    { q: t.landing.faqQ2, a: t.landing.faqA2 },
    { q: t.landing.faqQ3, a: t.landing.faqA3 },
    { q: t.landing.faqQ4, a: t.landing.faqA4 },
    { q: t.landing.faqQ5, a: t.landing.faqA5 },
    { q: t.landing.faqQ6, a: t.landing.faqA6 },
  ];
  return (
    <section className="py-24 md:py-32">
      <div className="text-center space-y-4 mb-16">
        <div className="flex justify-center">
          <SectionLabel>{t.landing.faqLabel}</SectionLabel>
        </div>
        <h2 className="font-headline text-4xl md:text-6xl text-on-surface leading-[1.05]">
          {t.landing.faqTitle1}
          <br />
          <span className="italic">{t.landing.faqTitle2}</span>
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
        {items.map(({ q, a }) => (
          <div key={q} className="space-y-3 border-t border-outline-variant/30 pt-7">
            <h3 className="font-headline text-xl text-on-surface leading-snug">{q}</h3>
            <p className="font-body text-on-surface-variant leading-relaxed text-sm md:text-base">
              {a}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
