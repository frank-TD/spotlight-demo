"use client";
import Image from "next/image";
import {
  Play,
  Undo2,
  Redo2,
  Scissors,
  Trash2,
  ZoomIn,
  ZoomOut,
  Clapperboard,
  Music2,
} from "lucide-react";
import { toast } from "sonner";
import { fmtClock } from "./pro-mock";
import { useStore } from "@/lib/store";

/* ── Editor shell (PR-1 placeholder) ─────────────────────────────────────
   Static preview + timeline chrome matching the Artlist editor layout. The
   interactive dual-track timeline (drag, trim, split, playhead) ships in
   the next Studio Pro update — every control here answers with a toast so
   the surface is honest about that. */

const TICKS = Array.from({ length: 11 }, (_, i) => i);
const SUBTICKS = Array.from({ length: 4 }, (_, i) => i);

export default function EditorPanel({ onGoShots }: { onGoShots: () => void }) {
  const { proFragments, currentProProjectId, proProjects } = useStore();
  const project = proProjects.find((p) => p.id === currentProProjectId) ?? null;
  const directed = proFragments.filter(
    (f) => f.projectId === currentProProjectId && f.status === "directed"
  );
  const totalSec = directed.reduce((acc, f) => acc + f.durationSec, 0);
  const soon = (label: string) =>
    toast.info(`${label} — interactive timeline ships in the next Studio Pro update`);

  return (
    <div>
      {/* Ready strip */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
          {project ? `${project.title} · ` : ""}
          {directed.length} directed {directed.length === 1 ? "shot" : "shots"} ready for the
          timeline
        </span>
        {directed.length > 0 && (
          <div className="flex gap-1.5">
            {directed.slice(0, 8).map((f) => (
              <div
                key={f.id}
                className="w-14 aspect-video rounded-md overflow-hidden border border-outline-variant/40"
                title={f.title}
              >
                {f.frameUrl && (
                  <Image
                    src={f.frameUrl}
                    alt={f.title}
                    width={112}
                    height={63}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        )}
        {directed.length === 0 && (
          <button
            type="button"
            onClick={onGoShots}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/45 text-primary font-label text-[10px] uppercase tracking-wider hover:bg-primary-container/25 transition-colors"
          >
            <Clapperboard className="w-3 h-3" /> Direct some shots first
          </button>
        )}
      </div>

      {/* Preview */}
      <div className="rounded-3xl border border-outline-variant/40 bg-surface-container-lowest/80 aspect-[21/9] max-h-[420px] w-full flex flex-col items-center justify-center text-center mb-4">
        <Clapperboard className="w-7 h-7 text-on-surface-variant" />
        <p className="font-headline text-xl text-on-surface mt-3">Assemble your episode</p>
        <p className="font-body text-sm text-on-surface-variant mt-1.5 max-w-md leading-relaxed">
          The interactive dual-track editor — drag shots, trim, split, add voiceover and music —
          arrives in the next Studio Pro update.
        </p>
      </div>

      {/* Timeline shell */}
      <div className="rounded-3xl border border-outline-variant/40 bg-surface-container-lowest/80 px-4 py-3">
        {/* Transport row */}
        <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/20">
          <TransportBtn label="Play" onClick={() => soon("Play")}>
            <Play className="w-3.5 h-3.5" fill="currentColor" />
          </TransportBtn>
          <span className="font-mono text-xs text-on-surface-variant">
            00:00.00 / {fmtClock(Math.max(totalSec, 10))}
          </span>
          <span className="w-px h-5 bg-outline-variant/40 mx-1" />
          <TransportBtn label="Undo" onClick={() => soon("Undo")}>
            <Undo2 className="w-3.5 h-3.5" />
          </TransportBtn>
          <TransportBtn label="Redo" onClick={() => soon("Redo")}>
            <Redo2 className="w-3.5 h-3.5" />
          </TransportBtn>
          <TransportBtn label="Split" onClick={() => soon("Split")}>
            <Scissors className="w-3.5 h-3.5" />
          </TransportBtn>
          <TransportBtn label="Delete clip" onClick={() => soon("Delete clip")}>
            <Trash2 className="w-3.5 h-3.5" />
          </TransportBtn>
          <span className="ml-auto flex items-center gap-2">
            <TransportBtn label="Zoom out" onClick={() => soon("Zoom")}>
              <ZoomOut className="w-3.5 h-3.5" />
            </TransportBtn>
            <span className="w-24 h-1 rounded-full bg-surface-container relative" aria-hidden="true">
              <span className="absolute left-1/3 -top-1 w-3 h-3 rounded-full bg-on-surface-variant" />
            </span>
            <TransportBtn label="Zoom in" onClick={() => soon("Zoom")}>
              <ZoomIn className="w-3.5 h-3.5" />
            </TransportBtn>
            <button
              type="button"
              onClick={() => soon("Export")}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-primary/50 text-primary font-label text-[10px] uppercase tracking-wider hover:bg-primary-container/25 transition-colors"
            >
              Export
            </button>
          </span>
        </div>

        {/* Ruler */}
        <div className="flex items-end gap-0 pt-3 pb-1 select-none" aria-hidden="true">
          {TICKS.map((n) => (
            <div key={n} className="flex-1 min-w-0">
              <span className="font-mono text-[9px] text-on-surface-variant/70">{n}</span>
              <div className="flex items-end gap-0 h-2 mt-0.5">
                <span className="w-px h-2 bg-outline-variant/60" />
                {n < 10 &&
                  SUBTICKS.map((s) => (
                    <span key={s} className="flex-1 self-end h-1 border-l border-outline-variant/30" />
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Tracks */}
        <div className="space-y-2 pt-1 pb-1">
          <button
            type="button"
            onClick={() => soon("Video track")}
            className="w-full h-16 rounded-xl border border-dashed border-outline-variant/45 hover:border-primary/45 transition-colors flex items-center justify-center gap-2 text-on-surface-variant"
          >
            <Clapperboard className="w-3.5 h-3.5" />
            <span className="font-body text-xs italic">
              To start editing, click “+” on a shot or drag it here — coming in the next update
            </span>
          </button>
          <button
            type="button"
            onClick={() => soon("Audio track")}
            className="w-full h-10 rounded-xl border border-dashed border-outline-variant/35 hover:border-primary/45 transition-colors flex items-center justify-center gap-2 text-on-surface-variant/80"
          >
            <Music2 className="w-3 h-3" />
            <span className="font-body text-[11px] italic">
              Audio track — voiceover &amp; music from Basic mode
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function TransportBtn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="w-8 h-8 rounded-full border border-outline-variant/50 flex items-center justify-center text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors"
    >
      {children}
    </button>
  );
}
