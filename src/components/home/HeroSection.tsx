"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import StatCountUp from "./StatCountUp";
import MobileHeroVideo from "./MobileHeroVideo";
import { useStore } from "@/lib/store";
import { useT } from "@/hooks/useT";

const HERO_VIDEOS = [
  "/videos/hero/optimized/16022209_hero.mp4",
  "/videos/hero/optimized/16049416_hero.mp4",
  "/videos/hero/optimized/16079919_hero.mp4",
  "/videos/hero/optimized/16107702_hero.mp4",
];

// Tiny dark poster (matches --md-surface) so each cell paints instantly as a
// solid panel instead of flashing black/blank while the clip buffers.
const HERO_POSTER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Crect width='8' height='8' fill='%2308080a'/%3E%3C/svg%3E";

// Full-bleed cinematic hero with the user's selected footage combined into a
// moving background collage.
export default function HeroSection() {
  const t = useT();
  const router = useRouter();
  const isLoggedIn = useStore((s) => s.isLoggedIn);
  const onboardingComplete = useStore((s) => s.onboardingComplete);
  const sectionRef = useRef<HTMLElement | null>(null);
  const [motionAllowed, setMotionAllowed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [heroInView, setHeroInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotionPreference = () => setMotionAllowed(!media.matches);
    syncMotionPreference();
    media.addEventListener("change", syncMotionPreference);
    return () => media.removeEventListener("change", syncMotionPreference);
  }, []);

  // The 4-clip collage is desktop-only — decoding it on phones tanks scroll
  // performance and battery, so mobile keeps the static cinematic mesh.
  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const syncIsDesktop = () => setIsDesktop(media.matches);
    syncIsDesktop();
    media.addEventListener("change", syncIsDesktop);
    return () => media.removeEventListener("change", syncIsDesktop);
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

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const videos = Array.from(section.querySelectorAll<HTMLVideoElement>("[data-hero-video]"));
    const shouldPlay = motionAllowed && heroInView && pageVisible;

    if (!shouldPlay) {
      videos.forEach((video) => video.pause());
      return;
    }

    const playAll = () => {
      videos.forEach((video) => {
        video.muted = true;
        void video.play();
      });
    };

    const timers = [0, 500, 1500].map((delay) => window.setTimeout(playAll, delay));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [heroInView, motionAllowed, pageVisible]);

  // Post a Brief — smart routing. Anonymous users go through register; signed-
  // in users that haven't finished onboarding land on the role picker; fully
  // onboarded users jump straight into the marketplace post-a-need flow.
  const post = () => {
    if (!isLoggedIn) {
      toast.info(t.landing.signupToastBrief);
      router.push("/register");
      return;
    }
    if (!onboardingComplete) {
      router.push("/onboarding/role");
      return;
    }
    router.push("/market");
  };
  // Browse Creators is the inspiration entry point — no signup gate, just
  // walk over to the masonry feed.
  const browse = () => router.push("/discovery");

  return (
    <section
      ref={sectionRef}
      className="relative bg-mesh -mx-6 md:-mx-12 px-6 md:px-12 pt-28 md:pt-36 pb-24 md:pb-32 overflow-hidden"
    >
      {motionAllowed && !isDesktop && (
        <MobileHeroVideo
          clips={HERO_VIDEOS}
          poster={HERO_POSTER}
          playing={heroInView && pageVisible}
        />
      )}
      {motionAllowed && isDesktop && (
        <div
          className="absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-80"
          aria-hidden="true"
          // Isolate this layer so scrolling the page doesn't repaint the videos,
          // and keep its painting contained to its own box.
          style={{ transform: "translateZ(0)", contain: "paint" }}
        >
          {HERO_VIDEOS.map((src) => (
            <div
              key={src}
              className="relative overflow-hidden border border-on-surface/5 bg-surface"
            >
              {/* Only mount (and therefore fetch/decode) the clips once the hero
                  is actually on screen — avoids a heavy 4-video decode burst
                  competing with first paint. */}
              {heroInView && (
                <video
                  data-hero-video
                  aria-hidden="true"
                  className="hero-kenburns h-full w-full object-cover"
                  // Promote each video to its own GPU layer; no CSS filters /
                  // blend modes (those repaint every frame and caused the jank).
                  // The Ken Burns drift is a cheap GPU transform, not a repaint.
                  style={{ backfaceVisibility: "hidden" }}
                  poster={HERO_POSTER}
                  autoPlay={pageVisible}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  disablePictureInPicture
                >
                  <source src={src} type="video/mp4" />
                </video>
              )}
            </div>
          ))}
          {/* One cheap flat gold cast in place of the four per-video blends. */}
          <div className="absolute inset-0 bg-primary/[0.08] pointer-events-none" />
        </div>
      )}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(8,8,10,0.08),rgba(8,8,10,0.66)_72%),linear-gradient(180deg,rgba(8,8,10,0.52)_0%,rgba(8,8,10,0.18)_42%,rgba(8,8,10,0.82)_100%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,8,10,0.82)_0%,rgba(8,8,10,0.3)_28%,rgba(8,8,10,0.08)_50%,rgba(8,8,10,0.34)_74%,rgba(8,8,10,0.84)_100%)] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 mb-10 px-4 py-1.5 rounded-full border border-primary/30 text-primary font-label text-[11px] uppercase tracking-[0.28em] animate-fade-up">
          <span className="relative inline-flex w-1.5 h-1.5">
            <span className="absolute inline-flex w-full h-full rounded-full bg-primary opacity-50 animate-ping" />
            <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-primary live-dot" />
          </span>
          {t.landing.heroBadge}
        </div>

        <h1 className="font-headline text-[64px] sm:text-[88px] md:text-[112px] leading-[1.02] tracking-tight text-on-surface mb-10">
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
          className="font-body text-base md:text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed animate-fade-up"
          style={{ animationDelay: "440ms" }}
        >
          {t.landing.heroSub}
        </p>

        <div
          className="flex flex-wrap items-center justify-center gap-3 mt-12 animate-fade-up"
          style={{ animationDelay: "560ms" }}
        >
          <button
            type="button"
            onClick={post}
            className="group inline-flex items-center gap-2.5 bg-primary text-on-primary font-label text-label-md uppercase tracking-widest px-7 py-4 rounded-full hover:opacity-90 active:scale-95 transition-all shadow-[0_8px_30px_rgba(212,175,55,0.25)]"
          >
            {t.landing.heroCtaPrimary}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
          <button
            type="button"
            onClick={browse}
            className="inline-flex items-center gap-2 font-label text-label-md uppercase tracking-widest text-on-surface px-7 py-4 rounded-full border border-on-surface/40 hover:bg-on-surface/5 hover:border-on-surface transition-colors"
          >
            {t.landing.heroCtaSecondary}
          </button>
        </div>

        {/* Hero stats trio */}
        <div
          className="flex items-center justify-center gap-10 md:gap-16 mt-14 animate-fade-up"
          style={{ animationDelay: "700ms" }}
        >
          <Stat value={t.landing.heroStatCreators} label={t.landing.heroStatCreatorsLabel} />
          <span className="w-px h-10 bg-outline-variant/40" />
          <Stat
            value={t.landing.heroStatCommissioned}
            label={t.landing.heroStatCommissionedLabel}
          />
          <span className="w-px h-10 bg-outline-variant/40" />
          <Stat value={t.landing.heroStatCompletion} label={t.landing.heroStatCompletionLabel} />
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <StatCountUp value={value} className="font-headline text-2xl md:text-3xl text-primary" />
      <span className="font-label text-[10px] uppercase tracking-[0.28em] text-on-surface-variant mt-1.5">
        {label}
      </span>
    </div>
  );
}
