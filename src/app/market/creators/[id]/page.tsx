"use client";
import { use, useState } from "react";
import { useStore } from "@/lib/store";
import AppShell from "@/components/layout/AppShell";
import { CREATORS } from "@/lib/mock-data";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, Clock, CheckCircle2, AlertCircle, Film, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useT } from "@/hooks/useT";

export default function CreatorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { activeRole, invitationSent, sendInvitation } = useStore();
  const t = useT();
  const [inviteOpen, setInviteOpen] = useState(false);

  const creator = CREATORS.find(c => c.id === id) ?? CREATORS[0];

  const metrics = [
    { label: t.creatorProfile.completionRate, value: `${creator.completion}%`, icon: CheckCircle2, color: "text-emerald-600" },
    { label: t.creatorProfile.onTimeDelivery, value: `${creator.punctuality}%`, icon: Clock, color: "text-primary" },
    { label: t.creatorProfile.disputeRate, value: t.creatorProfile.disputes(creator.disputes), icon: AlertCircle, color: creator.disputes === 0 ? "text-emerald-600" : "text-amber-600" },
    { label: t.creatorProfile.copyrightIssues, value: creator.copyrightViolations === 0 ? t.creatorProfile.cleanRecord : t.creatorProfile.violations(creator.copyrightViolations), icon: Film, color: creator.copyrightViolations === 0 ? "text-emerald-600" : "text-red-600" },
  ];

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Link href="/market/creators" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> {t.creatorProfile.backToCreators}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: profile */}
          <div className="lg:col-span-2 space-y-5">
            {/* Header card */}
            <div className="bg-white border border-border rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className={cn("w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shrink-0", creator.avatarColor)}>
                  {creator.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg font-bold text-foreground">{creator.nickname}</h1>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium">{creator.rating}</span>
                    </div>
                    <span className="text-muted-foreground text-sm">·</span>
                    <span className="text-sm text-muted-foreground">{creator.orders} {t.creatorProfile.projectsCompleted}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {creator.specialties.map(s => (
                      <span key={s} className="text-xs bg-accent text-primary px-2.5 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4 leading-relaxed">{creator.bio}</p>
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
                <span>{t.creatorProfile.activeLabel} {creator.activeHours}</span>
                <span>·</span>
                <span>{t.creators.fromLabel} ¥{creator.rateCard.from.toLocaleString()} {t.creatorProfile.fromPerProject}</span>
              </div>
            </div>

            {/* Metrics */}
            <div className="bg-white border border-border rounded-xl p-6">
              <h2 className="text-sm font-semibold text-foreground mb-4">{t.creatorProfile.performance}</h2>
              <div className="grid grid-cols-2 gap-3">
                {metrics.map(m => (
                  <div key={m.label} className="bg-muted rounded-lg px-4 py-3 flex items-center gap-3">
                    <m.icon className={cn("w-4 h-4 shrink-0", m.color)} />
                    <div>
                      <p className="text-xs text-muted-foreground">{m.label}</p>
                      <p className={cn("text-sm font-semibold mt-0.5", m.color)}>{m.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Showcase */}
            <div className="bg-white border border-border rounded-xl p-6">
              <h2 className="text-sm font-semibold text-foreground mb-4">{t.creatorProfile.showcase}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {creator.showcase.map(work => (
                  <div key={work.id} className="rounded-lg border border-border overflow-hidden bg-muted">
                    <div className="h-24 bg-accent flex items-center justify-center">
                      <span className="text-3xl">{work.thumbnail}</span>
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-medium text-foreground truncate">{work.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{work.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white border border-border rounded-xl p-5 sticky top-20">
              <div className="text-center mb-4">
                <p className="text-2xl font-bold text-foreground">¥{creator.rateCard.from.toLocaleString()}+</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t.creatorProfile.startingRate}</p>
              </div>

              {activeRole === "backer" && (
                <div className="space-y-2">
                  {invitationSent ? (
                    <Badge className="w-full justify-center bg-accent text-primary border-0 py-2">{t.creatorProfile.invitationSent}</Badge>
                  ) : (
                    <Button className="w-full gap-2" onClick={() => setInviteOpen(true)}>
                      <Send className="w-4 h-4" /> {t.creatorProfile.sendInvitation}
                    </Button>
                  )}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-border space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{t.creatorProfile.projectsCount}</span>
                  <span className="font-medium">{creator.orders}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{t.creatorProfile.completion}</span>
                  <span className="font-medium">{creator.completion}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{t.creatorProfile.punctuality}</span>
                  <span className="font-medium">{creator.punctuality}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invite dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">{t.creatorProfile.inviteDialogTitle(creator.nickname)}</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <div>
              <p className="text-sm font-medium text-foreground mb-1">{t.creatorProfile.project}</p>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option>{t.creatorProfile.inviteProjectOption("Cinematic Brand Film for AI Startup")}</option>
                <option>{t.creatorProfile.createNewNeed}</option>
              </select>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-1">{t.creatorProfile.note}</p>
              <Textarea rows={3} className="resize-none text-sm" defaultValue={t.creatorProfile.inviteNoteDefault(creator.nickname)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>{t.common.cancel}</Button>
            <Button onClick={() => { sendInvitation(); setInviteOpen(false); toast.success(t.creatorProfile.invitedToast); }}>
              {t.creatorProfile.sendInvitation}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
