"use client";
import { use, useState } from "react";
import { useStore } from "@/lib/store";
import AppShell from "@/components/layout/AppShell";
import { CREATORS, PRESET_SPECIALTY_TAGS, SHOWCASE_THUMBNAIL_OPTIONS } from "@/lib/mock-data";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, Clock, CheckCircle2, AlertCircle, Film, Send, Pencil, X, Plus, GripVertical, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useT } from "@/hooks/useT";

const OWN_CREATOR_ID = "u_creator_01";

type ShowcaseItem = { id: string; title: string; thumbnail: string; duration: string; description?: string };

export default function CreatorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { activeRole, invitationSent, sendInvitation, creatorEdits, updateCreatorEdits, showcaseEdits, setShowcaseEdits } = useStore();
  const t = useT();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [showcaseOpen, setShowcaseOpen] = useState(false);

  const baseCreator = CREATORS.find(c => c.id === id) ?? CREATORS[0];
  const isOwnProfile = activeRole === "creator" && id === OWN_CREATOR_ID;
  const showcase: ShowcaseItem[] = isOwnProfile && showcaseEdits ? showcaseEdits : (baseCreator.showcase as ShowcaseItem[]);
  const creator = isOwnProfile
    ? {
        ...baseCreator,
        bio: creatorEdits.bio ?? baseCreator.bio,
        specialties: creatorEdits.specialties ?? baseCreator.specialties,
        rateCard: { ...baseCreator.rateCard, from: creatorEdits.rateFrom ?? baseCreator.rateCard.from },
        activeHours: creatorEdits.activeHours ?? baseCreator.activeHours,
        showcase,
      }
    : { ...baseCreator, showcase };

  // Profile edit form state
  const [formBio, setFormBio] = useState(creator.bio);
  const [formTags, setFormTags] = useState<string[]>(creator.specialties);
  const [customTag, setCustomTag] = useState("");
  const [formRate, setFormRate] = useState(String(creator.rateCard.from));
  const [formActiveHours, setFormActiveHours] = useState(creator.activeHours);

  // Showcase edit form state
  const [formShowcase, setFormShowcase] = useState<ShowcaseItem[]>(showcase);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const openEdit = () => {
    setFormBio(creator.bio);
    setFormTags([...creator.specialties]);
    setCustomTag("");
    setFormRate(String(creator.rateCard.from));
    setFormActiveHours(creator.activeHours);
    setEditOpen(true);
  };

  const toggleTag = (tag: string) => {
    setFormTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const addCustomTag = () => {
    const v = customTag.trim();
    if (!v) return;
    if (!formTags.includes(v)) setFormTags((prev) => [...prev, v]);
    setCustomTag("");
  };

  const saveEdit = () => {
    updateCreatorEdits({
      bio: formBio.trim(),
      specialties: formTags,
      rateFrom: Number(formRate) || baseCreator.rateCard.from,
      activeHours: formActiveHours.trim(),
    });
    setEditOpen(false);
    toast.success(t.creatorProfile.savedToast);
  };

  const openShowcaseEdit = () => {
    setFormShowcase(showcase.map((s) => ({ ...s })));
    setShowcaseOpen(true);
  };

  const addShowcaseItem = () => {
    setFormShowcase((prev) => [
      ...prev,
      { id: `sc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, title: "", thumbnail: "🎬", duration: "", description: "" },
    ]);
  };

  const updateShowcaseField = (idx: number, field: keyof ShowcaseItem, value: string) => {
    setFormShowcase((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));
  };

  const removeShowcaseItem = (idx: number) => {
    setFormShowcase((prev) => prev.filter((_, i) => i !== idx));
  };

  const onDragStart = (i: number) => setDragIndex(i);
  const onDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (overIndex !== i) setOverIndex(i);
  };
  const onDrop = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === i) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }
    setFormShowcase((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(i, 0, moved);
      return next;
    });
    setDragIndex(null);
    setOverIndex(null);
  };
  const onDragEnd = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  const saveShowcase = () => {
    setShowcaseEdits(formShowcase.filter((s) => s.title.trim()));
    setShowcaseOpen(false);
    toast.success(t.creatorProfile.showcaseSavedToast);
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-foreground">{t.creatorProfile.showcase}</h2>
                {isOwnProfile && (
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7" onClick={openShowcaseEdit}>
                    <Pencil className="w-3 h-3" /> {t.creatorProfile.editShowcase}
                  </Button>
                )}
              </div>
              {creator.showcase.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">{t.creatorProfile.emptyShowcase}</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {creator.showcase.map(work => (
                    <div key={work.id} className="rounded-lg border border-border overflow-hidden bg-muted">
                      <div className="h-24 bg-accent flex items-center justify-center">
                        <span className="text-3xl">{work.thumbnail}</span>
                      </div>
                      <div className="p-2.5">
                        <p className="text-xs font-medium text-foreground truncate">{work.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{work.duration}</p>
                        {work.description && (
                          <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">{work.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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

      {/* Showcase edit dialog — Own profile only */}
      <Dialog open={showcaseOpen} onOpenChange={setShowcaseOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">{t.creatorProfile.editShowcaseTitle}</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
              <GripVertical className="w-3.5 h-3.5" /> {t.creatorProfile.dragHint}
            </p>
            {formShowcase.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">{t.creatorProfile.emptyShowcase}</p>
            ) : (
              <div className="space-y-2">
                {formShowcase.map((work, i) => (
                  <div
                    key={work.id}
                    draggable
                    onDragStart={() => onDragStart(i)}
                    onDragOver={(e) => onDragOver(e, i)}
                    onDrop={(e) => onDrop(e, i)}
                    onDragEnd={onDragEnd}
                    className={cn(
                      "border rounded-lg p-3 bg-muted/30 transition-colors",
                      dragIndex === i ? "opacity-50" : "",
                      overIndex === i && dragIndex !== null && dragIndex !== i ? "border-primary border-dashed bg-accent" : "border-border"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <div className="cursor-grab active:cursor-grabbing text-muted-foreground pt-1 shrink-0" aria-label="drag">
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex gap-2">
                          <div>
                            <Label className="text-[10px] text-muted-foreground">{t.creatorProfile.workThumbnail}</Label>
                            <select
                              value={work.thumbnail}
                              onChange={(e) => updateShowcaseField(i, "thumbnail", e.target.value)}
                              className="mt-1 block w-14 h-8 rounded-md border border-input bg-background text-base text-center focus:outline-none focus:ring-1 focus:ring-ring"
                            >
                              {SHOWCASE_THUMBNAIL_OPTIONS.map((tn) => (
                                <option key={tn} value={tn}>{tn}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex-1">
                            <Label className="text-[10px] text-muted-foreground">{t.creatorProfile.workTitle}</Label>
                            <Input
                              value={work.title}
                              onChange={(e) => updateShowcaseField(i, "title", e.target.value)}
                              className="mt-1 h-8 text-xs"
                            />
                          </div>
                          <div className="w-24">
                            <Label className="text-[10px] text-muted-foreground">{t.creatorProfile.workDuration}</Label>
                            <Input
                              value={work.duration}
                              onChange={(e) => updateShowcaseField(i, "duration", e.target.value)}
                              placeholder={t.creatorProfile.workDurationPlaceholder}
                              className="mt-1 h-8 text-xs"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-[10px] text-muted-foreground">{t.creatorProfile.workDescription}</Label>
                          <Textarea
                            value={work.description ?? ""}
                            onChange={(e) => updateShowcaseField(i, "description", e.target.value)}
                            placeholder={t.creatorProfile.workDescriptionPlaceholder}
                            rows={2}
                            className="mt-1 resize-none text-xs"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeShowcaseItem(i)}
                        className="text-muted-foreground hover:text-destructive pt-1 shrink-0"
                        aria-label="remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 w-full gap-1.5 text-xs"
              onClick={addShowcaseItem}
            >
              <Plus className="w-3.5 h-3.5" /> {t.creatorProfile.addWork}
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowcaseOpen(false)}>{t.common.cancel}</Button>
            <Button onClick={saveShowcase}>{t.common.save}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              <p className="text-xs text-muted-foreground mt-1">{t.creatorProfile.specialtiesHint}</p>

              {/* Selected tags */}
              {formTags.length > 0 && (
                <div className="mt-3">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5">{t.creatorProfile.specialtiesPicked}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {formTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className="group inline-flex items-center gap-1 text-xs bg-primary text-white pl-2.5 pr-1.5 py-1 rounded-full hover:bg-primary/90"
                      >
                        {tag}
                        <X className="w-3 h-3 opacity-70 group-hover:opacity-100" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested tags */}
              <div className="mt-3">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5">{t.creatorProfile.specialtiesSuggested}</p>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_SPECIALTY_TAGS.filter((tag) => !formTags.includes(tag)).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className="inline-flex items-center gap-1 text-xs border border-border bg-white text-muted-foreground hover:border-primary/50 hover:text-foreground px-2.5 py-1 rounded-full transition-colors"
                    >
                      <Plus className="w-3 h-3" /> {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom tag input */}
              <div className="mt-3 flex gap-2">
                <Input
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomTag(); } }}
                  placeholder={t.creatorProfile.tagCustomPlaceholder}
                  className="text-sm h-8"
                />
                <Button type="button" size="sm" variant="outline" className="h-8 shrink-0" onClick={addCustomTag} disabled={!customTag.trim()}>
                  {t.creatorProfile.tagAddBtn}
                </Button>
              </div>
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
