"use client";
import { useStore } from "@/lib/store";
import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-xl font-bold text-foreground mb-6">{t.profile.title}</h1>

        <div className="space-y-5">
          {/* Avatar + basic */}
          <div className="bg-white border border-border rounded-xl p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-xl font-bold text-primary">
                {user.avatar}
              </div>
              <div>
                <p className="text-base font-semibold text-foreground">{user.nickname}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="text-xs capitalize" variant="secondary">{user.role}</Badge>
                  <Badge className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" /> {t.common.kycVerified}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm">{t.profile.displayName}</Label>
                <Input className="mt-1.5" defaultValue={user.nickname} />
              </div>
              <div>
                <Label className="text-sm">{t.profile.email}</Label>
                <Input className="mt-1.5" defaultValue={user.email} type="email" />
              </div>
              <div>
                <Label className="text-sm">{t.profile.bio}</Label>
                <Textarea className="mt-1.5 resize-none text-sm" rows={3} defaultValue={activeRole === "creator" ? t.profile.bioCreatorDefault : t.profile.bioBackerDefault} />
              </div>
              <Button onClick={() => toast.success(t.profile.savedToast)}>{t.profile.saveChanges}</Button>
            </div>
          </div>

          {/* KYC */}
          <div className="bg-white border border-border rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-foreground">{t.profile.identityVerification}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{t.profile.verificationDesc}</p>
              </div>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 text-xs">
                <CheckCircle2 className="w-3 h-3" /> {t.profile.verified}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
