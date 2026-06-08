"use client";
import { use, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import AppShell from "@/components/layout/AppShell";
import {
  CREATORS,
  PRESET_SPECIALTY_TAGS,
  MY_ASSETS_CREATED,
  findSessionForCounterpart,
} from "@/lib/mock-data";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  MessageCircle,
  Pencil,
  X,
  Plus,
  GripVertical,
  Trash2,
  Camera,
  Check,
  Upload,
  FolderOpen,
  FileVideo,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  const { activeRole, creatorEdits, updateCreatorEdits, showcaseEdits, setShowcaseEdits } =
    useStore();
  const router = useRouter();
  const t = useT();
  const [showcaseOpen, setShowcaseOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingField, setEditingField] = useState<EditField>(null);

  const startConversation = () => {
    const sid = findSessionForCounterpart("backer", id);
    router.push(sid ? `/messages/sessions/${sid}` : "/messages");
  };

  const baseCreator = CREATORS.find((c) => c.id === id) ?? CREATORS[0];
  const isOwnProfile = activeRole === "creator" && id === OWN_CREATOR_ID;
  const baseShowcaseAsItems: ShowcaseItem[] = baseCreator.showcase.map((s) => ({
    id: s.id,
    title: s.title,
    duration: s.duration,
  }));
  const showcase: ShowcaseItem[] =
    isOwnProfile && showcaseEdits ? showcaseEdits : baseShowcaseAsItems;
  const creator = isOwnProfile
    ? {
        ...baseCreator,
        nickname: creatorEdits.nickname ?? baseCreator.nickname,
        avatarUrl: creatorEdits.avatarUrl,
        bio: creatorEdits.bio ?? baseCreator.bio,
        specialties: creatorEdits.specialties ?? baseCreator.specialties,
        rateCard: {
          ...baseCreator.rateCard,
          from: creatorEdits.rateFrom ?? baseCreator.rateCard.from,
        },
        activeHours: creatorEdits.activeHours ?? baseCreator.activeHours,
        showcase,
      }
    : { ...baseCreator, avatarUrl: undefined as string | undefined };

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
    if (field === "tags") {
      setDraftTags([...creator.specialties]);
      setDraftCustomTag("");
    }
    if (field === "rate") setDraftRate(String(creator.rateCard.from));
    if (field === "hours") setDraftHours(creator.activeHours);
    setEditingField(field);
  };

  const cancelField = () => setEditingField(null);

  const saveField = () => {
    if (editingField === "nickname")
      updateCreatorEdits({ nickname: draftNickname.trim() || baseCreator.nickname });
    if (editingField === "bio") updateCreatorEdits({ bio: draftBio.trim() });
    if (editingField === "tags") updateCreatorEdits({ specialties: draftTags });
    if (editingField === "rate")
      updateCreatorEdits({ rateFrom: Number(draftRate) || baseCreator.rateCard.from });
    if (editingField === "hours") updateCreatorEdits({ activeHours: draftHours.trim() });
    setEditingField(null);
    toast.success(t.creatorProfile.savedToast);
  };

  const toggleTag = (tag: string) =>
    setDraftTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
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

  const addShowcaseItem = () =>
    setFormShowcase((prev) => [
      ...prev,
      {
        id: `sc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        title: "",
        duration: "",
        description: "",
      },
    ]);

  const updateShowcaseField = (i: number, field: keyof ShowcaseItem, value: string) =>
    setFormShowcase((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));

  const removeShowcaseItem = (i: number) =>
    setFormShowcase((prev) => prev.filter((_, idx) => idx !== i));

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
    setFormShowcase((prev) =>
      prev.map((s, idx) =>
        idx === i
          ? {
              ...s,
              fileSource: "local",
              fileName: file.name,
              assetId: undefined,
              title: s.title || file.name.replace(/\.[^.]+$/, ""),
              duration: "",
            }
          : s
      )
    );
    const dur = await detectVideoDuration(file);
    if (dur)
      setFormShowcase((prev) => prev.map((s, idx) => (idx === i ? { ...s, duration: dur } : s)));
  };

  const pickAsset = (asset: (typeof MY_ASSETS_CREATED)[number]) => {
    if (assetPickerForIdx === null) return;
    setFormShowcase((prev) =>
      prev.map((s, idx) =>
        idx === assetPickerForIdx
          ? {
              ...s,
              fileSource: "asset",
              assetId: asset.id,
              fileName: asset.title,
              title: s.title || asset.title,
              duration: asset.duration ?? "",
            }
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
  const onDragEnd = () => {
    setDragIndex(null);
    setOverIndex(null);
  };
  const saveShowcase = () => {
    setShowcaseEdits(formShowcase.filter((s) => s.title.trim() || s.fileName));
    setShowcaseOpen(false);
    toast.success(t.creatorProfile.showcaseSavedToast);
  };

  // Helpers
  const editIcon = (field: EditField) =>
    isOwnProfile && isEditing && editingField !== field ? (
      <button
        type="button"
        onClick={() => enterEdit(field)}
        className="text-on-surface-variant hover:text-primary inline-flex items-center justify-center w-6 h-6 rounded hover:bg-surface-container ml-1"
        aria-label="edit"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>
    ) : null;

  const fieldActions = () => (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={saveField}
        className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-primary text-on-primary hover:opacity-90"
        aria-label="confirm"
      >
        <Check className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={cancelField}
        className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-high"
        aria-label="cancel"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-6 md:px-12 pt-8 pb-16">
        <Link
          href="/market/creators"
          className="inline-flex items-center gap-1.5 font-label text-label-md uppercase tracking-wider text-on-surface-variant hover:text-on-surface mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> {t.creatorProfile.backToCreators}
        </Link>

        {isOwnProfile && isEditing && (
          <div className="mb-6 bg-primary-container/60 border border-primary/20 rounded-xl px-5 py-3 flex items-center justify-between">
            <p className="font-body text-sm text-on-primary-container flex items-center gap-2">
              <Pencil className="w-3.5 h-3.5 text-primary" /> {t.creatorProfile.editingHint}
            </p>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditingField(null);
              }}
              className="flex items-center gap-1.5 font-label text-label-md uppercase tracking-wider bg-primary text-on-primary px-3 py-1.5 rounded-lg hover:opacity-90"
            >
              <Check className="w-3.5 h-3.5" /> {t.creatorProfile.editDone}
            </button>
          </div>
        )}

        <div className="space-y-6">
          {/* Header card */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8">
            <div className="flex items-start gap-5">
              {/* Avatar */}
              <div className="relative shrink-0">
                {creator.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={creator.avatarUrl}
                    alt={creator.nickname}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className={cn(
                      "w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold",
                      creator.avatarColor
                    )}
                  >
                    {creator.avatar}
                  </div>
                )}
                {isOwnProfile && isEditing && (
                  <>
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="absolute inset-0 w-20 h-20 rounded-full bg-black/55 text-white flex flex-col items-center justify-center gap-1 opacity-0 hover:opacity-100 transition-opacity"
                      aria-label="upload avatar"
                    >
                      <Camera className="w-4 h-4" />
                      <span className="font-label text-[9px] uppercase tracking-wider px-1 text-center leading-tight">
                        {t.creatorProfile.uploadAvatar}
                      </span>
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
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  {editingField === "nickname" ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        value={draftNickname}
                        onChange={(e) => setDraftNickname(e.target.value)}
                        className="flex-1 px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg focus:border-primary focus:outline-none font-headline text-[24px]"
                        autoFocus
                      />
                      {fieldActions()}
                    </div>
                  ) : (
                    <h1 className="font-headline text-headline-md text-on-surface flex items-center">
                      {creator.nickname}
                      {editIcon("nickname")}
                    </h1>
                  )}
                  <div className="flex items-center gap-2 shrink-0">
                    {isOwnProfile && !isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-1.5 font-label text-label-md uppercase tracking-wider px-3 py-1.5 border border-outline-variant rounded-lg hover:bg-surface-container-high"
                      >
                        <Pencil className="w-3.5 h-3.5" /> {t.creatorProfile.editProfile}
                      </button>
                    )}
                    {isOwnProfile && isEditing && (
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditingField(null);
                        }}
                        className="flex items-center gap-1.5 font-label text-label-md uppercase tracking-wider bg-primary text-on-primary px-3 py-1.5 rounded-lg hover:opacity-90"
                      >
                        <Check className="w-3.5 h-3.5" /> {t.creatorProfile.editDone}
                      </button>
                    )}
                    {activeRole === "backer" && (
                      <button
                        onClick={startConversation}
                        className="flex items-center gap-1.5 font-label text-label-md uppercase tracking-wider bg-primary text-on-primary px-3 py-1.5 rounded-lg hover:opacity-90"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> {t.chat.startConversation}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <Star className="w-3.5 h-3.5 fill-tertiary text-tertiary" />
                  <span className="font-label text-label-md uppercase tracking-wider text-on-surface-variant">
                    {creator.rating} · {creator.orders} {t.creatorProfile.projectsCompleted}
                  </span>
                </div>

                {/* Tags */}
                {editingField === "tags" ? (
                  <div className="mt-4 rounded-xl border border-outline-variant/40 bg-surface-container-low p-4 space-y-3">
                    <div>
                      <p className="font-label text-[10px] uppercase tracking-wider text-on-surface-variant mb-2">
                        {t.creatorProfile.specialtiesPicked}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {draftTags.length === 0 && (
                          <span className="font-body text-xs text-on-surface-variant">—</span>
                        )}
                        {draftTags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(tag)}
                            className="group inline-flex items-center gap-1 font-label text-[11px] uppercase tracking-wider bg-primary text-on-primary pl-3 pr-2 py-1 rounded-full hover:opacity-90"
                          >
                            {tag}
                            <X className="w-3 h-3 opacity-70 group-hover:opacity-100" />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="font-label text-[10px] uppercase tracking-wider text-on-surface-variant mb-2">
                        {t.creatorProfile.specialtiesSuggested}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_SPECIALTY_TAGS.filter((tag) => !draftTags.includes(tag)).map(
                          (tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => toggleTag(tag)}
                              className="inline-flex items-center gap-1 font-label text-[11px] uppercase tracking-wider border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:border-primary/40 hover:text-on-surface px-3 py-1 rounded-full transition-colors"
                            >
                              <Plus className="w-3 h-3" /> {tag}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={draftCustomTag}
                        onChange={(e) => setDraftCustomTag(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addCustomTag();
                          }
                        }}
                        placeholder={t.creatorProfile.tagCustomPlaceholder}
                        className="flex-1 px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg focus:border-primary focus:outline-none font-body text-sm"
                      />
                      <button
                        type="button"
                        onClick={addCustomTag}
                        disabled={!draftCustomTag.trim()}
                        className="font-label text-label-md uppercase tracking-wider px-3 py-2 border border-outline-variant rounded-lg hover:bg-surface-container-high disabled:opacity-50"
                      >
                        {t.creatorProfile.tagAddBtn}
                      </button>
                    </div>
                    <div className="flex justify-end">{fieldActions()}</div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5 mt-3 items-center">
                    {creator.specialties.map((s) => (
                      <span
                        key={s}
                        className="font-label text-[11px] uppercase tracking-widest bg-primary-container text-on-primary-container px-2.5 py-1 rounded-full"
                      >
                        {s}
                      </span>
                    ))}
                    {editIcon("tags")}
                  </div>
                )}
              </div>
            </div>

            {/* Bio */}
            {editingField === "bio" ? (
              <div className="mt-5 flex items-start gap-2">
                <textarea
                  value={draftBio}
                  onChange={(e) => setDraftBio(e.target.value)}
                  rows={3}
                  className="flex-1 px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl focus:border-primary focus:outline-none font-body text-sm resize-none"
                  autoFocus
                />
                <div className="pt-1">{fieldActions()}</div>
              </div>
            ) : (
              <div className="mt-5 flex items-start gap-1">
                <p className="font-body text-sm text-on-surface-variant leading-relaxed flex-1">
                  {creator.bio}
                </p>
                {editIcon("bio")}
              </div>
            )}

            {/* Hours + rate */}
            <div className="flex items-center gap-3 mt-6 pt-5 border-t border-outline-variant/30 text-sm flex-wrap">
              {editingField === "hours" ? (
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="font-label text-label-md uppercase tracking-wider text-on-surface-variant">
                    {t.creatorProfile.activeLabel}
                  </span>
                  <input
                    value={draftHours}
                    onChange={(e) => setDraftHours(e.target.value)}
                    className="flex-1 min-w-0 px-3 py-1.5 bg-surface-container-low border border-outline-variant rounded-lg focus:border-primary focus:outline-none font-body text-sm"
                    autoFocus
                  />
                  {fieldActions()}
                </div>
              ) : (
                <span className="flex items-center font-label text-label-md uppercase tracking-wider text-on-surface-variant">
                  {t.creatorProfile.activeLabel}{" "}
                  <span className="font-body text-on-surface ml-1">{creator.activeHours}</span>
                  {editIcon("hours")}
                </span>
              )}
              <span className="text-on-surface-variant/40">·</span>
              {editingField === "rate" ? (
                <div className="flex items-center gap-2">
                  <span className="font-label text-label-md uppercase tracking-wider text-on-surface-variant">
                    {t.creators.fromLabel} ¥
                  </span>
                  <input
                    type="number"
                    value={draftRate}
                    onChange={(e) => setDraftRate(e.target.value)}
                    className="w-24 px-3 py-1.5 bg-surface-container-low border border-outline-variant rounded-lg focus:border-primary focus:outline-none font-body text-sm"
                    autoFocus
                  />
                  <span className="font-label text-label-md uppercase tracking-wider text-on-surface-variant">
                    {t.creatorProfile.fromPerProject}
                  </span>
                  {fieldActions()}
                </div>
              ) : (
                <span className="flex items-center font-label text-label-md uppercase tracking-wider text-on-surface-variant">
                  {t.creators.fromLabel}{" "}
                  <span className="font-body font-bold text-on-surface mx-1">
                    ¥{creator.rateCard.from.toLocaleString()}+
                  </span>{" "}
                  {t.creatorProfile.fromPerProject}
                  {editIcon("rate")}
                </span>
              )}
            </div>
          </div>

          {/* Showcase */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-label text-label-md uppercase tracking-[0.2em] text-on-surface-variant">
                {t.creatorProfile.showcase}
              </h2>
              {isOwnProfile && (
                <button
                  onClick={openShowcaseEdit}
                  className="flex items-center gap-1.5 font-label text-label-md uppercase tracking-wider px-3 py-1.5 border border-outline-variant rounded-lg hover:bg-surface-container-high"
                >
                  <Pencil className="w-3.5 h-3.5" /> {t.creatorProfile.editShowcase}
                </button>
              )}
            </div>
            {creator.showcase.length === 0 ? (
              <p className="font-body text-sm text-on-surface-variant text-center py-10">
                {t.creatorProfile.emptyShowcase}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {showcase.map((work, i) => (
                  <div
                    key={work.id}
                    className={cn(
                      "rounded-2xl overflow-hidden bg-surface-container border border-outline-variant/30 group"
                    )}
                  >
                    <div
                      className={cn(
                        "aspect-video flex items-center justify-center bg-gradient-to-br",
                        i % 3 === 0 &&
                          "from-primary-container via-primary-fixed to-tertiary-container",
                        i % 3 === 1 &&
                          "from-tertiary-container via-tertiary-fixed to-primary-container",
                        i % 3 === 2 &&
                          "from-secondary-container via-secondary-fixed to-primary-container"
                      )}
                    >
                      <FileVideo className="w-7 h-7 text-primary opacity-70" />
                    </div>
                    <div className="p-4">
                      <p className="font-headline text-[16px] text-on-surface truncate">
                        {work.title}
                      </p>
                      <p className="font-label text-label-md uppercase tracking-wider text-on-surface-variant mt-1">
                        {work.duration}
                      </p>
                      {work.description && (
                        <p className="font-body text-xs text-on-surface-variant mt-2 leading-relaxed line-clamp-2">
                          {work.description}
                        </p>
                      )}
                      {work.fileName && (
                        <p className="font-label text-[10px] uppercase tracking-widest text-primary/80 mt-2 truncate flex items-center gap-1">
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
            <DialogTitle className="font-headline text-[22px]">
              {t.creatorProfile.editShowcaseTitle}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="font-label text-label-md uppercase tracking-wider text-on-surface-variant mb-4 flex items-center gap-1.5">
              <GripVertical className="w-3.5 h-3.5" /> {t.creatorProfile.dragHint}
            </p>

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
                    "border rounded-2xl bg-surface-container-lowest transition-colors",
                    dragIndex === i ? "opacity-50" : "",
                    overIndex === i && dragIndex !== null && dragIndex !== i
                      ? "border-primary border-dashed bg-primary-container/40"
                      : "border-outline-variant/40"
                  )}
                >
                  <div className="flex items-center justify-between px-3 py-2 border-b border-outline-variant/30">
                    <div
                      className="cursor-grab active:cursor-grabbing text-on-surface-variant"
                      title="drag"
                    >
                      <GripVertical className="w-4 h-4" />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeShowcaseItem(i)}
                      className="text-on-surface-variant hover:text-error"
                      aria-label="remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-4">
                    <div className="aspect-video rounded-xl border border-dashed border-outline-variant bg-surface-container-low flex flex-col items-center justify-center text-center px-3">
                      {work.fileName ? (
                        <>
                          <FileVideo className="w-7 h-7 text-primary mb-2" />
                          <p className="font-body text-xs font-bold text-on-surface truncate max-w-full">
                            {work.fileName}
                          </p>
                          <span className="mt-2 inline-flex items-center gap-1 font-label text-[10px] uppercase tracking-widest bg-primary-container text-on-primary-container px-2 py-0.5 rounded-full">
                            {work.fileSource === "asset" ? (
                              <FolderOpen className="w-2.5 h-2.5" />
                            ) : (
                              <Upload className="w-2.5 h-2.5" />
                            )}
                            {work.fileSource === "asset"
                              ? t.creatorProfile.sourceAsset
                              : t.creatorProfile.sourceLocal}
                          </span>
                        </>
                      ) : (
                        <>
                          <FileVideo className="w-7 h-7 text-on-surface-variant/60 mb-2" />
                          <p className="font-body text-xs text-on-surface-variant">
                            {t.creatorProfile.noAttachedFile}
                          </p>
                        </>
                      )}
                    </div>

                    <div className="flex gap-2 mt-3">
                      <input
                        ref={(el) => {
                          fileInputsRef.current[i] = el;
                        }}
                        type="file"
                        accept="video/*,image/*"
                        className="hidden"
                        onChange={(e) => onLocalFilePick(i, e)}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputsRef.current[i]?.click()}
                        className="flex-1 flex items-center justify-center gap-1 font-label text-[11px] uppercase tracking-wider py-2 border border-outline-variant rounded-lg hover:bg-surface-container-high"
                      >
                        <Upload className="w-3 h-3" />
                        {work.fileName ? t.creatorProfile.replaceFile : t.creatorProfile.uploadFile}
                      </button>
                      <button
                        type="button"
                        onClick={() => setAssetPickerForIdx(i)}
                        className="flex-1 flex items-center justify-center gap-1 font-label text-[11px] uppercase tracking-wider py-2 border border-outline-variant rounded-lg hover:bg-surface-container-high"
                      >
                        <FolderOpen className="w-3 h-3" /> {t.creatorProfile.pickFromAssets}
                      </button>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div>
                        <label className="font-label text-label-md uppercase tracking-wider text-on-surface-variant block mb-1.5">
                          {t.creatorProfile.workTitle}
                        </label>
                        <input
                          value={work.title}
                          onChange={(e) => updateShowcaseField(i, "title", e.target.value)}
                          className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg focus:border-primary focus:outline-none font-body text-sm"
                        />
                      </div>
                      <div>
                        <label className="font-label text-label-md uppercase tracking-wider text-on-surface-variant block mb-1.5 flex items-center gap-1">
                          {t.creatorProfile.workDuration}
                          <span className="font-label text-[9px] text-primary/70 normal-case">
                            · {t.creatorProfile.workDurationAutoHint}
                          </span>
                        </label>
                        <input
                          value={work.duration}
                          readOnly
                          tabIndex={-1}
                          placeholder={t.creatorProfile.workDurationPlaceholder}
                          className="w-full px-3 py-2 bg-surface-container border border-outline-variant rounded-lg cursor-default font-body text-sm focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="font-label text-label-md uppercase tracking-wider text-on-surface-variant block mb-1.5">
                          {t.creatorProfile.workDescription}
                        </label>
                        <textarea
                          value={work.description ?? ""}
                          onChange={(e) => updateShowcaseField(i, "description", e.target.value)}
                          placeholder={t.creatorProfile.workDescriptionPlaceholder}
                          rows={2}
                          className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg focus:border-primary focus:outline-none font-body text-sm resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addShowcaseItem}
                className="border-2 border-dashed border-outline-variant rounded-2xl flex flex-col items-center justify-center text-on-surface-variant hover:border-primary/40 hover:text-primary transition-colors py-16"
              >
                <Plus className="w-7 h-7 mb-2" />
                <span className="font-label text-label-md uppercase tracking-wider">
                  {t.creatorProfile.addWork}
                </span>
              </button>
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setShowcaseOpen(false)}
              className="font-label text-label-md uppercase tracking-wider px-4 py-2 border border-outline-variant rounded-lg hover:bg-surface-container-high"
            >
              {t.common.cancel}
            </button>
            <button
              onClick={saveShowcase}
              className="font-label text-label-md uppercase tracking-wider px-4 py-2 bg-primary text-on-primary rounded-lg hover:opacity-90"
            >
              {t.common.save}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Asset picker */}
      <Dialog
        open={assetPickerForIdx !== null}
        onOpenChange={(open) => {
          if (!open) setAssetPickerForIdx(null);
        }}
      >
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-headline text-[20px]">
              {t.creatorProfile.pickAssetTitle}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            {MY_ASSETS_CREATED.map((asset) => (
              <button
                key={asset.id}
                type="button"
                onClick={() => pickAsset(asset)}
                className="w-full border border-outline-variant/40 rounded-xl p-4 flex items-center gap-3 hover:border-primary/40 hover:bg-primary-container/30 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
                  <FileVideo className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm font-bold text-on-surface truncate">
                    {asset.title}
                  </p>
                  <p className="font-label text-label-md uppercase tracking-wider text-on-surface-variant mt-0.5">
                    {asset.size} · {asset.createdAt}
                  </p>
                </div>
              </button>
            ))}
          </div>
          <DialogFooter>
            <button
              onClick={() => setAssetPickerForIdx(null)}
              className="font-label text-label-md uppercase tracking-wider px-4 py-2 border border-outline-variant rounded-lg hover:bg-surface-container-high"
            >
              {t.common.cancel}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
