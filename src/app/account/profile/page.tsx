"use client";
import { useStore } from "@/lib/store";
import AppShell from "@/components/layout/AppShell";
import { CURRENT_USER_BACKER, CURRENT_USER_CREATOR } from "@/lib/mock-data";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/hooks/useT";

export default function ProfilePage() {
  const { activeRole } = useStore();
  const t = useT();
  const user = activeRole === "backer" ? CURRENT_USER_BACKER : CURRENT_USER_CREATOR;

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-6 md:px-12 pt-10 pb-16">
        <h1 className="font-headline text-headline-lg text-on-surface mb-10">{t.profile.title}</h1>

        <div className="space-y-6">
          {/* Avatar + form */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8">
            <div className="flex items-center gap-5 mb-8">
              <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center text-2xl font-bold text-on-primary-container">
                {user.avatar}
              </div>
              <div>
                <p className="font-headline text-[24px] text-on-surface">{user.nickname}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="font-label text-[10px] uppercase tracking-widest bg-secondary-container text-on-secondary-container px-2.5 py-1 rounded">
                    {activeRole === "backer" ? t.market.roleBacker : t.market.roleCreator}
                  </span>
                  <span className="flex items-center gap-1 font-label text-[10px] uppercase tracking-widest bg-tertiary-container text-on-tertiary-container px-2.5 py-1 rounded">
                    <CheckCircle2 className="w-3 h-3" /> {t.common.kycVerified}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="font-label text-label-md uppercase tracking-wider text-on-surface-variant block mb-2">
                  {t.profile.displayName}
                </label>
                <input
                  defaultValue={user.nickname}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:border-primary focus:outline-none font-body text-sm"
                />
              </div>
              <div>
                <label className="font-label text-label-md uppercase tracking-wider text-on-surface-variant block mb-2">
                  {t.profile.email}
                </label>
                <input
                  type="email"
                  defaultValue={user.email}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:border-primary focus:outline-none font-body text-sm"
                />
              </div>
              <div>
                <label className="font-label text-label-md uppercase tracking-wider text-on-surface-variant block mb-2">
                  {t.profile.bio}
                </label>
                <textarea
                  rows={3}
                  defaultValue={activeRole === "creator" ? t.profile.bioCreatorDefault : t.profile.bioBackerDefault}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:border-primary focus:outline-none font-body text-sm resize-none"
                />
              </div>
              <button
                onClick={() => toast.success(t.profile.savedToast)}
                className="bg-primary text-on-primary font-label text-label-md uppercase tracking-wider px-6 py-3 rounded-lg hover:opacity-90 active:scale-95 transition-all"
              >
                {t.profile.saveChanges}
              </button>
            </div>
          </div>

          {/* KYC */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 flex items-center justify-between">
            <div>
              <h2 className="font-headline text-[18px] text-on-surface">{t.profile.identityVerification}</h2>
              <p className="font-body text-sm text-on-surface-variant mt-1">{t.profile.verificationDesc}</p>
            </div>
            <span className="flex items-center gap-1 font-label text-[10px] uppercase tracking-widest bg-tertiary-container text-on-tertiary-container px-3 py-1.5 rounded-full">
              <CheckCircle2 className="w-3 h-3" /> {t.profile.verified}
            </span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
