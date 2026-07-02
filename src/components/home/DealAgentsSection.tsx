"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, Check, Quote } from "lucide-react";
import SectionLabel from "./SectionLabel";
import BorderGlow from "./BorderGlow";
import { useT } from "@/hooks/useT";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type AgentKind = "marlow" | "wren";

// The headline moat moment from the design review. The 4-turn negotiation
// auto-types itself as soon as the user scrolls it into view; once the deal
// is "agreed" we drop the gold summary banner. Replays on each visit.
export default function DealAgentsSection() {
  const t = useT();
  const router = useRouter();
  const isLoggedIn = useStore((s) => s.isLoggedIn);
  const onboardingComplete = useStore((s) => s.onboardingComplete);
  const sectionRef = useRef<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState(0);
  const [openAgent, setOpenAgent] = useState<AgentKind | null>(null);

  // The BorderGlow treatment is desktop + motion only; phones (no hover) and
  // reduced-motion users get the plain card so the click just opens the dialog.
  const [enhanced, setEnhanced] = useState(false);
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 768px)");
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const decide = () => setEnhanced(wide.matches && !rm.matches);
    decide();
    wide.addEventListener("change", decide);
    rm.addEventListener("change", decide);
    return () => {
      wide.removeEventListener("change", decide);
      rm.removeEventListener("change", decide);
    };
  }, []);

  // "See how it works" CTA. Anonymous users go through register → onboarding;
  // signed-in users land in their messages (where the live agent threads are).
  const handleCta = () => {
    if (!isLoggedIn) {
      toast.info(t.landing.signupToastBrief);
      router.push("/register");
      return;
    }
    if (!onboardingComplete) {
      router.push("/onboarding/role");
      return;
    }
    router.push("/messages");
  };

  const bubbles = [
    { who: "marlow" as const, role: t.landing.dealRoleMarlow, text: t.landing.dealMsg1 },
    { who: "wren" as const, role: t.landing.dealRoleWren, text: t.landing.dealMsg2 },
    { who: "marlow" as const, role: t.landing.dealRoleMarlow, text: t.landing.dealMsg3 },
    { who: "wren" as const, role: t.landing.dealRoleWren, text: t.landing.dealMsg4 },
  ];

  // Use IntersectionObserver so we don't fire until the panel is on-screen,
  // then stagger the bubbles ~1.1s apart for a readable beat.
  useEffect(() => {
    if (!sectionRef.current) return;
    const el = sectionRef.current;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        obs.disconnect();
        bubbles.forEach((_, idx) => {
          setTimeout(() => setRevealed((r) => Math.max(r, idx + 1)), 500 + idx * 1100);
        });
      },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dealDone = revealed >= bubbles.length;

  return (
    <section ref={sectionRef} className="py-24 md:py-32">
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-center">
        {/* Left — chat panel mockup */}
        <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
          {/* Window chrome — three traffic-light dots, session title */}
          <header className="flex items-center gap-4 px-5 py-4 border-b border-outline-variant/40 bg-surface-container/60">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
            </div>
            <div className="min-w-0">
              <p className="font-body text-sm text-on-surface truncate">{t.landing.dealSession}</p>
              <p className="font-label text-[12px] uppercase tracking-[0.2em] text-on-surface-variant mt-0.5 truncate">
                {t.landing.dealSessionMeta}
              </p>
            </div>
          </header>

          {/* Bubbles area */}
          <div className="px-5 py-6 space-y-5 min-h-[420px]">
            {bubbles.map((b, i) => (
              <Bubble
                key={b.text}
                role={b.who}
                label={b.role}
                text={b.text}
                visible={i < revealed}
              />
            ))}
            {revealed < bubbles.length && (
              <div className="flex items-center gap-2 text-on-surface-variant pl-12">
                <span className="typing-dot" />
                <span className="typing-dot" style={{ animationDelay: "0.15s" }} />
                <span className="typing-dot" style={{ animationDelay: "0.3s" }} />
              </div>
            )}
          </div>

          {/* Deal agreed banner */}
          <footer
            className={cn(
              "border-t border-primary/30 px-5 py-4 flex flex-wrap items-center justify-between gap-3 transition-all duration-500",
              dealDone ? "bg-primary/10 opacity-100" : "opacity-40"
            )}
          >
            <p className="font-label text-[12px] uppercase tracking-[0.2em] text-primary inline-flex items-center gap-2">
              <Check className="w-3.5 h-3.5" /> {t.landing.dealAgreed}
            </p>
            <p className="font-label text-[12px] uppercase tracking-[0.2em] text-on-surface-variant">
              {t.landing.dealAgreedMeta}
            </p>
          </footer>
        </div>

        {/* Right — copy + agent cards */}
        <div className="space-y-7">
          <SectionLabel>{t.landing.dealLabel}</SectionLabel>
          <h2 className="font-headline text-4xl md:text-5xl text-on-surface leading-[1.1]">
            {t.landing.dealTitle1}
            <br />
            <span className="italic text-primary">{t.landing.dealTitle2}</span>
          </h2>
          <p className="font-body text-on-surface-variant leading-relaxed max-w-xl">
            {t.landing.dealBody}
          </p>
          <button
            type="button"
            onClick={handleCta}
            className="group inline-flex items-center gap-2 font-label text-[12px] uppercase tracking-[0.18em] text-primary border border-primary/40 px-5 py-3 rounded-full hover:bg-primary/10 transition-colors"
          >
            {t.landing.dealCta}{" "}
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>

          <div className="grid grid-cols-2 gap-4 pt-4">
            {(() => {
              const Comp = enhanced ? GlowAgentCard : AgentCard;
              return (
                <>
                  <Comp
                    initial="M"
                    name={t.landing.dealCardMarlow}
                    role={t.landing.dealCardMarlowRole}
                    accent="gold"
                    onOpen={() => setOpenAgent("marlow")}
                  />
                  <Comp
                    initial="W"
                    name={t.landing.dealCardWren}
                    role={t.landing.dealCardWrenRole}
                    accent="blue"
                    onOpen={() => setOpenAgent("wren")}
                  />
                </>
              );
            })()}
          </div>
        </div>
      </div>
      <AgentIntroDialog
        agent={openAgent}
        onOpenChange={(o) => !o && setOpenAgent(null)}
        onCta={handleCta}
      />
    </section>
  );
}

