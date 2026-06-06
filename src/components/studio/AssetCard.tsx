"use client";
import { useState } from "react";
import type { StudioAsset } from "@/lib/store";
import { useT } from "@/hooks/useT";
import Waveform from "./Waveform";
import { Play, Pause, Download, Music2, Mic, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Hashed gradient so a broken picsum URL still renders as plausible content.
function gradientFor(seed: string): string {
  const palettes = [
    "from-primary-container via-primary-fixed to-tertiary-container",
    "from-tertiary-container via-tertiary-fixed to-primary-container",
    "from-secondary-container via-secondary-fixed to-primary-container",
    "from-primary-container via-tertiary-fixed to-secondary-container",
  ];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return palettes[h % palettes.length];
}

function aspectClass(aspect?: string): string {
  switch (aspect) {
    case "1:1": return "aspect-square";
    case "4:3": return "aspect-[4/3]";
    case "9:16": return "aspect-[9/16]";
    case "21:9": return "aspect-[21/9]";
    default: return "aspect-video";
  }
}

function fmtDuration(sec?: number) {
  if (!sec) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AssetCard({
  asset,
  onOpen,
}: {
  asset: StudioAsset;
  onOpen?: (asset: StudioAsset) => void;
}) {
  const t = useT();
  const [playing, setPlaying] = useState(false);

  const onPlay = () => {
    setPlaying((p) => !p);
    if (!playing) toast.info(t.aigc.playbackToast);
  };
  const onDownload = () => toast.info(t.aigc.downloadToast);
  const openLightbox = () => onOpen?.(asset);

  // Image — single picsum still (with gradient fallback)
  if (asset.mode === "image") {
    return <VisualCard asset={asset} onDownload={onDownload} onOpen={openLightbox} />;
  }

  // Video — poster + play overlay. The whole card opens the lightbox;
  // the play button inside the overlay still triggers the playback toast.
  if (asset.mode === "video") {
    return <VisualCard asset={asset} onDownload={onDownload} onPlay={onPlay} isVideo onOpen={openLightbox} />;
  }

  // Voiceover / Music — waveform card
  const isMusic = asset.mode === "music";
  return (
    <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant/40 p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="w-7 h-7 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
          {isMusic ? <Music2 className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
        </span>
        <p className="font-body text-sm text-on-surface line-clamp-1 flex-1">{asset.prompt}</p>
        <button onClick={onDownload} className="text-on-surface-variant hover:text-primary transition-colors" aria-label="download">
          <Download className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onPlay}
          className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 hover:opacity-90 active:scale-95 transition-all"
          aria-label="play"
        >
          {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" fill="currentColor" />}
        </button>
        <div className="flex-1 h-9">
          <Waveform seed={asset.waveformSeed ?? asset.id} bars={56} animated={playing} progress={playing ? 0.5 : undefined} />
        </div>
        <span className="font-mono text-xs text-on-surface-variant shrink-0">{fmtDuration(asset.durationSec)}</span>
      </div>

      {/* Metadata chips */}
      <div className="flex flex-wrap gap-1.5">
        {isMusic ? (
          <>
            {asset.settings?.genre && <Chip>{asset.settings.genre}</Chip>}
            {asset.settings?.mood && <Chip>{asset.settings.mood}</Chip>}
          </>
        ) : (
          <>
            {asset.settings?.voiceName && <Chip>{asset.settings.voiceName}</Chip>}
            {asset.settings?.language && <Chip>{asset.settings.language}</Chip>}
            {asset.settings?.accent && <Chip>{asset.settings.accent}</Chip>}
          </>
        )}
      </div>

      <ReferenceChips asset={asset} />
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className={cn("font-label text-[10px] uppercase tracking-widest bg-surface-container text-on-surface-variant px-2.5 py-1 rounded-full")}>
      {children}
    </span>
  );
}

function ReferenceChips({ asset, light = false }: { asset: StudioAsset; light?: boolean }) {
  const t = useT();
  if (!asset.references || asset.references.length === 0) return null;
  return (
    <div className={cn("flex items-center gap-1.5 flex-wrap", light && "text-white/90")}>
      <span
        className={cn(
          "inline-flex items-center gap-1 font-label text-[9px] uppercase tracking-widest",
          light ? "text-white/70" : "text-on-surface-variant"
        )}
      >
        <Paperclip className="w-3 h-3" /> {t.aigc.referencesLabel}
      </span>
      {asset.references.map((r) => (
        <span
          key={r.id}
          className={cn(
            "inline-flex max-w-[140px] items-center gap-1 px-1.5 py-0.5 rounded-full font-body text-[10px] truncate",
            light
              ? "bg-white/15 backdrop-blur border border-white/20 text-white/90"
              : "bg-surface-container text-on-surface-variant"
          )}
          title={r.name}
        >
          <Paperclip className="w-2.5 h-2.5 shrink-0" />
          <span className="truncate">{r.name}</span>
        </span>
      ))}
    </div>
  );
}

function VisualCard({
  asset,
  isVideo = false,
  onPlay,
  onDownload,
  onOpen,
}: {
  asset: StudioAsset;
  isVideo?: boolean;
  onPlay?: () => void;
  onDownload: () => void;
  onOpen?: () => void;
}) {
  const [imgOk, setImgOk] = useState(true);
  const gradient = gradientFor(asset.id);
  const aspect = aspectClass(asset.settings?.aspect);
  return (
    <figure
      onClick={onOpen}
      className={cn(
        "group relative rounded-2xl overflow-hidden border border-outline-variant/40 bg-gradient-to-br cursor-zoom-in",
        gradient,
        aspect
      )}
    >
      {imgOk && asset.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={asset.imageUrl}
          alt={asset.prompt}
          onError={() => setImgOk(false)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {/* Fallback overlay shows the prompt-as-poster, used when the image can't load. */}
      {!imgOk && (
        <div className="absolute inset-0 flex items-end p-5">
          <p className="font-headline italic text-on-surface text-lg md:text-xl leading-snug line-clamp-4">
            {asset.prompt}
          </p>
        </div>
      )}
      {isVideo && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay?.();
            }}
            className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/35 transition-colors"
            aria-label="play"
          >
            <span className="w-14 h-14 rounded-full bg-white/95 shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="w-6 h-6 text-on-surface ml-1" fill="currentColor" />
            </span>
          </button>
          <span className="absolute top-2 left-2 font-label text-[10px] uppercase tracking-widest bg-black/50 text-white px-2 py-1 rounded">
            {asset.settings?.duration ?? ""}
          </span>
        </>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDownload();
        }}
        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/20 backdrop-blur border border-white/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="download"
      >
        <Download className="w-3.5 h-3.5" />
      </button>
      <figcaption className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex flex-col gap-1.5">
        <p className="font-body text-xs text-white/90 line-clamp-1">{asset.prompt}</p>
        <ReferenceChips asset={asset} light />
      </figcaption>
    </figure>
  );
}
