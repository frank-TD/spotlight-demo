"use client";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

// Deterministic pseudo-random waveform bars seeded by a string, so the same
// asset always renders the same shape across reloads.
function seededBars(seed: string, count: number): number[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const bars: number[] = [];
  for (let i = 0; i < count; i++) {
    h = (h * 1103515245 + 12345) & 0x7fffffff;
    const base = (h % 100) / 100; // 0..1
    // Emphasize a centered envelope so it reads as speech/music, not noise.
    const env = Math.sin((i / count) * Math.PI);
    bars.push(0.18 + base * 0.65 * (0.5 + env * 0.5));
  }
  return bars;
}

export default function Waveform({
  seed,
  bars = 48,
  className,
  animated = false,
  progress,
}: {
  seed: string;
  bars?: number;
  className?: string;
  animated?: boolean;
  // 0..1 — fraction of bars rendered in the active color (playback position)
  progress?: number;
}) {
  const heights = useMemo(() => seededBars(seed, bars), [seed, bars]);
  return (
    <div className={cn("flex items-center gap-[2px] h-full w-full", className)}>
      {heights.map((h, i) => {
        const active = progress != null && i / heights.length <= progress;
        return (
          <span
            key={i}
            className={cn(
              "flex-1 rounded-full transition-colors",
              active ? "bg-primary" : "bg-primary/30",
              animated && "animate-pulse"
            )}
            style={{
              height: `${Math.round(h * 100)}%`,
              animationDelay: animated ? `${(i % 8) * 90}ms` : undefined,
            }}
          />
        );
      })}
    </div>
  );
}