function Bubble({
  role,
  label,
  text,
  visible,
}: {
  role: "marlow" | "wren";
  label: string;
  text: string;
  visible: boolean;
}) {
  const isMarlow = role === "marlow";
  return (
    <div
      className={cn(
        "flex items-end gap-3 transition-all duration-500",
        isMarlow ? "" : "flex-row-reverse",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
    >
      <div
        className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border",
          isMarlow
            ? "border-primary/50 bg-primary/15 text-primary"
            : "border-secondary/50 bg-secondary/15 text-secondary"
        )}
      >
        {isMarlow ? "M" : "W"}
      </div>
      <div className={cn("max-w-[78%] space-y-1.5", isMarlow ? "" : "items-end flex flex-col")}>
        <p
          className={cn(
            "font-label text-[12px] uppercase tracking-[0.22em]",
            isMarlow ? "text-primary" : "text-secondary"
          )}
        >
          {label}
        </p>
        <p
          className={cn(
            "font-body text-sm leading-relaxed rounded-2xl px-4 py-3",
            isMarlow
              ? "bg-surface-container border border-outline-variant/40 text-on-surface"
              : "bg-secondary-container border border-secondary/30 text-on-secondary-container"
          )}
        >
          {text}
        </p>
      </div>
    </div>
  );
}

function AgentCard({
  initial,
  name,
  role,
  accent,
  onOpen,
}: {
  initial: string;
  name: string;
  role: string;
  accent: "gold" | "blue";
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`${name} — ${role}`}
      className={cn(
        "rounded-2xl p-5 border bg-surface-container-lowest text-left transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2",
        accent === "gold"
          ? "border-primary/30 hover:border-primary/60 hover:shadow-[0_12px_40px_rgba(198,255,52,0.18)] focus-visible:ring-primary"
          : "border-secondary/30 hover:border-secondary/60 hover:shadow-[0_12px_40px_rgba(168,196,229,0.18)] focus-visible:ring-secondary"
      )}
    >
      <div
        className={cn(
          "w-11 h-11 rounded-full flex items-center justify-center font-bold mb-4 border",
          accent === "gold"
            ? "border-primary/50 bg-primary/15 text-primary"
            : "border-secondary/50 bg-secondary/15 text-secondary"
        )}
      >
        {initial}
      </div>
      <p className="font-headline text-xl text-on-surface">{name}</p>
      <p className="font-label text-[12px] uppercase tracking-[0.2em] text-on-surface-variant mt-1.5">
        {role}
      </p>
    </button>
  );
}

