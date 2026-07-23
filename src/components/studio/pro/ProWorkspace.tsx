"use client";
import { useState } from "react";
import { Video, UsersRound, Mountain, Box, Clapperboard, Zap } from "lucide-react";
import ShotsBoard from "./ShotsBoard";
import AssetLibrary from "./AssetLibrary";
import EditorPanel from "./EditorPanel";
import { useStore, type ProAssetKind } from "@/lib/store";
import { cn } from "@/lib/utils";

/* ── Studio Pro workspace ────────────────────────────────────────────────
   Artlist-style production workspace: a left icon rail switches between the
   Shots board, the three asset libraries and the Editor. Lives behind the
   Basic | Pro toggle in StudioWorkspace; everything inside is mock. */

export type ProSection = "shots" | "character" | "scene" | "prop" | "editor";

const RAIL: { id: ProSection; icon: typeof Video; label: string }[] = [
  { id: "shots", icon: Video, label: "Shots" },
  { id: "character", icon: UsersRound, label: "Cast" },
  { id: "scene", icon: Mountain, label: "Scenes" },
  { id: "prop", icon: Box, label: "Props" },
  { id: "editor", icon: Clapperboard, label: "Editor" },
];

export default function ProWorkspace() {
  const [section, setSection] = useState<ProSection>("shots");
  const proCredits = useStore((s) => s.proCredits);

  return (
    <div className="flex gap-4 items-start">
      {/* Icon rail */}
      <nav
        aria-label="Studio Pro sections"
        className="sticky top-24 shrink-0 w-[64px] rounded-2xl border border-outline-variant/40 bg-surface-container-lowest/60 py-3 flex flex-col items-center gap-1"
      >
        {RAIL.map(({ id, icon: Icon, label }, i) => (
          <span key={id} className="contents">
            {/* Hairline between the creative sections and the editor */}
            {i === 4 && <span className="w-7 h-px bg-outline-variant/40 my-1.5" aria-hidden="true" />}
            <button
              type="button"
              onClick={() => setSection(id)}
              aria-current={section === id ? "page" : undefined}
              className={cn(
                "w-12 py-2 rounded-xl flex flex-col items-center gap-1 transition-colors",
                section === id
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              )}
            >
              <Icon className="w-[18px] h-[18px]" />
              <span className="font-label text-[8px] uppercase tracking-widest">{label}</span>
            </button>
          </span>
        ))}
      </nav>

      {/* Section area */}
      <div className="flex-1 min-w-0">
        {/* Slim workspace header */}
        <div className="flex items-center gap-2.5 flex-wrap mb-4">
          <h2 className="font-headline text-xl text-on-surface leading-none">Studio Pro</h2>
          <span className="font-label text-[9px] uppercase tracking-widest border border-primary/40 text-primary px-1.5 py-0.5 rounded">
            Short Drama Production
          </span>
          <span className="font-label text-[9px] uppercase tracking-widest border border-outline-variant/50 text-on-surface-variant px-1.5 py-0.5 rounded">
            Superstar Inside · Mock mode
          </span>
          <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/35 bg-primary-container/20 font-label text-[10px] uppercase tracking-widest text-primary">
            <Zap className="w-3 h-3" fill="currentColor" />
            {proCredits} credits
          </span>
        </div>

        {section === "shots" && (
          <ShotsBoard onGoEditor={() => setSection("editor")} />
        )}
        {(section === "character" || section === "scene" || section === "prop") && (
          <AssetLibrary key={section} kind={section as ProAssetKind} />
        )}
        {section === "editor" && <EditorPanel onGoShots={() => setSection("shots")} />}
      </div>
    </div>
  );
}
