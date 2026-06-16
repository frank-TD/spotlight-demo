"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ReleasePerformanceShowcase from "./ReleasePerformanceShowcase";
import { useT } from "@/hooks/useT";

// AI Distribution — the platform's second pillar gets its own viewport:
// editorial copy left, a released-film performance showcase right (proof that
// films have shipped and reached audiences), one dedicated CTA.
export default function DistributionSection() {
  const t = useT();
  return (
    <section className="border-y border-outline-variant/20 bg-[#2a2114]">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-24 md:py-28 grid md:grid-cols-[5fr_6fr] gap-12 md:gap-20 items-center">
        <div className="scroll-reveal">
          <h2 className="font-headline text-5xl md:text-7xl text-on-surface leading-[1.05]">
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
          <Link
            href="/distribution"
            className="group inline-flex items-center gap-2.5 font-label text-label-md uppercase tracking-widest text-on-primary-container border border-primary/60 px-7 py-4 rounded-full hover:bg-primary/10 transition-colors mt-10"
          >
            {t.homeV2.distCta}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="scroll-reveal" style={{ animationDelay: "120ms" }}>
          <ReleasePerformanceShowcase />
        </div>
      </div>
    </section>
  );
}
