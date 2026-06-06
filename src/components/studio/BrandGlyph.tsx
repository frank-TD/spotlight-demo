"use client";
import type { StudioModel } from "@/lib/studio-mock";
import { cn } from "@/lib/utils";

// Small monogram glyph standing in for each model provider's logo.
const BRAND_STYLE: Record<StudioModel["brand"], { letter: string; cls: string }> = {
  google: { letter: "G", cls: "bg-sky-100 text-sky-700" },
  openai: { letter: "O", cls: "bg-emerald-100 text-emerald-700" },
  kling: { letter: "K", cls: "bg-violet-100 text-violet-700" },
  artlist: { letter: "A", cls: "bg-primary-container text-on-primary-container" },
  krea: { letter: "K", cls: "bg-rose-100 text-rose-700" },
  grok: { letter: "X", cls: "bg-neutral-200 text-neutral-700" },
  seedance: { letter: "S", cls: "bg-amber-100 text-amber-700" },
  happy: { letter: "H", cls: "bg-pink-100 text-pink-700" },
  veo: { letter: "V", cls: "bg-indigo-100 text-indigo-700" },
  suno: { letter: "S", cls: "bg-orange-100 text-orange-700" },
  udio: { letter: "U", cls: "bg-teal-100 text-teal-700" },
  elevenlabs: { letter: "11", cls: "bg-neutral-200 text-neutral-800" },
};

export default function BrandGlyph({ brand, size = "md" }: { brand: StudioModel["brand"]; size?: "sm" | "md" | "lg" }) {
  const s = BRAND_STYLE[brand];
  const dim = size === "lg" ? "w-9 h-9 text-base" : size === "sm" ? "w-6 h-6 text-[10px]" : "w-7 h-7 text-xs";
  return (
    <span className={cn("inline-flex items-center justify-center rounded-lg font-bold shrink-0", dim, s.cls)}>
      {s.letter}
    </span>
  );
}
