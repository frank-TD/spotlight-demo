"use client";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useT } from "@/hooks/useT";
import {
  MODELS_BY_MODE,
  ASPECT_OPTIONS,
  QUALITY_OPTIONS,
  COUNT_OPTIONS,
  VIDEO_DURATION_OPTIONS,
  VIDEO_RESOLUTION_OPTIONS,
  LANGUAGE_OPTIONS,
  ACCENT_OPTIONS,
  VOICE_EFFECT_OPTIONS,
  GENRE_OPTIONS,
  MOOD_OPTIONS,
  MUSIC_DURATION_OPTIONS,
} from "@/lib/studio-mock";
import type { StudioMode, StudioAssetSettings } from "@/lib/store";
import BrandGlyph from "./BrandGlyph";
import MiniSelect from "./MiniSelect";
import { cn } from "@/lib/utils";

export default function ModelPickerDialog(props: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  mode: StudioMode;
  modelId: string;
  settings: StudioAssetSettings;
  onConfirm: (modelId: string, settings: StudioAssetSettings) => void;
}) {
  const { open, onOpenChange, mode, modelId } = props;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden max-h-[85vh]" showCloseButton>
        {/* Remount on each open so the draft initializes fresh from props. */}
        {open && <PickerBody key={`${mode}-${modelId}`} {...props} />}
      </DialogContent>
    </Dialog>
  );
}

