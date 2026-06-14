"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import FeaturedCoverflow from "./FeaturedCoverflow";
import StatusBadge from "./StatusBadge";
import { FEATURED_PROJECTS, VIDEO_CLIP_BY_ID, type VideoClip } from "@/lib/mock-data";
import { useT } from "@/hooks/useT";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// "In the Spotlight" — the editorial heart of the homepage. One lead project
// gets a full magazine spread; the rest spin through a 3D coverflow you can
// drag, step, or click into. Spotlight commissions creators, so cards
// foreground who is making each film and whether it is open to back.
export default function FeaturedProjects() {
  const t = useT();
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

  return (
    <section className="max-w-[1280px] mx-auto px-6 md:px-12 py-24 md:py-32">
      <div className="flex items-end justify-between gap-6 mb-14 md:mb-20">
        <h2 className="scroll-reveal font-headline text-5xl md:text-7xl text-on-surface leading-[1.0]">
          {t.homeV2.featuredLabel}
        </h2>
        <Link
          href="/discovery"
          className="scroll-reveal hidden md:inline-flex items-center gap-2 shrink-0 pb-2 font-label text-[12px] uppercase tracking-[0.18em] text-on-surface-variant hover:text-primary transition-colors"
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
          <LeadMedia
            clip={lead.clipId ? VIDEO_CLIP_BY_ID[lead.clipId] : undefined}
            seed={lead.seed}
            alt={lead.title}
          />
          <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(212,175,55,0.08),transparent_38%,rgba(8,8,10,0.45)_95%)] pointer-events-none" />
        </div>
        <div>
          <StatusBadge status={lead.status} />
          <h2 className="font-headline text-4xl md:text-6xl text-on-surface leading-[1.05] mt-6">
            {lead.title}
          </h2>
          <p className="font-label text-[12px] uppercase tracking-[0.2em] text-primary mt-4">
            {metaByKey[lead.copyKey]}
          </p>
          <p className="font-body text-on-surface-variant leading-relaxed mt-5 max-w-md">
            {t.homeV2.leadLogline}
          </p>
          <div className="mt-8 pt-6 border-t border-outline-variant/40 max-w-sm space-y-1.5">
            <p className="font-label text-[12px] uppercase tracking-[0.18em] text-on-surface">
              {t.homeV2.filmBy} {lead.creator}
              {lead.city ? ` · ${lead.city}` : ""}
            </p>
            {lead.status === "open" && (
              <p className="font-label text-[12px] uppercase tracking-[0.18em] text-on-surface-variant">
                {t.homeV2.leadSeeking}
              </p>
            )}
          </div>
          <span className="inline-block font-label text-[12px] uppercase tracking-[0.18em] text-on-surface border-b border-primary/70 pb-1.5 mt-9 group-hover:text-primary transition-colors">
            {(lead.status === "open" ? t.homeV2.backProject : t.homeV2.viewProject)} →
          </span>
        </div>
      </Link>

      {/* 3D coverflow — drag / step / click into a project. */}
      <FeaturedCoverflow projects={rail} />

      <div className="scroll-reveal text-center mt-16 md:mt-20">
        <Link
          href="/discovery"
          className="inline-block font-label text-[13px] uppercase tracking-[0.18em] text-primary border-b border-primary/60 pb-2 hover:text-on-primary-container transition-colors"
        >
          {t.homeV2.exploreAll} →
        </Link>
      </div>
    </section>
  );
}

// Lead spread media: a clip autoplays (muted, looped) once scrolled into view,
// otherwise a seeded still. Pauses when off-screen and under reduced-motion.
function LeadMedia({ clip, seed, alt }: { clip?: VideoClip; seed: string; alt: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || prefersReducedMotion()) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.35 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, [clip]);

  const cls =
    "absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]";
  if (!clip) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={`https://picsum.photos/seed/${seed}/1200/800`} alt={alt} className={cls} loading="lazy" />;
  }
  return (
    <video ref={ref} className={cls} poster={clip.poster} muted loop playsInline preload="metadata">
      <source src={clip.src} type="video/mp4" />
    </video>
  );
}
