"use client";
import { useRef, useState } from "react";
import type { StudioMode, StudioAssetSettings } from "@/lib/store";
import type { StudioVoice } from "@/lib/studio-mock";
import { useT } from "@/hooks/useT";
import BrandGlyph from "./BrandGlyph";
import { MODELS_BY_MODE } from "@/lib/studio-mock";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PromptReference } from "./ReferenceUploadDialog";

const MODE_META: { id: StudioMode; icon: typeof ImageIcon }[] = [
  { id: "image", icon: ImageIcon },
  { id: "video", icon: Clapperboard },
  { id: "voiceover", icon: Mic },
  { id: "music", icon: Music2 },
];

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
}) {
  const t = useT();
  const [expanded, setExpanded] = useState(true);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const model = MODELS_BY_MODE[mode].find((m) => m.id === modelId) ?? MODELS_BY_MODE[mode][0];

  const placeholder =
    mode === "image" ? t.aigc.promptImage
    : mode === "video" ? t.aigc.promptVideo
    : mode === "voiceover" ? t.aigc.promptVoiceover
    : t.aigc.promptMusic;

  // The settings summary chip text varies by mode.
  const summary =
    mode === "image" ? `${settings.aspect ?? "16:9"} / ${settings.quality ?? "2K"} / ${settings.count ?? 1}`
    : mode === "video" ? `${settings.aspect ?? "16:9"} / ${settings.duration ?? "5 sec"} / ${settings.resolution ?? "1080p"}`
    : mode === "voiceover" ? `${settings.language ?? "English"} / ${settings.accent ?? "American"} / ${settings.effect ?? "No Effect"}`
    : `${settings.genre ?? "Cinematic"} / ${settings.mood ?? "Uplifting"} / ${settings.duration ?? "30 sec"}`;

  const ModeIcon = MODE_META.find((m) => m.id === mode)!.icon;

  return (
    <div className="pointer-events-auto w-full max-w-[860px] mx-auto">
      <div
        className="rounded-[28px] border border-outline-variant/30 overflow-hidden shadow-[0_24px_60px_rgba(110,91,71,0.22)]"
        style={{
          background: "rgba(255, 248, 245, 0.9)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
        }}
      >
        {/* Collapse handle */}
        <button
          onClick={() => setExpanded((e) => !e)}
          className="w-full flex items-center justify-end px-4 pt-2 text-on-surface-variant hover:text-on-surface"
          aria-label="toggle dock"
        >
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>

        {expanded && (
          <>
            {/* Reference / add row */}
            <div className="flex items-center gap-2 px-4 pb-1 flex-wrap">
              <button
                onClick={onOpenReferences}
                className="w-8 h-8 rounded-full border border-outline-variant/50 flex items-center justify-center text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors"
                aria-label="add reference"
              >
                <Plus className="w-4 h-4" />
              </button>
              {(mode === "image" || mode === "video") && (
                <button
                  onClick={onOpenReferences}
                  className={cn(
                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border font-label text-[10px] uppercase tracking-wider transition-colors",
                    references.length > 0
                      ? "border-primary/50 text-primary bg-primary-container/30"
                      : "border-outline-variant/50 text-on-surface-variant hover:border-primary/50 hover:text-primary"
                  )}
                >
                  <ImagePlus className="w-3.5 h-3.5" />
                  {references.length > 0 ? t.aigc.refCount(references.length) : t.aigc.imageReference}
                </button>
              )}
              {mode === "voiceover" && (
                <button
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
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.previewUrl} alt="" className="w-4 h-4 rounded object-cover" />
                  ) : (
                    <FileIcon className="w-3 h-3" />
                  )}
                  <span className="font-body text-[11px] truncate">{r.name}</span>
                  <button
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
                className="flex-1 bg-transparent border-none resize-none focus:outline-none focus:ring-0 font-body text-base placeholder:text-on-surface-variant/60 min-h-[56px] max-h-[160px]"
              />
              <Sparkles className="w-4 h-4 text-primary/50 mt-2 shrink-0" />
            </div>
          </>
        )}

        {/* Summary bar */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-t border-outline-variant/20 flex-wrap">
          {/* Mode selector */}
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

          {/* Model picker trigger */}
          <button
            onClick={onOpenModelPicker}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full hover:bg-surface-container transition-colors"
          >
            <BrandGlyph brand={model.brand} size="sm" />
            <span className="font-label text-label-md text-on-surface">{model.name}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          <span className="w-px h-5 bg-outline-variant/40 hidden sm:block" />

          {/* Settings summary (opens model picker too) */}
          <button
            onClick={onOpenModelPicker}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-surface-container transition-colors font-label text-label-md text-on-surface-variant"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{summary}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {/* Generate */}
          <button
            onClick={onGenerate}
            disabled={generating}
            className="ml-auto inline-flex items-center gap-2 bg-primary text-on-primary font-label text-label-md uppercase tracking-wider px-6 py-3 rounded-full hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? t.aigc.generating : t.aigc.generate}
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
