"use client";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Check, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/hooks/useT";

type Side = "marlow" | "wren";

// Feed the border glow: --cursor-angle (which edge to light) and
// --edge-proximity (how close the cursor is to an edge → how bright).
function setBorderGlow(el: HTMLElement, clientX: number, clientY: number) {
  const rect = el.getBoundingClientRect();
  const cx = rect.width / 2;
  const cy = rect.height / 2;
  const dx = clientX - rect.left - cx;
  const dy = clientY - rect.top - cy;
  const kx = dx !== 0 ? cx / Math.abs(dx) : Infinity;
  const ky = dy !== 0 ? cy / Math.abs(dy) : Infinity;
  const edge = Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
  let deg = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
  if (deg < 0) deg += 360;
  el.style.setProperty("--edge-proximity", (edge * 100).toFixed(2));
  el.style.setProperty("--cursor-angle", `${deg.toFixed(2)}deg`);
}

// "Agents negotiate. You stay in control." Marlow represents backers, Wren
// represents creators — they align the terms and prepare a deal summary, but
// the human always gives the final approval. Right: a product deal card that
// flips between the two agents (toggle / card tap), never claiming to close a
// deal on its own.
export default function AgentShowcase() {
  const t = useT();
  const [side, setSide] = useState<Side>("marlow");
  const cardRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const toggle = () => setSide((s) => (s === "marlow" ? "wren" : "marlow"));
  const otherName = side === "marlow" ? "Wren" : "Marlow";

  return (
    <section
      className="relative"
      style={{
        background:
          "radial-gradient(ellipse 55% 50% at 72% 6%, rgba(212,175,55,0.06), transparent 60%), linear-gradient(180deg, #1e1912 0%, #13100b 200px)",
      }}
    >
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-24 md:py-28 grid md:grid-cols-[6fr_5fr] gap-14 md:gap-20 items-center">
        {/* Slogan + CTAs */}
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
          <div className="flex flex-col sm:flex-row gap-4 mt-10">
            <Link
              href="/register"
              className="group inline-flex items-center justify-center gap-2.5 bg-primary text-on-primary font-label text-label-md uppercase tracking-widest px-7 py-4 rounded-full hover:opacity-90 active:scale-95 transition-all shadow-[0_8px_30px_rgba(212,175,55,0.25)]"
            >
              {t.homeV2.agentCtaPrimary}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/how-it-works#agents"
              className="inline-flex items-center justify-center font-label text-label-md uppercase tracking-widest text-on-primary-container border border-primary/55 px-7 py-4 rounded-full hover:bg-primary/10 transition-colors"
            >
              {t.homeV2.agentCta}
            </Link>
          </div>
        </div>

        {/* Agent deal card */}
        <div ref={cardRef} className="w-full max-w-[380px] mx-auto">
          {/* Role toggle */}
          <div className="flex justify-center mb-6">
            <div
              role="group"
              aria-label="Choose agent"
              className="inline-flex items-center gap-1 rounded-full border border-outline-variant/50 bg-surface-container-lowest p-1"
            >
              <ToggleButton active={side === "marlow"} accent="#d4af37" onClick={() => setSide("marlow")}>
                {t.homeV2.agentToggleBackers}
              </ToggleButton>
              <ToggleButton active={side === "wren"} accent="#a8c4e5" onClick={() => setSide("wren")}>
                {t.homeV2.agentToggleCreators}
              </ToggleButton>
            </div>
          </div>

          {/* Flip card */}
          <div
            className={cn(
              "group transition-[transform,opacity] duration-700 ease-out motion-reduce:transition-none",
              inView ? "opacity-100 scale-100" : "opacity-0 scale-95"
            )}
            style={{ perspective: "1600px" }}
          >
            <button
              type="button"
              onClick={toggle}
              onPointerMove={(e) => setBorderGlow(e.currentTarget, e.clientX, e.clientY)}
              aria-label={`${t.homeV2.agentSwitchTo} ${otherName}`}
              style={{ "--glow-color": side === "marlow" ? "#f3d57f" : "#a8c4e5" } as CSSProperties}
              className="border-glow-card block w-full text-left cursor-pointer rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary/60 transition-transform duration-300 group-hover:-translate-y-1.5"
            >
              <span className="border-glow" aria-hidden="true" />
              <div
                className="relative aspect-[3/4] transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none"
                style={{
                  transformStyle: "preserve-3d",
                  transform: side === "wren" ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
              >
                <DealCardFace
                  kind="marlow"
                  name="Marlow"
                  role={t.homeV2.agentBackerRole}
                  duty={t.homeV2.agentDuty}
                  tags={[
                    t.homeV2.agentTagBudget,
                    t.homeV2.agentTagRights,
                    t.homeV2.agentTagMilestones,
                    t.homeV2.agentTagEscrow,
                  ]}
                  dealReady={t.homeV2.agentDealReady}
                  summary={t.homeV2.agentDealSummaryMarlow}
                  awaiting={t.homeV2.agentAwaitingApproval}
                  inView={inView}
                />
                <DealCardFace
                  kind="wren"
                  name="Wren"
                  role={t.homeV2.agentCreatorRole}
                  duty={t.homeV2.agentDuty}
                  tags={[
                    t.homeV2.agentTagBudget,
                    t.homeV2.agentTagRights,
                    t.homeV2.agentTagMilestones,
                    t.homeV2.agentTagEscrow,
                  ]}
                  dealReady={t.homeV2.agentDealReady}
                  summary={t.homeV2.agentDealSummaryWren}
                  awaiting={t.homeV2.agentAwaitingApproval}
                  inView={inView}
                  back
                />
              </div>
            </button>
          </div>

          {/* Switch microcopy */}
          <button
            type="button"
            onClick={toggle}
            className="flex items-center justify-center gap-2 mx-auto font-label text-[12px] uppercase tracking-[0.16em] text-on-surface-variant hover:text-primary transition-colors mt-6"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {t.homeV2.agentSwitchTo} {otherName}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}

function ToggleButton({
  active,
  accent,
  onClick,
  children,
}: {
  active: boolean;
  accent: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "px-4 py-2 rounded-full font-label text-[11px] uppercase tracking-[0.16em] transition-colors",
        active ? "text-on-surface" : "text-on-surface-variant hover:text-on-surface"
      )}
      style={active ? { background: `${accent}26` } : undefined}
    >
      {children}
    </button>
  );
}

// One face of the agent deal card: status badge + monogram, name + role, the
// aligned term tags (revealed in sequence), a ready deal summary, and the
// human-approval status — never "closed", always "awaiting your approval".
function DealCardFace({
  kind,
  name,
  role,
  duty,
  tags,
  dealReady,
  summary,
  awaiting,
  inView,
  back = false,
}: {
  kind: Side;
  name: string;
  role: string;
  duty: string;
  tags: string[];
  dealReady: string;
  summary: string;
  awaiting: string;
  inView: boolean;
  back?: boolean;
}) {
  const gold = kind === "marlow";
  const accent = gold ? "#d4af37" : "#a8c4e5";
  const soft = gold ? "rgba(212,175,55," : "rgba(168,196,229,";

  return (
    <div
      className="absolute inset-0 rounded-2xl border bg-surface-container-lowest p-6 md:p-7 flex flex-col"
      style={{
        borderColor: `${soft}0.35)`,
        backfaceVisibility: "hidden",
        transform: back ? "rotateY(180deg)" : undefined,
        boxShadow: `0 30px 80px rgba(0,0,0,0.5), 0 0 50px ${soft}0.06)`,
      }}
    >
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{ background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${soft}0.1), transparent 70%)` }}
      />

      {/* header — status + monogram */}
      <div className="relative flex items-start justify-between">
        <span
          className="inline-flex items-center gap-2 font-label text-[11px] uppercase tracking-[0.16em] rounded-full border px-2.5 py-1"
          style={{ color: accent, borderColor: `${soft}0.4)` }}
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
        <span
          className="inline-flex items-center justify-center w-11 h-11 rounded-xl border font-headline text-xl"
          style={{ color: accent, borderColor: `${soft}0.4)`, background: `${soft}0.06)` }}
        >
          {gold ? "M" : "W"}
        </span>
      </div>

      {/* name + role */}
      <h3 className="relative font-headline text-3xl md:text-4xl text-on-surface mt-5">{name}</h3>
      <p className="relative font-label text-[12px] uppercase tracking-[0.2em] mt-1.5" style={{ color: accent }}>
        {role}
      </p>

      {/* aligned term tags — appear in sequence */}
      <div className="relative flex flex-wrap gap-2 mt-5">
        {tags.map((tag, i) => (
          <span
            key={tag}
            className={cn(
              "font-label text-[11px] uppercase tracking-[0.13em] text-on-surface-variant border rounded-full px-3 py-1 transition-all duration-500 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0",
              inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1.5"
            )}
            style={{ borderColor: `${soft}0.3)`, transitionDelay: inView ? `${320 + i * 100}ms` : "0ms" }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* deal summary — ready, pending approval */}
      <div className="relative mt-auto pt-5">
        <div className="rounded-lg border p-4" style={{ borderColor: `${soft}0.25)`, background: `${soft}0.04)` }}>
          <p
            className="flex items-center gap-2 font-label text-[12px] uppercase tracking-[0.16em]"
            style={{ color: accent }}
          >
            <Check className="w-3.5 h-3.5" />
            {dealReady}
          </p>
          <p className="font-body text-sm text-on-surface-variant leading-relaxed mt-2">{summary}</p>
        </div>
        <p className="flex items-center gap-2 font-label text-[12px] uppercase tracking-[0.16em] text-on-surface-variant mt-3">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
          {awaiting}
        </p>
      </div>
    </div>
  );
}
