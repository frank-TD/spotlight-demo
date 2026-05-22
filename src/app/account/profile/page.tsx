"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { CURRENT_USER_BACKER, CURRENT_USER_CREATOR } from "@/lib/mock-data";
import { CheckCircle2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/hooks/useT";

function ProfileForm({ role }: { role: "backer" | "creator" }) {
  const t = useT();
  const { profileEdits, updateProfile, updateCreatorEdits } = useStore();
  const user = role === "backer" ? CURRENT_USER_BACKER : CURRENT_USER_CREATOR;
  const saved = profileEdits[role] ?? {};
  const defaultBio = role === "creator" ? t.profile.bioCreatorDefault : t.profile.bioBackerDefault;

  const [name, setName] = useState(saved.nickname ?? user.nickname);
  const [email, setEmail] = useState(saved.email ?? user.email);
  const [bio, setBio] = useState(saved.bio ?? defaultBio);

  const handleSave = () => {
    const nickname = name.trim() || user.nickname;
    updateProfile(role, { nickname, email: email.trim(), bio: bio.trim() });
    // Keep the creator's public card in sync with the account profile.
    if (role === "creator") updateCreatorEdits({ nickname, bio: bio.trim() });
    toast.success(t.profile.savedToast);
  };

  const inputCls =
    "w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:border-primary focus:outline-none font-body text-sm";

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8">
      <div className="flex items-center gap-5 mb-8">
        <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center text-2xl font-bold text-on-primary-container">
          {user.avatar}
        </div>
        <div>
          <p className="font-headline text-[24px] text-on-surface">{name}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="font-label text-[10px] uppercase tracking-widest bg-secondary-container text-on-secondary-container px-2.5 py-1 rounded">
              {role === "backer" ? t.market.roleBacker : t.market.roleCreator}
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
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="font-label text-label-md uppercase tracking-wider text-on-surface-variant block mb-2">
            {t.profile.email}
          </label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="font-label text-label-md uppercase tracking-wider text-on-surface-variant block mb-2">
            {t.profile.bio}
          </label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className={`${inputCls} resize-none`}
          />
        </div>
        <button
          onClick={handleSave}
          className="bg-primary text-on-primary font-label text-label-md uppercase tracking-wider px-6 py-3 rounded-lg hover:opacity-90 active:scale-95 transition-all"
        >
          {t.profile.saveChanges}
        </button>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { activeRole, logout } = useStore();
  const router = useRouter();
  const t = useT();

  const handleLogout = () => {
    logout();
    toast.success(t.profile.loggedOutToast);
    router.push("/login");
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-6 md:px-12 pt-10 pb-16">
        <h1 className="font-headline text-headline-lg text-on-surface mb-10">{t.profile.title}</h1>

        <div className="space-y-6">
          {/* Avatar + form (remounts on role switch to reload the right values) */}
          <ProfileForm key={activeRole} role={activeRole} />

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

          {/* Account / logout */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6">
            <h2 className="font-label text-label-md uppercase tracking-[0.2em] text-on-surface-variant mb-4">
              {t.profile.accountSection}
            </h2>
            <div className="flex items-center justify-between gap-4">
              <p className="font-body text-sm text-on-surface-variant">{t.profile.logoutDesc}</p>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 font-label text-label-md uppercase tracking-wider text-error border border-error/40 px-5 py-2.5 rounded-lg hover:bg-error-container/40 transition-colors shrink-0"
              >
                <LogOut className="w-4 h-4" /> {t.nav.signOut}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
