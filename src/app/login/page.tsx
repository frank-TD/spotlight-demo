"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { useT } from "@/hooks/useT";

export default function LoginPage() {
  const router = useRouter();
  const { login, onboardingComplete } = useStore();
  const t = useT();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    login();
    toast.success(t.login.welcomeBack);
    // If the signup gate sent the user here from a locked project/action, drop
    // them right back where they left off (guarded to internal paths only).
    const raw = new URLSearchParams(window.location.search).get("returnTo");
    const returnTo = raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : null;
    // Otherwise: returning users that finished onboarding head straight to
    // Discovery; anyone still in the funnel resumes at the role picker.
    router.push(returnTo ?? (onboardingComplete ? "/discovery" : "/onboarding/role"));
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Left brand panel — cinematic dark with a soft gold mesh wash */}
      <div className="hidden lg:flex lg:w-1/2 bg-surface-container-lowest text-on-surface flex-col justify-between p-12 relative overflow-hidden bg-mesh">
        <Link
          href="/"
          className="font-headline text-[32px] font-extrabold tracking-tight leading-none text-primary"
        >
          Spotlight
        </Link>
        <div className="relative z-10">
          <blockquote className="font-headline text-[28px] leading-snug mb-6">
            {t.login.testimonial}
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-sm font-bold">
              AS
            </div>
            <div>
              <p className="font-body font-bold">Aria Song</p>
              <p className="font-label text-label-md uppercase tracking-wider text-on-surface-variant mt-1">
                {t.login.testimonialRole}
              </p>
            </div>
          </div>
        </div>
        <p className="font-label text-label-md uppercase tracking-wider text-on-surface-variant">
          {t.login.copyright}
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="lg:hidden font-headline text-[28px] font-extrabold tracking-tight text-on-surface block mb-10"
          >
            Spotlight
          </Link>

          <h1 className="font-headline text-[40px] font-extrabold uppercase tracking-tight text-on-surface mb-2 leading-[1.05]">
            {t.login.welcomeBack}
          </h1>
          <p className="text-on-surface-variant font-body mb-8">{t.login.subtitle}</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="font-label text-label-md uppercase tracking-wider text-on-surface-variant block mb-2">
                {t.login.email}
              </label>
              <input
                type="email"
                defaultValue="you@spotlight.demo"
                readOnly
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:border-primary focus:outline-none font-body text-sm"
              />
            </div>
            <div>
              <label className="font-label text-label-md uppercase tracking-wider text-on-surface-variant block mb-2">
                {t.login.password}
              </label>
              <input
                type="password"
                defaultValue="••••••••"
                readOnly
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:border-primary focus:outline-none font-body text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-on-primary font-label text-label-md uppercase tracking-wider py-3 rounded-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
            >
              {loading ? t.login.signingIn : t.login.signIn}
            </button>
          </form>

          <p className="text-center text-sm text-on-surface-variant mt-6">
            {t.login.noAccount}{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              {t.login.signUp}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
