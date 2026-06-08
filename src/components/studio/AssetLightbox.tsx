"use client";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { StudioAsset } from "@/lib/store";
import { useT } from "@/hooks/useT";
import { MODELS_BY_MODE } from "@/lib/studio-mock";
import BrandGlyph from "./BrandGlyph";
import { Play, Download, Repeat, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function AssetLightbox({
  asset,
  onOpenChange,
  onReuse,
}: {
  asset: StudioAsset | null;
  onOpenChange: (o: boolean) => void;
  onReuse: (asset: StudioAsset) => void;
}) {
  const t = useT();
  const [imgOk, setImgOk] = useState(true);
  if (!asset) return null;

  const model = MODELS_BY_MODE[asset.mode].find((m) => m.id === asset.modelId);
  const isVideo = asset.mode === "video";

  // Build a settings summary line, mode-aware.
  const settingsLine = (() => {
    const s = asset.settings;
    if (asset.mode === "image") return [s.aspect, s.quality].filter(Boolean).join(" · ");
    if (asset.mode === "video")
      return [s.aspect, s.duration, s.resolution].filter(Boolean).join(" · ");
    if (asset.mode === "voiceover")
      return [s.voiceName, s.language, s.accent, s.effect].filter(Boolean).join(" · ");
    return [s.genre, s.mood, s.duration].filter(Boolean).join(" · ");
  })();

  return (
    <Dialog open={!!asset} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-5xl p-0 overflow-hidden max-h-[92vh] bg-surface"
        showCloseButton
      >
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] max-h-[92vh]">
          {/* Left: preview */}
          <div className="bg-[#0f0d0c] p-6 flex items-center justify-center min-h-[300px] max-h-[92vh] overflow-hidden relative">
            {imgOk && asset.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={asset.imageUrl}
                alt={asset.prompt}
                onError={() => setImgOk(false)}
                className="max-w-full max-h-[80vh] object-contain"
              />
            ) : (
              <div className="w-full aspect-video rounded-xl bg-gradient-to-br from-primary-container via-primary-fixed to-tertiary-container flex items-end p-6">
                <p className="font-headline italic text-on-surface text-xl md:text-2xl leading-snug">
                  {asset.prompt}
                </p>
              </div>
            )}
            {isVideo && (
              <button
                onClick={() => toast.info(t.aigc.playbackToast)}
                className="absolute inset-0 flex items-center justify-center bg-black/15 hover:bg-black/30 transition-colors"
                aria-label="play"
              >
                <span className="w-20 h-20 rounded-full bg-white/95 shadow-2xl flex items-center justify-center hover:scale-110 transition-transform">
                  <Play className="w-9 h-9 text-on-surface ml-1" fill="currentColor" />
                </span>
              </button>
            )}
          </div>

          {/* Right: metadata + actions */}
          <div className="p-6 flex flex-col overflow-y-auto">
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">
              {t.aigc.modes[asset.mode]}
            </p>
            <h2 className="font-headline italic text-2xl text-on-surface leading-snug mb-4">
              {asset.prompt}
            </h2>

            <div className="space-y-3 text-sm flex-1">
              {model && (
                <Row label="Model">
                  <span className="inline-flex items-center gap-2">
                    <BrandGlyph brand={model.brand} size="sm" />
                    <span className="font-body text-on-surface">{model.name}</span>
                  </span>
                </Row>
              )}
              {settingsLine && (
                <Row label="Settings">
                  <span className="font-body text-on-surface-variant">{settingsLine}</span>
                </Row>
              )}
              {asset.durationSec !== undefined && (
                <Row label={t.aigc.duration}>
                  <span className="font-mono text-on-surface-variant">
                    {Math.floor(asset.durationSec / 60)}:
                    {Math.round(asset.durationSec % 60)
                      .toString()
                      .padStart(2, "0")}
                  </span>
                </Row>
              )}
              {asset.references && asset.references.length > 0 && (
                <div>
                  <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">
                    {t.aigc.referencesLabel}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {asset.references.map((r) => (
                      <span
                        key={r.id}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-body text-xs max-w-[200px]"
                        )}
                        title={r.name}
                      >
                        <Paperclip className="w-3 h-3 shrink-0" />
                        <span className="truncate">{r.name}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 mt-6">
              <button
                onClick={() => {
                  onReuse(asset);
                  onOpenChange(false);
                }}
                className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary font-label text-label-md uppercase tracking-wider px-6 py-3 rounded-full hover:opacity-90 active:scale-95 transition-all"
              >
                <Repeat className="w-3.5 h-3.5" /> {t.aigc.reuse}
              </button>
              <button
                onClick={() => toast.info(t.aigc.downloadToast)}
                className="inline-flex items-center justify-center gap-2 font-label text-label-md uppercase tracking-wider px-6 py-3 rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> {t.aigc.download}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant shrink-0">
        {label}
      </span>
      <span className="text-right">{children}</span>
    </div>
  );
}
