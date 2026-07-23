"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import {
  ImageIcon,
  Clapperboard,
  Mic,
  Music2,
  ChevronUp,
  ChevronDown,
  SlidersHorizontal,
  Plus,
  ImagePlus,
  Sparkles,
  Send,
  Check,
  X,
  FileIcon,
  Languages,
  Video,
  Ban,
  Film,
  Workflow,
} from "lucide-react";
import BrandGlyph from "./BrandGlyph";
import type { PromptReference } from "./ReferenceUploadDialog";
import {
  SuperstarGlyph,
  SUPERSTAR_GEN_MODES,
  SUPERSTAR_PROMPT_PLACEHOLDER,
  superstarSummary,
  type SuperstarGenMode,
  type SuperstarSettings,
} from "./SuperstarProvider";
import type { StudioMode, StudioAssetSettings } from "@/lib/store";
import type { StudioVoice } from "@/lib/studio-mock";
import { useT } from "@/hooks/useT";
import { MODELS_BY_MODE } from "@/lib/studio-mock";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const MODE_META: { id: StudioMode; icon: typeof ImageIcon }[] = [
  { id: "image", icon: ImageIcon },
  { id: "video", icon: Clapperboard },
  { id: "voiceover", icon: Mic },
  { id: "music", icon: Music2 },
];

export type StudioProvider = "native" | "superstar";

/* The Model / Provider dropdown's native group. Nano Banana 2 maps onto the
   real image model; the two Spotlight entries are display-level mocks. */
const NATIVE_ENTRIES: { id: string; label: string }[] = [
  { id: "nano-banana-2", label: "Nano Banana 2" },
  { id: "spotlight-image", label: "Spotlight Image Model" },
  { id: "spotlight-video", label: "Spotlight Video Model" },
];

const COMING_SOON = ["Runway", "Kling", "Luma"];

/* Outline mark for Spotlight-native mock entries (the filled lime square is
   reserved for the Superstar provider). */
function NativeGlyph() {
  return (
    <span
      className="shrink-0 inline-flex w-5 h-5 rounded-md items-center justify-center border border-primary/60 text-primary font-label font-bold text-[10px]"
      aria-hidden="true"
    >
      S
    </span>
  );
}

