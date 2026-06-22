"use client";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { RELEASED_SHOWCASE } from "@/lib/mock-data";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type Film = (typeof RELEASED_SHOWCASE.films)[number];

// Released Film Performance Showcase — a premium proof panel. The card holds a
// minimal slate of three released films (poster + title + release date).
// Tapping one expands the card downward and zooms that film into a focus view
// where its full post-release metrics count up; the other two recede to a
// dimmed switcher. No modal — it all happens in place. All figures are
// placeholder demo data (see RELEASED_SHOWCASE), built to swap for real data.
export default function ReleasePerformanceShowcase() {
  const { films, capabilities } = RELEASED_SHOWCASE;
  const rootRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  // `shownId` lags `activeId` on close so the focus view can fade out with its
  // content intact (no animation library / presence handling available).
  const [shownId, setShownId] = useState<string | null>(null);
  const [originIdx, setOriginIdx] = useState(1);
  const closeTimer = useRef(0);

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

  const open = (id: string) => {
    window.clearTimeout(closeTimer.current);
    setOriginIdx(films.findIndex((f) => f.id === id));
    setShownId(id);
    setActiveId(id);
  };
  const close = () => {
    setActiveId(null);
    closeTimer.current = window.setTimeout(() => setShownId(null), 450);
  };

  useEffect(() => {
    if (!activeId) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeId]);

  const shownFilm = films.find((f) => f.id === shownId) ?? null;
  const originClass = ["origin-left", "origin-center", "origin-right"][originIdx] ?? "origin-center";

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

      {/* Stage — grows downward from slate to focus, in place */}
      <div
        className={cn(
          "relative transition-[height] duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)] motion-reduce:transition-none",
          activeId ? "h-[470px] sm:h-[340px]" : "h-[164px] sm:h-[292px]"
        )}
      >
        {/* Slate layer */}
        <div
          className={cn(
            "absolute inset-0 grid grid-cols-3 gap-3 md:gap-4 transition-[opacity,transform] duration-[450ms] ease-out motion-reduce:transition-none",
            activeId ? "opacity-0 scale-[0.98] pointer-events-none" : "opacity-100 scale-100"
          )}
        >
          {films.map((f, i) => (
            <SlatePoster key={f.id} film={f} inView={inView} delay={i * 110} onOpen={() => open(f.id)} />
          ))}
        </div>

        {/* Focus layer — zooms from the tapped poster */}
        <div
          className={cn(
            "absolute inset-0 transition-[opacity,transform] duration-[450ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] motion-reduce:transition-none",
            originClass,
            activeId ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
          )}
        >
          {shownFilm && (
            <FocusView
              key={shownFilm.id}
              film={shownFilm}
              others={films.filter((f) => f.id !== shownFilm.id)}
              onSwitch={open}
              onClose={close}
            />
          )}
        </div>
      </div>

      <p
        className={cn(
          "font-label text-[11px] uppercase tracking-[0.16em] text-on-surface-variant/60 mt-4 transition-opacity duration-300",
          activeId ? "opacity-0" : "opacity-100"
        )}
      >
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
    </div>
  );
}

// Slate thumbnail: real film still, title + release date overlaid, Released pill.
function SlatePoster({
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
        "group/card relative block h-full w-full rounded-lg overflow-hidden text-left ring-1 ring-outline-variant/50 shadow-[0_12px_30px_rgba(0,0,0,0.4)] transition-all duration-500 ease-out outline-none",
        "hover:ring-primary/55 hover:shadow-[0_0_44px_rgba(212,175,55,0.22)] focus-visible:ring-primary/70",
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
        <p className="font-label text-[10px] uppercase tracking-[0.14em] text-on-surface-variant">
          {film.releaseDate}
        </p>
      </div>
    </button>
  );
}

// Focus view — the tapped film, enlarged, with its metrics counting up. The
// other two sit below as a dimmed switcher.
function FocusView({
  film,
  others,
  onSwitch,
  onClose,
}: {
  film: Film;
  others: Film[];
  onSwitch: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-0 flex flex-col gap-3 sm:gap-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 flex-1 min-h-0">
        {/* enlarged still */}
        <div className="relative shrink-0 w-full sm:w-[38%] h-[150px] sm:h-auto rounded-lg overflow-hidden ring-1 ring-primary/45 shadow-[0_0_50px_rgba(212,175,55,0.2)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={film.poster} alt={film.title} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(212,175,55,0.08),transparent_45%,rgba(8,8,10,0.4)_96%)]" />
          <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 font-label text-[10px] uppercase tracking-[0.14em] text-on-primary-container bg-surface/70 border border-primary/40 rounded-full px-2 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Released · {film.releaseDate}
          </span>
        </div>

        {/* detail */}
        <div className="relative flex-1 min-w-0 pr-8">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close report"
            className="absolute -top-1 right-0 w-8 h-8 rounded-full border border-outline-variant/60 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/60 active:scale-95 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <h3 className="font-headline text-2xl md:text-3xl text-on-surface leading-[1.05] pr-6">
            {film.title}
          </h3>
          <p className="font-label text-[11px] uppercase tracking-[0.16em] text-primary/90 mt-2">
            {film.type}
          </p>
          <p className="font-label text-[11px] uppercase tracking-[0.13em] text-on-surface-variant mt-2 leading-relaxed">
            {film.distribution}
          </p>
          <div className="grid grid-cols-2 gap-x-5 gap-y-4 mt-4 sm:mt-5 pt-4 border-t border-outline-variant/40">
            {film.metrics.map((m) => (
              <Metric key={m.label} value={m.value} suffix={m.suffix} decimals={m.decimals} label={m.label} />
            ))}
          </div>
        </div>
      </div>

      {/* dimmed switcher — the other two released titles */}
      <div className="flex items-stretch gap-2.5 shrink-0 pt-3 border-t border-outline-variant/40">
        {others.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onSwitch(o.id)}
            aria-label={`Switch to ${o.title}`}
            className="group/sw flex items-center gap-2.5 min-w-0 flex-1 rounded-md p-1.5 opacity-55 hover:opacity-100 transition-opacity outline-none"
          >
            <span className="relative shrink-0 w-9 h-12 rounded overflow-hidden ring-1 ring-outline-variant/50 group-hover/sw:ring-primary/50 transition-colors">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={o.poster} alt="" className="absolute inset-0 w-full h-full object-cover" />
            </span>
            <span className="min-w-0 text-left">
              <span className="block font-headline text-sm text-on-surface truncate">{o.title}</span>
              <span className="block font-label text-[10px] uppercase tracking-[0.14em] text-on-surface-variant">
                {o.releaseDate}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// One large metric that counts up from 0 → target on mount.
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
      <div className="font-headline text-[28px] md:text-4xl text-on-surface leading-none tabular-nums">
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