// Enhanced agent card: BorderGlow border/edge-glow follows the cursor, and a
// click fires the sweep as feedback before the intro dialog opens. Colour is
// tuned per agent (Marlow gold, Wren slate-blue).
function GlowAgentCard({
  initial,
  name,
  role,
  accent,
  onOpen,
}: {
  initial: string;
  name: string;
  role: string;
  accent: "gold" | "blue";
  onOpen: () => void;
}) {
  const [sweep, setSweep] = useState(0);
  const isGold = accent === "gold";
  const glow = isGold
    ? { glowColor: "198 255 52", colors: ["#c6ff34", "#d8ff95", "#2f4712"] }
    : { glowColor: "211 55 78", colors: ["#a8c4e5", "#c5d6e8", "#1c2a3a"] };

  const handleClick = () => {
    setSweep((s) => s + 1);
    // Let the sweep register as click feedback before the modal covers the card.
    window.setTimeout(onOpen, 420);
  };

  return (
    <BorderGlow
      sweep={sweep}
      glowColor={glow.glowColor}
      colors={glow.colors}
      backgroundColor="#0c0c0e"
      borderRadius={24}
      glowRadius={32}
      glowIntensity={isGold ? 1 : 0.95}
      className="h-full"
    >
      <button
        type="button"
        onClick={handleClick}
        aria-label={`${name} — ${role}`}
        className="w-full text-left p-5 rounded-[24px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
      >
        <div
          className={cn(
            "w-11 h-11 rounded-full flex items-center justify-center font-bold mb-4 border",
            isGold
              ? "border-primary/50 bg-primary/15 text-primary"
              : "border-secondary/50 bg-secondary/15 text-secondary"
          )}
        >
          {initial}
        </div>
        <p className="font-headline text-xl text-on-surface">{name}</p>
        <p className="font-label text-[12px] uppercase tracking-[0.2em] text-on-surface-variant mt-1.5">
          {role}
        </p>
      </button>
    </BorderGlow>
  );
}

function AgentIntroDialog({
  agent,
  onOpenChange,
  onCta,
}: {
  agent: AgentKind | null;
  onOpenChange: (open: boolean) => void;
  onCta: () => void;
}) {
  const t = useT();
  // Pull both agents' content so the dialog content swaps without remounting.
  const data =
    agent === "marlow"
      ? {
          initial: "M",
          accent: "gold" as const,
          name: t.landing.dealCardMarlow,
          role: t.landing.dealCardMarlowRole,
          tagline: t.landing.agentIntroMarlowTagline,
          caps: [
            t.landing.agentIntroMarlowCap1,
            t.landing.agentIntroMarlowCap2,
            t.landing.agentIntroMarlowCap3,
            t.landing.agentIntroMarlowCap4,
          ],
          quoteLabel: t.landing.agentIntroMarlowQuoteLabel,
          quote: t.landing.agentIntroMarlowQuote,
        }
      : agent === "wren"
        ? {
            initial: "W",
            accent: "blue" as const,
            name: t.landing.dealCardWren,
            role: t.landing.dealCardWrenRole,
            tagline: t.landing.agentIntroWrenTagline,
            caps: [
              t.landing.agentIntroWrenCap1,
              t.landing.agentIntroWrenCap2,
              t.landing.agentIntroWrenCap3,
              t.landing.agentIntroWrenCap4,
            ],
            quoteLabel: t.landing.agentIntroWrenQuoteLabel,
            quote: t.landing.agentIntroWrenQuote,
          }
        : null;

  return (
    <Dialog open={!!agent} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        {data && (
          <div className="p-7 md:p-8">
            <DialogTitle className="sr-only">{data.name}</DialogTitle>
            <div className="flex items-center gap-4 mb-5">
              <div
                className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg border shrink-0",
                  data.accent === "gold"
                    ? "border-primary/50 bg-primary/15 text-primary"
                    : "border-secondary/50 bg-secondary/15 text-secondary"
                )}
              >
                {data.initial}
              </div>
              <div className="min-w-0">
                <p className="font-headline text-2xl text-on-surface">{data.name}</p>
                <p className="font-label text-[12px] uppercase tracking-[0.22em] text-on-surface-variant mt-1">
                  {data.role}
                </p>
              </div>
            </div>

            <p className="font-body text-sm md:text-base text-on-surface leading-relaxed mb-6">
              {data.tagline}
            </p>

            <ul className="space-y-2.5 mb-6">
              {data.caps.map((cap) => (
                <li key={cap} className="flex items-start gap-2.5">
                  <Check
                    className={cn(
                      "w-3.5 h-3.5 mt-1 shrink-0",
                      data.accent === "gold" ? "text-primary" : "text-secondary"
                    )}
                  />
                  <span className="font-body text-sm text-on-surface-variant leading-relaxed">
                    {cap}
                  </span>
                </li>
              ))}
            </ul>

            <div
              className={cn(
                "rounded-xl p-4 mb-6 border",
                data.accent === "gold"
                  ? "border-primary/20 bg-primary/[0.04]"
                  : "border-secondary/20 bg-secondary/[0.04]"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <Quote
                  className={cn(
                    "w-3 h-3",
                    data.accent === "gold" ? "text-primary" : "text-secondary"
                  )}
                />
                <span className="font-label text-[12px] uppercase tracking-[0.18em] text-on-surface-variant">
                  {data.quoteLabel}
                </span>
              </div>
              <p className="font-body text-sm text-on-surface leading-relaxed">
                &ldquo;{data.quote}&rdquo;
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onCta();
              }}
              className="group w-full inline-flex items-center justify-center gap-2 bg-primary text-on-primary font-label text-label-md uppercase tracking-wider py-3 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all"
            >
              {t.landing.agentIntroCta}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
