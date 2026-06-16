"use client";
import { useState } from "react";
import Link from "next/link";
import { Plus, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/hooks/useT";

// Closing FAQ — the homepage's bold sign-off. A giant outlined "FAQ" anchors
// the left column (sticky), with a right-aligned accordion of the questions
// first-time visitors actually ask. Reuses the existing landing FAQ copy.
export default function ClosingFaq() {
  const t = useT();
  const items = [
    { q: t.landing.faqQ1, a: t.landing.faqA1 },
    { q: t.landing.faqQ2, a: t.landing.faqA2 },
    { q: t.landing.faqQ3, a: t.landing.faqA3 },
    { q: t.landing.faqQ4, a: t.landing.faqA4 },
    { q: t.landing.faqQ6, a: t.landing.faqA6 },
  ];
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-[#1e1912] border-t border-outline-variant/20">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-24 md:py-32 grid md:grid-cols-[5fr_7fr] gap-12 md:gap-16">
        {/* Left — oversized anchor */}
        <div className="scroll-reveal md:sticky md:top-28 self-start">
          <h2
            className="font-label leading-[0.8] text-transparent select-none text-[120px] md:text-[200px]"
            style={{ WebkitTextStroke: "1.5px rgba(212,175,55,0.55)" }}
            aria-hidden="true"
          >
            FAQ
          </h2>
          <p className="font-headline text-2xl md:text-3xl text-on-surface leading-tight mt-6 max-w-xs">
            {t.landing.faqTitle1} {t.landing.faqTitle2}
          </p>
          <Link
            href="/how-it-works"
            className="group inline-flex items-center gap-2 font-label text-[12px] uppercase tracking-[0.18em] text-on-surface-variant hover:text-primary transition-colors mt-7"
          >
            {t.homeV2.stepsDetail}
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Right — accordion */}
        <div className="scroll-reveal" style={{ animationDelay: "100ms" }}>
          {items.map((item, i) => (
            <AccordionRow
              key={item.q}
              q={item.q}
              a={item.a}
              open={open === i}
              onToggle={() => setOpen(open === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function AccordionRow({
  q,
  a,
  open,
  onToggle,
}: {
  q: string;
  a: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-t border-outline-variant/40 last:border-b">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="group w-full flex items-center justify-between gap-6 py-6 md:py-7 text-left"
      >
        <span
          className={cn(
            "font-headline text-xl md:text-[28px] leading-snug transition-colors",
            open ? "text-primary" : "text-on-surface group-hover:text-primary"
          )}
        >
          {q}
        </span>
        <span
          className={cn(
            "shrink-0 inline-flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full border transition-all duration-300",
            open
              ? "border-primary text-primary rotate-45"
              : "border-outline-variant text-on-surface-variant group-hover:border-primary/60 group-hover:text-primary"
          )}
        >
          <Plus className="w-4 h-4" />
        </span>
      </button>
      {/* 0fr → 1fr gives a smooth height transition without measuring. */}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <p className="font-body text-on-surface-variant leading-relaxed pb-7 max-w-2xl">{a}</p>
        </div>
      </div>
    </div>
  );
}
