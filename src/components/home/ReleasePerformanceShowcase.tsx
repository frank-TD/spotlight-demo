"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { RELEASED_SHOWCASE } from "@/lib/mock-data";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type Film = (typeof RELEASED_SHOWCASE.films)[number];

// Released Film Performance Showcase — a premium proof panel. The card stays
// minimal: three released films as poster thumbnails (title + release date).
// Clicking one zooms it open into a focused detail dialog where its full
// post-release metrics count up. All figures are placeholder demo data (see
// RELEASED_SHOWCASE) — no revenue, no trend charts — built to swap for real
// released-film data later.
export default function ReleasePerformanceShowcase() {
  const { films, capabilities } = RELEASED_SHOWCASE;
  const rootRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = films.find((f) => f.id === activeId) ?? null;

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative border border-outline-variant rounded-xl bg-surface-container-low p-6 md:p-8 shadow-[0_30px_80px_rgba(0,0,0,0.45)] transition-[transform,opacity] duration-700 ease-out",
        "motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:scale-100",
        inView ? "opacity-100 scale-100" : "opacity-0 scale-[0.97]"
      )}
    >
      {/* Header — report framing */}
      <div className="flex items-center justify-between pb-6">
        <span className="font-label text-[12px] uppercase tracking-[0.2em] text-on-surface-variant">
          Released through Spotlight
        </span>
        <span className="font-label text-[12px] uppercase tracking-[0.18em] text-primary">
          Distribution Report
        </span>
      </div>

      {/* Poster slate — tap a film to zoom into its full report */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {films.map((f, i) => (
          <PosterCard
            key={f.id}
            film={f}
            inView={inView}
            delay={i * 110}
            onOpen={() => setActiveId(f.id)}
          />
        ))}
      </div>

      <p className="font-label text-[11px] uppercase tracking-[0.16em] text-on-surface-variant/60 mt-4">
        Tap a film for its distribution report
      </p>

      {/* Capability tags */}
      <div className="mt-6 pt-6 border-t border-outline-variant/60 flex flex-wrap items-center gap-x-3 gap-y-2">
        {capabilities.map((c, i) => (
          <span key={c} className="flex items-center gap-3">
            {i > 0 && <span className="text-outline-variant">·</span>}
            <span className="font-label text-[12px] uppercase tracking-[0.2em] text-on-surface-variant/80">
              {c}
            </span>
          </span>
        ))}
      </div>

      <FilmReportDialog film={active} onOpenChange={(open) => !open && setActiveId(null)} />
    </div>
  );
}

// Compact poster thumbnail: real film still, title + release date overlaid, a
// Released pill, and a gold glow on hover. Staggers in on viewport entry.
function PosterCard({
  film,
  inView,
  delay,
  onOpen,
}: {
  film: Film;
  inView: boolean;
  delay: number;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`${film.title} — open distribution report`}
      style={{ transitionDelay: inView ? `${delay}ms` : "0ms" }}
      className={cn(
        "group/card relative block aspect-[2/3] rounded-lg overflow-hidden text-left ring-1 ring-outline-variant/50 shadow-[0_12px_30px_rgba(0,0,0,0.4)] transition-all duration-500 ease-out outline-none",
        "hover:ring-primary/55 hover:shadow-[0_0_44px_rgba(212,175,55,0.22)] focus-visible:ring-primary/70 active:scale-[0.98]",
        "motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0",
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={film.poster}
        alt={film.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-[1.05]"
        draggable={false}
        loading="lazy"
        decoding="async"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,10,0.05)_0%,transparent_34%,rgba(8,8,10,0.55)_70%,rgba(8,8,10,0.95)_100%)]" />

      <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 font-label text-[9px] sm:text-[10px] uppercase tracking-[0.14em] text-on-primary-container bg-surface/70 border border-primary/40 rounded-full px-2 py-0.5">
        <span className="relative inline-flex w-1.5 h-1.5">
          <span className="absolute inline-flex w-full h-full rounded-full bg-primary opacity-40 animate-ping [animation-duration:2.4s]" />
          <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-primary" />
        </span>
        Released
      </span>

      <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3">
        <h3 className="font-headline text-base sm:text-lg leading-tight text-on-surface">{film.title}</h3>
        <p className="font-label text-[10px] uppercase tracking-[0.14em] text-on-surface-variant mt-1">
          {film.releaseDate}
        </p>
      </div>

      {/* zoom affordance */}
      <span className="absolute top-2.5 right-2.5 inline-flex items-center justify-center w-7 h-7 rounded-full bg-surface/60 text-on-surface opacity-0 group-hover/card:opacity-90 transition-opacity duration-300">
        <ArrowUpRight className="w-3.5 h-3.5" />
      </span>
    </button>
  );
}

