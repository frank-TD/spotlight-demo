"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import MobileHeroVideo from "./MobileHeroVideo";
import { FEATURED_PROJECTS } from "@/lib/mock-data";
import { useSubmitProject } from "@/hooks/useSubmitProject";
import { useT } from "@/hooks/useT";

const HERO_VIDEOS = [
  "/videos/hero/optimized/16022209_hero.mp4",
  "/videos/hero/optimized/16049416_hero.mp4",
  "/videos/hero/optimized/16079919_hero.mp4",
  "/videos/hero/optimized/16107702_hero.mp4",
];

// Tiny dark poster (matches --md-surface) so the video layer paints instantly
// as a solid panel instead of flashing black/blank while the clip buffers.
const HERO_POSTER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Crect width='8' height='8' fill='%2308080a'/%3E%3C/svg%3E";

// Editorial full-bleed hero: ONE clip plays at a time (cross-fading through
// the pool) instead of the old 4-up collage, so the frame keeps a single
// visual focus and decodes a quarter of the video. Copy block sits left,
// "Now Showing" film-credit chip bottom-left.
export default function HeroCinematic() {
  const t = useT();
  const submit = useSubmitProject();
  const sectionRef = useRef<HTMLElement | null>(null);
  const [motionAllowed, setMotionAllowed] = useState(false);
  const [heroInView, setHeroInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);

  const nowShowing = FEATURED_PROJECTS.find((p) => p.nowShowing) ?? FEATURED_PROJECTS[0];
  const statusLabel = {
    funding: t.homeV2.statusFunding,
    production: t.homeV2.statusProduction,
    released: t.homeV2.statusReleased,
  }[nowShowing.status];

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotionPreference = () => setMotionAllowed(!media.matches);
    syncMotionPreference();
    media.addEventListener("change", syncMotionPreference);
    return () => media.removeEventListener("change", syncMotionPreference);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => setHeroInView(entry.isIntersecting), {
      threshold: 0.15,
    });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const syncPageVisibility = () => setPageVisible(document.visibilityState === "visible");
    syncPageVisibility();
    document.addEventListener("visibilitychange", syncPageVisibility);
    return () => document.removeEventListener("visibilitychange", syncPageVisibility);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-mesh overflow-hidden min-h-[640px] h-[92svh] md:h-screen"
    >
      {motionAllowed && (
        <MobileHeroVideo
          clips={HERO_VIDEOS}
          poster={HERO_POSTER}
          playing={heroInView && pageVisible}
        />
      )}
      {/* Editorial scrims: darken left for the copy block, fade bottom to black. */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,8,10,0.86)_0%,rgba(8,8,10,0.46)_36%,rgba(8,8,10,0.08)_64%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,10,0.55)_0%,rgba(8,8,10,0.08)_32%,rgba(8,8,10,0.28)_62%,rgba(8,8,10,0.97)_100%)] pointer-events-none" />

      <div className="relative h-full max-w-[1280px] mx-auto px-6 md:px-12 flex flex-col justify-center">
        <h1 className="font-headline text-[64px] sm:text-[84px] md:text-[104px] leading-[1.02] tracking-tight text-on-surface">
          <span className="block animate-fade-up" style={{ animationDelay: "120ms" }}>
            {t.landing.heroLine1}
          </span>
          <span className="block animate-fade-up" style={{ animationDelay: "220ms" }}>
            {t.landing.heroLine2}
          </span>
          <span
            className="block italic font-headline animate-fade-up"
            style={{
              animationDelay: "320ms",
              background: "linear-gradient(135deg, #d4af37 0%, #f3d57f 60%, #d4af37 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              paddingBottom: "0.05em",
            }}
          >
            {t.landing.heroLine3}
          </span>
        </h1>

        <p
          className="font-body text-base md:text-lg text-on-surface-variant max-w-xl leading-relaxed mt-7 animate-fade-up"
          style={{ animationDelay: "440ms" }}
        >
          {t.homeV2.heroSub}
        </p>

        <div
          className="flex flex-col sm:flex-row sm:items-center gap-3 mt-10 animate-fade-up"
          style={{ animationDelay: "560ms" }}
        >
          <Link
            href="/discovery"
            className="group inline-flex items-center justify-center gap-2.5 bg-primary text-on-primary font-label text-label-md uppercase tracking-widest px-7 py-4 rounded-full hover:opacity-90 active:scale-95 transition-all shadow-[0_8px_30px_rgba(212,175,55,0.25)]"
          >
            {t.homeV2.ctaPrimary}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <button
            type="button"
            onClick={submit}
            className="inline-flex items-center justify-center gap-2 font-label text-label-md uppercase tracking-widest text-on-surface px-7 py-4 rounded-full border border-on-surface/40 hover:bg-on-surface/5 hover:border-on-surface transition-colors"
          >
            {t.homeV2.ctaSecondary}
          </button>
        </div>
      </div>

      {/* Film-credit chip — curation signal, links into the slate. */}
      <Link
        href="/discovery"
        className="absolute left-6 md:left-12 bottom-6 md:bottom-10 inline-flex items-center gap-3 border border-on-surface/20 bg-surface/40 backdrop-blur-sm rounded-sm px-4 py-2.5 hover:border-primary/60 transition-colors animate-fade-up"
        style={{ animationDelay: "700ms" }}
      >
        <span className="font-label text-[11px] uppercase tracking-[0.3em] text-primary">
          {t.homeV2.nowShowing}
        </span>
        <span className="hidden sm:inline font-label text-[11px] uppercase tracking-[0.24em] text-on-surface/80">
          {nowShowing.title} · {statusLabel}
        </span>
      </Link>
    </section>
  );
}
