"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { useT } from "@/hooks/useT";
import { ArrowRight, Camera, Megaphone, Sparkles } from "lucide-react";

export default function OnboardingRolePage() {
  const router = useRouter();
  const { isLoggedIn, hasHydrated, onboardingComplete, switchRole } = useStore();
  const t = useT();

  // Anyone hitting this URL without a session goes back to register; anyone
  // who has already finished onboarding skips ahead to Discovery.
  useEffect(() => {
    if (!hasHydrated) return;
    if (!isLoggedIn) router.replace("/register");
    else if (onboardingComplete) router.replace("/discovery");
  }, [hasHydrated, isLoggedIn, onboardingComplete, router]);

  if (!hasHydrated || !isLoggedIn || onboardingComplete) return null;

  const pick = (role: "backer" | "creator") => {
    switchRole(role);
    router.push("/onboarding/profile");
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-4xl mx-auto px-6 md:px-12 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-tertiary-container text-on-tertiary-container font-label text-[11px] uppercase tracking-[0.2em]">
          <Sparkles className="w-3 h-3" /> Spotlight
        </div>
        <h1 className="font-headline text-5xl md:text-6xl text-on-surface leading-tight mb-4">
          {t.onboarding.roleTitle}
        </h1>
        <p className="font-body text-on-surface-variant text-base md:text-lg italic mb-12 opacity-80">
          {t.onboarding.roleSubtitle}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RoleCard
            icon={Megaphone}
            title={t.onboarding.backerTitle}
            desc={t.onboarding.backerDesc}
            cta={t.onboarding.backerCta}
            onClick={() => pick("backer")}
          />
          <RoleCard
            icon={Camera}
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
  title,
  desc,
  cta,
  onClick,
}: {
  icon: typeof Megaphone;
  title: string;
  desc: string;
  cta: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group text-left bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8 hover:border-primary hover:shadow-xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-1"
    >
      <div className="w-14 h-14 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-on-primary transition-colors">
        <Icon className="w-6 h-6" />
      </div>
      <h2 className="font-headline text-[28px] text-on-surface leading-tight mb-3">{title}</h2>
      <p className="font-body text-sm text-on-surface-variant leading-relaxed mb-6">{desc}</p>
      <span className="inline-flex items-center gap-1.5 font-label text-label-md uppercase tracking-wider text-primary">
        {cta} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </span>
    </button>
  );
}
