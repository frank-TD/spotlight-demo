"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Repeat2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/hooks/useT";

// "Your agent closes the deal — while you sleep." Left: slogan + CTA into the
// full negotiation demo on /how-it-works. Right: a tarot-style agent portrait
// that flips on click between Marlow (gold, backer's agent) and Wren (blue,
// creator's agent) — one card, both sides of the deal.
export default function AgentShowcase() {
  const t = useT();
  const [side, setSide] = useState<"marlow" | "wren">("marlow");

  return (
    <section className="border-t border-outline-variant/30">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-24 md:py-28 grid md:grid-cols-[6fr_5fr] gap-14 md:gap-20 items-center">
        {/* Slogan + CTA */}
        <div className="scroll-reveal">
          <h2 className="font-headline text-5xl md:text-7xl text-on-surface leading-[1.05]">
            {t.homeV2.agentTitle1}
            <br />
            <span
              className="italic"
              style={{
                background: "linear-gradient(135deg, #d4af37 0%, #f3d57f 60%, #d4af37 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {t.homeV2.agentTitle2}
            </span>
          </h2>
          <p className="font-body text-lg text-on-surface-variant leading-relaxed mt-7 max-w-md">
            {t.homeV2.agentSub}
          </p>
          <Link
            href="/how-it-works#agents"
            className="group inline-flex items-center gap-2.5 font-label text-label-md uppercase tracking-widest text-on-primary-container border border-primary/60 px-7 py-4 rounded-full hover:bg-primary/10 transition-colors mt-10"
          >
            {t.homeV2.agentCta}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Flip-card portrait */}
        <div className="scroll-reveal" style={{ animationDelay: "120ms" }}>
          <button
            type="button"
            onClick={() => setSide(side === "marlow" ? "wren" : "marlow")}
            aria-label={t.homeV2.agentHint}
            className="block w-full max-w-[380px] mx-auto cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-2xl"
            style={{ perspective: "1400px" }}
          >
            <div
              className="relative aspect-[3/4] transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
              style={{
                transformStyle: "preserve-3d",
                transform: side === "wren" ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              <AgentFace
                kind="marlow"
                name={t.landing.dealCardMarlow}
                role={t.landing.dealCardMarlowRole}
                quote={t.landing.agentIntroMarlowQuote}
                duty={t.homeV2.agentDuty}
              />
              <AgentFace
                kind="wren"
                name={t.landing.dealCardWren}
                role={t.landing.dealCardWrenRole}
                quote={t.landing.agentIntroWrenQuote}
                duty={t.homeV2.agentDuty}
                back
              />
            </div>
          </button>
          <p className="flex items-center justify-center gap-2 font-label text-[12px] uppercase tracking-[0.18em] text-on-surface-variant mt-6">
            <Repeat2 className="w-3.5 h-3.5" />
            {t.homeV2.agentHint}
          </p>
        </div>
      </div>
    </section>
  );
}

// One face of the card: deco arc backdrop, giant serif monogram, geometric
// steward bust in the agent's accent colour, name plate + signature line.
function AgentFace({
  kind,
  name,
  role,
  quote,
  duty,
  back = false,
}: {
  kind: "marlow" | "wren";
  name: string;
  role: string;
  quote: string;
  duty: string;
  back?: boolean;
}) {
  const gold = kind === "marlow";
  const accent = gold ? "#d4af37" : "#a8c4e5";
  const accentSoft = gold ? "rgba(212,175,55," : "rgba(168,196,229,";

  return (
    <div
      className="absolute inset-0 rounded-2xl overflow-hidden border bg-surface-container-lowest"
      style={{
        borderColor: `${accentSoft}0.35)`,
        backfaceVisibility: "hidden",
        transform: back ? "rotateY(180deg)" : undefined,
        boxShadow: `0 30px 80px rgba(0,0,0,0.5), 0 0 60px ${accentSoft}0.07)`,
      }}
    >
      {/* glow + giant monogram backdrop */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 75% 55% at 50% 30%, ${accentSoft}0.13), transparent 75%)`,
        }}
      />
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-[4%] -translate-x-1/2 font-headline italic select-none pointer-events-none"
        style={{ fontSize: "190px", lineHeight: 1, color: `${accentSoft}0.10)` }}
      >
        {gold ? "M" : "W"}
      </span>

      {/* duty chip */}
      <span
        className="absolute top-4 left-4 inline-flex items-center gap-2 font-label text-[12px] uppercase tracking-[0.18em] rounded-full border px-3 py-1.5"
        style={{ color: accent, borderColor: `${accentSoft}0.4)` }}
      >
        <span className="relative inline-flex w-1.5 h-1.5">
          <span
            className="absolute inline-flex w-full h-full rounded-full opacity-50 animate-ping"
            style={{ background: accent }}
          />
          <span className="relative inline-flex w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
        </span>
        {duty}
      </span>

      {/* steward bust */}
      <svg
        viewBox="0 0 200 200"
        aria-hidden="true"
        className="absolute left-1/2 top-[16%] -translate-x-1/2 w-[62%]"
      >
        {/* deco arcs behind the head */}
        <circle cx="100" cy="74" r="56" fill="none" stroke={accent} strokeOpacity="0.18" />
        <circle cx="100" cy="74" r="72" fill="none" stroke={accent} strokeOpacity="0.10" />
        <circle cx="100" cy="74" r="88" fill="none" stroke={accent} strokeOpacity="0.05" />
        {/* bust silhouette */}
        <path
          d="M30 186 Q36 132 80 118 L84 104 A30 30 0 1 1 116 104 L120 118 Q164 132 170 186 Z"
          fill="#101014"
          stroke={accent}
          strokeOpacity="0.5"
          strokeWidth="1.6"
        />
        {/* shirt + lapels */}
        <path d="M88 118 L100 142 L112 118 Z" fill="#e8e8ee" fillOpacity="0.88" />
        <path d="M88 118 L100 142 L78 132 Z" fill={accent} fillOpacity="0.28" />
        <path d="M112 118 L100 142 L122 132 Z" fill={accent} fillOpacity="0.28" />
        {/* bow tie */}
        <path d="M100 124 L86 117 L86 131 Z" fill={accent} />
        <path d="M100 124 L114 117 L114 131 Z" fill={accent} />
        <circle cx="100" cy="124" r="2.6" fill={accent} />
        {/* pocket square */}
        <path d="M128 156 L138 156 L133 147 Z" fill={accent} fillOpacity="0.8" />
      </svg>

      {/* name plate */}
      <div className="absolute inset-x-0 bottom-0 px-7 pb-7 text-center">
        <p className="font-headline text-3xl text-on-surface">{name}</p>
        <p
          className="font-label text-[12px] uppercase tracking-[0.2em] mt-1.5"
          style={{ color: accent }}
        >
          {role}
        </p>
        <div className="mx-auto w-10 h-px my-4" style={{ background: `${accentSoft}0.45)` }} />
        <p className="font-headline italic text-sm text-on-surface-variant leading-relaxed line-clamp-2">
          “{quote}”
        </p>
      </div>
    </div>
  );
}