function PickerBody({
  onOpenChange,
  mode,
  modelId,
  settings,
  onConfirm,
}: {
  onOpenChange: (o: boolean) => void;
  mode: StudioMode;
  modelId: string;
  settings: StudioAssetSettings;
  onConfirm: (modelId: string, settings: StudioAssetSettings) => void;
}) {
  const t = useT();
  const models = MODELS_BY_MODE[mode];
  const [sel, setSel] = useState(modelId);
  const [draft, setDraft] = useState<StudioAssetSettings>(settings);

  const selected = models.find((m) => m.id === sel) ?? models[0];
  const set = (patch: Partial<StudioAssetSettings>) => setDraft((d) => ({ ...d, ...patch }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] max-h-[85vh]">
      {/* Left: model list */}
      <div className="border-r border-outline-variant/40 p-5 overflow-y-auto">
        <p className="font-label text-label-md uppercase tracking-wider text-on-surface-variant mb-4">
          {t.aigc.modelPickerAllModels}
        </p>
        <div className="space-y-1">
          {models.map((m) => (
            <button
              key={m.id}
              onClick={() => setSel(m.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors",
                m.id === sel
                  ? "bg-primary-container/50 ring-1 ring-primary/20"
                  : "hover:bg-surface-container"
              )}
            >
              <BrandGlyph brand={m.brand} size="md" />
              <span className="flex-1 min-w-0">
                <span className="flex items-center gap-2">
                  <span className="font-body text-sm text-on-surface truncate">{m.name}</span>
                  {m.badge && (
                    <span className="font-label text-[9px] uppercase tracking-widest bg-tertiary-container text-on-tertiary-container px-1.5 py-0.5 rounded">
                      {m.badge}
                    </span>
                  )}
                </span>
              </span>
              <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant shrink-0">
                {m.tier ?? ""}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Right: detail + settings */}
      <div className="p-6 flex flex-col overflow-y-auto">
        <div className="flex items-center gap-3 mb-3">
          <BrandGlyph brand={selected.brand} size="lg" />
          <h2 className="font-headline text-2xl text-on-surface">{selected.name}</h2>
        </div>
        <p className="font-body text-sm text-on-surface-variant leading-relaxed mb-4">
          {selected.description}
        </p>

        {selected.features && selected.features.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {selected.features.map((f) => (
              <span
                key={f}
                className="font-label text-[10px] uppercase tracking-widest bg-surface-container text-on-surface-variant px-2.5 py-1 rounded-full"
              >
                {f}
              </span>
            ))}
          </div>
        )}

        <div className="border-t border-outline-variant/40 pt-4 space-y-4 flex-1">
          {mode === "image" && (
            <>
              <Row label={t.aigc.aspectRatio}>
                <MiniSelect
                  value={draft.aspect ?? "16:9"}
                  options={ASPECT_OPTIONS}
                  onChange={(v) => set({ aspect: v })}
                />
              </Row>
              <Row label={t.aigc.quality}>
                <MiniSelect
                  value={draft.quality ?? "2K"}
                  options={QUALITY_OPTIONS}
                  onChange={(v) => set({ quality: v })}
                />
              </Row>
              <Row label={t.aigc.numberOfImages}>
                <MiniSelect
                  value={draft.count ?? 1}
                  options={COUNT_OPTIONS}
                  onChange={(v) => set({ count: v })}
                />
              </Row>
            </>
          )}
          {mode === "video" && (
            <>
              <Row label={t.aigc.aspectRatio}>
                <MiniSelect
                  value={draft.aspect ?? "16:9"}
                  options={ASPECT_OPTIONS}
                  onChange={(v) => set({ aspect: v })}
                />
              </Row>
              <Row label={t.aigc.audio}>
                <Toggle on={draft.audio ?? true} onChange={(v) => set({ audio: v })} />
              </Row>
              <Row label={t.aigc.duration}>
                <MiniSelect
                  value={draft.duration ?? "5 sec"}
                  options={VIDEO_DURATION_OPTIONS}
                  onChange={(v) => set({ duration: v })}
                />
              </Row>
              <Row label={t.aigc.resolution}>
                <MiniSelect
                  value={draft.resolution ?? "1080p"}
                  options={VIDEO_RESOLUTION_OPTIONS}
                  onChange={(v) => set({ resolution: v })}
                />
              </Row>
            </>
          )}
          {mode === "voiceover" && (
            <>
              <Row label={t.aigc.language}>
                <MiniSelect
                  value={draft.language ?? "English"}
                  options={LANGUAGE_OPTIONS}
                  onChange={(v) => set({ language: v })}
                />
              </Row>
              <Row label={t.aigc.accent}>
                <MiniSelect
                  value={draft.accent ?? "American"}
                  options={ACCENT_OPTIONS}
                  onChange={(v) => set({ accent: v })}
                />
              </Row>
              <Row label={t.aigc.effect}>
                <MiniSelect
                  value={draft.effect ?? "No Effect"}
                  options={VOICE_EFFECT_OPTIONS}
                  onChange={(v) => set({ effect: v })}
                />
              </Row>
            </>
          )}
          {mode === "music" && (
            <>
              <Row label={t.aigc.genre}>
                <MiniSelect
                  value={draft.genre ?? "Cinematic"}
                  options={GENRE_OPTIONS}
                  onChange={(v) => set({ genre: v })}
                />
              </Row>
              <Row label={t.aigc.mood}>
                <MiniSelect
                  value={draft.mood ?? "Uplifting"}
                  options={MOOD_OPTIONS}
                  onChange={(v) => set({ mood: v })}
                />
              </Row>
              <Row label={t.aigc.duration}>
                <MiniSelect
                  value={draft.duration ?? "30 sec"}
                  options={MUSIC_DURATION_OPTIONS}
                  onChange={(v) => set({ duration: v })}
                />
              </Row>
            </>
          )}
        </div>

        <button
          onClick={() => {
            onConfirm(selected.id, draft);
            onOpenChange(false);
          }}
          className="mt-6 self-end bg-primary text-on-primary font-label text-label-md uppercase tracking-wider px-7 py-3 rounded-full hover:opacity-90 active:scale-95 transition-all"
        >
          {t.aigc.useModel}
        </button>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-body text-sm text-on-surface">{label}</span>
      {children}
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={cn(
        "relative w-10 h-6 rounded-full transition-colors",
        on ? "bg-primary" : "bg-outline-variant"
      )}
      aria-pressed={on}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform",
          on && "translate-x-4"
        )}
      />
    </button>
  );
}
