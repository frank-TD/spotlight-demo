"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Play } from "lucide-react";
import {
  FEATURED_PROJECTS,
  VIDEO_CLIP_BY_ID,
  type FeaturedStatus,
  type VideoClip,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useT } from "@/hooks/useT";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  // Auto-advance the rail one card at a time, ping-ponging at the ends so it
  // never hard-rewinds. Pauses on hover/touch, when scrolled off-screen, when
  // the tab is hidden, and under reduced-motion — so it's ambient, not pushy.
  useEffect(() => {
    const el = railRef.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let dir = 1;
    let paused = false;
    let visible = true;

    const pause = () => {
      paused = true;
    };
    const resume = () => {
      paused = false;
    };
    el.addEventListener("pointerenter", pause);
    el.addEventListener("pointerleave", resume);
    el.addEventListener("pointerdown", pause);
    el.addEventListener("pointerup", resume);

    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), {
      threshold: 0.25,
    });
    io.observe(el);

    const id = window.setInterval(() => {
      if (paused || !visible || document.hidden || reduce.matches) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll < 10) return;
      if (dir === 1 && el.scrollLeft >= maxScroll - 2) dir = -1;
      else if (dir === -1 && el.scrollLeft <= 2) dir = 1;
      const card = el.querySelector<HTMLElement>("[data-rail-card]");
      const step = card ? card.offsetWidth + 24 : el.clientWidth * 0.6;
      el.scrollBy({ left: dir * step, behavior: "smooth" });
    }, 4000);

    return () => {
      window.clearInterval(id);
      io.disconnect();
      el.removeEventListener("pointerenter", pause);
      el.removeEventListener("pointerleave", resume);
      el.removeEventListener("pointerdown", pause);
      el.removeEventListener("pointerup", resume);
    };
  }, []);

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

      {/* Poster rail — drag / scroll / arrow-step through the curated slate.
          Captions sit on the artwork so each card reads as a film poster. */}
      <div className="relative mt-20 md:mt-28">
        <div className="scroll-reveal flex items-center justify-between gap-4 mb-6">
          <p className="font-label text-[12px] uppercase tracking-[0.18em] text-on-surface-variant">
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
            <RailCard key={p.id} project={p} index={i} />
          ))}
        </div>
      </div>

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
    return (
      <img src={`https://picsum.photos/seed/${seed}/1200/800`} alt={alt} className={cls} loading="lazy" />
    );
  }
  return (
    <video ref={ref} className={cls} poster={clip.poster} muted loop playsInline preload="metadata">
      <source src={clip.src} type="video/mp4" />
    </video>
  );
}

// One rail card. If the project has a clip, it plays on hover (desktop) and
// shows its poster frame otherwise; without a clip it falls back to a still.
function RailCard({
  project,
  index,
}: {
  project: (typeof FEATURED_PROJECTS)[number];
  index: number;
}) {
  const t = useT();
  const clip = project.clipId ? VIDEO_CLIP_BY_ID[project.clipId] : undefined;
  const videoRef = useRef<HTMLVideoElement>(null);

  const play = () => {
    const v = videoRef.current;
    if (v && !prefersReducedMotion()) void v.play().catch(() => {});
  };
  const stop = () => {
    const v = videoRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
  };

  const mediaCls =
    "absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]";

  return (
    <Link
      href="/discovery"
      data-rail-card
      onMouseEnter={play}
      onMouseLeave={stop}
      className="scroll-reveal group relative shrink-0 w-[70vw] sm:w-[260px] md:w-[288px] snap-start"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-surface-container-low ring-1 ring-outline-variant/40 group-hover:ring-primary/50 transition-all duration-500">
        {clip ? (
          <video className={mediaCls} poster={clip.poster} muted loop playsInline preload="none">
            <source src={clip.src} type="video/mp4" />
          </video>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`https://picsum.photos/seed/${project.seed}/600/900`}
            alt={project.title}
            className={mediaCls}
            loading="lazy"
          />
        )}
        {clip && (
          <span className="absolute top-3.5 right-3.5 inline-flex items-center justify-center w-7 h-7 rounded-full bg-surface/60 backdrop-blur-sm text-on-surface opacity-80 group-hover:opacity-0 transition-opacity duration-300">
            <Play className="w-3 h-3 fill-current" />
          </span>
        )}
        {/* Legibility scrim — deepens on hover. */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,10,0.08)_0%,transparent_28%,rgba(8,8,10,0.32)_60%,rgba(8,8,10,0.92)_100%)] group-hover:bg-[linear-gradient(180deg,rgba(8,8,10,0.3)_0%,rgba(8,8,10,0.12)_30%,rgba(8,8,10,0.5)_62%,rgba(8,8,10,0.96)_100%)] transition-[background] duration-500 pointer-events-none" />
        <div className="absolute top-3.5 left-3.5">
          <StatusBadge status={project.status} small overlay />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-5">
          <h3 className="font-headline text-[28px] leading-tight text-on-surface">{project.title}</h3>
          <p className="font-label text-[12px] uppercase tracking-[0.18em] text-primary/95 mt-2.5">
            {t.homeV2.filmBy} {project.creator}
          </p>
          <span className="flex items-center gap-1.5 font-label text-[12px] uppercase tracking-[0.18em] text-on-surface mt-3 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            {project.status === "open" ? t.homeV2.backProject : t.homeV2.viewProject}
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
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
        small ? "text-[12px] tracking-[0.18em] px-2.5 py-1" : "text-[12px] tracking-[0.2em] px-3.5 py-1.5",
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
