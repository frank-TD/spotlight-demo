import { useT } from "@/hooks/useT";

// 5 placeholder studio logos as monogram badges. Names mirror the netlify
// sample (Pegasus / Dramawave / Mandarin etc.) — easy to swap for real assets.
const STUDIOS = [
  { name: "Pegasus", style: "tracking-[0.25em] text-on-surface-variant" },
  { name: "Dramawave", style: "tracking-[0.18em] text-on-surface-variant italic" },
  { name: "Mandarin", style: "tracking-[0.2em] text-on-surface-variant/80 font-bold" },
  { name: "RedSky Drama", style: "tracking-[0.18em] text-on-surface-variant" },
  { name: "NeoFrame", style: "tracking-[0.22em] text-on-surface-variant" },
];

export default function TrustLogosSection() {
  const t = useT();
  return (
    <section className="py-14 md:py-16 border-y border-outline-variant/30">
      <p className="font-label text-[12px] uppercase tracking-[0.2em] text-on-surface-variant text-center mb-10">
        {t.landing.trustHeading}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-12 md:gap-x-20 gap-y-6">
        {STUDIOS.map((s) => (
          <span
            key={s.name}
            className={`font-label text-[13px] uppercase ${s.style} opacity-70 hover:opacity-100 transition-opacity`}
          >
            {s.name}
          </span>
        ))}
      </div>
    </section>
  );
}
