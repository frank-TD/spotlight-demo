"use client";
import { useT } from "@/hooks/useT";
import { useSubmitProject } from "@/hooks/useSubmitProject";

// Full-width cinematic band for the secondary audience (filmmakers). One
// focus, one button — the only place besides the hero that pitches "Submit".
export default function CreatorCallout() {
  const t = useT();
  const submit = useSubmitProject();

  return (
    <section className="relative overflow-hidden h-[480px] md:h-[560px] flex items-center justify-center">
      <img
        src="https://picsum.photos/seed/goldencore/1920/820"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover opacity-70"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_50%_50%,rgba(8,8,10,0.35),rgba(8,8,10,0.92)_92%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(212,175,55,0.08),transparent_45%)] pointer-events-none" />

      <div className="scroll-reveal relative text-center px-6">
        <p className="font-label text-[12px] uppercase tracking-[0.34em] text-primary">
          {t.homeV2.creatorLabel}
        </p>
        <h2 className="font-headline text-4xl md:text-6xl text-on-surface mt-5">
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
        <p className="font-body text-on-surface-variant mt-4">{t.homeV2.creatorSub}</p>
        <button
          type="button"
          onClick={submit}
          className="inline-flex items-center gap-2 font-label text-label-md uppercase tracking-widest text-on-surface px-7 py-4 rounded-full border border-on-surface/40 hover:bg-on-surface/5 hover:border-on-surface transition-colors mt-10"
        >
          {t.homeV2.ctaSecondary}
        </button>
      </div>
    </section>
  );
}