// Focused detail — the poster zooms open here, full metrics counting up beside
// the enlarged still. Background dims (dialog backdrop).
function FilmReportDialog({
  film,
  onOpenChange,
}: {
  film: Film | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={!!film} onOpenChange={onOpenChange}>
      {film && (
        <DialogContent
          key={film.id}
          className="sm:max-w-2xl p-0 overflow-hidden bg-surface-container-lowest ring-outline-variant/40"
        >
          <DialogTitle className="sr-only">{film.title}</DialogTitle>
          <div className="grid sm:grid-cols-[5fr_4fr]">
            <div className="relative aspect-[3/4] sm:aspect-auto sm:min-h-[380px] bg-surface-container-low">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={film.poster}
                alt={film.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(212,175,55,0.08),transparent_42%,rgba(8,8,10,0.45)_96%)]" />
              <span className="absolute top-3.5 left-3.5 inline-flex items-center gap-1.5 font-label text-[10px] uppercase tracking-[0.16em] text-on-primary-container bg-surface/70 border border-primary/40 rounded-full px-2.5 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Released · {film.releaseDate}
              </span>
            </div>

            <div className="p-7 md:p-8 flex flex-col">
              <h3 className="font-headline text-3xl md:text-4xl text-on-surface leading-[1.05]">
                {film.title}
              </h3>
              <p className="font-label text-[12px] uppercase tracking-[0.18em] text-primary/90 mt-3">
                {film.type}
              </p>
              <p className="font-label text-[12px] uppercase tracking-[0.14em] text-on-surface-variant mt-3 leading-relaxed">
                {film.distribution}
              </p>

              <div className="grid grid-cols-2 gap-x-6 gap-y-6 mt-7 pt-6 border-t border-outline-variant/40">
                {film.metrics.map((m) => (
                  <Metric
                    key={m.label}
                    value={m.value}
                    suffix={m.suffix}
                    decimals={m.decimals}
                    label={m.label}
                  />
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}

// One large metric that counts up from 0 → target on mount (dialog open).
function Metric({
  value,
  suffix,
  decimals,
  label,
}: {
  value: number;
  suffix: string;
  decimals: number;
  label: string;
}) {
  const display = useCountUp(value, decimals);
  return (
    <div>
      <div className="font-headline text-3xl md:text-4xl text-on-surface leading-none tabular-nums">
        {display}
        <span className="text-primary">{suffix}</span>
      </div>
      <div className="font-label text-[11px] uppercase tracking-[0.16em] text-on-surface-variant mt-2">
        {label}
      </div>
    </div>
  );
}

function useCountUp(target: number, decimals: number, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const dur = prefersReducedMotion() ? 0 : duration;
    let raf = 0;
    let start = 0;
    const tick = (ts: number) => {
      if (!start) start = ts;
      const p = dur === 0 ? 1 : Math.min(1, (ts - start) / dur);
      const eased = 1 - (1 - p) ** 3; // easeOutCubic
      setVal(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val.toFixed(decimals);
}
