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
  FileText,
  Loader2,
  Zap,
  Layers,
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
  PRO_COSTS,
  SK,
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
import { useStore, type ProFragment, type ProFragmentStatus } from "@/lib/store";
import { cn } from "@/lib/utils";

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
  const [stepperOpen, setStepperOpen] = useState(() => {
    const d = readSession<StepperDraft>(SK.stepper);
    return !!(d?.open && (d.title || d.script || (d.drafts?.length ?? 0) > 0));
  });
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
      createdAt: Date.now(),
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
  if (stepperOpen) {
    return (
      <ScriptStepper
        onClose={() => setStepperOpen(false)}
        onGoEditor={() => {
          setStepperOpen(false);
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

  /* Empty state — no project yet: lead with the two production entries. */
  if (!project) {
    return (
      <div className="rounded-3xl border border-outline-variant/40 bg-surface-container-lowest/60 px-6 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="font-headline text-2xl text-on-surface">Start a production</h3>
          <p className="font-body text-sm text-on-surface-variant mt-2">
            Split a full episode script into shots with the Superstar agent, or start from a single
            blank shot.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 mt-8 text-left">
            <button
              type="button"
              onClick={() => setStepperOpen(true)}
              className="rounded-2xl border border-primary/45 bg-primary-container/15 hover:bg-primary-container/30 transition-colors p-5"
            >
              <FileText className="w-5 h-5 text-primary" />
              <p className="font-label text-label-md uppercase tracking-wider text-on-surface mt-3">
                Script to Shots
              </p>
              <p className="font-body text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                Paste one full episode — the agent splits it into up to 80 shot drafts with detected
                cast, scenes and props.
              </p>
            </button>
            <button
              type="button"
              onClick={onNewShot}
              className="rounded-2xl border border-outline-variant/40 bg-surface-container-low hover:border-primary/40 transition-colors p-5"
            >
              <Plus className="w-5 h-5 text-on-surface-variant" />
              <p className="font-label text-label-md uppercase tracking-wider text-on-surface mt-3">
                Blank shot
              </p>
              <p className="font-body text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                Open the composer directly — frame it, direct it, add more shots as you go.
              </p>
            </button>
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
              <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant/75">
                {project.style}
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
              <DropdownMenuItem onClick={() => newProProject()} className="gap-2 cursor-pointer">
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
            onClick={() => setStepperOpen(true)}
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
                  "linear-gradient(135deg, #101014 0%, #16181c 55%, rgba(198,255,52,0.10) 100%)",
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
