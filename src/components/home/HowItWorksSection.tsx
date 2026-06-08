"use client";
import { Clipboard, Bot, Clapperboard } from "lucide-react";
import SectionLabel from "./SectionLabel";
import { useT } from "@/hooks/useT";

export default function HowItWorksSection() {
  const t = useT();
  const steps = [
    {
      n: "01",
      icon: Clipboard,
      title: t.landing.processStep1Title,
      body: t.landing.processStep1Body,
    },
    { n: "02", icon: Bot, title: t.landing.processStep2Title, body: t.landing.processStep2Body },
    {
      n: "03",
      icon: Clapperboard,
      title: t.landing.processStep3Title,
      body: t.landing.processStep3Body,
    },
  ];
  return (
    <section className="py-24 md:py-32">
      <div className="space-y-4 mb-16">
        <div className="scroll-reveal">
          <SectionLabel>{t.landing.processLabel}</SectionLabel>
        </div>
        <h2
          className="scroll-reveal font-headline text-4xl md:text-6xl text-on-surface leading-[1.05] max-w-3xl"
          style={{ animationDelay: "90ms" }}
        >
          {t.landing.processTitle1}
          <br />
          <span className="italic text-on-surface/95">{t.landing.processTitle2}</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-outline-variant/30 border border-outline-variant/30 rounded-2xl overflow-hidden">
        {steps.map(({ n, icon: Icon, title, body }, i) => (
          <div
            key={n}
            className="scroll-reveal relative bg-surface-container-lowest p-10 md:p-12 overflow-hidden"
            style={{ animationDelay: `${i * 120}ms` }}
          >
            {/* Giant faded gold numeral as background mark */}
            <span
              className="absolute top-2 left-6 font-headline italic font-bold pointer-events-none select-none leading-none text-[160px] md:text-[200px]"
              style={{ color: "rgba(212,175,55,0.06)" }}
            >
              {n}
            </span>
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-primary-container text-primary flex items-center justify-center mb-8">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-headline text-2xl md:text-[28px] text-on-surface leading-tight mb-4">
                {title}
              </h3>
              <p className="font-body text-sm md:text-base text-on-surface-variant leading-relaxed">
                {body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
