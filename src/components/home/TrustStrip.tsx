"use client";
import { ShieldCheck, Landmark } from "lucide-react";
import StatCountUp from "./StatCountUp";
import AuroraBackdrop from "./AuroraBackdrop";
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
    <section
      className="relative"
      style={{
        background:
          "radial-gradient(ellipse 82% 58% at 50% 50%, rgba(212,175,55,0.095) 0%, transparent 76%), #08080a",
      }}
    >
      {/* Warm gold aurora — a soft centred halo with a long feathered edge that
          fades to transparent on every side, well before the section bounds, so
          it reads as a pool of light rather than a band and joins the
          neighbouring black seamlessly. Above the static glow, below content. */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden opacity-40"
        style={{
          WebkitMaskImage:
            "radial-gradient(ellipse 84% 62% at 50% 50%, #000 0%, #000 16%, transparent 74%)",
          maskImage:
            "radial-gradient(ellipse 84% 62% at 50% 50%, #000 0%, #000 16%, transparent 74%)",
        }}
        aria-hidden="true"
      >
        <AuroraBackdrop />
      </div>

      <div className="relative z-10 max-w-[1280px] mx-auto px-6 md:px-12 py-24 md:py-28">
        <div className="scroll-reveal flex flex-wrap items-center justify-center gap-x-10 md:gap-x-16 gap-y-6">
          {stats.map((s, i) => (
            <div key={s.label} className="flex items-center gap-10 md:gap-16">
              <div className="flex flex-col items-center text-center">
                <StatCountUp
                  value={s.value}
                  className="font-headline text-3xl md:text-4xl text-on-surface"
                />
                <span className="font-label text-[12px] uppercase tracking-[0.2em] text-on-surface-variant mt-1.5">
                  {s.label}
                </span>
              </div>
              {i < stats.length - 1 && (
                <span className="hidden sm:block w-px h-9 bg-primary/20" />
              )}
            </div>
          ))}
        </div>

        <div className="scroll-reveal flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-9">
          <span className="inline-flex items-center gap-2 font-label text-[12px] uppercase tracking-[0.18em] text-on-surface-variant">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            {t.homeV2.trustEscrow}
          </span>
          <span className="hidden sm:block w-px h-4 bg-primary/20" />
          <span className="inline-flex items-center gap-2 font-label text-[12px] uppercase tracking-[0.18em] text-on-surface-variant">
            <Landmark className="w-3.5 h-3.5 text-primary" />
            {t.homeV2.trustBacked}
          </span>
        </div>
      </div>
    </section>
  );
}
