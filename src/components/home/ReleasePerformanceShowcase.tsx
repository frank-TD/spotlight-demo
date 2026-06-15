"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { RELEASED_SHOWCASE } from "@/lib/mock-data";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Released Film Performance Showcase — the distribution story retold as a
// premium cinematic *proof* panel: a released film fronts the card, four large
// post-release metrics carry the proof, and two secondary titles back it up.
// All figures are placeholder demo data (see RELEASED_SHOWCASE) — no revenue,
// no trend charts — built to swap 1:1 with real released-film data later.
export default function ReleasePerformanceShowcase() {
  const { featured, metrics, others, capabilities } = RELEASED_SHOWCASE;
  const rootRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  // One observer drives the whole panel: metric count-up + sequential reveals.
  // (Reduced motion is handled by `motion-reduce:` variants + the count-up's
  // zero-duration path, so everything shows instantly without animation.)
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

      {/* Featured film — the visual focus */}
      <div className="flex gap-5 md:gap-6 pb-7 border-b border-outline-variant/60">
        <AbstractPoster status={featured.status} title={featured.title} />
        <div className="flex flex-col justify-center min-w-0">
          <h3 className="font-headline text-3xl md:text-4xl text-on-surface leading-[1.05]">
            {featured.title}
          </h3>
          <p className="font-label text-[12px] uppercase tracking-[0.18em] text-primary/90 mt-3">
            {featured.type}
          </p>
          <p className="font-label text-[12px] uppercase tracking-[0.14em] text-on-surface-variant mt-4 leading-relaxed">
            {featured.distribution}
          </p>
        </div>
      </div>

      {/* Metrics — the strongest proof, counting up on entry */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-7 py-7">
        {metrics.map((m) => (
          <Metric
            key={m.label}
            value={m.value}
            suffix={m.suffix}
            decimals={m.decimals}
            label={m.label}
            active={inView}
          />
        ))}
      </div>

      {/* Other released titles — secondary proof, revealing in sequence */}
      <div className="pt-6 border-t border-outline-variant/60">
        <span className="font-label text-[12px] uppercase tracking-[0.22em] text-on-surface-variant/70">
          Other Released Titles
        </span>
        <div className="mt-4 space-y-3.5">
          {others.map((o, i) => (
            <div
              key={o.title}
              className={cn(
                "flex items-baseline justify-between gap-4 transition-all duration-500 ease-out",
                "motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0",
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              )}
              style={{ transitionDelay: inView ? `${300 + i * 140}ms` : "0ms" }}
            >
              <span className="font-headline text-lg md:text-xl text-on-surface shrink-0">
                {o.title}
              </span>
              <span className="font-label text-[12px] uppercase tracking-[0.14em] text-on-surface-variant text-right">
                {o.detail}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Capability tags */}
      <div className="mt-7 pt-6 border-t border-outline-variant/60 flex flex-wrap items-center gap-x-3 gap-y-2">
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

// Abstract dark black-and-gold placeholder poster: thin gold border + glow,
// film-grain texture, faint "rain" streaks, and a softly pulsing Released pill.
function AbstractPoster({ status, title }: { status: string; title: string }) {
  return (
    <div className="group/poster shrink-0 w-[120px] sm:w-[140px]">
      <div
        className="relative aspect-[2/3] rounded-lg overflow-hidden ring-1 ring-primary/40 shadow-[0_0_40px_rgba(212,175,55,0.18)] transition-shadow duration-500 group-hover/poster:shadow-[0_0_70px_rgba(212,175,55,0.34)]"
        style={{
          background:
            "radial-gradient(125% 80% at 50% 8%, rgba(212,175,55,0.24), transparent 58%), linear-gradient(180deg, #1a1622 0%, #0a0a0c 100%)",
        }}
        role="img"
        aria-label={`${title} — ${status}`}
      >
        {/* faint vertical "rain" light beams */}
        <div
          className="absolute inset-0 opacity-70"
          style={{
            background:
              "repeating-linear-gradient(98deg, transparent 0 11px, rgba(212,175,55,0.07) 12px, transparent 13px)",
          }}
        />
        {/* soft spotlight core */}
        <div
          className="absolute inset-x-0 top-0 h-3/5"
          style={{ background: "radial-gradient(70% 60% at 50% 0%, rgba(243,213,127,0.14), transparent 70%)" }}
        />
        {/* film grain */}
        <div
          className="absolute inset-0 mix-blend-overlay opacity-[0.18]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
        {/* bottom scrim + title so it reads as a film poster */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <span className="absolute inset-x-0 bottom-2.5 px-2 text-center font-headline text-[13px] leading-tight text-on-surface/90">
          {title}
        </span>

        {/* Released pill — subtle pulse */}
        <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 font-label text-[10px] uppercase tracking-[0.16em] text-on-primary-container bg-surface/70 border border-primary/40 rounded-full px-2 py-0.5">
          <span className="relative inline-flex w-1.5 h-1.5">
            <span className="absolute inline-flex w-full h-full rounded-full bg-primary opacity-40 animate-ping [animation-duration:2.4s]" />
            <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-primary" />
          </span>
          {status}
        </span>
      </div>
    </div>
  );
}

// One large metric that counts up from 0 → target when activated.
function Metric({
  value,
  suffix,
  decimals,
  label,
  active,
}: {
  value: number;
  suffix: string;
  decimals: number;
  label: string;
  active: boolean;
}) {
  const display = useCountUp(value, decimals, active);
  return (
    <div>
      <div className="font-headline text-4xl md:text-5xl text-on-surface leading-none tabular-nums">
        {display}
        <span className="text-primary">{suffix}</span>
      </div>
      <div className="font-label text-[12px] uppercase tracking-[0.16em] text-on-surface-variant mt-2.5">
        {label}
      </div>
    </div>
  );
}

function useCountUp(target: number, decimals: number, active: boolean, duration = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    // Reduced motion → duration 0 so the first frame lands on the target. State
    // is only ever set inside the rAF callback, never synchronously here.
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
  }, [active, target, duration]);
  return val.toFixed(decimals);
}
