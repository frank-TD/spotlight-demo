"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Clipboard, Bot, Clapperboard, Share2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import SectionLabel from "./SectionLabel";
import { useT } from "@/hooks/useT";
import { cn } from "@/lib/utils";

type Step = { n: string; icon: LucideIcon; title: string; body: string };

// "The Process" — a scroll-pinned 3D card deck modelled on the NicheShowcase
// pattern. On desktop the section pins to the viewport and scrolling advances
// the front card of the stack (the step list on the left highlights to match);
// after the last step the pin releases. On touch / reduced-motion we drop the
// pin and fall back to a single-card horizontal swipe carousel.

const CARD_W = 420;
const CARD_H = 290;
const DIST_X = 36;
const DIST_Y = 40;
const SKEW = 4;
const STEP_VH = 85; // scroll distance (vh) allotted to each step in pinned mode

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const slot = (pos: number, total: number) => ({
  x: pos * DIST_X,
  y: -pos * DIST_Y,
  z: -pos * DIST_X * 1.6,
  zIndex: total - pos,
});

export default function HowItWorksSection() {
  const t = useT();
  const steps: Step[] = [
    { n: "01", icon: Clipboard, title: t.landing.processStep1Title, body: t.landing.processStep1Body },
    { n: "02", icon: Bot, title: t.landing.processStep2Title, body: t.landing.processStep2Body },
    { n: "03", icon: Clapperboard, title: t.landing.processStep3Title, body: t.landing.processStep3Body },
    { n: "04", icon: Share2, title: t.landing.processStep4Title, body: t.landing.processStep4Body },
  ];
  const total = steps.length;

  const [active, setActive] = useState(0);
  // pinned = desktop + motion OK. Starts false so SSR + first paint render the
  // safe swipe fallback; we upgrade after measuring on mount.
  const [pinned, setPinned] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 1024px)");
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const decide = () => setPinned(wide.matches && !rm.matches);
    decide();
    wide.addEventListener("change", decide);
    rm.addEventListener("change", decide);
    return () => {
      wide.removeEventListener("change", decide);
      rm.removeEventListener("change", decide);
    };
  }, []);

  // Pinned mode: map scroll progress through the tall wrapper to the front card.
  useEffect(() => {
    if (!pinned) return undefined;
    let raf = 0;
    const compute = () => {
      raf = 0;
      const el = wrapperRef.current;
      if (!el) return;
      const scrollable = el.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const progress = clamp(-el.getBoundingClientRect().top / scrollable, 0, 1);
      setActive(clamp(Math.floor(progress * total), 0, total - 1));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(compute);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    compute();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pinned, total]);

  // Step click → smooth-scroll the window to that step's dwell zone.
  const scrollToIndex = useCallback(
    (i: number) => {
      const el = wrapperRef.current;
      if (!el) return;
      const scrollable = el.offsetHeight - window.innerHeight;
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + ((i + 0.5) / total) * scrollable, behavior: "smooth" });
    },
    [total]
  );

  return (
    <section className="py-24 md:py-32">
      <div className="space-y-4 mb-16">
        <div className="scroll-reveal">
          <SectionLabel>{t.landing.processLabel}</SectionLabel>
        </div>
        <h2
          className="scroll-reveal font-headline text-4xl md:text-6xl text-on-surface leading-[1.05] max-w-3xl"
          style={{ animationDelay: "90ms" }}
        >
          {t.landing.processTitle1}
          <br />
          <span className="italic text-on-surface/95">{t.landing.processTitle2}</span>
        </h2>
      </div>

      {pinned ? (
        <div ref={wrapperRef} style={{ height: `${total * STEP_VH}vh` }} className="mt-4">
          <div className="sticky top-0 h-screen flex items-center">
            <div className="w-full grid grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] items-center gap-10 xl:gap-16 pt-[72px]">
              <StepList steps={steps} active={active} total={total} onSelect={scrollToIndex} />
              <Deck steps={steps} active={active} total={total} />
            </div>
          </div>
        </div>
      ) : (
        <SwipeCarousel steps={steps} />
      )}
    </section>
  );
}

