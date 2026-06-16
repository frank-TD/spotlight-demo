"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/hooks/useT";

// "Create. Fund. Distribute." — Spotlight's platform loop told as a production
// pipeline: three process cards wired by a gold line that draws on entry, with
// a creator-first CTA pair below. The mechanics still live on /how-it-works.
export default function HowItWorksBand() {
  const t = useT();
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const steps = [
    { num: "01", word: t.homeV2.step1Word, line: t.homeV2.step1Line, anchor: <CreateAnchor /> },
    { num: "02", word: t.homeV2.step2Word, line: t.homeV2.step2Line, anchor: <FundAnchor /> },
    { num: "03", word: t.homeV2.step3Word, line: t.homeV2.step3Line, anchor: <DistributeAnchor /> },
  ];

  return (
    <section style={{ background: "linear-gradient(180deg, #08080a 0%, #1e1912 200px)" }}>
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-24 md:py-28">
        {/* Title — three-line, three-segment */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="scroll-reveal font-headline text-5xl md:text-7xl text-on-surface leading-[0.95]">
            {t.homeV2.stepsLabel.split("|").map((seg) => (
              <span key={seg} className="block">
                {seg}
              </span>
            ))}
          </h2>
        </div>

        {/* Pipeline cards */}
        <div ref={ref} className="relative mt-16 md:mt-24">
          {/* Pipeline line — draws Create → Fund → Distribute */}
          <div
            aria-hidden
            className="hidden md:block absolute left-[12%] right-[12%] top-1/2 -translate-y-1/2 h-px bg-primary/30 origin-left transition-transform duration-[1100ms] ease-out motion-reduce:transition-none"
            style={{ transform: inView ? "scaleX(1)" : "scaleX(0)" }}
          />
          <ChevronRight
            aria-hidden
            className={cn(
              "hidden md:block absolute right-[10%] top-1/2 -translate-y-1/2 w-4 h-4 text-primary/60 transition-opacity duration-500 motion-reduce:transition-none",
              inView ? "opacity-100" : "opacity-0"
            )}
            style={{ transitionDelay: inView ? "900ms" : "0ms" }}
          />
          {/* Mobile vertical connector */}
          <div
            aria-hidden
            className="md:hidden absolute left-1/2 -translate-x-1/2 top-8 bottom-8 w-px bg-primary/25 origin-top transition-transform duration-[1100ms] ease-out motion-reduce:transition-none"
            style={{ transform: inView ? "scaleY(1)" : "scaleY(0)" }}
          />

          <div className="grid md:grid-cols-3 gap-8 md:gap-6">
            {steps.map((s, i) => (
              <div
                key={s.num}
                className={cn(
                  "transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0",
                  inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                )}
                style={{ transitionDelay: inView ? `${i * 150}ms` : "0ms" }}
              >
                <StepCard num={s.num} word={s.word} line={s.line} anchor={s.anchor} />
              </div>
            ))}
          </div>
        </div>

        {/* Conversion CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-16 md:mt-20">
          <Link
            href="/studio"
            className="group inline-flex items-center gap-2.5 bg-primary text-on-primary font-label text-label-md uppercase tracking-widest px-7 py-4 rounded-full hover:opacity-90 active:scale-95 transition-all shadow-[0_8px_30px_rgba(212,175,55,0.25)]"
          >
            {t.homeV2.stepsCtaPrimary}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/discovery"
            className="inline-flex items-center font-label text-label-md uppercase tracking-widest text-on-primary-container border border-primary/55 px-7 py-4 rounded-full hover:bg-primary/10 transition-colors"
          >
            {t.homeV2.stepsCtaSecondary}
          </Link>
        </div>
      </div>
    </section>
  );
}

// One process card: outline-number watermark, gold anchor, title, description.
function StepCard({
  num,
  word,
  line,
  anchor,
}: {
  num: string;
  word: string;
  line: string;
  anchor: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      ref={ref}
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mouse-x", `${e.clientX - r.left}px`);
        el.style.setProperty("--mouse-y", `${e.clientY - r.top}px`);
      }}
      className="group spotlight-card relative h-full rounded-xl border border-outline-variant/50 bg-surface-container-lowest/55 p-7 md:p-8 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/45"
    >
      {/* watermark number */}
      <span
        aria-hidden
        className="absolute -top-3 right-3 font-label text-[110px] md:text-[140px] leading-none select-none pointer-events-none"
        style={{ WebkitTextStroke: "1.2px rgba(212,175,55,0.16)", color: "transparent" }}
      >
        {num}
      </span>

      <div className="relative h-12 flex items-end">{anchor}</div>

      <h3 className="relative font-headline text-2xl md:text-[28px] text-on-surface mt-6">{word}</h3>
      <p className="relative font-body text-on-surface-variant leading-relaxed mt-3 max-w-[34ch]">
        {line}
      </p>
    </div>
  );
}

// ── Minimal gold visual anchors (no images / colour) ────────────────────────

// Create — storyboard frames with a prompt line.
function CreateAnchor() {
  return (
    <div>
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="flex items-center justify-center w-8 h-6 rounded-[3px] border border-primary/45 bg-primary/[0.06]"
          >
            {i === 1 && <span className="w-0 h-0 border-y-[3px] border-y-transparent border-l-[5px] border-l-primary/70" />}
          </span>
        ))}
      </div>
      <div className="mt-2 h-1.5 w-[88px] rounded-full bg-on-surface/10 overflow-hidden">
        <div className="h-full w-2/3 rounded-full bg-primary/55" />
      </div>
    </div>
  );
}

// Fund — funding progress with a small backer cluster.
function FundAnchor() {
  return (
    <div className="w-[120px]">
      <div className="flex items-center justify-between font-label text-[10px] uppercase tracking-[0.14em]">
        <span className="text-on-surface-variant">Backed</span>
        <span className="text-primary">68%</span>
      </div>
      <div className="mt-1.5 h-1.5 rounded-full bg-on-surface/10 overflow-hidden">
        <div className="h-full w-[68%] rounded-full bg-primary" />
      </div>
      <div className="mt-2.5 flex -space-x-1.5">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="w-4 h-4 rounded-full border border-primary/50 bg-surface-container-low"
          />
        ))}
      </div>
    </div>
  );
}

// Distribute — channel rows reaching out to regions.
function DistributeAnchor() {
  return (
    <div className="flex items-center gap-2">
      <div className="space-y-1.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/70" />
            <span className="block h-1.5 rounded-full bg-primary/20" style={{ width: 30 - i * 6 }} />
          </span>
        ))}
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-primary/45" aria-hidden />
      <span className="relative w-9 h-9 rounded-full border border-primary/35">
        <span className="absolute inset-0 m-auto w-px h-full bg-primary/20" />
        <span className="absolute inset-0 m-auto h-px w-full bg-primary/20" />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary/70" />
      </span>
    </div>
  );
}
