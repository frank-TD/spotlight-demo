"use client";
import { ShieldCheck, Bot, Sparkles, ListChecks, KeyRound, Plug } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import SectionLabel from "./SectionLabel";
import { useT } from "@/hooks/useT";
import { cn } from "@/lib/utils";

// Platform-capabilities grid — six cards, each a capability + one-line
// second-person benefit, with optional New / Coming soon badges. Modelled on
// Fanvue's "Features" grid. Reuses the hairline-divider card treatment from
// HowItWorks and the icon chip styling for visual continuity.

type Badge = "new" | "soon" | null;

export default function CapabilitiesGrid() {
  const t = useT();
  const c = t.landing;
  const caps: { icon: LucideIcon; title: string; body: string; badge: Badge }[] = [
    { icon: ShieldCheck, title: c.capEscrowTitle, body: c.capEscrowBody, badge: null },
    { icon: Bot, title: c.capAgentsTitle, body: c.capAgentsBody, badge: null },
    { icon: Sparkles, title: c.capStudioTitle, body: c.capStudioBody, badge: "new" },
    { icon: ListChecks, title: c.capMilestoneTitle, body: c.capMilestoneBody, badge: null },
    { icon: KeyRound, title: c.capIpTitle, body: c.capIpBody, badge: null },
    { icon: Plug, title: c.capApiTitle, body: c.capApiBody, badge: "soon" },
  ];

  return (
    <section className="py-24 md:py-32">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <div className="scroll-reveal flex justify-center">
          <SectionLabel>{c.capLabel}</SectionLabel>
        </div>
        <h2
          className="scroll-reveal font-headline text-4xl md:text-5xl text-on-surface leading-tight mt-5"
          style={{ animationDelay: "90ms" }}
        >
          {c.capTitle}
        </h2>
        <p
          className="scroll-reveal font-body text-on-surface-variant mt-4"
          style={{ animationDelay: "160ms" }}
        >
          {c.capSub}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-outline-variant/30 border border-outline-variant/30 rounded-2xl overflow-hidden">
        {caps.map(({ icon: Icon, title, body, badge }, i) => (
          <div
            key={title}
            className="scroll-reveal relative bg-surface-container-lowest p-8 md:p-10"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {badge && (
              <span
                className={cn(
                  "absolute top-5 right-5 font-label text-[12px] uppercase tracking-[0.18em] px-2.5 py-1 rounded-full",
                  badge === "new"
                    ? "bg-primary text-on-primary"
                    : "border border-outline text-on-surface-variant"
                )}
              >
                {badge === "new" ? c.capBadgeNew : c.capBadgeSoon}
              </span>
            )}
            <div className="w-12 h-12 rounded-xl bg-primary-container text-primary flex items-center justify-center mb-6">
              <Icon className="w-5 h-5" />
            </div>
            <h3 className="font-headline text-xl md:text-2xl text-on-surface leading-tight mb-3">
              {title}
            </h3>
            <p className="font-body text-sm text-on-surface-variant leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