// ── Step list + counter (genre-style nav) ────────────────────────────────────
function StepList({
  steps,
  active,
  total,
  onSelect,
}: {
  steps: Step[];
  active: number;
  total: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="flex flex-col items-start select-none">
      <ul className="flex flex-col gap-3 md:gap-4">
        {steps.map((s, i) => {
          const on = i === active;
          return (
            <li key={s.n}>
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-current={on ? "true" : undefined}
                className="group flex items-baseline gap-4 text-left focus-visible:outline-none"
              >
                <span
                  className={cn(
                    "font-mono transition-all duration-500",
                    on ? "text-primary text-sm" : "text-on-surface-variant/40 text-xs"
                  )}
                >
                  {s.n}
                </span>
                <span
                  className={cn(
                    "font-headline leading-[1.05] transition-all duration-500 ease-out",
                    on
                      ? "text-on-surface text-3xl md:text-4xl"
                      : "text-on-surface-variant/35 group-hover:text-on-surface-variant/65 text-2xl md:text-3xl"
                  )}
                >
                  {s.title}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-8 font-mono text-[12px] tracking-[0.2em] text-on-surface-variant/80">
        {String(active + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </div>
    </div>
  );
}

// ── 3D stacked deck (scroll-driven) ──────────────────────────────────────────
function Deck({ steps, active, total }: { steps: Step[]; active: number; total: number }) {
  const cx = ((total - 1) * DIST_X) / 2;
  const cy = ((total - 1) * DIST_Y) / 2;
  return (
    <div
      aria-hidden
      className="relative mx-auto"
      style={{
        width: CARD_W + (total - 1) * DIST_X,
        height: CARD_H + (total - 1) * DIST_Y,
        perspective: "1200px",
      }}
    >
      {steps.map((step, idx) => {
        const pos = (idx - active + total) % total;
        const sl = slot(pos, total);
        const tx = sl.x - cx;
        const ty = sl.y + cy;
        return (
          <DeckCard
            key={step.n}
            step={step}
            transform={`translate(-50%, -50%) translate3d(${tx}px, ${ty}px, ${sl.z}px) skewY(${SKEW}deg)`}
            zIndex={sl.zIndex}
            isFront={pos === 0}
          />
        );
      })}
    </div>
  );
}

function DeckCard({
  step,
  transform,
  zIndex,
  isFront,
}: {
  step: Step;
  transform: string;
  zIndex: number;
  isFront: boolean;
}) {
  return (
    <article
      className="absolute left-1/2 top-1/2 overflow-hidden rounded-3xl border border-primary/25 bg-surface-container shadow-[0_30px_70px_rgba(0,0,0,0.5)]"
      style={{
        width: CARD_W,
        height: CARD_H,
        transform,
        zIndex,
        transitionProperty: "transform",
        transitionDuration: "600ms",
        transitionTimingFunction: "cubic-bezier(0.34, 1.1, 0.64, 1)",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
      }}
    >
      <CardFace step={step} />
      {/* Dim the cards parked behind the front one for depth. */}
      <span
        className="absolute inset-0 bg-surface/55 transition-opacity duration-500 pointer-events-none"
        style={{ opacity: isFront ? 0 : 1 }}
      />
    </article>
  );
}

// Shared card content (icon + faded numeral + title + body).
function CardFace({ step }: { step: Step }) {
  const Icon = step.icon;
  return (
    <>
      <span
        className="absolute -top-7 right-4 font-headline italic font-bold pointer-events-none select-none leading-none text-[170px]"
        style={{ color: "rgba(212,175,55,0.07)" }}
      >
        {step.n}
      </span>
      <div className="relative h-full p-9 flex flex-col">
        <div className="w-14 h-14 rounded-xl bg-primary-container text-primary flex items-center justify-center mb-7">
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="font-headline text-3xl text-on-surface leading-tight mb-4">{step.title}</h3>
        <p className="font-body text-base text-on-surface-variant leading-relaxed">{step.body}</p>
      </div>
    </>
  );
}

// ── Mobile / reduced-motion fallback: single-card horizontal swipe ───────────
function SwipeCarousel({ steps }: { steps: Step[] }) {
  const [idx, setIdx] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    setIdx(clamp(Math.round(el.scrollLeft / el.clientWidth), 0, steps.length - 1));
  };

  return (
    <div className="mt-10">
      <div
        ref={ref}
        onScroll={onScroll}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {steps.map((s) => (
          <div key={s.n} className="snap-center shrink-0 w-[85%] sm:w-[60%]">
            <article className="relative h-[340px] overflow-hidden rounded-3xl border border-primary/25 bg-surface-container shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
              <CardFace step={s} />
            </article>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-2 mt-4">
        {steps.map((s, i) => (
          <span
            key={s.n}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === idx ? "w-6 bg-primary" : "w-1.5 bg-on-surface-variant/30"
            )}
          />
        ))}
      </div>
    </div>
  );
}
