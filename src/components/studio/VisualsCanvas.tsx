"use client";
import { ImageIcon, Clapperboard, Mic, Music2 } from "lucide-react";
import AssetCard from "./AssetCard";
import { SuperstarTaskCard, type SuperstarTask } from "./SuperstarProvider";
import type { StudioAsset, StudioMode, StudioSession } from "@/lib/store";
import { useT } from "@/hooks/useT";
import { cn } from "@/lib/utils";

const MODE_ICON: Record<StudioMode, typeof ImageIcon> = {
  image: ImageIcon,
  video: Clapperboard,
  voiceover: Mic,
  music: Music2,
};

export default function VisualsCanvas({
  mode,
  session,
  generating,
  progress,
  onOpenAsset,
  superstarTasks = [],
  onRegenerateTask,
  onTaskMockAction,
}: {
  mode: StudioMode;
  session: StudioSession | null;
  generating: boolean;
  progress: number;
  onOpenAsset?: (asset: StudioAsset) => void;
  superstarTasks?: SuperstarTask[];
  onRegenerateTask?: (task: SuperstarTask) => void;
  onTaskMockAction?: (action: string) => void;
}) {
  const t = useT();
  const assets = session?.assets ?? [];
  const Icon = MODE_ICON[mode];
  const isAudio = mode === "voiceover" || mode === "music";

  const emptySub =
    mode === "image"
      ? t.aigc.canvasEmptySubImage
      : mode === "video"
        ? t.aigc.canvasEmptySubVideo
        : mode === "voiceover"
          ? t.aigc.canvasEmptySubVoiceover
          : t.aigc.canvasEmptySubMusic;

  const generatingLabel =
    mode === "image"
      ? t.aigc.generatingImage
      : mode === "video"
        ? t.aigc.generatingVideo
        : mode === "voiceover"
          ? t.aigc.generatingVoiceover
          : t.aigc.generatingMusic;

  const hasContent = generating || assets.length > 0 || superstarTasks.length > 0;

  return (
    <div className="h-full flex flex-col rounded-3xl border border-outline-variant/40 bg-surface-container-lowest/60 overflow-hidden">
      {/* Header — identifies the active session (or falls back to the mode
          when there's no session yet) so the canvas isn't anonymous. */}
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-outline-variant/30">
        <div className="flex items-center gap-2 min-w-0">
          <Icon className="w-3.5 h-3.5 text-on-surface-variant shrink-0" />
          {session && session.assets.length > 0 ? (
            <span className="font-body text-sm text-on-surface truncate">{session.title}</span>
          ) : (
            <span className="font-label text-label-md uppercase tracking-wider text-on-surface-variant">
              {t.aigc.modes[mode]}
            </span>
          )}
        </div>
        {assets.length > 0 && (
          <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/85 shrink-0">
            {t.aigc.assetCount(assets.length)}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5">
        {!hasContent ? (
          <div className="h-full min-h-[420px] flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center mb-5 text-on-surface-variant">
              <Icon className="w-7 h-7" />
            </div>
            <h3 className="font-headline text-2xl text-on-surface mb-2">
              {t.aigc.canvasEmptyTitle}
            </h3>
            <p className="font-body text-sm text-on-surface-variant">{emptySub}</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Superstar external-provider tasks, newest on top */}
            {superstarTasks.length > 0 && (
              <div className="space-y-4 max-w-xl mx-auto">
                {[...superstarTasks].reverse().map((task) => (
                  <SuperstarTaskCard
                    key={task.id}
                    task={task}
                    onRegenerate={(tk) => onRegenerateTask?.(tk)}
                    onMockAction={(a) => onTaskMockAction?.(a)}
                  />
                ))}
              </div>
            )}

            {/* In-flight placeholder, newest on top */}
            {generating && (
              <div className={cn(isAudio ? "" : "max-w-md mx-auto")}>
                {isAudio ? (
                  <div className="rounded-2xl border border-outline-variant/40 bg-surface-container p-5 flex items-center gap-4">
                    <span className="shimmer-overlay absolute" />
                    <div className="w-10 h-10 rounded-full bg-primary/20 animate-pulse shrink-0" />
                    <div className="flex-1">
                      <div className="h-9 flex items-center gap-[2px]">
                        {Array.from({ length: 48 }).map((_, i) => (
                          <span
                            key={i}
                            className="flex-1 bg-primary/25 rounded-full animate-pulse"
                            style={{
                              height: `${20 + ((i * 7) % 70)}%`,
                              animationDelay: `${(i % 8) * 90}ms`,
                            }}
                          />
                        ))}
                      </div>
                      <p className="font-body text-xs text-on-surface-variant mt-2">
                        {generatingLabel} {progress}%
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden bg-surface-container aspect-video flex flex-col items-center justify-center">
                    <span className="shimmer-overlay" />
                    <div className="relative z-10 flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                      <p className="font-body text-sm text-on-surface-variant">
                        {generatingLabel} ({progress}%)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Results */}
            {isAudio ? (
              <div className="space-y-3 max-w-2xl">
                {[...assets].reverse().map((a) => (
                  <AssetCard key={a.id} asset={a} onOpen={onOpenAsset} />
                ))}
              </div>
            ) : (
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [&>*]:mb-4 [&>*]:break-inside-avoid">
                {[...assets].reverse().map((a) => (
                  <AssetCard key={a.id} asset={a} onOpen={onOpenAsset} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
