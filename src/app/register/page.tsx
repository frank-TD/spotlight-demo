"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import { useT } from "@/hooks/useT";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useStore();
  const t = useT();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await new Promise((r) => setTimeout(r, 700));
    // Register without committing to a role — the user picks Backer or Creator on /onboarding/role.
    login();
    toast.success(t.register.successToast);
    router.push("/onboarding/role");
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="font-headline text-[28px] italic font-bold text-on-surface block mb-10"
        >
          Spotlight
        </Link>

        <h1 className="font-headline text-[40px] text-on-surface mb-2 leading-tight">
          {t.register.title}
        </h1>
        <p className="text-on-surface-variant font-body italic mb-8">{t.register.subtitle}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-label text-label-md uppercase tracking-wider text-on-surface-variant block mb-2">
                {t.register.firstName}
              </label>
              <input
                placeholder="Alex"
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:border-primary focus:outline-none font-body text-sm"
              />
            </div>
            <div>
              <label className="font-label text-label-md uppercase tracking-wider text-on-surface-variant block mb-2">
                {t.register.lastName}
              </label>
              <input
                placeholder="Kim"
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:border-primary focus:outline-none font-body text-sm"
              />
            </div>
          </div>
          <div>
            <label className="font-label text-label-md uppercase tracking-wider text-on-surface-variant block mb-2">
              {t.register.email}
            </label>
            <input
              type="email"
              placeholder="you@studio.com"
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:border-primary focus:outline-none font-body text-sm"
            />
          </div>
          <div>
            <label className="font-label text-label-md uppercase tracking-wider text-on-surface-variant block mb-2">
              {t.register.password}
            </label>
            <input
              type="password"
              placeholder={t.register.passwordPlaceholder}
              className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:border-primary focus:outline-none font-body text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-on-primary font-label text-label-md uppercase tracking-wider py-3 rounded-lg hover:opacity-90 active:scale-95 transition-all"
          >
            {t.register.createAccount}
          </button>
        </form>

        <p className="text-center text-sm text-on-surface-variant mt-6">
          {t.register.alreadyHaveAccount}{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            {t.register.signIn}
          </Link>
        </p>
      </div>
    </div>
  );
}
