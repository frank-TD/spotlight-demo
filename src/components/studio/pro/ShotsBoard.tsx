"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  FolderOpen,
  ChevronDown,
  Check,
  Plus,
  Sparkles,
  Pencil,
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
  Clapperboard,
  Loader2,
  Zap,
  Layers,
  Megaphone,
  Music2,
  Smartphone,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import ScriptStepper, { type StepperDraft } from "./ScriptStepper";
import ShotComposer from "./ShotComposer";
import {
  clearSession,
  fmtShotNo,
  frameImg,
  nowTs,
  proId,
  readSession,
  writeSession,
  workflowOf,
  PRO_COSTS,
  SK,
  WORKFLOWS,
  WORKFLOW_ORDER,
} from "./pro-mock";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore, type ProFragment, type ProFragmentStatus, type ProWorkflow } from "@/lib/store";
import { cn } from "@/lib/utils";

/* Quick-start card visuals per workflow. */
const WF_ICON: Record<ProWorkflow, typeof Smartphone> = {
  ugc: Smartphone,
  ad: Megaphone,
  mv: Music2,
  film: Clapperboard,
};
const WF_TINT: Record<ProWorkflow, string> = {
  ugc: "linear-gradient(150deg, #16181c 20%, rgba(127,247,226,0.18) 100%)",
  ad: "linear-gradient(150deg, #16181c 20%, rgba(255,184,64,0.16) 100%)",
  mv: "linear-gradient(150deg, #16181c 20%, rgba(150,120,255,0.18) 100%)",
  film: "linear-gradient(150deg, #101014 10%, rgba(127,247,226,0.30) 100%)",
};

/* ── Shots board — fragment management ───────────────────────────────────
   Projects (episodes) hold fragments (shots). Two production entries: the
   Script → Shots stepper (batch) and a blank New Shot (manual), both landing
   in the same board. Opening a card swaps the board for the Shot Composer. */

const STATUS_META: Record<ProFragmentStatus, { label: string; cls: string }> = {
  draft: { label: "Draft", cls: "border-outline-variant/50 text-on-surface-variant" },
  framed: { label: "Framed", cls: "border-amber-400/60 text-amber-300" },
  directed: { label: "Directed", cls: "border-primary/50 text-primary bg-primary-container/30" },
};

