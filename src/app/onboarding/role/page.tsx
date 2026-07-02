"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Camera, Megaphone, Check } from "lucide-react";
import { useStore } from "@/lib/store";
import { useT } from "@/hooks/useT";
import SectionLabel from "@/components/home/SectionLabel";
import { cn } from "@/lib/utils";

export default function OnboardingRolePage() {
  const router = useRouter();
  const { isLoggedIn, hasHydrated, onboardingComplete, switchRole } = useStore();
  const t = useT();

  // Anyone hitting this URL without a session goes back to register; anyone
  // who has already finished onboarding skips ahead to the discovery feed.
  useEffect(() => {
    if (!hasHydrated) return;
    if (!isLoggedIn) router.replace("/register");
    else if (onboardingComplete) router.replace("/market");
  }, [hasHydrated, isLoggedIn, onboardingComplete, router]);

  if (!hasHydrated || !isLoggedIn || onboardingComplete) return null;

  const pick = (role: "backer" | "creator") => {
    switchRole(role);
    router.push("/onboarding/profile");
  };

  return (
    <div className="relative min-h-screen bg-mesh overflow-hidden">
      <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-primary/10 blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-32 w-[520px] h-[520px] rounded-full bg-secondary/10 blur-[160px] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-6 md:px-12 pt-24 md:pt-32 pb-24 text-center">
        <div className="inline-flex justify-center mb-8 animate-fade-up">
          <SectionLabel>{t.onboarding.stepRole}</SectionLabel>
        </div>
        <h1 className="font-headline text-5xl md:text-7xl text-on-surface leading-[1.05] tracking-tight">
          <span className="block animate-fade-up" style={{ animationDelay: "120ms" }}>
            {t.onboarding.roleTitle1}
          </span>
          <span
            className="block font-headline animate-fade-up"
            style={{
              animationDelay: "260ms",
              background: "linear-gradient(135deg, #c6ff34 0%, #d8ff95 60%, #c6ff34 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              paddingBottom: "0.05em",
            }}
          >
            {t.onboarding.roleTitle2}
          </span>
        </h1>
        <p
          className="font-body text-on-surface-variant text-base md:text-lg mt-8 max-w-xl mx-auto leading-relaxed animate-fade-up"
          style={{ animationDelay: "400ms" }}
        >
          {t.onboarding.roleSubtitle}
        </p>

        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto mt-16 text-left animate-fade-up"
          style={{ animationDelay: "540ms" }}
        >
          <RoleCard
            icon={Megaphone}
            accent="gold"
            title={t.onboarding.backerTitle}
            desc={t.onboarding.backerDesc}
            cta={t.onboarding.backerCta}
            onClick={() => pick("backer")}
          />
          <RoleCard
            icon={Camera}
            accent="blue"
            title={t.onboarding.creatorTitle}
            desc={t.onboarding.creatorDesc}
            cta={t.onboarding.creatorCta}
            onClick={() => pick("creator")}
          />
        </div>
      </div>
    </div>
  );
}

function RoleCard({
  icon: Icon,
  accent,
  title,
  desc,
  cta,
  onClick,
}: {
  icon: typeof Megaphone;
  accent: "gold" | "blue";
  title: string;
  desc: string;
  cta: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group rounded-3xl bg-surface-container-lowest border p-9 text-left transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_30px_70px_rgba(0,0,0,0.5)]",
        accent === "gold"
          ? "border-primary/30 hover:border-primary/60"
          : "border-secondary/30 hover:border-secondary/60"
      )}
    >
      <div
        className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center mb-7 border",
          accent === "gold"
            ? "border-primary/40 bg-primary/15 text-primary"
            : "border-secondary/40 bg-secondary/15 text-secondary"
        )}
      >
        <Icon className="w-6 h-6" />
      </div>
      <h2 className="font-headline text-[28px] text-on-surface leading-tight mb-3">{title}</h2>
      <p className="font-body text-sm md:text-[15px] text-on-surface-variant leading-relaxed mb-7">
        {desc}
      </p>
      <span
        className={cn(
          "inline-flex items-center gap-2 font-label text-[11px] uppercase tracking-[0.24em] transition-transform group-hover:translate-x-1",
          accent === "gold" ? "text-primary" : "text-secondary"
        )}
      >
        {cta} <ArrowRight className="w-3.5 h-3.5" />
        <Check className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </span>
    </button>
  );
}
