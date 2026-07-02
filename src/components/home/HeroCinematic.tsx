"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import MobileHeroVideo from "./MobileHeroVideo";
import { HERO_VIDEO_CLIPS } from "@/lib/mock-data";
import { useSubmitProject } from "@/hooks/useSubmitProject";
import { useT } from "@/hooks/useT";

// Editorial full-bleed hero: ONE clip plays at a time (cross-fading through
// the pool) instead of the old 4-up collage, so the frame keeps a single
// visual focus and decodes a quarter of the video. Copy block sits left.
export default function HeroCinematic() {
  const t = useT();
  const submit = useSubmitProject();
  const sectionRef = useRef<HTMLElement | null>(null);
  const [motionAllowed, setMotionAllowed] = useState(false);
  const [heroInView, setHeroInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);

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
        <MobileHeroVideo clips={HERO_VIDEO_CLIPS} playing={heroInView && pageVisible} />
      )}
      {/* No grade over the footage — only a soft fade at the very bottom so the
          hero blends into the next (black) section. Legibility comes from the
          headline / CTA text-shadows below instead of a full overlay. */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,transparent_72%,rgba(8,8,10,0.85)_100%)] pointer-events-none" />

      <div className="relative h-full max-w-[1280px] mx-auto px-6 md:px-12 flex flex-col justify-center">
        <h1 className="font-headline text-[64px] sm:text-[84px] md:text-[104px] leading-[1.02] tracking-tight text-on-surface [text-shadow:0_2px_20px_rgba(0,0,0,0.6)]">
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
          className="font-body text-base md:text-lg text-on-surface-variant max-w-xl leading-relaxed mt-7 animate-fade-up [text-shadow:0_1px_14px_rgba(0,0,0,0.75)]"
          style={{ animationDelay: "440ms" }}
        >
          {t.homeV2.heroSub}
        </p>

        <div
          className="flex flex-col sm:flex-row sm:items-center gap-3 mt-10 animate-fade-up"
          style={{ animationDelay: "560ms" }}
        >
          <Link
            href="/market"
            className="group inline-flex items-center justify-center gap-2.5 bg-primary text-on-primary font-label text-label-md uppercase tracking-widest px-7 py-4 rounded-full hover:opacity-90 active:scale-95 transition-all shadow-[0_8px_30px_rgba(212,175,55,0.25)]"
          >
            {t.homeV2.ctaPrimary}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <button
            type="button"
            onClick={submit}
            className="inline-flex items-center justify-center gap-2 font-label text-label-md uppercase tracking-widest text-on-surface px-7 py-4 rounded-full border border-on-surface/40 hover:bg-on-surface/5 hover:border-on-surface transition-colors [text-shadow:0_1px_10px_rgba(0,0,0,0.55)]"
          >
            {t.homeV2.ctaSecondary}
          </button>
        </div>
      </div>
    </section>
  );
}
