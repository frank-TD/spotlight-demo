"use client";
import Link from "next/link";
import { useT } from "@/hooks/useT";

// Three steps, one viewport. The mechanics (agents, escrow, milestones) live
// on /how-it-works — this band only answers "what do I do here?".
export default function HowItWorksBand() {
  const t = useT();
  const steps = [
    { num: "01", word: t.homeV2.step1Word, line: t.homeV2.step1Line },
    { num: "02", word: t.homeV2.step2Word, line: t.homeV2.step2Line },
    { num: "03", word: t.homeV2.step3Word, line: t.homeV2.step3Line },
  ];

  return (
    <section className="border-t border-outline-variant/30">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-24 md:py-28 text-center">
        <h2 className="scroll-reveal font-headline text-5xl md:text-7xl text-on-surface leading-[1.04]">
          {t.homeV2.stepsLabel}
        </h2>
        <div className="grid md:grid-cols-3 gap-14 md:gap-12 mt-16 md:mt-24">
          {steps.map((s, i) => (
            <div key={s.num} className="scroll-reveal" style={{ animationDelay: `${i * 110}ms` }}>
              <div
                className="font-label text-[88px] md:text-[120px] leading-[0.9] select-none"
                style={{ WebkitTextStroke: "1.2px rgba(212,175,55,0.55)", color: "transparent" }}
                aria-hidden="true"
              >
                {s.num}
              </div>
              <h3 className="font-headline text-3xl md:text-[40px] text-on-surface mt-4">{s.word}</h3>
              <p className="font-body text-base text-on-surface-variant leading-relaxed max-w-[280px] mx-auto mt-3">
                {s.line}
              </p>
            </div>
          ))}
        </div>
        <Link
          href="/how-it-works"
          className="scroll-reveal inline-block font-label text-[12px] uppercase tracking-[0.18em] text-on-surface-variant hover:text-primary transition-colors mt-16 md:mt-20"
        >
          {t.homeV2.stepsDetail} →
        </Link>
      </div>
    </section>
  );
}