export default function PromptDock({
  mode,
  onModeChange,
  modelId,
  settings,
  voice,
  prompt,
  onPromptChange,
  generating,
  onGenerate,
  onOpenModelPicker,
  onOpenVoiceCatalog,
  onOpenReferences,
  references,
  onRemoveReference,
  provider,
  onSelectProvider,
  nativeDisplay,
  superstarGenMode,
  onSuperstarGenModeChange,
  superstarSettings,
  onOpenSuperstarParams,
  onSuperstarHelper,
  onOpenPro,
}: {
  mode: StudioMode;
  onModeChange: (m: StudioMode) => void;
  modelId: string;
  settings: StudioAssetSettings;
  voice?: StudioVoice;
  prompt: string;
  onPromptChange: (v: string) => void;
  generating: boolean;
  onGenerate: () => void;
  onOpenModelPicker: () => void;
  onOpenVoiceCatalog: () => void;
  onOpenReferences: () => void;
  references: PromptReference[];
  onRemoveReference: (id: string) => void;
  provider: StudioProvider;
  onSelectProvider: (p: StudioProvider, nativeEntry?: { id: string; label: string }) => void;
  nativeDisplay: { id: string; label: string } | null;
  superstarGenMode: SuperstarGenMode;
  onSuperstarGenModeChange: (m: SuperstarGenMode) => void;
  superstarSettings: SuperstarSettings;
  onOpenSuperstarParams: () => void;
  onSuperstarHelper: (label: string) => void;
  // Opens Studio Pro — the short-drama production workspace that absorbed
  // the old Superstar Agent provider entry.
  onOpenPro: () => void;
}) {
  const t = useT();
  const [expanded, setExpanded] = useState(true);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const isSuperstar = provider === "superstar";
  const model = MODELS_BY_MODE[mode].find((m) => m.id === modelId) ?? MODELS_BY_MODE[mode][0];

  const placeholder = isSuperstar
    ? SUPERSTAR_PROMPT_PLACEHOLDER
    : mode === "image"
      ? t.aigc.promptImage
      : mode === "video"
        ? t.aigc.promptVideo
        : mode === "voiceover"
          ? t.aigc.promptVoiceover
          : t.aigc.promptMusic;

  // The settings summary chip text varies by mode (and by provider).
  const summary = isSuperstar
    ? superstarSummary(superstarSettings)
    : mode === "image"
      ? `${settings.aspect ?? "16:9"} / ${settings.quality ?? "2K"} / ${settings.count ?? 1}`
      : mode === "video"
        ? `${settings.aspect ?? "16:9"} / ${settings.duration ?? "5 sec"} / ${settings.resolution ?? "1080p"}`
        : mode === "voiceover"
          ? `${settings.language ?? "English"} / ${settings.accent ?? "American"} / ${settings.effect ?? "No Effect"}`
          : `${settings.genre ?? "Cinematic"} / ${settings.mood ?? "Uplifting"} / ${settings.duration ?? "30 sec"}`;

  const ModeIcon = MODE_META.find((m) => m.id === mode)!.icon;

  // Reference affordances in Superstar mode follow the generation mode.
  const superstarRefs =
    superstarGenMode === "i2i" || superstarGenMode === "i2v"
      ? { caption: null, image: "+ Add image reference", video: null }
      : superstarGenMode === "t2v"
        ? { caption: "Reference optional", image: "+ Image Reference", video: "+ Video Reference" }
        : { caption: null, image: null, video: null };

  return (
    <div className="pointer-events-auto w-full max-w-[860px] mx-auto">
      <div
        className="rounded-[28px] border border-outline-variant/40 overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.6)]"
        style={{
          background: "rgba(20, 20, 26, 0.9)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
        }}
      >
        {/* Collapse handle */}
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="w-full flex items-center justify-end px-4 pt-2 text-on-surface-variant hover:text-on-surface"
          aria-label="toggle dock"
        >
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>

        {expanded && (
          <>
            {/* Superstar provider mode: status line + generation-mode tabs */}
            {isSuperstar && (
              <>
                <div className="flex items-center gap-2 px-4 pb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" aria-hidden="true" />
                  <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                    External Provider · Superstar API · Mock mode
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-4 pb-2 flex-wrap">
                  {SUPERSTAR_GEN_MODES.map((gm) => (
                    <button
                      type="button"
                      key={gm.id}
                      onClick={() => onSuperstarGenModeChange(gm.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-full border font-label text-[10px] uppercase tracking-wider transition-colors",
                        gm.id === superstarGenMode
                          ? "border-primary/60 text-primary bg-primary-container/30"
                          : "border-outline-variant/40 text-on-surface-variant hover:border-primary/40 hover:text-on-surface"
                      )}
                    >
                      {gm.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Reference / add row */}
            <div className="flex items-center gap-2 px-4 pb-1 flex-wrap">
              {isSuperstar ? (
                <>
                  {superstarRefs.caption && (
                    <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/70">
                      {superstarRefs.caption}
                    </span>
                  )}
                  {superstarRefs.image && (
                    <button
                      type="button"
                      onClick={onOpenReferences}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-outline-variant/35 font-label text-[10px] uppercase tracking-wider text-on-surface-variant/75 hover:border-primary/40 hover:text-on-surface transition-colors"
                    >
                      <ImagePlus className="w-3 h-3" />
                      {superstarRefs.image}
                    </button>
                  )}
                  {superstarRefs.video && (
                    <button
                      type="button"
                      onClick={onOpenReferences}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-outline-variant/35 font-label text-[10px] uppercase tracking-wider text-on-surface-variant/75 hover:border-primary/40 hover:text-on-surface transition-colors"
                    >
                      <Film className="w-3 h-3" />
                      {superstarRefs.video}
                    </button>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  onClick={onOpenReferences}
                  className="w-8 h-8 rounded-full border border-outline-variant/50 flex items-center justify-center text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors"
                  aria-label="add reference"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
              {!isSuperstar && (mode === "image" || mode === "video") && (
                <button
                  type="button"
                  onClick={onOpenReferences}
                  className={cn(
                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border font-label text-[10px] uppercase tracking-wider transition-colors",
                    references.length > 0
                      ? "border-primary/50 text-primary bg-primary-container/30"
                      : "border-outline-variant/50 text-on-surface-variant hover:border-primary/50 hover:text-primary"
                  )}
                >
                  <ImagePlus className="w-3.5 h-3.5" />
                  {references.length > 0
                    ? t.aigc.refCount(references.length)
                    : t.aigc.imageReference}
                </button>
              )}
              {!isSuperstar && mode === "voiceover" && (
                <button
                  type="button"
                  onClick={onOpenVoiceCatalog}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-outline-variant/50 font-label text-[10px] uppercase tracking-wider text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors"
                >
                  <Mic className="w-3.5 h-3.5" /> {voice ? voice.name : t.aigc.voiceCatalog}
                </button>
              )}

              {/* Selected reference chips */}
              {references.map((r) => (
                <span
                  key={r.id}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary-container/40 text-on-primary-container max-w-[180px]"
                >
                  {r.previewUrl ? (
                    <Image
                      src={r.previewUrl}
                      alt=""
                      width={16}
                      height={16}
                      className="w-4 h-4 rounded object-cover"
                    />
                  ) : (
                    <FileIcon className="w-3 h-3" />
                  )}
                  <span className="font-body text-[11px] truncate">{r.name}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveReference(r.id)}
                    className="hover:text-error"
                    aria-label="remove reference"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Prompt textarea */}
            <div className="flex items-start gap-3 px-4 py-2">
              <textarea
                ref={taRef}
                aria-label={placeholder}
                rows={2}
                value={prompt}
                onChange={(e) => onPromptChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onGenerate();
                  }
                }}
                placeholder={placeholder}
                className="flex-1 bg-transparent border-none resize-none focus:outline-none focus:ring-0 font-body text-base placeholder:text-on-surface-variant/75 min-h-[56px] max-h-[160px]"
              />
              <Sparkles className="w-4 h-4 text-primary/50 mt-2 shrink-0" />
            </div>

            {/* Superstar prompt helpers (mock) */}
            {isSuperstar && (
              <div className="flex items-center gap-1.5 px-4 pb-2 flex-wrap">
                {(
                  [
                    { label: "Enhance prompt", icon: Sparkles },
                    { label: "Translate to English", icon: Languages },
                    { label: "Add camera motion", icon: Video },
                    { label: "Negative prompt", icon: Ban },
                  ] as const
                ).map(({ label, icon: Icon }) => (
                  <button
                    type="button"
                    key={label}
                    onClick={() => onSuperstarHelper(label)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-outline-variant/35 font-label text-[10px] uppercase tracking-wider text-on-surface-variant/85 hover:border-primary/40 hover:text-primary transition-colors"
                  >
                    <Icon className="w-3 h-3" />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Summary bar */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-t border-outline-variant/20 flex-wrap">
          {/* Mode selector (native providers only — Superstar has its own tabs) */}
          {!isSuperstar && (
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors font-label text-label-md uppercase tracking-wider text-on-surface">
                <ModeIcon className="w-3.5 h-3.5" />
                {t.aigc.modes[mode]}
                <ChevronUp className="w-3 h-3 opacity-60" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="top" className="min-w-[160px]">
                {MODE_META.map((m) => {
                  const Icon = m.icon;
                  return (
                    <DropdownMenuItem
                      key={m.id}
                      onClick={() => onModeChange(m.id)}
                      className={cn("gap-2.5 cursor-pointer py-2.5", m.id === mode && "text-primary")}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="flex-1">{t.aigc.modes[m.id]}</span>
                      {m.id === mode && <Check className="w-3.5 h-3.5" />}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Model / Provider dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-2 px-3 py-2 rounded-full hover:bg-surface-container transition-colors">
              {isSuperstar ? (
                <>
                  <SuperstarGlyph size="sm" />
                  <span className="font-label text-label-md text-on-surface">Superstar</span>
                  <span className="font-label text-[9px] uppercase tracking-widest border border-primary/40 text-primary px-1.5 py-0.5 rounded">
                    External · Token pending
                  </span>
                </>
              ) : nativeDisplay && !MODELS_BY_MODE[mode].some((m) => m.id === nativeDisplay.id) ? (
                <>
                  <NativeGlyph />
                  <span className="font-label text-label-md text-on-surface">
                    {nativeDisplay.label}
                  </span>
                </>
              ) : (
                <>
                  <BrandGlyph brand={model.brand} size="sm" />
                  <span className="font-label text-label-md text-on-surface">{model.name}</span>
                </>
              )}
              <ChevronDown className="w-3 h-3 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="w-[300px]">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                  Spotlight Native
                </DropdownMenuLabel>
                {NATIVE_ENTRIES.map((entry) => {
                  const realModel = MODELS_BY_MODE[mode].find((m) => m.id === entry.id);
                  const active = !isSuperstar && (nativeDisplay?.id ?? modelId) === entry.id;
                  return (
                    <DropdownMenuItem
                      key={entry.id}
                      onClick={() => onSelectProvider("native", entry)}
                      className={cn("gap-2.5 cursor-pointer py-2.5", active && "text-primary")}
                    >
                      {realModel ? <BrandGlyph brand={realModel.brand} size="sm" /> : <NativeGlyph />}
                      <span className="flex-1">{entry.label}</span>
                      {active && <Check className="w-3.5 h-3.5" />}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuGroup>

              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                  External Providers
                </DropdownMenuLabel>
                {/* Superstar gets a small highlighted card, not a plain row. */}
                <DropdownMenuItem
                  onClick={() => onSelectProvider("superstar")}
                  className="p-0 cursor-pointer focus:bg-transparent data-highlighted:bg-transparent"
                >
                  <div
                    className={cn(
                      "m-1 w-full rounded-xl border p-3 transition-colors",
                      isSuperstar
                        ? "border-primary/60 bg-primary-container/40"
                        : "border-primary/30 bg-primary-container/15 hover:bg-primary-container/30"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <SuperstarGlyph size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="font-label text-label-md text-on-surface flex items-center gap-2">
                          Superstar Generate
                          {isSuperstar && <Check className="w-3.5 h-3.5 text-primary" />}
                        </p>
                        <p className="font-body text-[11px] text-on-surface-variant mt-0.5">
                          Image / Video generation API
                        </p>
                      </div>
                    </div>
                    <p className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant/85 mt-2">
                      External Provider · Beta · Token pending
                    </p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                  Production Workspace
                </DropdownMenuLabel>
                {/* The old Superstar Agent provider moved into Studio Pro —
                    this entry hands users over to the Pro workspace. */}
                <DropdownMenuItem
                  onClick={onOpenPro}
                  className="p-0 cursor-pointer focus:bg-transparent data-highlighted:bg-transparent"
                >
                  <div className="m-1 w-full rounded-xl border border-primary/30 bg-primary-container/15 hover:bg-primary-container/30 p-3 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span className="shrink-0 inline-flex w-8 h-8 rounded-lg items-center justify-center bg-primary text-on-primary">
                        <Workflow className="w-4 h-4" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-label text-label-md text-on-surface flex items-center gap-2">
                          Studio Pro
                          <span className="font-label text-[8px] uppercase tracking-widest border border-primary/50 text-primary px-1 py-px rounded">
                            New
                          </span>
                        </p>
                        <p className="font-body text-[11px] text-on-surface-variant mt-0.5">
                          Short drama production — shots, assets, editor
                        </p>
                      </div>
                    </div>
                    <p className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant/85 mt-2">
                      Superstar Agent moved here · Script → Shots → Timeline
                    </p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                  Coming Soon
                </DropdownMenuLabel>
                {COMING_SOON.map((name) => (
                  <DropdownMenuItem key={name} disabled className="gap-2.5 py-2 opacity-55">
                    <span className="w-5 h-5 rounded-md border border-outline-variant/50" aria-hidden="true" />
                    <span className="flex-1">{name}</span>
                    <span className="font-label text-[9px] uppercase tracking-widest border border-outline-variant/50 px-1.5 py-0.5 rounded">
                      Soon
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <span className="w-px h-5 bg-outline-variant/40 hidden sm:block" />

          {/* Settings summary (native → model picker; Superstar → mock params) */}
          <button
            type="button"
            onClick={isSuperstar ? onOpenSuperstarParams : onOpenModelPicker}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-surface-container transition-colors font-label text-label-md text-on-surface-variant"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{summary}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {/* Generate */}
          <div className="ml-auto flex flex-col items-end gap-1">
            <button
              type="button"
              onClick={onGenerate}
              disabled={generating}
              className="inline-flex items-center gap-2 bg-primary text-on-primary font-label text-label-md uppercase tracking-wider px-6 py-3 rounded-full hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSuperstar
                ? "Generate with Superstar"
                : generating
                  ? t.aigc.generating
                  : t.aigc.generate}
              <Send className="w-3.5 h-3.5" />
            </button>
            {isSuperstar && (
              <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant/70 pr-1">
                Mock mode · API token pending
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
