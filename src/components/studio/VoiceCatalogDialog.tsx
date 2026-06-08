"use client";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useT } from "@/hooks/useT";
import { VOICES, type StudioVoice } from "@/lib/studio-mock";
import Waveform from "./Waveform";
import { Check, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const HUE_BG = [
  "from-rose-200 to-amber-200",
  "from-sky-200 to-indigo-200",
  "from-emerald-200 to-teal-200",
  "from-violet-200 to-fuchsia-200",
];

export default function VoiceCatalogDialog({
  open,
  onOpenChange,
  selectedVoiceId,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  selectedVoiceId?: string;
  onSelect: (voice: StudioVoice) => void;
}) {
  const t = useT();
  const [playing, setPlaying] = useState<string | null>(null);
  const selected = VOICES.find((v) => v.id === selectedVoiceId);

  const togglePlay = (id: string) => {
    setPlaying((p) => (p === id ? null : id));
    if (playing !== id) toast.info(t.aigc.playbackToast);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden max-h-[85vh]" showCloseButton>
        <div className="flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <h2 className="font-headline text-2xl text-on-surface">{t.aigc.voiceCatalog}</h2>
              <div className="flex items-center gap-1 bg-surface-container rounded-full p-1">
                <span className="px-3 py-1 rounded-full bg-primary text-on-primary font-label text-[10px] uppercase tracking-wider">
                  {t.aigc.artlistVoices}
                </span>
                <span className="px-3 py-1 font-label text-[10px] uppercase tracking-wider text-on-surface-variant">
                  {t.aigc.customVoices}
                </span>
              </div>
            </div>
            {selected && (
              <div className="flex items-center gap-2">
                <span className="font-label text-[10px] uppercase tracking-wider text-on-surface-variant">
                  {t.aigc.selectedVoice}
                </span>
                <span className="inline-flex items-center gap-2 bg-surface-container rounded-full pl-1.5 pr-3 py-1">
                  <span
                    className={cn("w-6 h-6 rounded-full bg-gradient-to-br", HUE_BG[selected.hue])}
                  />
                  <span className="font-body text-sm text-on-surface">{selected.name}</span>
                </span>
              </div>
            )}
          </div>

          {/* Voice list */}
          <div className="px-6 pb-6 overflow-y-auto space-y-2">
            {VOICES.map((v) => {
              const isSel = v.id === selectedVoiceId;
              const isPlaying = playing === v.id;
              return (
                <div
                  key={v.id}
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-2xl border transition-colors",
                    isSel
                      ? "border-primary/40 bg-primary-container/30"
                      : "border-outline-variant/40 hover:bg-surface-container"
                  )}
                >
                  {/* Thumbnail + play */}
                  <button
                    onClick={() => togglePlay(v.id)}
                    className={cn(
                      "relative w-14 h-14 rounded-xl bg-gradient-to-br shrink-0 flex items-center justify-center group",
                      HUE_BG[v.hue]
                    )}
                    aria-label="preview voice"
                  >
                    <span className="absolute inset-0 rounded-xl bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow">
                      {isPlaying ? (
                        <Pause className="w-3.5 h-3.5 text-on-surface" />
                      ) : (
                        <Play className="w-3.5 h-3.5 text-on-surface ml-0.5" fill="currentColor" />
                      )}
                    </span>
                  </button>

                  {/* Name + desc (or waveform while playing) */}
                  <div className="flex-1 min-w-0">
                    <p className="font-headline text-lg text-on-surface leading-tight">{v.name}</p>
                    {isPlaying ? (
                      <div className="h-5 mt-1">
                        <Waveform seed={v.id} bars={40} animated />
                      </div>
                    ) : (
                      <p className="font-body text-sm text-on-surface-variant truncate">
                        {v.description}
                      </p>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="hidden sm:flex items-center gap-1.5">
                    <span className="font-label text-[10px] uppercase tracking-widest bg-surface-container-high text-on-surface-variant px-2.5 py-1 rounded-full">
                      {v.gender}
                    </span>
                    {v.tags.map((tag) => (
                      <span
                        key={tag}
                        className="font-label text-[10px] uppercase tracking-widest bg-surface-container-high text-on-surface-variant px-2.5 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Select */}
                  <button
                    onClick={() => {
                      onSelect(v);
                      onOpenChange(false);
                    }}
                    className={cn(
                      "shrink-0 inline-flex items-center gap-1.5 font-label text-[10px] uppercase tracking-wider px-4 py-2 rounded-full transition-colors",
                      isSel
                        ? "bg-primary text-on-primary"
                        : "border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary"
                    )}
                  >
                    {isSel && <Check className="w-3 h-3" />}
                    {isSel ? t.aigc.selected : t.aigc.select}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
