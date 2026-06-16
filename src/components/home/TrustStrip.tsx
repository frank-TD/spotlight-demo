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
    <section className="bg-[#efe7d2]">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-10 md:py-12">
        <div className="scroll-reveal flex flex-wrap items-center justify-center gap-x-10 md:gap-x-16 gap-y-6">
          {stats.map((s, i) => (
            <div key={s.label} className="flex items-center gap-10 md:gap-16">
              <div className="flex flex-col items-center text-center">
                <StatCountUp
                  value={s.value}
                  className="font-headline text-3xl md:text-4xl text-[#15110a]"
                />
                <span className="font-label text-[12px] uppercase tracking-[0.2em] text-[#6b6052] mt-1.5">
                  {s.label}
                </span>
              </div>
              {i < stats.length - 1 && (
                <span className="hidden sm:block w-px h-9 bg-[#15110a]/15" />
              )}
            </div>
          ))}
        </div>

        <div className="scroll-reveal flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-9">
          <span className="inline-flex items-center gap-2 font-label text-[12px] uppercase tracking-[0.18em] text-[#6b6052]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#9a7a1e]" />
            {t.homeV2.trustEscrow}
          </span>
          <span className="hidden sm:block w-px h-4 bg-[#15110a]/15" />
          <span className="inline-flex items-center gap-2 font-label text-[12px] uppercase tracking-[0.18em] text-[#6b6052]">
            <Landmark className="w-3.5 h-3.5 text-[#9a7a1e]" />
            {t.homeV2.trustBacked}
          </span>
        </div>
      </div>
    </section>
  );
}
