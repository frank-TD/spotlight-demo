"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, Check } from "lucide-react";
import SectionLabel from "./SectionLabel";
import { useT } from "@/hooks/useT";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

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
              <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mt-0.5 truncate">
                {t.landing.dealSessionMeta}
              </p>
            </div>
          </header>

          {/* Bubbles area */}
          <div className="px-5 py-6 space-y-5 min-h-[420px]">
            {bubbles.map((b, i) => (
              <Bubble key={i} role={b.who} label={b.role} text={b.text} visible={i < revealed} />
            ))}
            {revealed < bubbles.length && (
              <div className="flex items-center gap-2 text-on-surface-variant/60 pl-12">
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
            <p className="font-label text-[11px] uppercase tracking-[0.2em] text-primary inline-flex items-center gap-2">
              <Check className="w-3.5 h-3.5" /> {t.landing.dealAgreed}
            </p>
            <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
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
            className="group inline-flex items-center gap-2 font-label text-[11px] uppercase tracking-[0.24em] text-primary border border-primary/40 px-5 py-3 rounded-full hover:bg-primary/10 transition-colors"
          >
            {t.landing.dealCta}{" "}
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <AgentCard
              initial="M"
              name={t.landing.dealCardMarlow}
              role={t.landing.dealCardMarlowRole}
              accent="gold"
            />
            <AgentCard
              initial="W"
              name={t.landing.dealCardWren}
              role={t.landing.dealCardWrenRole}
              accent="blue"
            />
          </div>
        </div>
      </div>
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
            "font-label text-[9px] uppercase tracking-[0.22em]",
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
}: {
  initial: string;
  name: string;
  role: string;
  accent: "gold" | "blue";
}) {
  return (
    <div
      className={cn(
        "rounded-2xl p-5 border bg-surface-container-lowest",
        accent === "gold" ? "border-primary/30" : "border-secondary/30"
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
      <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mt-1.5">
        {role}
      </p>
    </div>
  );
}
