"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Clapperboard,
  Download,
  FolderOpen,
  Loader2,
  Pause,
  Pencil,
  Play,
  Plus,
  Scissors,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { PRO_COSTS, fmtClock, frameImg, nowTs, proId, workflowOf } from "./pro-mock";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore, type ProExport, type ProWorkflow } from "@/lib/store";
import { cn } from "@/lib/utils";

/* ── Premiere — the project page ─────────────────────────────────────────
   Workflows generate the whole video, so a project opens on its finished
   cut, not a shot board: a mock player (cycles the directed frames), the
   spec strip, and the three ways out — export to Assets, fine-tune in the
   editor, or start the next video. Runs that stopped early (credits) show
   a resume card that finishes framing/directing and assembles the cut. */

export default function PremierePanel({
  onNewVideo,
  onGoEditor,
  onRevise,
}: {
  onNewVideo: () => void;
  onGoEditor: () => void;
  // Reopen the flow's intake form pre-filled to overwrite-regenerate.
  onRevise: (wf: ProWorkflow, projectId: string, brief: string) => void;
}) {
  const {
    proProjects,
    currentProProjectId,
    setCurrentProProject,
    renameProProject,
    updateProProject,
    deleteProProject,
    proFragments,
    proTimelines,
    updateProFragment,
    setProTimeline,
    addProExport,
    spendProCredits,
    isLoggedIn,
    openSignupGate,
  } = useStore();

  const project = proProjects.find((p) => p.id === currentProProjectId) ?? null;
  const fragments = project ? proFragments.filter((f) => f.projectId === project.id) : [];
  const directed = fragments.filter((f) => f.status === "directed");
  const pending = fragments.filter((f) => f.status !== "directed");
  const tl = project ? proTimelines[project.id] : undefined;
  const ready = fragments.length > 0 && pending.length === 0 && (tl?.video.length ?? 0) > 0;

  const [renaming, setRenaming] = useState(false);
  const [renameDraft, setRenameDraft] = useState("");
  // Mock playback: cycle the directed frames on a timer.
  const [playing, setPlaying] = useState(false);
  const [playIdx, setPlayIdx] = useState(0);
  // Resume-generation progress (frame → direct → assemble on the store).
  const [gen, setGen] = useState<{ stage: string; done: number; total: number } | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState<ProExport | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const playTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      if (playTimer.current) clearInterval(playTimer.current);
    },
    []
  );

  if (!project) return null;
  const cfg = workflowOf(project.workflow);
  const aspect = project.aspect ?? cfg.aspect;
  const totalSec = tl
    ? tl.video.reduce((s, c) => s + (c.outSec - c.inSec), 0)
    : directed.reduce((s, f) => s + f.durationSec, 0);
  const cover = directed[0]?.frameUrl ?? fragments.find((f) => f.frameUrl)?.frameUrl;
  const shownFrame = playing ? (directed[playIdx]?.frameUrl ?? cover) : cover;

  const stopPlayback = () => {
    if (playTimer.current) clearInterval(playTimer.current);
    playTimer.current = null;
    setPlaying(false);
    setPlayIdx(0);
  };
  const startPlayback = () => {
    if (directed.length === 0) return;
    setPlaying(true);
    setPlayIdx(0);
    let i = 0;
    playTimer.current = setInterval(() => {
      i += 1;
      if (i >= directed.length) {
        stopPlayback();
      } else {
        setPlayIdx(i);
      }
    }, 900);
  };

  /* Resume a run that stopped early: frame the drafts, direct everything,
     then assemble — same staged spending and safe-stop as the pipelines. */
  const directQueue = (ids: string[], idx: number) => {
    if (idx >= ids.length) {
      setGen({ stage: "Assembling", done: 1, total: 1 });
      timers.current.push(
        setTimeout(() => {
          const all = useStore
            .getState()
            .proFragments.filter((f) => f.projectId === project.id && f.status === "directed");
          setProTimeline(project.id, {
            video: all.map((f) => ({ id: proId("clip"), fragmentId: f.id, inSec: 0, outSec: f.durationSec })),
            audio: [],
          });
          setGen(null);
          toast.success("Premiere ready — roll it");
        }, 800)
      );
      return;
    }
    timers.current.push(
      setTimeout(() => {
        const frag = useStore.getState().proFragments.find((f) => f.id === ids[idx]);
        const url = frag?.frameUrl ?? frameImg(`${ids[idx]}-resume`);
        updateProFragment(ids[idx], {
          status: "directed",
          frameUrl: url,
          frames: frag?.frames.length ? frag.frames : [url],
        });
        setGen({ stage: "Directing", done: idx + 1, total: ids.length });
        directQueue(ids, idx + 1);
      }, 900)
    );
  };
  const frameQueue = (ids: string[], idx: number, next: string[]) => {
    if (idx >= ids.length) {
      if (!spendProCredits(next.length * PRO_COSTS.video)) {
        setGen(null);
        toast.error("Not enough credits to direct — framed shots are saved");
        return;
      }
      setGen({ stage: "Directing", done: 0, total: next.length });
      directQueue(next, 0);
      return;
    }
    timers.current.push(
      setTimeout(() => {
        const seed = `${ids[idx]}-${nowTs()}`;
        const fresh = [frameImg(`${seed}-a`), frameImg(`${seed}-b`)];
        updateProFragment(ids[idx], { frames: fresh, frameUrl: fresh[0], status: "framed" });
        setGen({ stage: "Framing", done: idx + 1, total: ids.length });
        frameQueue(ids, idx + 1, next);
      }, 800)
    );
  };
  const resume = () => {
    if (!isLoggedIn) {
      openSignupGate("/discovery/workspace");
      return;
    }
    if (gen) return;
    const toFrame = fragments.filter((f) => f.status === "draft").map((f) => f.id);
    const toDirect = pending.map((f) => f.id);
    if (!spendProCredits(toFrame.length * PRO_COSTS.frame)) {
      toast.error("Not enough credits to frame the remaining shots");
      return;
    }
    if (toFrame.length > 0) {
      setGen({ stage: "Framing", done: 0, total: toFrame.length });
      frameQueue(toFrame, 0, toDirect);
    } else {
      if (!spendProCredits(toDirect.length * PRO_COSTS.video)) {
        toast.error("Not enough credits to direct the remaining shots");
        return;
      }
      setGen({ stage: "Directing", done: 0, total: toDirect.length });
      directQueue(toDirect, 0);
    }
  };
  const resumeCost =
    fragments.filter((f) => f.status === "draft").length * PRO_COSTS.frame +
    pending.length * PRO_COSTS.video;

  const exportCut = () => {
    if (exporting || !ready) return;
    setExporting(true);
    timers.current.push(
      setTimeout(() => {
        const exp: ProExport = {
          id: proId("export"),
          title: `${project.title} — Final Cut`,
          projectTitle: project.title,
          durationSec: Math.round(totalSec * 10) / 10,
          clipCount: tl?.video.length ?? directed.length,
          coverUrl: cover,
          createdAt: nowTs(),
        };
        addProExport(exp);
        setExporting(false);
        setExported(exp);
        toast.success("Exported — the cut is in your Assets");
      }, 1800)
    );
  };

  return (
    <div className="max-w-[980px] mx-auto">
      {/* Project row */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        {/* Back into the making-of: staged film projects re-enter the
            pipeline at casting (bindings intact — the cut is only replaced
            when a re-shoot finishes); everything else reopens its intake
            form pre-filled for an overwrite re-generate. */}
        <button
          type="button"
          onClick={() => {
            if (project.workflow === "film" && project.scenes?.length) {
              updateProProject(project.id, { stage: "assets" });
            } else {
              onRevise(project.workflow ?? "film", project.id, project.brief ?? "");
            }
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-outline-variant/50 font-label text-[10px] uppercase tracking-wider text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          {project.workflow === "film" && project.scenes?.length
            ? "Back · Production"
            : "Back · Edit brief"}
        </button>
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
                {cfg.badge}
              </span>
              <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant/75">
                {project.style} · {aspect}
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
              <DropdownMenuItem onClick={onNewVideo} className="gap-2 cursor-pointer">
                <Plus className="w-3.5 h-3.5" /> New video
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
          {fragments.length} shots · {fmtClock(Math.round(totalSec))}
          {cfg.hasTrack && project.trackTitle ? ` · ♪ ${project.trackTitle}` : ""}
        </span>
        <span
          className={cn(
            "ml-auto inline-flex items-center gap-1.5 font-label text-[9px] uppercase tracking-widest border px-2 py-0.5 rounded-full",
            ready
              ? "border-primary/50 text-primary bg-primary-container/25"
              : "border-amber-400/60 text-amber-300"
          )}
        >
          {ready ? <Check className="w-2.5 h-2.5" /> : <Loader2 className="w-2.5 h-2.5" />}
          {ready ? "Premiere ready" : `${pending.length} shots pending`}
        </span>
      </div>

      {/* Player */}
      <div
        className={cn(
          "relative rounded-3xl overflow-hidden border border-outline-variant/40 bg-black",
          aspect === "9:16" ? "aspect-[9/16] max-h-[560px] mx-auto w-auto" : "aspect-video w-full"
        )}
        style={
          shownFrame
            ? { backgroundImage: `url(${shownFrame})`, backgroundSize: "cover", backgroundPosition: "center" }
            : { background: "linear-gradient(135deg, #101014 0%, #16181c 55%, rgba(127,247,226,0.12) 100%)" }
        }
      >
        <span className="absolute top-3 left-3 font-label text-[9px] uppercase tracking-widest text-white/90 bg-black/45 px-2 py-1 rounded-full">
          {project.title}
        </span>
        {ready && (
          <button
            type="button"
            onClick={playing ? stopPlayback : startPlayback}
            aria-label={playing ? "pause preview" : "play preview"}
            className="absolute inset-0 flex items-center justify-center group"
          >
            <span
              className={cn(
                "w-16 h-16 rounded-full border flex items-center justify-center transition-all backdrop-blur",
                playing
                  ? "border-white/30 bg-black/30 opacity-0 group-hover:opacity-100"
                  : "border-primary/60 bg-black/40 text-primary group-hover:scale-105"
              )}
            >
              {playing ? (
                <Pause className="w-6 h-6 text-white" fill="currentColor" />
              ) : (
                <Play className="w-6 h-6 ml-1" fill="currentColor" />
              )}
            </span>
          </button>
        )}
        {!ready && !gen && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/55 backdrop-blur-[2px] px-6 text-center">
            <Sparkles className="w-6 h-6 text-amber-300" />
            <p className="font-headline text-xl text-white mt-3">Generation stopped early</p>
            <p className="font-body text-xs text-white/70 mt-1.5 max-w-[360px] leading-relaxed">
              {pending.length} of {fragments.length} shots still need work — resume the run and
              I&apos;ll finish framing, directing and assembly.
            </p>
            <button
              type="button"
              onClick={resume}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-primary text-on-primary font-label text-[10px] uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all"
            >
              <Sparkles className="w-3 h-3" /> Resume generation
              <span className="inline-flex items-center gap-0.5 border-l border-on-primary/30 pl-1.5 ml-0.5">
                <Zap className="w-2.5 h-2.5" fill="currentColor" /> {resumeCost}
              </span>
            </button>
          </div>
        )}
        {gen && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px]">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <p className="font-label text-[10px] uppercase tracking-widest text-white mt-3">
              {gen.stage} {gen.total > 1 ? `${gen.done}/${gen.total}` : ""}
            </p>
          </div>
        )}
        {/* Transport strip */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pt-8 pb-3">
          <div className="h-[3px] rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: ready ? `${playing ? ((playIdx + 1) / Math.max(1, directed.length)) * 100 : 0}%` : "0%" }}
            />
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="font-label text-[9px] uppercase tracking-widest text-white/80">
              {playing ? `Shot ${String(playIdx + 1).padStart(2, "0")} / ${String(directed.length).padStart(2, "0")}` : fmtClock(0)}
            </span>
            <span className="font-label text-[9px] uppercase tracking-widest text-white/80">
              {fmtClock(Math.round(totalSec))}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-2 flex-wrap mt-5">
        <button
          type="button"
          onClick={exportCut}
          disabled={!ready || exporting}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary text-on-primary font-label text-label-md uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
        >
          {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          {exporting ? "Exporting…" : "Export to Assets"}
        </button>
        <button
          type="button"
          onClick={onGoEditor}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-primary/45 text-primary font-label text-label-md uppercase tracking-wider hover:bg-primary-container/25 transition-colors"
        >
          <Scissors className="w-3.5 h-3.5" /> Fine-tune in Editor
        </button>
        <button
          type="button"
          onClick={onNewVideo}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-outline-variant/50 text-on-surface-variant font-label text-label-md uppercase tracking-wider hover:border-primary/50 hover:text-primary transition-colors"
        >
          <Clapperboard className="w-3.5 h-3.5" /> New video
        </button>
      </div>
      {exported && (
        <p className="font-body text-xs text-on-surface-variant text-center mt-3">
          “{exported.title}” is in{" "}
          <Link href="/assets?tab=final" className="text-primary hover:underline">
            My Assets
          </Link>{" "}
          — distribute it from there anytime.
        </p>
      )}
    </div>
  );
}
