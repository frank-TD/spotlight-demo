"use client";
import { useState } from "react";
import { Video, UsersRound, Mountain, Box, Clapperboard, Zap, X, FileText, Scissors } from "lucide-react";
import { toast } from "sonner";
import ShotsBoard from "./ShotsBoard";
import AssetLibrary from "./AssetLibrary";
import EditorPanel from "./EditorPanel";
import { readSession, writeSession, PRO_COSTS, SK } from "./pro-mock";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useStore, type ProAssetKind } from "@/lib/store";
import { cn } from "@/lib/utils";

// One-time coach mark: persists across sessions (plain localStorage — this
// tree only mounts client-side, so reading it in an initializer is safe).
const COACH_KEY = "spotlight.pro.coach.v1";
const coachDismissed = () => {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(COACH_KEY) === "1";
  } catch {
    return true;
  }
};

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

const SECTIONS: ProSection[] = ["shots", "character", "scene", "prop", "editor"];

export default function ProWorkspace() {
  // Restore the last section across the signup-gate round-trip / reloads.
  const [section, setSection] = useState<ProSection>(() => {
    const saved = readSession<ProSection>(SK.section);
    return saved && SECTIONS.includes(saved) ? saved : "shots";
  });
  const proCredits = useStore((s) => s.proCredits);
  const [showCoach, setShowCoach] = useState(() => !coachDismissed());
  const [creditsOpen, setCreditsOpen] = useState(false);

  const dismissCoach = () => {
    setShowCoach(false);
    try {
      localStorage.setItem(COACH_KEY, "1");
    } catch {
      /* best-effort */
    }
  };

  const changeSection = (s: ProSection) => {
    setSection(s);
    writeSession(SK.section, s);
  };

  // "Use in Shots" from an asset library: park the mention and hand over to
  // the Shots board, which opens a composer that consumes it.
  const useInShot = (name: string) => {
    writeSession(SK.mention, name);
    changeSection("shots");
  };

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
              onClick={() => changeSection(id)}
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
          <button
            type="button"
            onClick={() => setCreditsOpen(true)}
            className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/35 bg-primary-container/20 font-label text-[10px] uppercase tracking-widest text-primary hover:bg-primary-container/35 transition-colors"
          >
            <Zap className="w-3 h-3" fill="currentColor" />
            {proCredits} credits
          </button>
        </div>

        {/* One-time coach mark for first-time Pro visitors */}
        {showCoach && (
          <div className="flex items-center gap-3 flex-wrap rounded-2xl border border-primary/30 bg-primary-container/15 px-4 py-3 mb-4">
            <span className="font-label text-[9px] uppercase tracking-widest bg-primary text-on-primary px-1.5 py-0.5 rounded shrink-0">
              New here?
            </span>
            <CoachStep n={1} icon={FileText} text="Script to Shots splits a full episode into drafts" />
            <CoachStep n={2} icon={Video} text="Frame & Direct each shot into a clip" />
            <CoachStep n={3} icon={Scissors} text="Assemble and export on the Editor timeline" />
            <button
              type="button"
              onClick={dismissCoach}
              aria-label="dismiss guide"
              className="ml-auto w-7 h-7 rounded-full border border-outline-variant/50 flex items-center justify-center text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {section === "shots" && (
          <ShotsBoard onGoEditor={() => changeSection("editor")} />
        )}
        {(section === "character" || section === "scene" || section === "prop") && (
          <AssetLibrary key={section} kind={section as ProAssetKind} onUseInShot={useInShot} />
        )}
        {section === "editor" && <EditorPanel onGoShots={() => changeSection("shots")} />}
      </div>

      {/* Credits detail (decorative ledger) */}
      <Dialog open={creditsOpen} onOpenChange={setCreditsOpen}>
        <DialogContent className="sm:max-w-xs p-6" showCloseButton>
          <DialogTitle className="sr-only">Credits</DialogTitle>
          <div className="text-center">
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
              Studio Pro balance
            </p>
            <p className="font-headline text-4xl text-primary mt-1 inline-flex items-center gap-2">
              <Zap className="w-6 h-6" fill="currentColor" />
              {proCredits}
            </p>
          </div>
          <div className="rounded-xl border border-outline-variant/35 divide-y divide-outline-variant/25 mt-4">
            <PriceRow label="Script → Shots parse" cost={PRO_COSTS.script} />
            <PriceRow label="Frame generation" cost={PRO_COSTS.frame} />
            <PriceRow label="Video render" cost={PRO_COSTS.video} />
            <PriceRow label="Asset generation ×4" cost={PRO_COSTS.asset} />
          </div>
          <button
            type="button"
            onClick={() => toast.info("Top up — mock mode, billing arrives with the real API")}
            className="mt-4 w-full bg-primary text-on-primary font-label text-label-md uppercase tracking-wider px-5 py-2.5 rounded-full hover:opacity-90 active:scale-95 transition-all"
          >
            Top up (mock)
          </button>
          <p className="font-label text-[8px] uppercase tracking-widest text-on-surface-variant/60 text-center mt-2">
            Decorative ledger · no real billing
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CoachStep({
  n,
  icon: Icon,
  text,
}: {
  n: number;
  icon: typeof FileText;
  text: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 font-body text-xs text-on-surface-variant">
      <span className="inline-flex w-4 h-4 rounded-full border border-primary/60 text-primary items-center justify-center font-label text-[8px] shrink-0">
        {n}
      </span>
      <Icon className="w-3 h-3 text-on-surface-variant/80 shrink-0" />
      {text}
    </span>
  );
}

function PriceRow({ label, cost }: { label: string; cost: number }) {
  return (
    <div className="flex items-center justify-between px-3.5 py-2">
      <span className="font-body text-xs text-on-surface-variant">{label}</span>
      <span className="inline-flex items-center gap-1 font-label text-[10px] uppercase tracking-widest text-primary">
        <Zap className="w-2.5 h-2.5" fill="currentColor" /> {cost}
      </span>
    </div>
  );
}
