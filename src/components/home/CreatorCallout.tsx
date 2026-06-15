"use client";
import { ArrowRight } from "lucide-react";
import { mediaUrl } from "@/lib/media";
import { useT } from "@/hooks/useT";
import { useSubmitProject } from "@/hooks/useSubmitProject";

// End-credit role labels rolling slowly up the cinema screen behind the call.
const CREDITS = [
  "Created By",
  "Funded By",
  "Distributed By",
  "Backed By",
  "Directed By",
  "Owned By",
  "Spotlight Originals",
  "AI Film Slate",
  "Global Release",
];
// Doubled so the -50% scroll loops seamlessly; stable keys precomputed here.
const CREDITS_LOOP = [...CREDITS, ...CREDITS].map((text, i) => ({ key: `${text}-${i}`, text }));

// The 2026 slate — real film stills as the open-call cast.
const SLATE = ["neon-rain", "golden-core", "aurora-crystal", "crimson-mirage", "paper-lanterns"].map(
  (s) => ({ key: s, src: mediaUrl(`/posters/${s}.jpg`) })
);

// Closing Credits Hero — the homepage's last frame. The credits roll on a black
// stage; an open call to the next slate of creators stands centred in the gold
// spotlight, with one final action. (Submit routing is shared with the main
// hero via useSubmitProject.)
export default function CreatorCallout() {
  const t = useT();
  const submit = useSubmitProject();

  return (
    <section className="relative overflow-hidden border-t border-outline-variant/30 min-h-[660px] md:min-h-[760px] flex items-center">
      {/* ── Cinema stage background ─────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* rolling end credits */}
        <div className="absolute inset-0 flex justify-center">
          <div className="credits-roll absolute top-0 flex flex-col items-center gap-9 md:gap-14">
            {CREDITS_LOOP.map((c) => (
              <span
                key={c.key}
                className="font-headline uppercase tracking-[0.12em] text-[40px] md:text-7xl leading-none whitespace-nowrap text-on-surface/[0.055]"
              >
                {c.text}
              </span>
            ))}
          </div>
        </div>

        {/* breathing gold spotlight from above */}
        <div
          className="absolute left-1/2 -top-[24%] -translate-x-1/2 w-[80%] md:w-[55%] h-[130%] spotlight-breathe"
          style={{ background: "radial-gradient(ellipse 46% 44% at 50% 0%, rgba(212,175,55,0.2), transparent 64%)" }}
        />

        {/* vignette to keep the centre readable + bleed the credits into black */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_62%_at_50%_48%,rgba(8,8,10,0.55),rgba(8,8,10,0.95)_92%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#08080a_0%,transparent_18%,transparent_82%,#08080a_100%)]" />

        {/* film grain */}
        <div
          className="absolute inset-0 mix-blend-overlay opacity-[0.06]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      {/* ── Centred open call ───────────────────────────────────────────── */}
      <div className="relative w-full max-w-[1280px] mx-auto px-6 md:px-12 py-24 text-center">
        <div className="max-w-2xl mx-auto">
          {/* open-call slate badge */}
          <div className="scroll-reveal">
            <p className="font-label text-[12px] uppercase tracking-[0.24em] text-primary">
              {t.homeV2.creatorLabel}
            </p>
            <div className="flex justify-center -space-x-3 mt-5">
              {SLATE.map((a) => (
                <span
                  key={a.key}
                  className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden ring-2 ring-primary/45 ring-offset-2 ring-offset-surface shadow-[0_8px_24px_rgba(0,0,0,0.6)]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.src} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                </span>
              ))}
            </div>
            <p className="font-label text-[12px] uppercase tracking-[0.18em] text-on-surface-variant mt-4">
              {t.homeV2.creatorSlateYear} · {t.homeV2.creatorSlateAccepting}
            </p>
          </div>

          {/* oversized headline */}
          <h2
            className="scroll-reveal font-headline text-[44px] sm:text-6xl md:text-7xl text-on-surface leading-[1.04] mt-9"
            style={{ animationDelay: "100ms" }}
          >
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

          {/* supporting copy */}
          <p
            className="scroll-reveal font-body text-lg text-on-surface-variant leading-relaxed mt-6 max-w-xl mx-auto"
            style={{ animationDelay: "180ms" }}
          >
            {t.homeV2.creatorSub}
          </p>

          {/* final action */}
          <div className="scroll-reveal mt-10" style={{ animationDelay: "260ms" }}>
            <button
              type="button"
              onClick={submit}
              className="group inline-flex items-center justify-center gap-2.5 bg-primary text-on-primary font-label text-label-md uppercase tracking-widest px-8 py-4 rounded-full transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_50px_rgba(212,175,55,0.45)] active:scale-95 shadow-[0_8px_30px_rgba(212,175,55,0.28)]"
            >
              {t.homeV2.creatorSubmitCta}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
