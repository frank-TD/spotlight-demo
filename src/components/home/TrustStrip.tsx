"use client";
import { ShieldCheck, Landmark } from "lucide-react";
import StatCountUp from "./StatCountUp";
import { useT } from "@/hooks/useT";

// Trust strip directly under the hero — the credibility signals the UI/UX
// review flagged "MUST FIX": volume stats up top, escrow + production-house
// backing as qualitative proof below. Numbers roll up once on mount.
export default function TrustStrip() {
  const t = useT();
  const stats = [
    { value: t.homeV2.trustCreators, label: t.homeV2.trustCreatorsLabel },
    { value: t.homeV2.trustCommissioned, label: t.homeV2.trustCommissionedLabel },
    { value: t.homeV2.trustCompletion, label: t.homeV2.trustCompletionLabel },
  ];

  return (
    <section className="border-y border-outline-variant/30">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-10 md:py-12">
        <div className="scroll-reveal flex flex-wrap items-center justify-center gap-x-10 md:gap-x-16 gap-y-6">
          {stats.map((s, i) => (
            <div key={s.label} className="flex items-center gap-10 md:gap-16">
              <div className="flex flex-col items-center text-center">
                <StatCountUp
                  value={s.value}
                  className="font-headline text-3xl md:text-4xl text-primary"
                />
                <span className="font-label text-[10px] uppercase tracking-[0.28em] text-on-surface-variant mt-1.5">
                  {s.label}
                </span>
              </div>
              {i < stats.length - 1 && (
                <span className="hidden sm:block w-px h-9 bg-outline-variant/40" />
              )}
            </div>
          ))}
        </div>

        <div className="scroll-reveal flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-9">
          <span className="inline-flex items-center gap-2 font-label text-[11px] uppercase tracking-[0.24em] text-on-surface-variant">
            <ShieldCheck className="w-3.5 h-3.5 text-primary/80" />
            {t.homeV2.trustEscrow}
          </span>
          <span className="hidden sm:block w-px h-4 bg-outline-variant/40" />
          <span className="inline-flex items-center gap-2 font-label text-[11px] uppercase tracking-[0.24em] text-on-surface-variant">
            <Landmark className="w-3.5 h-3.5 text-primary/80" />
            {t.homeV2.trustBacked}
          </span>
        </div>
      </div>
    </section>
  );
}
