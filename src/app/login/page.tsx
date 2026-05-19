"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import { useT } from "@/hooks/useT";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useStore();
  const t = useT();
  const [role, setRole] = useState<"backer" | "creator">("backer");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    login(role);
    toast.success(t.login.signedInAs(role === "backer" ? "Lucas Chen" : "Aria Song"));
    router.push("/market");
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary text-on-primary flex-col justify-between p-12 relative overflow-hidden">
        <Link href="/" className="font-headline text-[32px] italic font-bold leading-none">
          Spotlight
        </Link>
        <div className="relative z-10">
          <blockquote className="font-headline text-[28px] leading-snug italic mb-6">
            {t.login.testimonial}
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-sm font-bold">
              AS
            </div>
            <div>
              <p className="font-body font-bold">Aria Song</p>
              <p className="font-label text-label-md uppercase tracking-wider opacity-70 mt-1">
                {t.login.testimonialRole}
              </p>
            </div>
          </div>
        </div>
        <p className="font-label text-label-md uppercase tracking-wider opacity-60">{t.login.copyright}</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <Link href="/" className="lg:hidden font-headline text-[28px] italic font-bold text-on-surface block mb-10">
            Spotlight
          </Link>

          <h1 className="font-headline text-[40px] text-on-surface mb-2 leading-tight">{t.login.welcomeBack}</h1>
          <p className="text-on-surface-variant font-body italic mb-8">{t.login.subtitle}</p>

          {/* Demo role selector */}
          <div className="bg-primary-container/40 border border-outline-variant/30 rounded-xl p-4 mb-6">
            <p className="font-label text-label-md uppercase tracking-wider text-on-primary-container mb-3">
              {t.login.demoLabel}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setRole("backer")}
                className={`flex-1 font-label text-[11px] uppercase tracking-wider py-2 rounded-lg transition-colors ${
                  role === "backer"
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-lowest border border-outline-variant/30 text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {t.login.backerOption}
              </button>
              <button
                onClick={() => setRole("creator")}
                className={`flex-1 font-label text-[11px] uppercase tracking-wider py-2 rounded-lg transition-colors ${
                  role === "creator"
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-lowest border border-outline-variant/30 text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {t.login.creatorOption}
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="font-label text-label-md uppercase tracking-wider text-on-surface-variant block mb-2">
                {t.login.email}
              </label>
              <input
                type="email"
                defaultValue={role === "backer" ? "lucas@neovision.co" : "aria@studio.me"}
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
