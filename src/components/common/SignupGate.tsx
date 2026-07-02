"use client";
import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useStore } from "@/lib/store";
import { useT } from "@/hooks/useT";

// The single "Sign up or Log in" gate that every guest conversion point converges
// on (locked full detail, transactional actions). Carries a returnTo so the user
// lands back where they were after authenticating.
export default function SignupGate() {
  const { signupGateOpen, signupGateReturnTo, closeSignupGate } = useStore();
  const t = useT();
  const rt = signupGateReturnTo ? `?returnTo=${encodeURIComponent(signupGateReturnTo)}` : "";

  return (
    <Dialog open={signupGateOpen} onOpenChange={(v) => !v && closeSignupGate()}>
      <DialogContent className="sm:max-w-[440px] bg-surface-container-low border-outline-variant/50">
        <DialogHeader>
          <span className="font-label text-[11px] uppercase tracking-[0.18em] text-primary">{t.signupGate.eyebrow}</span>
          <DialogTitle className="font-headline text-3xl font-extrabold uppercase tracking-tight text-on-surface mt-2 leading-tight">
            {t.signupGate.title}
          </DialogTitle>
        </DialogHeader>
        <p className="font-body text-sm text-on-surface-variant leading-relaxed">
          {t.signupGate.body}
        </p>
        <div className="flex flex-col gap-3 mt-3">
          <Link
            href={`/register${rt}`}
            onClick={closeSignupGate}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary text-on-primary font-label text-[12px] uppercase tracking-[0.12em] px-6 py-3.5 hover:opacity-90 active:scale-95 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            {t.signupGate.createAccount}
          </Link>
          <Link
            href={`/login${rt}`}
            onClick={closeSignupGate}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-outline-variant/60 text-on-surface font-label text-[12px] uppercase tracking-[0.12em] px-6 py-3.5 hover:border-primary/60 hover:text-primary transition-colors"
          >
            <LogIn className="w-4 h-4" />
            {t.signupGate.logIn}
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
