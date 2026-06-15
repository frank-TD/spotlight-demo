"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, Check, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { mediaUrl } from "@/lib/media";
import { useT } from "@/hooks/useT";
import { useSubmitProject } from "@/hooks/useSubmitProject";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Real vertical stills as dimmed, drifting frames behind the hero — a poster
// wall that says "films entering a marketplace", not a single scenic photo.
const WALL = [
  { src: "/posters/neon-rain.jpg", top: "3%", left: "49%", w: 150, rot: -6, op: 0.22, blur: 1.2, dur: 9, delay: 0 },
  { src: "/posters/golden-core.jpg", top: "30%", left: "69%", w: 132, rot: 5, op: 0.16, blur: 1.6, dur: 11, delay: 1.2 },
  { src: "/posters/aurora-crystal.jpg", top: "54%", left: "55%", w: 120, rot: -4, op: 0.14, blur: 2, dur: 10, delay: 0.6 },
  { src: "/posters/crimson-mirage.jpg", top: "1%", left: "81%", w: 120, rot: 7, op: 0.15, blur: 1.9, dur: 12, delay: 2 },
  { src: "/posters/paper-lanterns.jpg", top: "58%", left: "83%", w: 112, rot: -7, op: 0.12, blur: 2.1, dur: 13, delay: 1.6 },
  { src: "/posters/the-eighth-day.jpg", top: "36%", left: "41%", w: 110, rot: 4, op: 0.12, blur: 2.3, dur: 10.5, delay: 0.9 },
];

// "Your film belongs here." — a cinematic submission portal: a filmmaker drops
// an AI-powered film into Spotlight and it becomes a structured, backable
// Project Dossier on its way to the marketplace.
export default function CreatorCallout() {
  const t = useT();
  const submit = useSubmitProject();
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
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="relative overflow-hidden border-t border-outline-variant/30">
      {/* ── Background layers ──────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* poster wall (desktop only — mobile stays simple/readable) */}
        <div className="absolute inset-0 hidden sm:block">
          {WALL.map((f) => (
            <div
              key={f.src}
              className="absolute frame-float"
              style={
                {
                  top: f.top,
                  left: f.left,
                  width: f.w,
                  animationDelay: `${f.delay}s`,
                  "--float-dur": `${f.dur}s`,
                } as CSSProperties
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mediaUrl(f.src)}
                alt=""
                loading="lazy"
                decoding="async"
                className="w-full rounded-md ring-1 ring-primary/15 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                style={{ transform: `rotate(${f.rot}deg)`, opacity: f.op, filter: `blur(${f.blur}px)` }}
              />
            </div>
          ))}
        </div>

        {/* breathing gold spotlight beam */}
        <div
          className="absolute left-1/2 -top-[25%] -translate-x-1/2 w-[75%] h-[130%] spotlight-breathe"
          style={{ background: "radial-gradient(ellipse 48% 46% at 50% 0%, rgba(212,175,55,0.18), transparent 62%)" }}
        />

        {/* vignette + left-side darkening for text legibility */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_72%_72%_at_50%_44%,rgba(8,8,10,0.5),rgba(8,8,10,0.95)_92%)]" />
        <div className="hidden md:block absolute inset-0 bg-[linear-gradient(90deg,rgba(8,8,10,0.9)_0%,rgba(8,8,10,0.55)_46%,transparent_100%)]" />

        {/* film grain */}
        <div
          className="absolute inset-0 mix-blend-overlay opacity-[0.06]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <div className="relative max-w-[1280px] mx-auto px-6 md:px-12 py-24 md:py-32 grid md:grid-cols-2 gap-14 md:gap-16 items-center">
        {/* Left — pitch + CTAs */}
        <div className="scroll-reveal">
          <p className="font-label text-[12px] uppercase tracking-[0.2em] text-primary">
            {t.homeV2.creatorLabel}
          </p>
          <h2 className="font-headline text-5xl md:text-7xl text-on-surface mt-5 leading-[1.05]">
            {t.homeV2.creatorTitle1}{" "}
            <span
              className="italic"
              style={{
                background: "linear-gradient(135deg, #d4af37 0%, #f3d57f 60%, #d4af37 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {t.homeV2.creatorTitle2}
            </span>
          </h2>
          <p className="font-body text-lg text-on-surface-variant leading-relaxed mt-6 max-w-md">
            {t.homeV2.creatorSub}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-10">
            <button
              type="button"
              onClick={submit}
              className="group inline-flex items-center justify-center gap-2.5 bg-primary text-on-primary font-label text-label-md uppercase tracking-widest px-7 py-4 rounded-full transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_44px_rgba(212,175,55,0.4)] active:scale-95 shadow-[0_8px_30px_rgba(212,175,55,0.25)]"
            >
              {t.homeV2.creatorSubmitCta}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center font-label text-label-md uppercase tracking-widest text-on-surface border border-on-surface/35 px-7 py-4 rounded-full hover:border-primary/60 hover:text-primary transition-colors"
            >
              {t.homeV2.creatorFlowCta}
            </Link>
          </div>
        </div>

        {/* Right — Project Dossier */}
        <div ref={ref} className="w-full max-w-[400px] mx-auto md:ml-auto md:mr-0">
          <ProjectDossier inView={inView} t={t} />
        </div>
      </div>
    </section>
  );
}

