"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { useT } from "@/hooks/useT";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import SectionLabel from "@/components/home/SectionLabel";

export default function OnboardingProfilePage() {
  const router = useRouter();
  const {
    isLoggedIn,
    hasHydrated,
    onboardingComplete,
    activeRole,
    setOnboardingComplete,
    updateBackerPrefs,
    updateCreatorPrefs,
  } = useStore();
  const t = useT();

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isLoggedIn) router.replace("/register");
    else if (onboardingComplete) router.replace("/discovery");
  }, [hasHydrated, isLoggedIn, onboardingComplete, router]);

  if (!hasHydrated || !isLoggedIn || onboardingComplete) return null;

  const finish = () => {
    setOnboardingComplete(true);
    toast.success(t.onboarding.finishedToast);
    router.replace("/discovery");
  };

  const isBacker = activeRole === "backer";
  const title1 = isBacker ? t.onboarding.profileBackerTitle1 : t.onboarding.profileCreatorTitle1;
  const title2 = isBacker ? t.onboarding.profileBackerTitle2 : t.onboarding.profileCreatorTitle2;
  const sub = isBacker ? t.onboarding.profileBackerSubtitle : t.onboarding.profileCreatorSubtitle;

  return (
    <div className="relative min-h-screen bg-mesh overflow-hidden">
      <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-primary/10 blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-32 w-[520px] h-[520px] rounded-full bg-secondary/10 blur-[160px] pointer-events-none" />

      <div className="relative max-w-2xl mx-auto px-6 md:px-8 pt-20 md:pt-28 pb-32">
        <button
          onClick={() => router.push("/onboarding/role")}
          className="inline-flex items-center gap-1.5 font-label text-[11px] uppercase tracking-[0.24em] text-on-surface-variant hover:text-primary mb-10 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> {t.onboarding.back}
        </button>

        <div className="mb-6 animate-fade-up">
          <SectionLabel>{t.onboarding.stepProfile}</SectionLabel>
        </div>
        <h1 className="font-headline text-4xl md:text-6xl text-on-surface leading-[1.05] tracking-tight">
          <span className="block animate-fade-up" style={{ animationDelay: "120ms" }}>
            {title1}
          </span>
          <span
            className="block italic font-headline animate-fade-up"
            style={{
              animationDelay: "260ms",
              background: "linear-gradient(135deg, #d4af37 0%, #f3d57f 60%, #d4af37 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              paddingBottom: "0.05em",
            }}
          >
            {title2}
          </span>
        </h1>
        <p
          className="font-body text-on-surface-variant text-base md:text-lg mt-7 mb-12 leading-relaxed animate-fade-up"
          style={{ animationDelay: "400ms" }}
        >
          {sub}
        </p>

        <div className="animate-fade-up" style={{ animationDelay: "540ms" }}>
          {isBacker ? (
            <BackerForm onSubmit={updateBackerPrefs} onFinish={finish} />
          ) : (
            <CreatorForm onSubmit={updateCreatorPrefs} onFinish={finish} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── shared field shells ─────────────────────────────────────────────── */

function Section({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  const t = useT();
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label className="font-label text-label-md uppercase tracking-wider text-on-surface">
          {label}
          <span className="ml-2 font-label text-[10px] text-on-surface-variant tracking-widest">
            {required ? t.onboarding.required : t.onboarding.optional}
          </span>
        </label>
        {hint && (
          <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:border-primary focus:outline-none font-body text-sm"
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={3}
      {...props}
      className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:border-primary focus:outline-none font-body text-sm resize-y min-h-[80px]"
    />
  );
}

function ChipGroup({
  options,
  value,
  onChange,
  multi,
  max,
}: {
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
  multi?: boolean;
  max?: number;
}) {
  const toggle = (opt: string) => {
    const has = value.includes(opt);
    if (!multi) {
      onChange(has ? [] : [opt]);
      return;
    }
    if (has) onChange(value.filter((v) => v !== opt));
    else if (!max || value.length < max) onChange([...value, opt]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = value.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={cn(
              "px-4 py-1.5 rounded-full border font-label text-[11px] uppercase tracking-widest transition-all duration-200",
              selected
                ? "bg-primary text-on-primary border-primary shadow-md shadow-primary/20"
                : "border-outline-variant/40 text-on-surface-variant hover:border-primary/50 hover:bg-primary/5"
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function FormActions({
  canSubmit,
  onSkip,
  onSubmit,
  finishLabel,
  skipLabel,
}: {
  canSubmit: boolean;
  onSkip: () => void;
  onSubmit: () => void;
  finishLabel: string;
  skipLabel: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 pt-4">
      <button
        type="button"
        onClick={onSkip}
        className="font-label text-label-md uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors px-2 py-1.5"
      >
        {skipLabel}
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit}
        className="inline-flex items-center gap-2 bg-primary text-on-primary font-label text-label-md uppercase tracking-wider px-6 py-3 rounded-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {finishLabel} <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/* ─── Backer form ────────────────────────────────────────────────────── */

function BackerForm({
  onSubmit,
  onFinish,
}: {
  onSubmit: (
    prefs: Partial<NonNullable<ReturnType<typeof useStore.getState>["userPreferences"]["backer"]>>
  ) => void;
  onFinish: () => void;
}) {
  const t = useT();
  const [company, setCompany] = useState("");
  const [industry, setIndustry] = useState<string[]>([]);
  const [budgetTier, setBudgetTier] = useState<string[]>([]);
  const [contentTypes, setContentTypes] = useState<string[]>([]);
  const [styles, setStyles] = useState<string[]>([]);
  const [bio, setBio] = useState("");

  const canSubmit = company.trim().length > 0 && industry.length > 0 && budgetTier.length > 0;

  const submit = () => {
    if (!canSubmit) {
      toast.error(t.onboarding.errRequired);
      return;
    }
    onSubmit({
      company: company.trim(),
      industry: industry[0],
      budgetTier: budgetTier[0],
      contentTypes,
      styles,
      bio: bio.trim() || undefined,
    });
    onFinish();
  };

  return (
    <div className="space-y-6">
      <Section label={t.onboarding.fBCompany} required>
        <TextInput
          placeholder={t.onboarding.fBCompanyPh}
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </Section>
      <Section label={t.onboarding.fBIndustry} required>
        <ChipGroup options={t.onboarding.industries} value={industry} onChange={setIndustry} />
      </Section>
      <Section label={t.onboarding.fBBudget} required>
        <ChipGroup options={t.onboarding.budgetTiers} value={budgetTier} onChange={setBudgetTier} />
      </Section>
      <Section label={t.onboarding.fBContentTypes}>
        <ChipGroup
          options={t.onboarding.contentTypes}
          value={contentTypes}
          onChange={setContentTypes}
          multi
        />
      </Section>
      <Section label={t.onboarding.fBStyles}>
        <ChipGroup options={t.onboarding.backerStyles} value={styles} onChange={setStyles} multi />
      </Section>
      <Section label={t.onboarding.fBBio}>
        <Textarea
          placeholder={t.onboarding.fBBioPh}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </Section>
      <FormActions
        canSubmit={canSubmit}
        onSkip={onFinish}
        onSubmit={submit}
        finishLabel={t.onboarding.finish}
        skipLabel={t.onboarding.skipForNow}
      />
    </div>
  );
}

/* ─── Creator form ──────────────────────────────────────────────────── */

function CreatorForm({
  onSubmit,
  onFinish,
}: {
  onSubmit: (
    prefs: Partial<NonNullable<ReturnType<typeof useStore.getState>["userPreferences"]["creator"]>>
  ) => void;
  onFinish: () => void;
}) {
  const t = useT();
  const [displayName, setDisplayName] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [experience, setExperience] = useState<string[]>([]);
  const [rate, setRate] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [styles, setStyles] = useState<string[]>([]);
  const [availability, setAvailability] = useState<string[]>([]);
  const [bio, setBio] = useState("");

  const rateNum = Number(rate);
  const rateValid = rate.trim().length > 0 && !Number.isNaN(rateNum) && rateNum > 0;
  const canSubmit =
    displayName.trim().length > 0 && specialties.length > 0 && experience.length > 0 && rateValid;

  const submit = () => {
    if (!canSubmit) {
      toast.error(
        specialties.length === 0 ? t.onboarding.errSpecialtiesMin : t.onboarding.errRequired
      );
      return;
    }
    onSubmit({
      displayName: displayName.trim(),
      specialties,
      experience: experience[0],
      rateFrom: rateNum,
      portfolioUrl: portfolio.trim() || undefined,
      styles,
      availability: availability[0],
      bio: bio.trim() || undefined,
    });
    onFinish();
  };

  return (
    <div className="space-y-6">
      <Section label={t.onboarding.fCDisplayName} required>
        <TextInput
          placeholder={t.onboarding.fCDisplayNamePh}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </Section>
      <Section label={t.onboarding.fCSpecialties} required hint={t.onboarding.fCSpecialtiesHint}>
        <ChipGroup
          options={t.onboarding.specialties}
          value={specialties}
          onChange={setSpecialties}
          multi
          max={3}
        />
      </Section>
      <Section label={t.onboarding.fCExperience} required>
        <ChipGroup
          options={t.onboarding.experienceTiers}
          value={experience}
          onChange={setExperience}
        />
      </Section>
      <Section label={t.onboarding.fCRate} required>
        <TextInput
          inputMode="numeric"
          placeholder={t.onboarding.fCRatePh}
          value={rate}
          onChange={(e) => setRate(e.target.value.replace(/[^0-9]/g, ""))}
        />
      </Section>
      <Section label={t.onboarding.fCPortfolio}>
        <TextInput
          type="url"
          placeholder={t.onboarding.fCPortfolioPh}
          value={portfolio}
          onChange={(e) => setPortfolio(e.target.value)}
        />
      </Section>
      <Section label={t.onboarding.fCStyles}>
        <ChipGroup options={t.onboarding.creatorStyles} value={styles} onChange={setStyles} multi />
      </Section>
      <Section label={t.onboarding.fCAvailability}>
        <ChipGroup
          options={t.onboarding.availabilities}
          value={availability}
          onChange={setAvailability}
        />
      </Section>
      <Section label={t.onboarding.fCBio}>
        <Textarea
          placeholder={t.onboarding.fCBioPh}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </Section>
      <FormActions
        canSubmit={canSubmit}
        onSkip={onFinish}
        onSubmit={submit}
        finishLabel={t.onboarding.finish}
        skipLabel={t.onboarding.skipForNow}
      />
    </div>
  );
}
