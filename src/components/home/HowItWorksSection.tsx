"use client";
import { useEffect, useRef, useState } from "react";
import { Clipboard, Bot, Clapperboard, Share2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import SectionLabel from "./SectionLabel";
import { useT } from "@/hooks/useT";

type Step = { n: string; icon: LucideIcon; title: string; body: string };

// Geometry for the stacked card-swap — a dependency-free reimplementation of
// the reactbits GSAP CardSwap. Same drop→promote→tuck-to-back choreography,
// driven by React state + CSS transitions instead of GSAP.
const CARD_W = 380;
const CARD_H = 240;
const DIST_X = 56;
const DIST_Y = 56;
const SKEW = 6;
const DROP_MS = 650; // front card falls away
const MOVE_MS = 720; // promote / tuck-to-back glide
const HOLD_MS = 3400; // dwell between swaps

const slot = (pos: number, total: number) => ({
  x: pos * DIST_X,
  y: -pos * DIST_Y,
  z: -pos * DIST_X * 1.5,
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

  // Animate only on a pointer-friendly viewport with motion allowed; otherwise
  // (mobile / reduced-motion / SSR) render the readable static grid.
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 768px)");
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const decide = () => setAnimated(wide.matches && !rm.matches);
    decide();
    wide.addEventListener("change", decide);
    rm.addEventListener("change", decide);
    return () => {
      wide.removeEventListener("change", decide);
      rm.removeEventListener("change", decide);
    };
  }, []);

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

      {animated ? <CardSwapStack steps={steps} /> : <StepGrid steps={steps} />}
    </section>
  );
}

// ── Animated stacked deck ────────────────────────────────────────────────────
function CardSwapStack({ steps }: { steps: Step[] }) {
  const total = steps.length;
  const [order, setOrder] = useState<number[]>(() => steps.map((_, i) => i));
  const [dropping, setDropping] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const orderRef = useRef(order);
  useEffect(() => {
    orderRef.current = order;
  }, [order]);

  useEffect(() => {
    if (paused) return;
    let dropTimer = 0;
    const tick = () => {
      const front = orderRef.current[0];
      setDropping(front); // phase A: front card falls
      dropTimer = window.setTimeout(() => {
        setDropping(null); // phase B: rotate — others promote, front tucks to back
        setOrder((o) => [...o.slice(1), o[0]]);
      }, DROP_MS);
    };
    const id = window.setInterval(tick, HOLD_MS);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(dropTimer);
      setDropping(null);
    };
  }, [paused]);

  // Offsets that recentre the diagonal cluster within its box.
  const cx = ((total - 1) * DIST_X) / 2;
  const cy = ((total - 1) * DIST_Y) / 2;

  return (
    <div
      // NB: use a mount-time animation (not `scroll-reveal`) — this deck is
      // mounted after `animated` flips, by which point the global ScrollReveal
      // IntersectionObserver has already scanned the DOM and would never add
      // `.visible`, leaving the cards stuck at opacity:0.
      className="animate-fade-up hidden md:flex justify-center mt-4"
      style={{ perspective: "1100px" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="relative"
        style={{ width: CARD_W, height: CARD_H + (total - 1) * DIST_Y + 40 }}
      >
        {steps.map((step, idx) => {
          const pos = order.indexOf(idx);
          const sl = slot(pos, total);
          const isDropping = dropping === idx;
          const tx = sl.x - cx;
          const ty = sl.y + cy + (isDropping ? CARD_H + 40 : 0);
          return (
            <DeckCard
              key={step.n}
              step={step}
              transform={`translate(-50%, -50%) translate3d(${tx}px, ${ty}px, ${sl.z}px) skewY(${SKEW}deg)`}
              zIndex={isDropping ? 99 : sl.zIndex}
              durationMs={isDropping ? DROP_MS : MOVE_MS}
              // accelerate on the way down, spring on the way back / forward
              easing={
                isDropping ? "cubic-bezier(0.5, 0, 0.75, 0)" : "cubic-bezier(0.34, 1.3, 0.64, 1)"
              }
              isFront={pos === 0 && !isDropping}
            />
          );
        })}
      </div>
    </div>
  );
}

function DeckCard({
  step,
  transform,
  zIndex,
  durationMs,
  easing,
  isFront,
}: {
  step: Step;
  transform: string;
  zIndex: number;
  durationMs: number;
  easing: string;
  isFront: boolean;
}) {
  const Icon = step.icon;
  return (
    <article
      className="absolute left-1/2 top-1/2 overflow-hidden rounded-2xl border border-primary/25 bg-surface-container shadow-[0_24px_60px_rgba(0,0,0,0.45)]"
      style={{
        width: CARD_W,
        height: CARD_H,
        transform,
        zIndex,
        transitionProperty: "transform",
        transitionDuration: `${durationMs}ms`,
        transitionTimingFunction: easing,
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
      }}
    >
      <span
        className="absolute -top-6 right-3 font-headline italic font-bold pointer-events-none select-none leading-none text-[150px]"
        style={{ color: "rgba(212,175,55,0.08)" }}
      >
        {step.n}
      </span>
      <div className="relative h-full p-8 flex flex-col">
        <div className="w-12 h-12 rounded-xl bg-primary-container text-primary flex items-center justify-center mb-6">
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="font-headline text-2xl text-on-surface leading-tight mb-3">{step.title}</h3>
        <p className="font-body text-sm text-on-surface-variant leading-relaxed line-clamp-3">
          {step.body}
        </p>
      </div>
      {/* Dim the cards parked behind the front one for depth. */}
      <span
        className="absolute inset-0 bg-surface/55 transition-opacity duration-500 pointer-events-none"
        style={{ opacity: isFront ? 0 : 1 }}
      />
    </article>
  );
}

// ── Static fallback grid (mobile / reduced-motion / SSR) ──────────────────────
function StepGrid({ steps }: { steps: Step[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-outline-variant/30 border border-outline-variant/30 rounded-2xl overflow-hidden">
      {steps.map(({ n, icon: Icon, title, body }, i) => (
        <div
          key={n}
          className="scroll-reveal relative bg-surface-container-lowest p-10 md:p-12 overflow-hidden"
          style={{ animationDelay: `${i * 120}ms` }}
        >
          <span
            className="absolute top-2 left-6 font-headline italic font-bold pointer-events-none select-none leading-none text-[160px] md:text-[200px]"
            style={{ color: "rgba(212,175,55,0.06)" }}
          >
            {n}
          </span>
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-primary-container text-primary flex items-center justify-center mb-8">
              <Icon className="w-5 h-5" />
            </div>
            <h3 className="font-headline text-2xl md:text-[28px] text-on-surface leading-tight mb-4">
              {title}
            </h3>
            <p className="font-body text-sm md:text-base text-on-surface-variant leading-relaxed">
              {body}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