export default function ShotsBoard({ onGoEditor }: { onGoEditor: () => void }) {
  const {
    proProjects,
    currentProProjectId,
    newProProject,
    renameProProject,
    deleteProProject,
    setCurrentProProject,
    proFragments,
    addProFragments,
    updateProFragment,
    deleteProFragment,
    duplicateProFragment,
    moveProFragment,
    spendProCredits,
    isLoggedIn,
    openSignupGate,
  } = useStore();

  const project = proProjects.find((p) => p.id === currentProProjectId) ?? null;
  const fragments = project ? proFragments.filter((f) => f.projectId === project.id) : [];

  /* Restore-on-mount, resolved inside initializers (render-safe): a script
     draft interrupted by the signup gate reopens the stepper; a pending
     @mention or a previously open composer reopens the composer. */
  // Which workflow's wizard is open (null = closed). Restored drafts reopen
  // with their own workflow.
  const [stepperWf, setStepperWf] = useState<ProWorkflow | null>(() => {
    const d = readSession<StepperDraft>(SK.stepper);
    if (d?.open && (d.title || d.script || (d.drafts?.length ?? 0) > 0)) return d.workflow ?? "film";
    return null;
  });
  // Text typed into the Create-screen vibe bar, seeded into the wizard.
  const [vibeText, setVibeText] = useState("");
  const [stepperSeed, setStepperSeed] = useState<string | undefined>(undefined);
  const [composerId, setComposerId] = useState<string | null>(() => {
    const d = readSession<StepperDraft>(SK.stepper);
    if (d?.open && (d.title || d.script)) return null; // stepper wins
    const lastOpen = readSession<string>(SK.composerOpen);
    if (readSession<string>(SK.mention) && fragments.length > 0) {
      const target =
        fragments.find((f) => f.id === lastOpen) ??
        fragments.find((f) => f.status !== "directed") ??
        fragments[0];
      return target.id;
    }
    if (lastOpen && fragments.some((f) => f.id === lastOpen)) return lastOpen;
    return null;
  });
  const [renaming, setRenaming] = useState(false);
  const [renameDraft, setRenameDraft] = useState("");

  /* Frame-all queue: sequential mock framing over every draft, driven by a
     handler-side timeout chain (never setState-in-effect). */
  const [framingNow, setFramingNow] = useState<string | null>(null);
  const [frameProgress, setFrameProgress] = useState<{ done: number; total: number } | null>(null);
  const queueTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => queueTimers.current.forEach(clearTimeout), []);

  const runFrameQueue = (ids: string[], idx: number) => {
    if (idx >= ids.length) {
      setFramingNow(null);
      setFrameProgress(null);
      toast.success(`${ids.length} shots framed — open any of them to direct`);
      return;
    }
    setFramingNow(ids[idx]);
    setFrameProgress({ done: idx, total: ids.length });
    queueTimers.current.push(
      setTimeout(() => {
        const seed = `${ids[idx]}-${nowTs()}`;
        const fresh = [frameImg(`${seed}-a`), frameImg(`${seed}-b`)];
        // Drafts carry no frames yet, so a plain patch is safe here.
        updateProFragment(ids[idx], { frames: fresh, frameUrl: fresh[0], status: "framed" });
        runFrameQueue(ids, idx + 1);
      }, 1200)
    );
  };

  const frameAll = (drafts: ProFragment[]) => {
    if (!isLoggedIn) {
      openSignupGate("/discovery/workspace");
      return;
    }
    if (framingNow) return;
    const cost = drafts.length * PRO_COSTS.frame;
    if (!spendProCredits(cost)) {
      toast.error(`Not enough credits (mock balance) — ${cost} needed`);
      return;
    }
    runFrameQueue(
      drafts.map((d) => d.id),
      0
    );
  };

  const openComposer = (id: string) => {
    setComposerId(id);
    writeSession(SK.composerOpen, id);
  };
  const closeComposer = () => {
    setComposerId(null);
    clearSession(SK.composerOpen);
  };
  const counts = fragments.reduce(
    (acc, f) => ({ ...acc, [f.status]: acc[f.status] + 1 }),
    { draft: 0, framed: 0, directed: 0 } as Record<ProFragmentStatus, number>
  );

  const newBlankShot = (projectId: string, order: number) => {
    const frag: ProFragment = {
      id: proId("frag"),
      projectId,
      title: fmtShotNo(order),
      summary: "",
      status: "draft",
      frames: [],
      durationSec: 8,
      createdAt: nowTs(),
    };
    addProFragments([frag]);
    openComposer(frag.id);
  };

  const onNewShot = () => {
    if (project) {
      newBlankShot(project.id, fragments.length + 1);
    } else {
      const id = newProProject();
      newBlankShot(id, 1);
    }
  };

  // Stepper and composer take over the whole section area.
  if (stepperWf) {
    return (
      <ScriptStepper
        key={stepperWf}
        workflow={stepperWf}
        initialScript={stepperSeed}
        onClose={() => {
          setStepperWf(null);
          setStepperSeed(undefined);
        }}
        onGoEditor={() => {
          setStepperWf(null);
          setStepperSeed(undefined);
          onGoEditor();
        }}
      />
    );
  }
  if (composerId) {
    // Keyed so prev/next navigation remounts with the target's own draft.
    return (
      <ShotComposer
        key={composerId}
        fragmentId={composerId}
        onBack={closeComposer}
        onNavigate={openComposer}
      />
    );
  }

  /* Create screen — no project selected: vibe bar + workflow quick starts
     (OpenArt-style). Picking a card opens that workflow's wizard. */
  if (!project) {
    const startWizard = (wf: ProWorkflow, seed?: string) => {
      setStepperSeed(seed && seed.trim() ? seed.trim() : undefined);
      setStepperWf(wf);
    };
    return (
      <div className="rounded-3xl border border-outline-variant/40 bg-surface-container-lowest/60 px-5 md:px-8 py-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            <h3 className="font-headline text-3xl text-on-surface" style={{ textWrap: "balance" }}>
              Direct your next video
            </h3>
            <p className="font-body text-sm text-on-surface-variant mt-2">
              Describe the idea, pick a workflow, and NexGC turns it into shots, clips and a cut.
            </p>
          </div>

          {/* Vibe bar */}
          <div className="mt-6 rounded-[22px] border border-outline-variant/40 bg-surface-container/60 p-2 pl-4 flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-primary shrink-0" />
            <input
              value={vibeText}
              onChange={(e) => setVibeText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") startWizard("film", vibeText);
              }}
              placeholder="Describe your video — “a rain-soaked revenge micro drama”, “a 15s serum ad”…"
              aria-label="describe your video"
              className="flex-1 min-w-0 bg-transparent border-none focus:outline-none font-body text-sm text-on-surface placeholder:text-on-surface-variant/60"
            />
            <button
              type="button"
              onClick={() => startWizard("film", vibeText)}
              className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-on-primary font-label text-[10px] uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all"
            >
              Guide me
            </button>
            <button
              type="button"
              onClick={() => toast.info("Just make it — one-shot auto mode arrives in the next update")}
              className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-outline-variant/50 font-label text-[10px] uppercase tracking-wider text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors"
            >
              Just make it
            </button>
          </div>

          {/* Quick starts */}
          <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mt-8 mb-3">
            Quick Starts
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            {WORKFLOW_ORDER.map((wf) => {
              const cfg = WORKFLOWS[wf];
              const Icon = WF_ICON[wf];
              return (
                <button
                  key={wf}
                  type="button"
                  onClick={() => startWizard(wf, vibeText)}
                  className="group text-left rounded-2xl border border-outline-variant/40 overflow-hidden hover:border-primary/50 transition-colors bg-surface-container-low"
                >
                  <div
                    className="relative aspect-[4/3] flex items-center justify-center"
                    style={{ background: WF_TINT[wf] }}
                  >
                    <Icon className="w-8 h-8 text-on-surface/85 group-hover:scale-110 transition-transform duration-300" />
                    {cfg.tag && (
                      <span
                        className={cn(
                          "absolute top-2 left-2 font-label text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded",
                          cfg.tag === "Featured"
                            ? "bg-primary text-on-primary"
                            : "border border-outline-variant/50 text-on-surface-variant bg-surface/50"
                        )}
                      >
                        {cfg.tag}
                      </span>
                    )}
                    <span className="absolute bottom-2 right-2 font-label text-[8px] uppercase tracking-widest text-on-surface-variant/80 border border-outline-variant/40 bg-surface/50 px-1.5 py-0.5 rounded">
                      {cfg.aspect}
                    </span>
                  </div>
                  <div className="px-3.5 py-3">
                    <p className="font-label text-label-md uppercase tracking-wider text-on-surface">
                      {cfg.label}
                    </p>
                    <p className="font-body text-[11px] text-on-surface-variant mt-1 leading-snug">
                      {cfg.tagline}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Secondary entries */}
          <div className="flex items-center justify-center gap-2 mt-7">
            <button
              type="button"
              onClick={onNewShot}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-outline-variant/50 font-label text-[10px] uppercase tracking-wider text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors"
            >
              <Plus className="w-3 h-3" /> Blank project
            </button>
            {proProjects.length > 0 && (
              <button
                type="button"
                onClick={() => setCurrentProProject(proProjects[0].id)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-outline-variant/50 font-label text-[10px] uppercase tracking-wider text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors"
              >
                <FolderOpen className="w-3 h-3" /> Open recent · {proProjects[0].title}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Project row */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        {renaming ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (renameDraft.trim()) renameProProject(project.id, renameDraft.trim());
              setRenaming(false);
            }}
            className="inline-flex"
          >
            <input
              autoFocus
              value={renameDraft}
              onChange={(e) => setRenameDraft(e.target.value)}
              onBlur={() => setRenaming(false)}
              maxLength={40}
              aria-label="project title"
              className="px-3 py-1.5 rounded-full bg-surface-container border border-primary/50 font-label text-label-md text-on-surface focus:outline-none w-[220px]"
            />
          </form>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors font-label text-label-md text-on-surface">
              <FolderOpen className="w-3.5 h-3.5 text-on-surface-variant" />
              {project.title}
              <span className="font-label text-[8px] uppercase tracking-widest bg-primary text-on-primary px-1.5 py-0.5 rounded">
                {workflowOf(project.workflow).badge}
              </span>
              <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant/75">
                {project.style} · {workflowOf(project.workflow).aspect}
              </span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[240px]">
              {/* Base UI requires Label to live inside a Group */}
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                  Projects
                </DropdownMenuLabel>
                {proProjects.map((p) => (
                  <DropdownMenuItem
                    key={p.id}
                    onClick={() => setCurrentProProject(p.id)}
                    className={cn("gap-2 cursor-pointer", p.id === project.id && "text-primary")}
                  >
                    {p.id === project.id ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <span className="w-3.5 h-3.5" />
                    )}
                    <span className="flex-1 truncate">{p.title}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setRenameDraft(project.title);
                  setRenaming(true);
                }}
                className="gap-2 cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" /> Rename
              </DropdownMenuItem>
              {/* Route through the Create screen so the new project picks a workflow. */}
              <DropdownMenuItem
                onClick={() => setCurrentProProject(null)}
                className="gap-2 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> New project
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  deleteProProject(project.id);
                  toast.success(`Deleted "${project.title}"`);
                }}
                className="gap-2 cursor-pointer text-error focus:text-error"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/75">
          {fragments.length} shots · {counts.directed} directed · {counts.framed} framed ·{" "}
          {counts.draft} drafts
        </span>

        <div className="ml-auto flex items-center gap-2">
          {counts.draft > 0 && (
            <button
              type="button"
              onClick={() => frameAll(fragments.filter((f) => f.status === "draft"))}
              disabled={!!framingNow}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-amber-400/55 text-amber-300 font-label text-[10px] uppercase tracking-wider hover:bg-amber-400/10 transition-colors disabled:opacity-70"
            >
              {framingNow && frameProgress ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Framing {frameProgress.done + 1}/{frameProgress.total}
                </>
              ) : (
                <>
                  <Layers className="w-3 h-3" />
                  Frame all drafts
                  <span className="inline-flex items-center gap-0.5 border-l border-amber-400/40 pl-1.5 ml-0.5">
                    <Zap className="w-2.5 h-2.5" fill="currentColor" />
                    {counts.draft * PRO_COSTS.frame}
                  </span>
                </>
              )}
            </button>
          )}
          <button
            type="button"
            onClick={() => setStepperWf(project.workflow ?? "film")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-primary/45 text-primary font-label text-[10px] uppercase tracking-wider hover:bg-primary-container/25 transition-colors"
          >
            <Sparkles className="w-3 h-3" /> Script to Shots
          </button>
          <button
            type="button"
            onClick={onNewShot}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-primary text-on-primary font-label text-[10px] uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all"
          >
            <Plus className="w-3 h-3" /> New Shot
          </button>
        </div>
      </div>

      {/* Fragment grid */}
      {fragments.length === 0 ? (
        <div className="rounded-3xl border border-outline-variant/40 bg-surface-container-lowest/60 px-6 py-16 text-center">
          <Clapperboard className="w-7 h-7 text-on-surface-variant mx-auto" />
          <p className="font-headline text-xl text-on-surface mt-4">Nothing here yet</p>
          <p className="font-body text-sm text-on-surface-variant mt-1.5">
            Create a shot to start editing — or run Script to Shots to draft the whole episode.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {fragments.map((f, i) => (
            <FragmentCard
              key={f.id}
              fragment={f}
              busy={framingNow === f.id}
              onOpen={() => openComposer(f.id)}
              onDuplicate={() => duplicateProFragment(f.id)}
              onDelete={() => deleteProFragment(f.id)}
              onMoveUp={i > 0 ? () => moveProFragment(f.id, -1) : undefined}
              onMoveDown={i < fragments.length - 1 ? () => moveProFragment(f.id, 1) : undefined}
            />
          ))}
          {/* Trailing New Shot tile keeps the grid inviting (Artlist-style). */}
          <button
            type="button"
            onClick={onNewShot}
            className="rounded-2xl border border-dashed border-outline-variant/50 hover:border-primary/50 hover:text-primary transition-colors min-h-[180px] flex flex-col items-center justify-center gap-2 text-on-surface-variant"
          >
            <Plus className="w-5 h-5" />
            <span className="font-label text-[10px] uppercase tracking-wider">New Shot</span>
          </button>
        </div>
      )}
    </div>
  );
}

function FragmentCard({
  fragment,
  busy,
  onOpen,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  fragment: ProFragment;
  busy?: boolean;
  onOpen: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  const meta = STATUS_META[fragment.status];
  return (
    <div className="group rounded-2xl border border-outline-variant/40 bg-surface-container-low overflow-hidden hover:border-primary/40 transition-colors">
      {/* Thumb — key frame when framed, numbered slate otherwise */}
      <button type="button" onClick={onOpen} className="block w-full text-left">
        <div className="relative aspect-video bg-surface-container overflow-hidden">
          {fragment.frameUrl ? (
            <Image
              src={fragment.frameUrl}
              alt={fragment.title}
              width={960}
              height={540}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, #101014 0%, #16181c 55%, rgba(127,247,226,0.10) 100%)",
              }}
            >
              <span
                className="font-headline text-4xl text-transparent"
                style={{ WebkitTextStroke: "1px rgba(244,240,232,0.28)" }}
              >
                {fragment.title.replace(/\D+/g, "") || "—"}
              </span>
            </div>
          )}
          {busy && (
            <span className="absolute inset-0 z-10 flex items-center justify-center bg-surface/55 backdrop-blur-[2px]">
              <span className="shimmer-overlay" />
              <span className="relative inline-flex items-center gap-1.5 font-label text-[9px] uppercase tracking-widest text-amber-300">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Framing…
              </span>
            </span>
          )}
          <span
            className={cn(
              "absolute top-2 right-2 font-label text-[9px] uppercase tracking-widest border px-2 py-0.5 rounded-full backdrop-blur bg-surface/50",
              meta.cls
            )}
          >
            {meta.label}
          </span>
          {fragment.status === "directed" && (
            <span className="absolute bottom-2 right-2 font-label text-[9px] uppercase tracking-widest text-on-surface-variant/90 border border-outline-variant/40 bg-surface/60 px-1.5 py-0.5 rounded">
              {fragment.durationSec}s
            </span>
          )}
        </div>
      </button>

      <div className="px-3.5 py-3">
        <div className="flex items-center gap-2">
          <span className="font-label text-label-md uppercase tracking-wider text-on-surface">
            {fragment.title}
          </span>
          {fragment.dialogue && (
            <span className="font-body text-[10px] text-on-surface-variant/75 italic truncate">
              “{fragment.dialogue}”
            </span>
          )}
        </div>
        <p className="font-body text-xs text-on-surface-variant mt-1 line-clamp-2 min-h-[2rem]">
          {fragment.summary || "No description yet — open the composer to frame this shot."}
        </p>

        {/* Hover actions */}
        <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <CardIcon label="Edit" onClick={onOpen}>
            <Pencil className="w-3 h-3" />
          </CardIcon>
          <CardIcon label="Duplicate" onClick={onDuplicate}>
            <Copy className="w-3 h-3" />
          </CardIcon>
          <CardIcon label="Delete" onClick={onDelete} danger>
            <Trash2 className="w-3 h-3" />
          </CardIcon>
          <span className="ml-auto inline-flex gap-1">
            {onMoveUp && (
              <CardIcon label="Move up" onClick={onMoveUp}>
                <ArrowUp className="w-3 h-3" />
              </CardIcon>
            )}
            {onMoveDown && (
              <CardIcon label="Move down" onClick={onMoveDown}>
                <ArrowDown className="w-3 h-3" />
              </CardIcon>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

function CardIcon({
  label,
  onClick,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "w-7 h-7 rounded-full border border-outline-variant/50 flex items-center justify-center transition-colors",
        danger
          ? "text-on-surface-variant hover:border-error/60 hover:text-error"
          : "text-on-surface-variant hover:border-primary/50 hover:text-primary"
      )}
    >
      {children}
    </button>
  );
}
