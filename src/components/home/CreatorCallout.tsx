"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { mediaUrl } from "@/lib/media";
import { useT } from "@/hooks/useT";
import { useSubmitProject } from "@/hooks/useSubmitProject";

// A receding wall of real film posters — Spotlight's marketplace seen in
// perspective. Repeated to fill the wall; order avoids obvious neighbours.
const WALL = [
  "neon-rain",
  "aurora-crystal",
  "paper-lanterns",
  "golden-core",
  "the-eighth-day",
  "crimson-mirage",
  "aurora-crystal",
  "neon-rain",
  "golden-core",
  "paper-lanterns",
  "crimson-mirage",
  "the-eighth-day",
].map((s, i) => ({ key: `${s}-${i}`, src: mediaUrl(`/posters/${s}.jpg`) }));

// "Your film belongs here." — a cinematic submission portal: the filmmaker's
// pitch on the left, a perspective wall of films (the marketplace they're
// entering) receding into gold-lit depth on the right.
export default function CreatorCallout() {
  const t = useT();
  const submit = useSubmitProject();

  return (
    <section className="relative overflow-hidden border-t border-outline-variant/30 min-h-[600px] md:min-h-[700px] flex items-center">
      {/* ── Background: perspective poster wall + light ─────────────────── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* receding poster wall (desktop) */}
        <div
          className="hidden sm:block absolute inset-y-0 right-0 w-[72%] md:w-[62%]"
          style={{ perspective: "1500px" }}
        >
          <div className="wall-drift absolute inset-0 flex items-center justify-end">
            <div
              className="grid grid-cols-3 gap-3.5 w-[600px] md:w-[660px] shrink-0"
              style={{ transform: "rotateY(-31deg) rotateX(5deg)", transformOrigin: "right center" }}
            >
              {WALL.map((p) => (
                <div
                  key={p.key}
                  className="aspect-[2/3] rounded-md overflow-hidden ring-1 ring-primary/20 shadow-[0_28px_60px_rgba(0,0,0,0.6)]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.src}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                    style={{ filter: "brightness(0.9) saturate(0.98)" }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* left darkening for the headline + wall depth dim (its back is on the
            left, so this also sinks the far posters into shadow) */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#08080a_0%,rgba(8,8,10,0.92)_30%,rgba(8,8,10,0.45)_50%,transparent_72%)]" />
        {/* top/bottom cinematic feather so the wall bleeds into black */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,10,0.78)_0%,transparent_22%,transparent_72%,rgba(8,8,10,0.88)_100%)]" />
        {/* far-right edge feather */}
        <div className="absolute inset-y-0 right-0 w-[14%] bg-[linear-gradient(90deg,transparent,rgba(8,8,10,0.55))]" />

        {/* breathing gold spotlight beam, raking the wall */}
        <div
          className="absolute right-[8%] -top-[26%] w-[56%] h-[150%] spotlight-breathe"
          style={{ background: "radial-gradient(ellipse 44% 42% at 50% 0%, rgba(212,175,55,0.24), transparent 64%)" }}
        />

        {/* film grain */}
        <div
          className="absolute inset-0 mix-blend-overlay opacity-[0.06]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      {/* ── Content (left) ─────────────────────────────────────────────── */}
      <div className="relative w-full max-w-[1280px] mx-auto px-6 md:px-12 py-20 md:py-0">
        <div className="scroll-reveal max-w-xl">
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
      </div>
    </section>
  );
}
