"use client";
import { use, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import AppShell from "@/components/layout/AppShell";
import { CREATORS, PRESET_SPECIALTY_TAGS, MY_ASSETS_CREATED } from "@/lib/mock-data";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, Send, Pencil, X, Plus, GripVertical, Trash2, Camera, Check, Upload, FolderOpen, FileVideo } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useT } from "@/hooks/useT";

const OWN_CREATOR_ID = "u_creator_01";

type ShowcaseItem = {
  id: string;
  title: string;
  duration: string;
  description?: string;
  fileSource?: "local" | "asset";
  fileName?: string;
  assetId?: string;
};

type EditField = "nickname" | "bio" | "tags" | "rate" | "hours" | null;

export default function CreatorProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { activeRole, invitationSent, sendInvitation, creatorEdits, updateCreatorEdits, showcaseEdits, setShowcaseEdits } = useStore();
  const t = useT();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [showcaseOpen, setShowcaseOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingField, setEditingField] = useState<EditField>(null);

  const baseCreator = CREATORS.find(c => c.id === id) ?? CREATORS[0];
  const isOwnProfile = activeRole === "creator" && id === OWN_CREATOR_ID;
  const baseShowcaseAsItems: ShowcaseItem[] = baseCreator.showcase.map((s) => ({
    id: s.id, title: s.title, duration: s.duration,
  }));
  const showcase: ShowcaseItem[] = isOwnProfile && showcaseEdits ? showcaseEdits : baseShowcaseAsItems;
  const creator = isOwnProfile
    ? {
        ...baseCreator,
        nickname: creatorEdits.nickname ?? baseCreator.nickname,
        avatarUrl: creatorEdits.avatarUrl,
        bio: creatorEdits.bio ?? baseCreator.bio,
        specialties: creatorEdits.specialties ?? baseCreator.specialties,
        rateCard: { ...baseCreator.rateCard, from: creatorEdits.rateFrom ?? baseCreator.rateCard.from },
        activeHours: creatorEdits.activeHours ?? baseCreator.activeHours,
      }
    : { ...baseCreator, avatarUrl: undefined as string | undefined };

  // Inline field drafts
  const [draftNickname, setDraftNickname] = useState("");
  const [draftBio, setDraftBio] = useState("");
  const [draftTags, setDraftTags] = useState<string[]>([]);
  const [draftCustomTag, setDraftCustomTag] = useState("");
  const [draftRate, setDraftRate] = useState("");
  const [draftHours, setDraftHours] = useState("");

  const avatarInputRef = useRef<HTMLInputElement>(null);

  const enterEdit = (field: EditField) => {
    if (field === "nickname") setDraftNickname(creator.nickname);
    if (field === "bio") setDraftBio(creator.bio);
    if (field === "tags") { setDraftTags([...creator.specialties]); setDraftCustomTag(""); }
    if (field === "rate") setDraftRate(String(creator.rateCard.from));
    if (field === "hours") setDraftHours(creator.activeHours);
    setEditingField(field);
  };

  const cancelField = () => setEditingField(null);

  const saveField = () => {
    if (editingField === "nickname") updateCreatorEdits({ nickname: draftNickname.trim() || baseCreator.nickname });
    if (editingField === "bio") updateCreatorEdits({ bio: draftBio.trim() });
    if (editingField === "tags") updateCreatorEdits({ specialties: draftTags });
    if (editingField === "rate") updateCreatorEdits({ rateFrom: Number(draftRate) || baseCreator.rateCard.from });
    if (editingField === "hours") updateCreatorEdits({ activeHours: draftHours.trim() });
    setEditingField(null);
    toast.success(t.creatorProfile.savedToast);
  };

  const toggleTag = (tag: string) => {
    setDraftTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };
  const addCustomTag = () => {
    const v = draftCustomTag.trim();
    if (!v) return;
    if (!draftTags.includes(v)) setDraftTags((prev) => [...prev, v]);
    setDraftCustomTag("");
  };

  const handleAvatarPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateCreatorEdits({ avatarUrl: String(reader.result) });
      toast.success(t.creatorProfile.avatarUpdatedToast);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Showcase dialog state
  const [formShowcase, setFormShowcase] = useState<ShowcaseItem[]>(showcase);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [assetPickerForIdx, setAssetPickerForIdx] = useState<number | null>(null);
  const fileInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const openShowcaseEdit = () => {
    setFormShowcase(showcase.map((s) => ({ ...s })));
    setShowcaseOpen(true);
  };

  const addShowcaseItem = () => {
    setFormShowcase((prev) => [
      ...prev,
      { id: `sc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, title: "", duration: "", description: "" },
    ]);
  };
  const updateField = (i: number, field: keyof ShowcaseItem, value: string) => {
    setFormShowcase((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  };
  const removeItem = (i: number) => {
    setFormShowcase((prev) => prev.filter((_, idx) => idx !== i));
  };
  const formatDuration = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds <= 0) return "";
    const s = Math.round(seconds);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const ss = s % 60;
    const pad = (n: number) => String(n).padStart(2, "0");
    return h > 0 ? `${h}:${pad(m)}:${pad(ss)}` : `${m}:${pad(ss)}`;
  };

  const detectVideoDuration = (file: File): Promise<string> =>
    new Promise((resolve) => {
      if (!file.type.startsWith("video/")) return resolve("");
      const url = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.preload = "metadata";
      const cleanup = () => URL.revokeObjectURL(url);
      video.onloadedmetadata = () => {
        const d = formatDuration(video.duration);
        cleanup();
        resolve(d);
      };
      video.onerror = () => {
        cleanup();
        resolve("");
      };
      video.src = url;
    });

  const onLocalFilePick = async (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    // Set file metadata immediately
    setFormShowcase((prev) =>
      prev.map((s, idx) =>
        idx === i
          ? { ...s, fileSource: "local", fileName: file.name, assetId: undefined, title: s.title || file.name.replace(/\.[^.]+$/, ""), duration: "" }
          : s
      )
    );
    // Then detect duration asynchronously
    const dur = await detectVideoDuration(file);
    if (dur) {
      setFormShowcase((prev) => prev.map((s, idx) => (idx === i ? { ...s, duration: dur } : s)));
    }
  };
  const pickAsset = (asset: typeof MY_ASSETS_CREATED[number]) => {
    if (assetPickerForIdx === null) return;
    setFormShowcase((prev) =>
      prev.map((s, idx) =>
        idx === assetPickerForIdx
          ? { ...s, fileSource: "asset", assetId: asset.id, fileName: asset.title, title: s.title || asset.title, duration: asset.duration ?? "" }
          : s
      )
    );
    setAssetPickerForIdx(null);
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
  const onDragEnd = () => { setDragIndex(null); setOverIndex(null); };
  const saveShowcase = () => {
    setShowcaseEdits(formShowcase.filter((s) => s.title.trim() || s.fileName));
    setShowcaseOpen(false);
    toast.success(t.creatorProfile.showcaseSavedToast);
  };

  // Helpers that return JSX — declared as functions to avoid creating React
  // components inside render (lint rule react-hooks/static-components).
  const editIcon = (field: EditField) =>
    isOwnProfile && isEditing && editingField !== field ? (
      <button
        type="button"
        onClick={() => enterEdit(field)}
        className="text-muted-foreground hover:text-primary inline-flex items-center justify-center w-5 h-5 rounded hover:bg-accent ml-1"
        aria-label="edit"
      >
        <Pencil className="w-3 h-3" />
      </button>
    ) : null;

  const fieldActions = () => (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={saveField}
        className="inline-flex items-center justify-center w-6 h-6 rounded bg-primary text-white hover:bg-primary/90"
        aria-label="confirm"
      >
        <Check className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={cancelField}
        className="inline-flex items-center justify-center w-6 h-6 rounded border border-border text-muted-foreground hover:text-foreground"
        aria-label="cancel"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-6 py-8">
        <Link href="/market/creators" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> {t.creatorProfile.backToCreators}
        </Link>

        {/* Editing mode hint */}
        {isOwnProfile && isEditing && (
          <div className="mb-4 bg-accent border border-primary/20 rounded-lg px-4 py-2.5 flex items-center justify-between">
            <p className="text-xs text-foreground/80 flex items-center gap-1.5">
              <Pencil className="w-3 h-3 text-primary" /> {t.creatorProfile.editingHint}
            </p>
            <Button size="sm" className="gap-1.5 text-xs h-7" onClick={() => { setIsEditing(false); setEditingField(null); }}>
              <Check className="w-3 h-3" /> {t.creatorProfile.editDone}
            </Button>
          </div>
        )}

        <div className="space-y-5">
            {/* Header card */}
            <div className="bg-white border border-border rounded-xl p-6">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="relative shrink-0">
                  {creator.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={creator.avatarUrl}
                      alt={creator.nickname}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className={cn("w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold", creator.avatarColor)}>
                      {creator.avatar}
                    </div>
                  )}
                  {isOwnProfile && isEditing && (
                    <>
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        className="absolute inset-0 w-16 h-16 rounded-full bg-black/55 text-white flex flex-col items-center justify-center gap-0.5 opacity-0 hover:opacity-100 transition-opacity"
                        aria-label="upload avatar"
                      >
                        <Camera className="w-4 h-4" />
                        <span className="text-[9px] leading-tight text-center px-1">{t.creatorProfile.uploadAvatar}</span>
                      </button>
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarPick}
                      />
                    </>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    {editingField === "nickname" ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input value={draftNickname} onChange={(e) => setDraftNickname(e.target.value)} className="h-8 text-base font-bold" autoFocus />
                        {fieldActions()}
                      </div>
                    ) : (
                      <h1 className="text-lg font-bold text-foreground flex items-center">
                        {creator.nickname}
                        {editIcon("nickname")}
                      </h1>
                    )}
                    {isOwnProfile && !isEditing && (
                      <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7 shrink-0" onClick={() => setIsEditing(true)}>
                        <Pencil className="w-3 h-3" /> {t.creatorProfile.editProfile}
                      </Button>
                    )}
                    {isOwnProfile && isEditing && (
                      <Button size="sm" className="gap-1.5 text-xs h-7 shrink-0" onClick={() => { setIsEditing(false); setEditingField(null); }}>
                        <Check className="w-3 h-3" /> {t.creatorProfile.editDone}
                      </Button>
                    )}
                    {activeRole === "backer" && (
                      invitationSent ? (
                        <Badge className="bg-accent text-primary border-0 text-xs h-7 px-3 shrink-0 flex items-center">{t.creatorProfile.invitationSent}</Badge>
                      ) : (
                        <Button size="sm" className="gap-1.5 text-xs h-7 shrink-0" onClick={() => setInviteOpen(true)}>
                          <Send className="w-3 h-3" /> {t.creatorProfile.sendInvitation}
                        </Button>
                      )
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

                  {/* Tags row */}
                  {editingField === "tags" ? (
                    <div className="mt-3 rounded-lg border border-border bg-muted/40 p-3 space-y-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5">{t.creatorProfile.specialtiesPicked}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {draftTags.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
                          {draftTags.map((tag) => (
                            <button key={tag} type="button" onClick={() => toggleTag(tag)} className="group inline-flex items-center gap-1 text-xs bg-primary text-white pl-2.5 pr-1.5 py-1 rounded-full hover:bg-primary/90">
                              {tag}
                              <X className="w-3 h-3 opacity-70 group-hover:opacity-100" />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5">{t.creatorProfile.specialtiesSuggested}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {PRESET_SPECIALTY_TAGS.filter((tag) => !draftTags.includes(tag)).map((tag) => (
                            <button key={tag} type="button" onClick={() => toggleTag(tag)} className="inline-flex items-center gap-1 text-xs border border-border bg-white text-muted-foreground hover:border-primary/50 hover:text-foreground px-2.5 py-1 rounded-full transition-colors">
                              <Plus className="w-3 h-3" /> {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Input value={draftCustomTag} onChange={(e) => setDraftCustomTag(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomTag(); } }} placeholder={t.creatorProfile.tagCustomPlaceholder} className="text-sm h-8" />
                        <Button type="button" size="sm" variant="outline" className="h-8 shrink-0" onClick={addCustomTag} disabled={!draftCustomTag.trim()}>{t.creatorProfile.tagAddBtn}</Button>
                      </div>
                      <div className="flex justify-end">{fieldActions()}</div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 mt-2 items-center">
                      {creator.specialties.map(s => (
                        <span key={s} className="text-xs bg-accent text-primary px-2.5 py-0.5 rounded-full">{s}</span>
                      ))}
                      {editIcon("tags")}
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              {editingField === "bio" ? (
                <div className="mt-4 flex items-start gap-2">
                  <Textarea value={draftBio} onChange={(e) => setDraftBio(e.target.value)} rows={3} className="text-sm resize-none flex-1" autoFocus />
                  <div className="pt-1">{fieldActions()}</div>
                </div>
              ) : (
                <div className="mt-4 flex items-start gap-1">
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{creator.bio}</p>
                  {editIcon("bio")}
                </div>
              )}

              {/* Active hours + rate row */}
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border text-xs text-muted-foreground flex-wrap">
                {editingField === "hours" ? (
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span>{t.creatorProfile.activeLabel}</span>
                    <Input value={draftHours} onChange={(e) => setDraftHours(e.target.value)} className="h-7 text-xs" autoFocus placeholder={t.creatorProfile.activeHoursPlaceholder} />
                    {fieldActions()}
                  </div>
                ) : (
                  <span className="flex items-center">
                    {t.creatorProfile.activeLabel} {creator.activeHours}
                    {editIcon("hours")}
                  </span>
                )}
                <span className="text-muted-foreground/50">·</span>
                {editingField === "rate" ? (
                  <div className="flex items-center gap-2">
                    <span>{t.creators.fromLabel} ¥</span>
                    <Input type="number" value={draftRate} onChange={(e) => setDraftRate(e.target.value)} className="h-7 text-xs w-24" autoFocus />
                    <span>{t.creatorProfile.fromPerProject}</span>
                    {fieldActions()}
                  </div>
                ) : (
                  <span className="flex items-center">
                    {t.creators.fromLabel} <span className="font-semibold text-foreground mx-1">¥{creator.rateCard.from.toLocaleString()}+</span> {t.creatorProfile.fromPerProject}
                    {editIcon("rate")}
                  </span>
                )}
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
                  {showcase.map(work => (
                    <div key={work.id} className="rounded-lg border border-border overflow-hidden bg-muted">
                      <div className="aspect-video bg-gradient-to-br from-accent via-accent/60 to-muted flex items-center justify-center">
                        <FileVideo className="w-7 h-7 text-primary/70" />
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium text-foreground truncate">{work.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{work.duration}</p>
                        {work.description && (
                          <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">{work.description}</p>
                        )}
                        {work.fileName && (
                          <p className="text-[10px] text-primary/80 mt-1.5 truncate flex items-center gap-1">
                            <FileVideo className="w-2.5 h-2.5" /> {work.fileName}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
        </div>
      </div>

      {/* Showcase edit dialog */}
      <Dialog open={showcaseOpen} onOpenChange={setShowcaseOpen}>
        <DialogContent className="sm:max-w-5xl max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">{t.creatorProfile.editShowcaseTitle}</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
              <GripVertical className="w-3.5 h-3.5" /> {t.creatorProfile.dragHint}
            </p>

            {formShowcase.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">{t.creatorProfile.emptyShowcase}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {formShowcase.map((work, i) => (
                  <div
                    key={work.id}
                    draggable
                    onDragStart={() => onDragStart(i)}
                    onDragOver={(e) => onDragOver(e, i)}
                    onDrop={(e) => onDrop(e, i)}
                    onDragEnd={onDragEnd}
                    className={cn(
                      "border rounded-xl bg-white transition-colors",
                      dragIndex === i ? "opacity-50" : "",
                      overIndex === i && dragIndex !== null && dragIndex !== i ? "border-primary border-dashed bg-accent/30" : "border-border"
                    )}
                  >
                    {/* Top bar: drag + delete */}
                    <div className="flex items-center justify-between px-3 py-1.5 border-b border-border">
                      <div className="cursor-grab active:cursor-grabbing text-muted-foreground" title="drag">
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <button type="button" onClick={() => removeItem(i)} className="text-muted-foreground hover:text-destructive" aria-label="remove">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* File area */}
                    <div className="p-3">
                      <div className="aspect-video rounded-lg border border-dashed border-border bg-muted/40 flex flex-col items-center justify-center text-center px-3">
                        {work.fileName ? (
                          <>
                            <FileVideo className="w-7 h-7 text-primary mb-1.5" />
                            <p className="text-xs font-medium text-foreground truncate max-w-full">{work.fileName}</p>
                            <Badge variant="outline" className="mt-1.5 text-[10px] border-primary/30 text-primary bg-accent gap-1">
                              {work.fileSource === "asset" ? <FolderOpen className="w-2.5 h-2.5" /> : <Upload className="w-2.5 h-2.5" />}
                              {work.fileSource === "asset" ? t.creatorProfile.sourceAsset : t.creatorProfile.sourceLocal}
                            </Badge>
                          </>
                        ) : (
                          <>
                            <FileVideo className="w-7 h-7 text-muted-foreground/60 mb-1.5" />
                            <p className="text-xs text-muted-foreground">{t.creatorProfile.noAttachedFile}</p>
                          </>
                        )}
                      </div>

                      <div className="flex gap-2 mt-2">
                        <input
                          ref={(el) => { fileInputsRef.current[i] = el; }}
                          type="file"
                          accept="video/*,image/*"
                          className="hidden"
                          onChange={(e) => onLocalFilePick(i, e)}
                        />
                        <Button
                          type="button" size="sm" variant="outline"
                          className="flex-1 text-[11px] h-8 gap-1"
                          onClick={() => fileInputsRef.current[i]?.click()}
                        >
                          <Upload className="w-3 h-3" />
                          {work.fileName ? t.creatorProfile.replaceFile : t.creatorProfile.uploadFile}
                        </Button>
                        <Button
                          type="button" size="sm" variant="outline"
                          className="flex-1 text-[11px] h-8 gap-1"
                          onClick={() => setAssetPickerForIdx(i)}
                        >
                          <FolderOpen className="w-3 h-3" /> {t.creatorProfile.pickFromAssets}
                        </Button>
                      </div>

                      {/* Title + duration */}
                      <div className="mt-3 space-y-2">
                        <div>
                          <Label className="text-[10px] text-muted-foreground">{t.creatorProfile.workTitle}</Label>
                          <Input value={work.title} onChange={(e) => updateField(i, "title", e.target.value)} className="mt-1 h-8 text-xs" />
                        </div>
                        <div>
                          <Label className="text-[10px] text-muted-foreground flex items-center gap-1">
                            {t.creatorProfile.workDuration}
                            <span className="text-[9px] text-primary/70 font-normal">· {t.creatorProfile.workDurationAutoHint}</span>
                          </Label>
                          <Input
                            value={work.duration}
                            readOnly
                            tabIndex={-1}
                            placeholder={t.creatorProfile.workDurationPlaceholder}
                            className="mt-1 h-8 text-xs bg-muted/60 cursor-default focus-visible:ring-0 focus-visible:border-input"
                          />
                        </div>
                        <div>
                          <Label className="text-[10px] text-muted-foreground">{t.creatorProfile.workDescription}</Label>
                          <Textarea value={work.description ?? ""} onChange={(e) => updateField(i, "description", e.target.value)} placeholder={t.creatorProfile.workDescriptionPlaceholder} rows={2} className="mt-1 resize-none text-xs" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add new tile */}
                <button
                  type="button"
                  onClick={addShowcaseItem}
                  className="border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors py-12"
                >
                  <Plus className="w-6 h-6 mb-1" />
                  <span className="text-xs">{t.creatorProfile.addWork}</span>
                </button>
              </div>
            )}
            {formShowcase.length === 0 && (
              <div className="mt-4 flex justify-center">
                <Button type="button" variant="outline" size="sm" className="gap-1.5 text-xs" onClick={addShowcaseItem}>
                  <Plus className="w-3.5 h-3.5" /> {t.creatorProfile.addWork}
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowcaseOpen(false)}>{t.common.cancel}</Button>
            <Button onClick={saveShowcase}>{t.common.save}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Asset picker sub-dialog */}
      <Dialog open={assetPickerForIdx !== null} onOpenChange={(open) => { if (!open) setAssetPickerForIdx(null); }}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">{t.creatorProfile.pickAssetTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            {MY_ASSETS_CREATED.map((asset) => (
              <button
                key={asset.id}
                type="button"
                onClick={() => pickAsset(asset)}
                className="w-full border border-border rounded-lg p-3 flex items-center gap-3 hover:border-primary/40 hover:bg-accent/30 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-md bg-accent flex items-center justify-center shrink-0">
                  <FileVideo className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{asset.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{asset.size} · {asset.createdAt}</p>
                </div>
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssetPickerForIdx(null)}>{t.common.cancel}</Button>
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
