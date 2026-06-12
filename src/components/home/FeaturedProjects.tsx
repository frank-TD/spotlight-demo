"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SectionLabel from "./SectionLabel";
import { FEATURED_PROJECTS, type FeaturedStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useT } from "@/hooks/useT";

// "In the Spotlight" — the editorial heart of the homepage. One lead project
// gets a full magazine spread (wide still + status + logline + backing
// progress); three more run as a quiet poster row. Max 4 cards, no marquee.
export default function FeaturedProjects() {
  const t = useT();
  const lead = FEATURED_PROJECTS.find((p) => p.lead) ?? FEATURED_PROJECTS[0];
  const rest = FEATURED_PROJECTS.filter((p) => p.id !== lead.id).slice(0, 3);
  const metaByKey: Record<number, string> = {
    1: t.homeV2.featMeta1,
    2: t.homeV2.featMeta2,
    3: t.homeV2.featMeta3,
    4: t.homeV2.featMeta4,
  };

  return (
    <section className="max-w-[1280px] mx-auto px-6 md:px-12 py-24 md:py-32">
      <div className="flex items-center justify-between gap-6 mb-14 md:mb-20">
        <div className="scroll-reveal">
          <SectionLabel>{t.homeV2.featuredLabel}</SectionLabel>
        </div>
        <Link
          href="/discovery"
          className="scroll-reveal hidden md:inline-flex items-center gap-2 font-label text-[11px] uppercase tracking-[0.24em] text-on-surface-variant hover:text-primary transition-colors"
        >
          {t.homeV2.exploreAll} <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Lead spread */}
      <Link
        href="/discovery"
        className="scroll-reveal group grid md:grid-cols-[7fr_5fr] gap-8 md:gap-16 items-center"
      >
        <div className="relative aspect-[3/2] rounded-md overflow-hidden bg-surface-container-low ring-1 ring-outline-variant/40 group-hover:ring-primary/50 transition-all duration-500">
          <img
            src={`https://picsum.photos/seed/${lead.seed}/1200/800`}
            alt={lead.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(212,175,55,0.08),transparent_38%,rgba(8,8,10,0.45)_95%)] pointer-events-none" />
        </div>
        <div>
          <StatusBadge status={lead.status} fundedPct={lead.fundedPct} />
          <h2 className="font-headline text-4xl md:text-6xl text-on-surface leading-[1.05] mt-6">
            {lead.title}
          </h2>
          <p className="font-label text-[12px] uppercase tracking-[0.3em] text-primary mt-4">
            {metaByKey[lead.copyKey]}
          </p>
          <p className="font-body text-on-surface-variant leading-relaxed mt-5 max-w-md">
            {t.homeV2.leadLogline}
          </p>
          <div className="mt-8 max-w-sm">
            <div className="h-0.5 bg-on-surface/15 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-on-primary-container"
                style={{ width: `${lead.fundedPct ?? 100}%` }}
              />
            </div>
            <p className="font-label text-[10px] uppercase tracking-[0.24em] text-on-surface-variant/70 mt-3">
              {t.homeV2.leadPMeta}
            </p>
          </div>
          <span className="inline-block font-label text-[12px] uppercase tracking-[0.24em] text-on-surface border-b border-primary/70 pb-1.5 mt-9 group-hover:text-primary transition-colors">
            {t.homeV2.viewProject} →
          </span>
        </div>
      </Link>

      {/* Poster row — horizontal swipe on mobile, 3-up grid on desktop */}
      <div className="mt-16 md:mt-24 flex md:grid md:grid-cols-3 gap-4 md:gap-8 overflow-x-auto md:overflow-visible snap-x snap-mandatory -mx-6 px-6 md:mx-0 md:px-0 pb-2 md:pb-0">
        {rest.map((p, i) => (
          <Link
            key={p.id}
            href="/discovery"
            className="scroll-reveal group shrink-0 w-[76vw] sm:w-[44vw] md:w-auto snap-start"
            style={{ animationDelay: `${i * 90}ms` }}
          >
            <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-surface-container-low ring-1 ring-outline-variant/40 group-hover:ring-primary/50 transition-all duration-500">
              <img
                src={`https://picsum.photos/seed/${p.seed}/600/900`}
                alt={p.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(212,175,55,0.07),transparent_38%,rgba(8,8,10,0.4)_95%)] pointer-events-none" />
            </div>
            <div className="pt-5 space-y-2.5">
              <h3 className="font-headline text-2xl text-on-surface group-hover:text-primary transition-colors">
                {p.title}
              </h3>
              <p className="font-label text-[10.5px] uppercase tracking-[0.26em] text-on-surface-variant/70">
                {metaByKey[p.copyKey]}
              </p>
              <StatusBadge status={p.status} fundedPct={p.fundedPct} small />
            </div>
          </Link>
        ))}
      </div>

      <div className="scroll-reveal text-center mt-16 md:mt-24">
        <Link
          href="/discovery"
          className="inline-block font-label text-[13px] uppercase tracking-[0.26em] text-primary border-b border-primary/60 pb-2 hover:text-on-primary-container transition-colors"
        >
          {t.homeV2.exploreAll} →
        </Link>
      </div>
    </section>
  );
}

function StatusBadge({
  status,
  fundedPct,
  small = false,
}: {
  status: FeaturedStatus;
  fundedPct?: number;
  small?: boolean;
}) {
  const t = useT();
  const config: Record<FeaturedStatus, { label: string; classes: string; dot: string }> = {
    funding: {
      label: t.homeV2.statusFunding,
      classes: "text-on-primary-container border-primary/45 bg-primary/10",
      dot: "bg-primary",
    },
    production: {
      label: t.homeV2.statusProduction,
      classes: "text-secondary border-secondary/40 bg-secondary/10",
      dot: "bg-secondary",
    },
    released: {
      label: t.homeV2.statusReleased,
      classes: "text-tertiary border-tertiary/40 bg-tertiary/10",
      dot: "bg-tertiary",
    },
  };
  const { label, classes, dot } = config[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-label uppercase border rounded-full",
        small ? "text-[10px] tracking-[0.18em] px-2.5 py-1" : "text-[11px] tracking-[0.2em] px-3.5 py-1.5",
        classes
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", dot)} />
      {label}
      {status === "funding" && fundedPct != null && <span>— {fundedPct}%</span>}
    </span>
  );
}