function ProjectDossier({ inView, t }: { inView: boolean; t: ReturnType<typeof useT> }) {
  const match = useCountUp(86, inView);
  const items = [
    t.homeV2.creatorStatusTrailer,
    t.homeV2.creatorStatusStory,
    t.homeV2.creatorStatusBudget,
    t.homeV2.creatorStatusRights,
  ];

  return (
    <div
      className={cn(
        "relative rounded-2xl border border-primary/25 bg-surface-container-lowest/85 backdrop-blur-sm p-6 md:p-7 shadow-[0_40px_100px_rgba(0,0,0,0.6),0_0_70px_rgba(212,175,55,0.08)] transition-[transform,opacity] duration-700 ease-out",
        "motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:scale-100",
        inView ? "opacity-100 scale-100" : "opacity-0 scale-95"
      )}
    >
      {/* header */}
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 font-label text-[12px] uppercase tracking-[0.2em] text-primary">
          <FolderOpen className="w-3.5 h-3.5" />
          {t.homeV2.creatorDossierHeader}
        </span>
        <span className="font-label text-[11px] uppercase tracking-[0.16em] text-on-surface-variant/60">
          SPT-001
        </span>
      </div>

      {/* title + meta */}
      <h3 className="font-headline text-3xl md:text-[32px] text-on-surface mt-5 leading-tight">Neon Rain</h3>
      <p className="font-label text-[12px] uppercase tracking-[0.18em] text-on-surface-variant mt-2">
        {t.homeV2.creatorDossierMeta}
      </p>

      {/* status checklist */}
      <div className="mt-6 pt-5 border-t border-outline-variant/40 space-y-3">
        {items.map((label, i) => (
          <div
            key={label}
            className={cn(
              "flex items-center gap-3 transition-all duration-500 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-x-0",
              inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
            )}
            style={{ transitionDelay: inView ? `${280 + i * 120}ms` : "0ms" }}
          >
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/15 text-primary shrink-0">
              <Check className="w-3 h-3" />
            </span>
            <span className="font-label text-[13px] uppercase tracking-[0.12em] text-on-surface-variant">
              {label}
            </span>
          </div>
        ))}

        {/* Backer match — counts up with a meter */}
        <div
          className={cn(
            "pt-1 transition-all duration-500 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-x-0",
            inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
          )}
          style={{ transitionDelay: inView ? `${280 + 4 * 120}ms` : "0ms" }}
        >
          <div className="flex items-center justify-between">
            <span className="font-label text-[13px] uppercase tracking-[0.12em] text-on-surface-variant">
              {t.homeV2.creatorStatusMatch}
            </span>
            <span className="font-headline text-xl text-primary tabular-nums">{match}%</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-on-surface/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-200 ease-out"
              style={{ width: `${match}%` }}
            />
          </div>
        </div>
      </div>

      {/* final status */}
      <div className="mt-6 pt-5 border-t border-outline-variant/40">
        <span className="flex items-center justify-center gap-2 rounded-lg bg-primary/10 border border-primary/30 px-4 py-3 font-label text-[12px] uppercase tracking-[0.16em] text-on-primary-container">
          <span className="relative inline-flex w-1.5 h-1.5">
            <span className="absolute inline-flex w-full h-full rounded-full bg-primary opacity-50 animate-ping [animation-duration:2.4s]" />
            <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-primary" />
          </span>
          {t.homeV2.creatorReadyReview}
        </span>
      </div>
    </div>
  );
}

function useCountUp(target: number, active: boolean, duration = 1300) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    const dur = prefersReducedMotion() ? 0 : duration;
    let raf = 0;
    let start = 0;
    const tick = (ts: number) => {
      if (!start) start = ts;
      const p = dur === 0 ? 1 : Math.min(1, (ts - start) / dur);
      setVal(Math.round(target * (1 - (1 - p) ** 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration]);
  return val;
}
