"use client";
import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Lock, UserPlus } from "lucide-react";
import { useStore } from "@/lib/store";
import { useT } from "@/hooks/useT";

// Full project/creator detail is members-only. Guests who reach a detail URL
// (direct link, refresh, or the returnTo redirect edge) land here: we auto-open
// the single signup gate and show a locked teaser they can re-trigger it from.
export default function LockedDetail({
  returnTo,
  kind,
  title,
}: {
  returnTo: string;
  kind: "brief" | "creator";
  title?: string;
}) {
  const { openSignupGate } = useStore();
  const t = useT();

  useEffect(() => {
    openSignupGate(returnTo);
  }, [returnTo, openSignupGate]);

  const lockedTitle = kind === "brief" ? t.signupGate.lockedBriefTitle : t.signupGate.lockedCreatorTitle;
  const lockedBody = kind === "brief" ? t.signupGate.lockedBriefBody : t.signupGate.lockedCreatorBody;

  return (
    <div className="max-w-[720px] mx-auto px-6 md:px-12 pt-12 md:pt-16 pb-40 text-center">
      <div className="flex justify-center">
        <Link
          href="/market"
          className="inline-flex items-center gap-1.5 font-label text-[11px] uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> {t.signupGate.backToMarketplace}
        </Link>
      </div>
      <div className="mt-10 rounded-3xl border border-outline-variant/40 bg-surface-container-lowest px-8 py-14 md:px-12 md:py-16">
        <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
          <Lock className="w-7 h-7" />
        </span>
        <span className="mt-6 block font-label text-[11px] uppercase tracking-[0.3em] text-primary">
          {t.signupGate.membersOnly}
        </span>
        <h1 className="mt-3 font-headline text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-on-surface leading-tight">
          {title || lockedTitle}
        </h1>
        <p className="mt-4 font-body text-base text-on-surface-variant leading-relaxed max-w-md mx-auto">
          {lockedBody}
        </p>
        <button
          type="button"
          onClick={() => openSignupGate(returnTo)}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary text-on-primary font-label text-[12px] uppercase tracking-[0.12em] px-8 py-4 hover:opacity-90 active:scale-95 transition-all"
        >
          <UserPlus className="w-4 h-4" /> {t.signupGate.signUpToView}
        </button>
      </div>
    </div>
  );
}
