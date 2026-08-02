"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  FolderOpen,
  ChevronDown,
  Check,
  Plus,
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
  ImagePlus,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import AgentPanel, { type AgentBoot } from "./AgentPanel";
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
/* Viral-template inspirations (local poster art; prompts prefill the vibe box). */
const INSPIRATIONS = [
  { title: "Rain-soaked rooftop revenge", img: "/posters/crimson-mirage.jpg", prompt: "A rain-soaked rooftop revenge micro drama — neon reflections, betrayal at midnight, 9:16." },
  { title: "Golden-hour perfume spot", img: "/posters/golden-core.jpg", prompt: "A 15s golden-hour perfume ad — macro product shots, silk and light, a whispered tagline." },
  { title: "Synthwave night drive", img: "/posters/aurora-crystal.jpg", prompt: "A synthwave night-drive music video — chrome, violet skyline, looping highway lights." },
  { title: "The printer is sentient", img: "/posters/exit-8.jpg", prompt: "A deadpan office comedy short where the printer becomes sentient and starts negotiating." },
  { title: "Lantern festival romance", img: "/posters/love-tears-us-apart.jpg", prompt: "A lantern festival romance micro film — paper light, missed trains, one shared umbrella." },
  { title: "Backstage in 22 minutes", img: "/posters/marty-supreme.jpg", prompt: "A backstage sports drama short — 22 minutes before the final, one taped-up racket." },
] as const;

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
    proAssets,
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

  /* Restore-on-mount, resolved inside initializers (render-safe): an agent
     chat interrupted by the signup gate reopens in place; a pending @mention
     or a previously open composer reopens the composer. */
  // Draft-mode agent chat (null = closed). A parked draft thread reopens with
  // its own mode + workflow; the panel itself restores the messages.
  const [agentBoot, setAgentBoot] = useState<AgentBoot | null>(() => {
    const d = readSession<{ open?: boolean; msgs?: unknown[]; mode?: "guided" | "auto"; workflow?: ProWorkflow }>(
      SK.agentDraft
    );
    if (d?.open && (d.msgs?.length ?? 0) > 1) {
      return { mode: d.mode ?? "guided", workflow: d.workflow ?? "film" };
    }
    return null;
  });
  // Text typed into the Create-screen vibe bar, seeded into the agent chat.
  const [vibeText, setVibeText] = useState("");
  const [composerId, setComposerId] = useState<string | null>(() => {
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

  // Composer and the draft-mode agent chat take over the whole section area.
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
  if (!project && agentBoot) {
    return (
      <div className="pt-2 pb-4">
        <AgentPanel
          key="draft"
          projectId={null}
          boot={agentBoot}
          dock={false}
          onProjectCreated={(id) => {
            setAgentBoot(null);
            setCurrentProProject(id);
          }}
          onGoEditor={onGoEditor}
          onClose={() => setAgentBoot(null)}
        />
      </div>
    );
  }

  /* Create home — Director-style (OpenArt): a large vibe prompt with
     reference attachments, example chips, quick starts, the project rack
     and viral-template inspirations. */
  if (!project) {
    const startAgent = (mode: AgentBoot["mode"], wf: ProWorkflow, seed?: string) => {
      if (mode === "auto" && !(seed && seed.trim())) {
        toast.error("Describe the video first — one line is enough");
        return;
      }
      setAgentBoot({ mode, workflow: wf, seed: seed?.trim() || undefined });
    };
    const coverOf = (pid: string) =>
      proFragments.find((f) => f.projectId === pid && (f.frameUrl || f.frames[0]))?.frameUrl;
    const statsOf = (pid: string) => {
      const fs = proFragments.filter((f) => f.projectId === pid);
      return `${fs.length} shots · ${fs.filter((f) => f.status === "directed").length} directed`;
    };
    return (
      <div className="max-w-[1080px] mx-auto pb-4">
        {/* ── Vibe prompt ── */}
        <div className="text-center pt-4">
          <h3
            className="font-headline text-[34px] leading-tight text-on-surface"
            style={{ textWrap: "balance" }}
          >
            Vibe Direct Your Next Video
          </h3>
          <p className="font-body text-sm text-on-surface-variant mt-1.5">
            Create videos by chatting with AI.
          </p>
        </div>

        <div className="mt-6 max-w-[760px] mx-auto rounded-[26px] border border-outline-variant/40 bg-surface-container-low/80 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
          <textarea
            value={vibeText}
            onChange={(e) => setVibeText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                startAgent("guided", "film", vibeText);
              }
            }}
            rows={2}
            placeholder="Describe the video in your head — the story, the mood, the style…"
            aria-label="describe your video"
            className="w-full bg-transparent border-none resize-none focus:outline-none font-body text-[15px] text-on-surface placeholder:text-on-surface-variant/60 leading-relaxed"
          />
          <div className="flex items-center gap-2 pt-2.5 mt-1 border-t border-outline-variant/25">
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="add a reference"
                className="w-8 h-8 rounded-full border border-outline-variant/50 flex items-center justify-center text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors"
              >
                <Plus className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[210px]">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                    Guide it with a reference
                  </DropdownMenuLabel>
                  {/* Mock attachments: each drops a token into the brief that
                      the agent acknowledges in its recap. */}
                  {[
                    { icon: ImagePlus, label: "Add an image", token: "[image: reference.png]" },
                    { icon: Music2, label: "Add a track", token: `♪ ${"Neon night drive · synthwave"}` },
                    {
                      icon: UsersRound,
                      label: "Mention a character",
                      token: `@${proAssets.find((a) => a.kind === "character")?.name ?? "Theo"}`,
                    },
                  ].map(({ icon: Icon, label, token }) => (
                    <DropdownMenuItem
                      key={label}
                      onClick={() => {
                        setVibeText((v) => (v ? `${v.trimEnd()} ${token}` : token));
                        toast.success(`${token} attached to the brief (mock)`);
                      }}
                      className="gap-2.5 cursor-pointer"
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant/60">
              Image · Track · @Character
            </span>
            <span className="flex-1" />
            <button
              type="button"
              onClick={() => startAgent("auto", "film", vibeText)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-outline-variant/50 font-label text-[10px] uppercase tracking-wider text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors"
            >
              <Zap className="w-3 h-3" /> Just make it
            </button>
            <button
              type="button"
              onClick={() => startAgent("guided", "film", vibeText)}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-primary text-on-primary font-label text-[10px] uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all"
            >
              <Wand2 className="w-3 h-3" /> Guide me
            </button>
          </div>
        </div>

        {/* Example chips */}
        <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
          {[
            "Create an anime micro drama",
            "Create a 15s glow serum ad",
            "Create a synthwave music video",
          ].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setVibeText(c)}
              className="px-3.5 py-1.5 rounded-full border border-outline-variant/40 font-body text-xs text-on-surface-variant hover:border-primary/50 hover:text-on-surface transition-colors"
            >
              {c}
            </button>
          ))}
        </div>

        {/* ── Quick Starts ── */}
        <div className="flex items-baseline justify-between mt-12 mb-3">
          <p className="font-headline text-lg text-on-surface">Quick Starts</p>
          <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant/70">
            4 workflows
          </span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {WORKFLOW_ORDER.map((wf) => {
            const cfg = WORKFLOWS[wf];
            const Icon = WF_ICON[wf];
            return (
              <button
                key={wf}
                type="button"
                onClick={() => startAgent("guided", wf, vibeText)}
                className="group shrink-0 w-[240px] text-left rounded-2xl border border-outline-variant/40 overflow-hidden hover:border-primary/50 transition-colors bg-surface-container-low flex items-stretch"
              >
                <span
                  className="w-[76px] shrink-0 flex items-center justify-center"
                  style={{ background: WF_TINT[wf] }}
                >
                  <Icon className="w-6 h-6 text-on-surface/85 group-hover:scale-110 transition-transform duration-300" />
                </span>
                <span className="px-3 py-2.5 min-w-0">
                  <span className="flex items-center gap-1.5">
                    <span className="font-label text-[11px] uppercase tracking-wider text-on-surface truncate">
                      {cfg.label}
                    </span>
                    {cfg.tag && (
                      <span
                        className={cn(
                          "font-label text-[7px] uppercase tracking-widest px-1 py-px rounded shrink-0",
                          cfg.tag === "Featured"
                            ? "bg-primary text-on-primary"
                            : "border border-outline-variant/50 text-on-surface-variant"
                        )}
                      >
                        {cfg.tag}
                      </span>
                    )}
                  </span>
                  <span className="block font-body text-[10.5px] text-on-surface-variant mt-1 leading-snug">
                    {cfg.tagline}
                  </span>
                </span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={onNewShot}
            className="shrink-0 w-[130px] rounded-2xl border border-dashed border-outline-variant/50 hover:border-primary/50 hover:text-primary transition-colors flex flex-col items-center justify-center gap-1.5 text-on-surface-variant"
          >
            <Plus className="w-4 h-4" />
            <span className="font-label text-[9px] uppercase tracking-wider">Blank project</span>
          </button>
        </div>

        {/* ── Director Projects ── */}
        {proProjects.length > 0 && (
          <>
            <div className="flex items-baseline justify-between mt-10 mb-3">
              <p className="font-headline text-lg text-on-surface">Director Projects</p>
              <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant/70">
                {proProjects.length} {proProjects.length === 1 ? "project" : "projects"}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {proProjects.slice(0, 8).map((pr) => {
                const cover = coverOf(pr.id);
                return (
                  <button
                    key={pr.id}
                    type="button"
                    onClick={() => setCurrentProProject(pr.id)}
                    aria-label={`Open project ${pr.title}`}
                    className="group text-left rounded-2xl border border-outline-variant/40 overflow-hidden hover:border-primary/50 transition-colors bg-surface-container-low"
                  >
                    <span
                      className="block aspect-video bg-surface-container"
                      style={
                        cover
                          ? { backgroundImage: `url(${cover})`, backgroundSize: "cover", backgroundPosition: "center" }
                          : { background: WF_TINT[pr.workflow ?? "film"] }
                      }
                    />
                    <span className="block px-3 py-2.5">
                      <span className="flex items-center gap-1.5">
                        <span className="font-body text-sm text-on-surface truncate">{pr.title}</span>
                        <span className="font-label text-[7px] uppercase tracking-widest bg-primary text-on-primary px-1 py-px rounded shrink-0">
                          {workflowOf(pr.workflow).badge}
                        </span>
                      </span>
                      <span className="block font-label text-[9px] uppercase tracking-widest text-on-surface-variant/75 mt-1">
                        {statsOf(pr.id)} · {new Date(pr.createdAt).toLocaleDateString()}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* ── Inspirations · Viral Templates ── */}
        <div className="flex items-baseline justify-between mt-10 mb-3">
          <p className="font-headline text-lg text-on-surface">Inspirations</p>
          <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant/70">
            Viral templates · recreate with your cast
          </span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {INSPIRATIONS.map((t) => (
            <button
              key={t.title}
              type="button"
              onClick={() => {
                setVibeText(t.prompt);
                toast.success("Template loaded — press Guide me to direct it");
              }}
              aria-label={`Use template ${t.title}`}
              className="group relative shrink-0 w-[148px] rounded-xl overflow-hidden border border-outline-variant/40 hover:border-primary/60 transition-colors"
            >
              <span
                className="block aspect-[2/3]"
                style={{ backgroundImage: `url(${t.img})`, backgroundSize: "cover", backgroundPosition: "center" }}
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent pt-8 pb-2 px-2.5">
                <span className="block font-body text-[11.5px] text-white leading-snug">{t.title}</span>
              </span>
              <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                <span className="px-3 py-1.5 rounded-full bg-primary text-on-primary font-label text-[9px] uppercase tracking-wider">
                  Remake
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* Project view — the agent thread docks left of the board (chat-first),
     and every store patch it makes shows up live in the grid beside it. */
  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(300px,360px)_minmax(0,1fr)] lg:items-start">
      <AgentPanel
        key={project.id}
        projectId={project.id}
        boot={null}
        dock
        onProjectCreated={setCurrentProProject}
        onGoEditor={onGoEditor}
      />
      <div className="min-w-0">
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
            Create a shot to start editing — or paste the script to the agent and let it draft the
            whole episode.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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
