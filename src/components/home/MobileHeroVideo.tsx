"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Mobile hero background: the four portrait clips play ONE at a time, full
// bleed. When the active clip ends we cross-fade to the next and cycle 0→3→0.
// Two stacked <video> layers handle the crossfade — the hidden layer always
// holds the upcoming clip preloaded, so the swap is seamless. Muted autoplay
// (required on mobile); the parent pauses us when the hero scrolls off-screen
// or the tab is hidden.
export default function MobileHeroVideo({
  clips,
  poster,
  playing,
}: {
  clips: string[];
  poster: string;
  playing: boolean;
}) {
  const layer0 = useRef<HTMLVideoElement | null>(null);
  const layer1 = useRef<HTMLVideoElement | null>(null);
  const refs = [layer0, layer1];

  // Which layer is visible, and which clip index each layer currently holds.
  const [active, setActive] = useState(0);
  const [layerClip, setLayerClip] = useState<[number, number]>([0, 1 % clips.length]);

  const handleEnded = (layer: number) => {
    if (layer !== active) return; // only the visible clip drives the advance
    const next = 1 - active;
    const nextVideo = refs[next].current;
    if (nextVideo) {
      nextVideo.currentTime = 0;
      void nextVideo.play();
    }
    setActive(next);
    // Queue the clip after next onto the layer we just left, so it's preloaded.
    setLayerClip((prev) => {
      const upcoming = (prev[next] + 1) % clips.length;
      const copy: [number, number] = [prev[0], prev[1]];
      copy[layer] = upcoming;
      return copy;
    });
  };

  // Honor the parent's play/pause (off-screen / tab hidden / reduced motion).
  useEffect(() => {
    if (playing) {
      void refs[active].current?.play();
    } else {
      layer0.current?.pause();
      layer1.current?.pause();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, active]);

  return (
    <div
      className="absolute inset-0 opacity-80"
      aria-hidden="true"
      style={{ transform: "translateZ(0)", contain: "paint" }}
    >
      {[0, 1].map((layer) => (
        <video
          key={layer}
          ref={refs[layer]}
          src={clips[layerClip[layer]]}
          poster={poster}
          muted
          playsInline
          preload="auto"
          autoPlay={layer === 0}
          onEnded={() => handleEnded(layer)}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
            active === layer ? "opacity-100" : "opacity-0"
          )}
          style={{ backfaceVisibility: "hidden" }}
        />
      ))}
      {/* Same flat gold cast as the desktop collage. */}
      <div className="absolute inset-0 bg-primary/[0.08] pointer-events-none" />
    </div>
  );
}
