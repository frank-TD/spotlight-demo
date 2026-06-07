"use client";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { useT } from "@/hooks/useT";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";

// Full-bleed cinematic hero. Photography is faked with a layered radial mesh
// (the existing bg-mesh utility, redefined for dark mode in Phase A) plus a
// subtle gold/blue glow so we don't depend on a licensed stock image.
export default function HeroSection() {
  const t = useT();
  const router = useRouter();
  const isLoggedIn = useStore((s) => s.isLoggedIn);
  const onboardingComplete = useStore((s) => s.onboardingComplete);

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
    <section className="relative bg-mesh -mx-6 md:-mx-12 px-6 md:px-12 pt-20 md:pt-28 pb-24 md:pb-32 overflow-hidden">
      {/* Decorative ambient glows — anchored top-left and bottom-right corners */}
      <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-primary/10 blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-32 w-[520px] h-[520px] rounded-full bg-secondary/10 blur-[160px] pointer-events-none" />

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
            onClick={post}
            className="group inline-flex items-center gap-2.5 bg-primary text-on-primary font-label text-label-md uppercase tracking-widest px-7 py-4 rounded-full hover:opacity-90 active:scale-95 transition-all shadow-[0_8px_30px_rgba(212,175,55,0.25)]"
          >
            {t.landing.heroCtaPrimary}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
          <button
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
          <Stat value={t.landing.heroStatCommissioned} label={t.landing.heroStatCommissionedLabel} />
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
      <span className="font-headline text-2xl md:text-3xl text-primary">{value}</span>
      <span className="font-label text-[10px] uppercase tracking-[0.28em] text-on-surface-variant mt-1.5">{label}</span>
    </div>
  );
}
