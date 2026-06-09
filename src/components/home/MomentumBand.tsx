"use client";
import { Fragment } from "react";
import StatCountUp from "./StatCountUp";
import SectionLabel from "./SectionLabel";
import { useT } from "@/hooks/useT";

// Mid-page "momentum" proof band — a single confident statement plus three
// rolling micro-stats, restating the network's scale after the product tour
// (distinct from the hero's credentials trio). Modelled on Fanvue's
// "Powering $500m in payouts" band. Numbers are i18n placeholders.

// Same gold gradient treatment as the hero's accent line.
const GOLD_GRADIENT = {
  background: "linear-gradient(135deg, #d4af37 0%, #f3d57f 60%, #d4af37 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
} as const;

export default function MomentumBand() {
  const t = useT();
  const stats = [
    { value: t.landing.momentumStat1, label: t.landing.momentumStat1Label },
    { value: t.landing.momentumStat2, label: t.landing.momentumStat2Label },
    { value: t.landing.momentumStat3, label: t.landing.momentumStat3Label },
  ];

  return (
    <section className="py-20 md:py-28 border-y border-outline-variant/30">
      <div className="text-center max-w-3xl mx-auto">
        <div className="scroll-reveal flex justify-center">
          <SectionLabel>{t.landing.momentumLabel}</SectionLabel>
        </div>
        <h2
          className="scroll-reveal font-headline text-3xl md:text-5xl text-on-surface leading-tight mt-5"
          style={{ animationDelay: "90ms" }}
        >
          {t.landing.momentumTitlePre}{" "}
          <span className="italic" style={GOLD_GRADIENT}>
            {t.landing.momentumTitleNum}
          </span>{" "}
          {t.landing.momentumTitlePost}
        </h2>
      </div>

      <div className="flex items-center justify-center gap-8 sm:gap-12 md:gap-16 mt-12">
        {stats.map((s, i) => (
          <Fragment key={s.label}>
            {i > 0 && <span className="w-px h-10 bg-outline-variant/40" />}
            <div
              className="scroll-reveal flex flex-col items-center text-center"
              style={{ animationDelay: `${150 + i * 90}ms` }}
            >
              <StatCountUp
                value={s.value}
                className="font-headline text-2xl md:text-4xl text-primary"
              />
              <span className="font-label text-[10px] uppercase tracking-[0.28em] text-on-surface-variant mt-2">
                {s.label}
              </span>
            </div>
          </Fragment>
        ))}
      </div>
    </section>
  );
}
