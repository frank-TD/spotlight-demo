"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SectionLabel from "./SectionLabel";
import ReleaseSlateCard from "./ReleaseSlateCard";
import { useT } from "@/hooks/useT";

// AI Distribution — the platform's second pillar gets its own viewport:
// editorial copy left, release-slate artifact right, one dedicated CTA.
export default function DistributionSection() {
  const t = useT();
  return (
    <section className="border-y border-outline-variant/30 bg-surface-container-lowest">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-24 md:py-28 grid md:grid-cols-[5fr_6fr] gap-12 md:gap-20 items-center">
        <div className="scroll-reveal">
          <SectionLabel>{t.homeV2.distLabel}</SectionLabel>
          <h2 className="font-headline text-4xl md:text-[56px] text-on-surface leading-[1.08] mt-6">
            {t.homeV2.distTitle1}
            <br />
            <span
              className="italic"
              style={{
                background: "linear-gradient(135deg, #d4af37 0%, #f3d57f 60%, #d4af37 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {t.homeV2.distTitle2}
            </span>
          </h2>
          <p className="font-body text-on-surface-variant leading-relaxed mt-6 max-w-md">
            {t.homeV2.distBody}
          </p>
          <Link
            href="/distribution"
            className="group inline-flex items-center gap-2.5 font-label text-label-md uppercase tracking-widest text-on-primary-container border border-primary/60 px-7 py-4 rounded-full hover:bg-primary/10 transition-colors mt-10"
          >
            {t.homeV2.distCta}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="scroll-reveal" style={{ animationDelay: "120ms" }}>
          <ReleaseSlateCard />
        </div>
      </div>
    </section>
  );
}
