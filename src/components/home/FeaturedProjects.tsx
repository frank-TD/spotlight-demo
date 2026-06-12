"use client";
import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import SectionLabel from "./SectionLabel";
import { FEATURED_PROJECTS, type FeaturedStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useT } from "@/hooks/useT";

// "In the Spotlight" — the editorial heart of the homepage. One lead project
// gets a full magazine spread (wide still + status + logline + the creator
// behind it); the rest run as a horizontal poster rail you can drag, scroll,
// or step through with the arrows. Spotlight commissions creators, so cards
// foreground who is making each film and whether it is open to back — never
// crowdfunding metrics.
export default function FeaturedProjects() {
  const t = useT();
  const railRef = useRef<HTMLDivElement>(null);
  const lead = FEATURED_PROJECTS.find((p) => p.lead) ?? FEATURED_PROJECTS[0];
  const rail = FEATURED_PROJECTS.filter((p) => p.id !== lead.id);
  const metaByKey: Record<number, string> = {
    1: t.homeV2.featMeta1,
    2: t.homeV2.featMeta2,
    3: t.homeV2.featMeta3,
    4: t.homeV2.featMeta4,
    5: t.homeV2.featMeta5,
    6: t.homeV2.featMeta6,
    7: t.homeV2.featMeta7,
  };

  const scrollRail = (dir: number) => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
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
          <StatusBadge status={lead.status} />
          <h2 className="font-headline text-4xl md:text-6xl text-on-surface leading-[1.05] mt-6">
            {lead.title}
          </h2>
          <p className="font-label text-[12px] uppercase tracking-[0.3em] text-primary mt-4">
            {metaByKey[lead.copyKey]}
          </p>
          <p className="font-body text-on-surface-variant leading-relaxed mt-5 max-w-md">
            {t.homeV2.leadLogline}
          </p>
          <div className="mt-8 pt-6 border-t border-outline-variant/40 max-w-sm space-y-1.5">
            <p className="font-label text-[12px] uppercase tracking-[0.26em] text-on-surface">
              {t.homeV2.filmBy} {lead.creator}
              {lead.city ? ` · ${lead.city}` : ""}
            </p>
            {lead.status === "open" && (
              <p className="font-label text-[10.5px] uppercase tracking-[0.24em] text-on-surface-variant/70">
                {t.homeV2.leadSeeking}
              </p>
            )}
          </div>
          <span className="inline-block font-label text-[12px] uppercase tracking-[0.24em] text-on-surface border-b border-primary/70 pb-1.5 mt-9 group-hover:text-primary transition-colors">
            {(lead.status === "open" ? t.homeV2.backProject : t.homeV2.viewProject)} →
          </span>
        </div>
      </Link>

      {/* Poster rail — drag / scroll / arrow-step through the curated slate.
          Captions sit on the artwork so each card reads as a film poster. */}
      <div className="relative mt-20 md:mt-28">
        <div className="scroll-reveal flex items-center justify-between gap-4 mb-6">
          <p className="font-label text-[11px] uppercase tracking-[0.26em] text-on-surface-variant/60">
            {t.homeV2.dragHint}
          </p>
          <div className="hidden md:flex gap-2">
            <RailArrow dir="prev" onClick={() => scrollRail(-1)} />
            <RailArrow dir="next" onClick={() => scrollRail(1)} />
          </div>
        </div>

        <div
          ref={railRef}
          className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-6 px-6 md:-mx-12 md:px-12 pb-2"
        >
          {rail.map((p, i) => (
            <Link
              key={p.id}
              href="/discovery"
              className="scroll-reveal group relative shrink-0 w-[78vw] sm:w-[300px] md:w-[332px] snap-start"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-surface-container-low ring-1 ring-outline-variant/40 group-hover:ring-primary/50 transition-all duration-500">
                <img
                  src={`https://picsum.photos/seed/${p.seed}/600/900`}
                  alt={p.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                  loading="lazy"
                />
                {/* Legibility scrim — deepens on hover. */}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,10,0.08)_0%,transparent_28%,rgba(8,8,10,0.32)_60%,rgba(8,8,10,0.92)_100%)] group-hover:bg-[linear-gradient(180deg,rgba(8,8,10,0.3)_0%,rgba(8,8,10,0.12)_30%,rgba(8,8,10,0.5)_62%,rgba(8,8,10,0.96)_100%)] transition-[background] duration-500 pointer-events-none" />
                <div className="absolute top-3.5 left-3.5">
                  <StatusBadge status={p.status} small overlay />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="font-headline text-[26px] leading-tight text-on-surface">
                    {p.title}
                  </h3>
                  <p className="font-label text-[10px] uppercase tracking-[0.24em] text-primary/95 mt-2">
                    {t.homeV2.filmBy} {p.creator}
                  </p>
                  <p className="font-label text-[10px] uppercase tracking-[0.22em] text-on-surface-variant/80 mt-1">
                    {metaByKey[p.copyKey]}
                  </p>
                  <span className="flex items-center gap-1.5 font-label text-[10px] uppercase tracking-[0.24em] text-on-surface mt-3 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    {p.status === "open" ? t.homeV2.backProject : t.homeV2.viewProject}
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="scroll-reveal text-center mt-16 md:mt-20">
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

function RailArrow({ dir, onClick }: { dir: "prev" | "next"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === "prev" ? "Previous projects" : "More projects"}
      className="w-10 h-10 rounded-full border border-outline-variant/60 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/60 active:scale-95 transition-all"
    >
      {dir === "prev" ? (
        <ChevronLeft className="w-4 h-4" />
      ) : (
        <ChevronRight className="w-4 h-4" />
      )}
    </button>
  );
}

function StatusBadge({
  status,
  small = false,
  overlay = false,
}: {
  status: FeaturedStatus;
  small?: boolean;
  // `overlay` swaps the translucent fill for a blurred dark chip so the badge
  // stays legible when it sits directly on poster artwork.
  overlay?: boolean;
}) {
  const t = useT();
  const config: Record<FeaturedStatus, { label: string; text: string; border: string; dot: string }> =
    {
      open: {
        label: t.homeV2.statusOpen,
        text: "text-on-primary-container",
        border: "border-primary/45",
        dot: "bg-primary",
      },
      production: {
        label: t.homeV2.statusProduction,
        text: "text-secondary",
        border: "border-secondary/40",
        dot: "bg-secondary",
      },
      released: {
        label: t.homeV2.statusReleased,
        text: "text-tertiary",
        border: "border-tertiary/40",
        dot: "bg-tertiary",
      },
    };
  const { label, text, border, dot } = config[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-label uppercase border rounded-full",
        small ? "text-[10px] tracking-[0.18em] px-2.5 py-1" : "text-[11px] tracking-[0.2em] px-3.5 py-1.5",
        text,
        border,
        overlay ? "bg-surface/70 backdrop-blur-sm" : "bg-primary/10"
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", dot)} />
      {label}
    </span>
  );
}
