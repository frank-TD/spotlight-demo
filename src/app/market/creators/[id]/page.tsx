"use client";
import { use, useState } from "react";
import { useStore } from "@/lib/store";
import AppShell from "@/components/layout/AppShell";
import { CREATORS } from "@/lib/mock-data";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, Clock, CheckCircle2, AlertCircle, Film, Send, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useT } from "@/hooks/useT";

const OWN_CREATOR_ID = "u_creator_01";

export default function CreatorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { activeRole, invitationSent, sendInvitation, creatorEdits, updateCreatorEdits } = useStore();
  const t = useT();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const baseCreator = CREATORS.find(c => c.id === id) ?? CREATORS[0];
  const isOwnProfile = activeRole === "creator" && id === OWN_CREATOR_ID;
  const creator = isOwnProfile
    ? {
        ...baseCreator,
        bio: creatorEdits.bio ?? baseCreator.bio,
        specialties: creatorEdits.specialties ?? baseCreator.specialties,
        rateCard: { ...baseCreator.rateCard, from: creatorEdits.rateFrom ?? baseCreator.rateCard.from },
        activeHours: creatorEdits.activeHours ?? baseCreator.activeHours,
      }
    : baseCreator;

  // Local form state mirrors the dialog inputs; initialized when opening
  const [formBio, setFormBio] = useState(creator.bio);
  const [formSpecialties, setFormSpecialties] = useState(creator.specialties.join(", "));
  const [formRate, setFormRate] = useState(String(creator.rateCard.from));
  const [formActiveHours, setFormActiveHours] = useState(creator.activeHours);

  const openEdit = () => {
    setFormBio(creator.bio);
    setFormSpecialties(creator.specialties.join(", "));
    setFormRate(String(creator.rateCard.from));
    setFormActiveHours(creator.activeHours);
    setEditOpen(true);
  };

  const saveEdit = () => {
    updateCreatorEdits({
      bio: formBio.trim(),
      specialties: formSpecialties.split(",").map((s) => s.trim()).filter(Boolean),
      rateFrom: Number(formRate) || baseCreator.rateCard.from,
      activeHours: formActiveHours.trim(),
    });
    setEditOpen(false);
    toast.success(t.creatorProfile.savedToast);
  };

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
                  <div className="flex items-start justify-between gap-3">
                    <h1 className="text-lg font-bold text-foreground">{creator.nickname}</h1>
                    {isOwnProfile && (
                      <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7 shrink-0" onClick={openEdit}>
                        <Pencil className="w-3 h-3" /> {t.creatorProfile.editProfile}
                      </Button>
                    )}
                  </div>
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

              {isOwnProfile && (
                <Button className="w-full gap-2" onClick={openEdit}>
                  <Pencil className="w-4 h-4" /> {t.creatorProfile.editProfile}
                </Button>
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

      {/* Edit dialog — Own profile only */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">{t.creatorProfile.editDialogTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm">{t.creatorProfile.bioLabel}</Label>
              <Textarea
                className="mt-1.5 resize-none text-sm"
                rows={4}
                value={formBio}
                onChange={(e) => setFormBio(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm">{t.creatorProfile.specialtiesLabel}</Label>
              <Input
                className="mt-1.5"
                value={formSpecialties}
                onChange={(e) => setFormSpecialties(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">{t.creatorProfile.specialtiesHint}</p>
            </div>
            <div>
              <Label className="text-sm">{t.creatorProfile.rateLabel}</Label>
              <Input
                className="mt-1.5"
                type="number"
                value={formRate}
                onChange={(e) => setFormRate(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm">{t.creatorProfile.activeHoursLabel}</Label>
              <Input
                className="mt-1.5"
                value={formActiveHours}
                onChange={(e) => setFormActiveHours(e.target.value)}
                placeholder={t.creatorProfile.activeHoursPlaceholder}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>{t.common.cancel}</Button>
            <Button onClick={saveEdit}>{t.common.save}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
