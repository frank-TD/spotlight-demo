"use client";
import { cn } from "@/lib/utils";
import { useT } from "@/hooks/useT";

// Release-slate mock card: the distribution story told as a film-industry
// artifact (slate rows + an AI agent "scheduling" pulse) instead of a generic
// network graphic. Shared by the homepage section and /distribution.
export default function ReleaseSlateCard() {
  const t = useT();
  const rows = [
    { film: "Neon Rain", plat: t.homeV2.slateRow1Plat, when: t.homeV2.slateRow1When, tone: "gold" },
    { film: "Golden Core", plat: t.homeV2.slateRow2Plat, when: t.homeV2.slateRow2When, tone: "dim" },
    { film: "Aurora Crystal", plat: t.homeV2.slateRow3Plat, when: t.homeV2.slateRow3When, tone: "live" },
  ] as const;

  return (
    <div className="border border-outline-variant rounded-xl bg-surface-container-low p-6 md:p-8 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
      <div className="flex items-center justify-between pb-5">
        <span className="font-label text-[12px] uppercase tracking-[0.3em] text-on-surface-variant/70">
          {t.homeV2.slateLabel}
        </span>
        <span className="inline-flex items-center gap-2 font-label text-[11px] uppercase tracking-[0.24em] text-primary">
          <span className="relative inline-flex w-1.5 h-1.5">
            <span className="absolute inline-flex w-full h-full rounded-full bg-primary opacity-50 animate-ping" />
            <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-primary" />
          </span>
          {t.homeV2.slateAgent}
        </span>
      </div>
      {rows.map((r) => (
        <div
          key={r.film}
          className="grid grid-cols-[1fr_auto] md:grid-cols-[1.1fr_1.6fr_auto] gap-x-4 gap-y-1.5 items-center py-5 border-t border-outline-variant/60"
        >
          <span className="font-headline text-xl md:text-2xl text-on-surface">{r.film}</span>
          <span className="font-label text-[10.5px] uppercase tracking-[0.22em] text-on-surface-variant/70 col-span-2 md:col-span-1 row-start-2 md:row-start-auto">
            {r.plat}
          </span>
          <span
            className={cn(
              "font-label text-[11.5px] uppercase tracking-[0.18em] border rounded-full px-3.5 py-1.5 justify-self-end",
              r.tone === "gold" && "text-on-primary-container border-primary/45",
              r.tone === "live" && "text-tertiary border-tertiary/45",
              r.tone === "dim" && "text-on-surface-variant border-outline-variant"
            )}
          >
            {r.when}
          </span>
        </div>
      ))}
      <div className="pt-5 border-t border-outline-variant/60 text-center font-label text-[10px] uppercase tracking-[0.3em] text-on-surface-variant/60">
        {t.homeV2.slateFoot}
      </div>
    </div>
  );
}
