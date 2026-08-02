"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  Box,
  Check,
  Clapperboard,
  FileText,
  Loader2,
  Mountain,
  Play,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  UsersRound,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { assetImg, frameImg, fmtShotNo, mockScript, nowTs, proId, PRO_COSTS } from "./pro-mock";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  useStore,
  type ProAsset,
  type ProAssetKind,
  type ProAssetRef,
  type ProFilmStage,
  type ProFragment,
  type ProProject,
  type ProScene,
} from "@/lib/store";
import { cn } from "@/lib/utils";

/* ── Micro Film pipeline ─────────────────────────────────────────────────
   The staged script → assets → film flow (film workflow only — the other
   workflows still direct the whole cut in one run). Step ① edits the
   parsed scene cards; step ② binds every cast/location/prop the script
   calls for (mandatory — this is the Powered-by-Superstar production
   story); step ③ frames and directs each scene with its bound assets and
   lands on the premiere page. */

const STEPS: { id: ProFilmStage; n: number; label: string; icon: typeof FileText }[] = [
  { id: "script", n: 1, label: "Script", icon: FileText },
  { id: "assets", n: 2, label: "Cast & Assets", icon: UsersRound },
  { id: "film", n: 3, label: "Production", icon: Clapperboard },
];

const KIND_META: Record<ProAssetKind, { label: string; icon: typeof UsersRound; chip: string }> = {
  character: { label: "Cast", icon: UsersRound, chip: "border-primary/45 text-primary" },
  scene: { label: "Locations", icon: Mountain, chip: "border-secondary/50 text-secondary" },
  prop: { label: "Props", icon: Box, chip: "border-tertiary/50 text-tertiary" },
};

// Reroll variations for scene summaries / beats (deterministic-ish per click).
const REROLL_SUMMARIES = [
  "The camera creeps closer; neither of them will say it first.",
  "Rain starts mid-sentence — nobody moves to leave.",
  "A phone buzzes face-down. Everyone pretends not to hear it.",
  "One long take: the truth arrives in the reflection, not the face.",
];
const REROLL_BEATS = [
  "You knew. The whole time, you knew.",
  "Say it again — slower this time.",
  "I didn't come back for you. I came back for what's mine.",
  "Don't. If you finish that sentence, we're done.",
];

interface FilmShot {
  sceneId: string;
  heading: string;
  summary: string;
  beat: string;
  refKeys: string[];
  frameUrl?: string;
  directed?: boolean;
}
interface FilmRun {
  stage: "frame" | "direct";
  shots: FilmShot[];
  done: number;
  total: number;
}

export default function FilmPipeline({
  project,
  onBack,
}: {
  project: ProProject;
  onBack: () => void;
}) {
  const {
    proAssets,
    proFragments,
    addProAsset,
    updateProProject,
    deleteProjectCut,
    addProFragments,
    setProTimeline,
    spendProCredits,
    isLoggedIn,
    openSignupGate,
  } = useStore();

  const stage: ProFilmStage = project.stage ?? "script";
  const scenes = project.scenes ?? [];
  const refs = project.assetRefs ?? [];
  // An earlier cut exists (re-entered from the premiere): it stays reachable
  // and intact until a re-shoot commits over it.
  const hasCut = proFragments.some((f) => f.projectId === project.id);

  const setScenes = (next: ProScene[]) => updateProProject(project.id, { scenes: next });
  const gotoStage = (s: ProFilmStage) => updateProProject(project.id, { stage: s });

  const assetOf = (ref: ProAssetRef): ProAsset | null =>
    (ref.assetId && proAssets.find((a) => a.id === ref.assetId)) || null;
  const boundCount = refs.filter((r) => assetOf(r)).length;
  const allBound = refs.length > 0 && boundCount === refs.length;

  /* ── step ① back target: brief editor (re-parse charges again) ── */
  const [editingBrief, setEditingBrief] = useState(false);
  const [briefText, setBriefText] = useState(project.brief ?? "");
  const [reparseConfirm, setReparseConfirm] = useState(false);

  /* ── step ② auto-cast state ── */
  const [castingKey, setCastingKey] = useState<string | null>(null);
  const [castBlocked, setCastBlocked] = useState(false);
  const castRunning = useRef(false);

  /* ── step ③ run state ── */
  const [run, setRun] = useState<FilmRun | null>(null);
  const runRef = useRef<FilmRun | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const setRunBoth = (r: FilmRun | null) => {
    runRef.current = r;
    setRun(r);
  };
  const later = (ms: number, fn: () => void) => {
    timers.current.push(setTimeout(fn, ms));
  };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const gate = () => {
    if (!isLoggedIn) {
      openSignupGate("/discovery/workspace");
      return false;
    }
    return true;
  };

  /* ── brief re-parse (destructive: rebuilds scenes + manifest) ── */
  const reparse = () => {
    if (!gate()) return;
    if (!briefText.trim()) {
      toast.error("The brief is empty — give it something to parse");
      return;
    }
    if (!spendProCredits(PRO_COSTS.script)) {
      toast.error("Not enough credits (mock balance)");
      return;
    }
    const { scenes: nextScenes, assetRefs } = mockScript(briefText, scenes.length || 5);
    updateProProject(project.id, {
      brief: briefText,
      scenes: nextScenes,
      assetRefs,
      stage: "script",
    });
    setReparseConfirm(false);
    setEditingBrief(false);
    toast.success(`Re-parsed — ${nextScenes.length} scenes, ${assetRefs.length} roles to cast`);
  };

  /* ── step ① actions ── */
  const patchScene = (id: string, patch: Partial<ProScene>) =>
    setScenes(scenes.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const rerollScene = (id: string) => {
    const t = nowTs();
    patchScene(id, {
      summary: REROLL_SUMMARIES[t % REROLL_SUMMARIES.length],
      beat: REROLL_BEATS[t % REROLL_BEATS.length],
    });
    toast.success("Scene rewritten");
  };

  const deleteScene = (id: string) => {
    if (scenes.length <= 4) {
      toast.error("A micro film needs at least 4 scenes");
      return;
    }
    setScenes(scenes.filter((s) => s.id !== id));
  };

  const addScene = () => {
    if (scenes.length >= 6) {
      toast.error("Six scenes is the cap — keep it micro");
      return;
    }
    const t = nowTs();
    setScenes([
      ...scenes,
      {
        id: `sc-${t}`,
        heading: `S${scenes.length + 1} · New Scene`,
        summary: REROLL_SUMMARIES[t % REROLL_SUMMARIES.length],
        beat: REROLL_BEATS[(t + 1) % REROLL_BEATS.length],
        refKeys: refs.slice(0, 2).map((r) => r.key),
      },
    ]);
  };

  /* ── step ② actions: auto-cast + per-card regenerate ──
     Timer chains bind against the freshest store state (the captured
     `refs` snapshot would drop earlier binds in the same batch). */
  const bindFresh = (key: string, assetId: string) => {
    const st = useStore.getState();
    const proj = st.proProjects.find((p) => p.id === project.id);
    if (!proj?.assetRefs) return;
    st.updateProProject(project.id, {
      assetRefs: proj.assetRefs.map((r) =>
        r.key === key ? { ...r, assetId, source: "generated" } : r
      ),
    });
  };

  const castLook = (ref: ProAssetRef) => {
    const asset: ProAsset = {
      id: proId("asset"),
      kind: ref.kind,
      name: ref.name,
      desc: ref.desc,
      imageUrl: assetImg(ref.kind, `${ref.key}-${nowTs()}`),
      createdAt: nowTs(),
    };
    addProAsset(asset);
    bindFresh(ref.key, asset.id);
  };

  const runAutoCast = () => {
    if (castRunning.current) return;
    const st = useStore.getState();
    const proj = st.proProjects.find((p) => p.id === project.id);
    const queue = (proj?.assetRefs ?? []).filter(
      (r) => !(r.assetId && st.proAssets.some((a) => a.id === r.assetId))
    );
    if (queue.length === 0) return;
    if (!st.spendProCredits(queue.length * PRO_COSTS.asset)) {
      setCastBlocked(true);
      return;
    }
    setCastBlocked(false);
    castRunning.current = true;
    const step = (i: number) => {
      if (i >= queue.length) {
        castRunning.current = false;
        setCastingKey(null);
        toast.success(`Cast complete — ${queue.length} looks generated`);
        return;
      }
      setCastingKey(queue[i].key);
      later(900, () => {
        castLook(queue[i]);
        step(i + 1);
      });
    };
    step(0);
  };

  /* Entering ② casts everything the form didn't provide, in one charged
     batch — no per-card generate clicks. Timer-scheduled so the effect
     never sets state synchronously. */
  useEffect(() => {
    if (stage !== "assets") return undefined;
    const tm = setTimeout(runAutoCast, 500);
    return () => clearTimeout(tm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const regenerate = (ref: ProAssetRef) => {
    if (!gate()) return;
    if (castRunning.current || castingKey) return;
    if (!spendProCredits(PRO_COSTS.asset)) {
      toast.error("Not enough credits (mock balance)");
      return;
    }
    setCastingKey(ref.key);
    later(900, () => {
      castLook(ref);
      setCastingKey(null);
      toast.success(`${ref.name} — new look generated`);
    });
  };

  /* ── step ③ run ── */
  /* Directed shots commit WITHOUT a timeline: fragments-without-cut is the
     review state (survives navigation/reload) where every take can be
     previewed and re-shot. Assembling is a separate, explicit confirm. The
     old cut is only replaced here — the moment the new takes land. */
  const commitRun = (shots: FilmShot[], level: "directed" | "framed") => {
    deleteProjectCut(project.id);
    const now = nowTs();
    const frags = shots.map((s, i) => ({
      id: proId("frag"),
      projectId: project.id,
      title: fmtShotNo(i + 1),
      summary: `${s.heading} — ${s.summary}`,
      dialogue: s.beat,
      status: level === "directed" ? "directed" : s.frameUrl ? "framed" : "draft",
      frames: s.frameUrl ? [s.frameUrl] : [],
      frameUrl: s.frameUrl,
      durationSec: 6,
      createdAt: now + i,
    })) satisfies ProFragment[];
    addProFragments(frags);
    setRunBoth(null);
    if (level === "directed") {
      toast.success(`${frags.length} takes ready — preview each shot, then assemble`);
    } else {
      updateProProject(project.id, { stage: "premiere" });
      toast.success("Credits ran out mid-run — progress saved on the project page");
    }
  };

  /* Review-state helpers (fragments committed, no timeline yet). */
  const projectFrags = proFragments
    .filter((f) => f.projectId === project.id)
    .sort((a, b) => a.createdAt - b.createdAt);
  const inReview =
    stage === "film" &&
    !run &&
    projectFrags.length > 0 &&
    projectFrags.every((f) => f.status === "directed") &&
    !useStore.getState().proTimelines[project.id];

  const [regenShotId, setRegenShotId] = useState<string | null>(null);
  const [previewShotId, setPreviewShotId] = useState<string | null>(null);
  const [assembling, setAssembling] = useState(false);
  const previewFrag = previewShotId
    ? (projectFrags.find((f) => f.id === previewShotId) ?? null)
    : null;

  const regenerateShot = (fragId: string) => {
    if (!gate()) return;
    if (regenShotId || assembling) return;
    if (!spendProCredits(PRO_COSTS.frame + PRO_COSTS.video)) {
      toast.error("Not enough credits (mock balance)");
      return;
    }
    setRegenShotId(fragId);
    later(1400, () => {
      const url = frameImg(`retake-${fragId}-${nowTs()}`);
      useStore.getState().updateProFragment(fragId, { frameUrl: url, frames: [url] });
      setRegenShotId(null);
      toast.success("Shot re-taken — preview the new take");
    });
  };

  const assembleCut = () => {
    if (assembling || regenShotId) return;
    setAssembling(true);
    later(900, () => {
      setProTimeline(project.id, {
        video: projectFrags.map((f) => ({
          id: proId("clip"),
          fragmentId: f.id,
          inSec: 0,
          outSec: f.durationSec,
        })),
        audio: [],
      });
      setAssembling(false);
      updateProProject(project.id, { stage: "premiere" });
      toast.success(`Premiere ready — ${projectFrags.length} shots, cut assembled`);
    });
  };

  const directStep = (shots: FilmShot[], idx: number) => {
    if (idx >= shots.length) {
      later(600, () => commitRun(shots, "directed"));
      return;
    }
    later(800, () => {
      shots[idx] = { ...shots[idx], directed: true };
      setRunBoth({ stage: "direct", shots: [...shots], done: idx + 1, total: shots.length });
      directStep(shots, idx + 1);
    });
  };

  const frameStep = (shots: FilmShot[], idx: number) => {
    if (idx >= shots.length) {
      if (!spendProCredits(shots.length * PRO_COSTS.video)) {
        commitRun(shots, "framed");
        return;
      }
      setRunBoth({ stage: "direct", shots, done: 0, total: shots.length });
      directStep(shots, 0);
      return;
    }
    later(700, () => {
      shots[idx] = { ...shots[idx], frameUrl: frameImg(`film-${shots[idx].sceneId}-${nowTs()}`) };
      setRunBoth({ stage: "frame", shots: [...shots], done: idx + 1, total: shots.length });
      frameStep(shots, idx + 1);
    });
  };

  const startProduction = () => {
    if (!gate()) return;
    if (!spendProCredits(scenes.length * PRO_COSTS.frame)) {
      toast.error("Not enough credits (mock balance)");
      return;
    }
    const shots: FilmShot[] = scenes.map((s) => ({
      sceneId: s.id,
      heading: s.heading,
      summary: s.summary,
      beat: s.beat,
      refKeys: s.refKeys,
    }));
    setRunBoth({ stage: "frame", shots, done: 0, total: shots.length });
    frameStep(shots, 0);
  };

  /* Mini avatar row for the assets a scene/shot uses. */
  const RefAvatars = ({ keys, size = 22 }: { keys: string[]; size?: number }) => (
    <span className="inline-flex items-center -space-x-1.5">
      {keys
        .map((k) => refs.find((r) => r.key === k))
        .filter((r): r is ProAssetRef => Boolean(r))
        .map((r) => {
          const a = assetOf(r);
          const Icon = KIND_META[r.kind].icon;
          return a ? (
            <Image
              key={r.key}
              src={a.imageUrl}
              alt={r.name}
              width={size}
              height={size}
              title={r.name}
              className="rounded-full object-cover border border-surface"
              style={{ width: size, height: size }}
            />
          ) : (
            <span
              key={r.key}
              title={r.name}
              className="rounded-full border border-outline-variant/50 bg-surface-container flex items-center justify-center text-on-surface-variant"
              style={{ width: size, height: size }}
            >
              <Icon style={{ width: size * 0.5, height: size * 0.5 }} />
            </span>
          );
        })}
    </span>
  );

  return (
    <div>
      {/* Header: back + title + stepper */}
      <div className="flex items-center gap-3 flex-wrap mb-5">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-outline-variant/50 font-label text-[10px] uppercase tracking-wider text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-3 h-3" /> Projects
        </button>
        <div className="min-w-0">
          <h3 className="font-headline text-lg text-on-surface truncate leading-tight">
            {project.title}
          </h3>
          <p className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant/80">
            Micro Film · Powered by Superstar
          </p>
        </div>
        {/* Stepper */}
        <div className="ml-auto flex items-center gap-1.5">
          {hasCut && !run && !inReview && (
            <button
              type="button"
              onClick={() => gotoStage("premiere")}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-secondary/45 font-label text-[10px] uppercase tracking-wider text-secondary hover:bg-secondary/10 transition-colors mr-1"
            >
              Premiere ↗
            </button>
          )}
          {STEPS.map((s, i) => {
            const idx = STEPS.findIndex((x) => x.id === stage);
            const done = i < idx;
            const current = s.id === stage;
            // Backwards only, and never once the cameras are rolling.
            const clickable = done && !run;
            const Icon = s.icon;
            return (
              <span key={s.id} className="flex items-center gap-1.5">
                {i > 0 && <span className="w-4 h-px bg-outline-variant/50" aria-hidden="true" />}
                <button
                  type="button"
                  disabled={!clickable}
                  onClick={() => clickable && gotoStage(s.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 pl-1.5 pr-3 py-1.5 rounded-full border font-label text-[10px] uppercase tracking-wider transition-colors",
                    current
                      ? "border-primary bg-primary text-on-primary"
                      : done
                        ? "border-primary/45 text-primary hover:bg-primary-container/25"
                        : "border-outline-variant/40 text-on-surface-variant/70",
                    !clickable && !current && "cursor-default"
                  )}
                >
                  <span
                    className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center",
                      current ? "bg-on-primary/15" : "bg-surface-container"
                    )}
                  >
                    {done ? <Check className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
                  </span>
                  {s.n}. {s.label}
                </button>
              </span>
            );
          })}
        </div>
      </div>

      {/* ── ① back target: brief editor ── */}
      {stage === "script" && editingBrief && (
        <div className="animate-fade-up max-w-2xl">
          <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">
            Original brief
          </p>
          <textarea
            value={briefText}
            onChange={(e) => setBriefText(e.target.value)}
            rows={7}
            aria-label="film brief"
            className="w-full rounded-2xl border border-outline-variant/40 bg-surface-container-lowest/70 p-4 font-body text-sm text-on-surface leading-relaxed resize-none focus:outline-none focus:border-primary/50"
          />
          <p className="font-body text-[12px] text-on-surface-variant mt-2">
            Re-parsing rebuilds the scene cards and the asset manifest — scene edits and existing
            bindings are replaced.
          </p>
          <div className="flex items-center gap-3 mt-4">
            <button
              type="button"
              onClick={() => {
                setBriefText(project.brief ?? "");
                setEditingBrief(false);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-outline-variant/50 font-label text-[10px] uppercase tracking-wider text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-3 h-3" /> Back · Script
            </button>
            <button
              type="button"
              onClick={() => setReparseConfirm(true)}
              className="ml-auto inline-flex items-center gap-2 bg-primary text-on-primary font-label text-label-md uppercase tracking-wider px-6 py-3 rounded-full hover:opacity-90 active:scale-95 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Re-parse script
              <span className="inline-flex items-center gap-0.5 opacity-80">
                <Zap className="w-3 h-3" fill="currentColor" /> {PRO_COSTS.script}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ── ① Script ── */}
      {stage === "script" && !editingBrief && (
        <div className="animate-fade-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scenes.map((sc) => (
              <div
                key={sc.id}
                className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest/70 p-4"
              >
                <div className="flex items-center gap-2">
                  <input
                    value={sc.heading}
                    onChange={(e) => patchScene(sc.id, { heading: e.target.value })}
                    aria-label="scene heading"
                    className="flex-1 min-w-0 bg-transparent border-none focus:outline-none focus:ring-0 font-label text-[11px] uppercase tracking-wider text-primary"
                  />
                  <button
                    type="button"
                    onClick={() => rerollScene(sc.id)}
                    title="Rewrite this scene"
                    className="w-7 h-7 rounded-full border border-outline-variant/45 flex items-center justify-center text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteScene(sc.id)}
                    title="Delete scene"
                    className="w-7 h-7 rounded-full border border-outline-variant/45 flex items-center justify-center text-on-surface-variant hover:border-error/60 hover:text-error transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <textarea
                  value={sc.summary}
                  onChange={(e) => patchScene(sc.id, { summary: e.target.value })}
                  rows={2}
                  aria-label="scene summary"
                  className="mt-2 w-full bg-transparent border-none resize-none focus:outline-none focus:ring-0 font-body text-sm text-on-surface leading-snug"
                />
                <p className="font-body text-[12px] italic text-on-surface-variant border-l-2 border-primary/40 pl-2.5 mt-1">
                  “{sc.beat}”
                </p>
                <div className="flex items-center gap-1.5 flex-wrap mt-3">
                  {sc.refKeys
                    .map((k) => refs.find((r) => r.key === k))
                    .filter((r): r is ProAssetRef => Boolean(r))
                    .map((r) => (
                      <span
                        key={r.key}
                        className={cn(
                          "font-label text-[8px] uppercase tracking-widest border px-1.5 py-0.5 rounded-full",
                          KIND_META[r.kind].chip
                        )}
                      >
                        {r.name}
                      </span>
                    ))}
                </div>
              </div>
            ))}
            {/* Add scene */}
            <button
              type="button"
              onClick={addScene}
              className="rounded-2xl border border-dashed border-outline-variant/50 min-h-[120px] flex flex-col items-center justify-center gap-1.5 text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="font-label text-[10px] uppercase tracking-wider">Add scene</span>
            </button>
          </div>
          <div className="flex items-center gap-3 mt-5 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setBriefText(project.brief ?? "");
                setEditingBrief(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-outline-variant/50 font-label text-[10px] uppercase tracking-wider text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-3 h-3" /> Back · Brief
            </button>
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
              {scenes.length} scenes · {refs.length} assets to cast
            </p>
            <button
              type="button"
              onClick={() => gotoStage("assets")}
              className="ml-auto inline-flex items-center gap-2 bg-primary text-on-primary font-label text-label-md uppercase tracking-wider px-6 py-3 rounded-full hover:opacity-90 active:scale-95 transition-all"
            >
              Lock script — {boundCount === refs.length ? "review the cast" : "auto-cast"}
              {boundCount < refs.length && (
                <span className="inline-flex items-center gap-0.5 opacity-80">
                  <Zap className="w-3 h-3" fill="currentColor" />
                  {(refs.length - boundCount) * PRO_COSTS.asset}
                </span>
              )}
              <UsersRound className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── ② Cast & Assets ── */}
      {stage === "assets" && (
        <div className="animate-fade-up">
          <div className="flex items-center gap-2.5 rounded-2xl border border-primary/30 bg-primary-container/15 px-4 py-2.5 mb-5 flex-wrap">
            {castingKey ? (
              <Loader2 className="w-3.5 h-3.5 text-primary animate-spin shrink-0" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
            )}
            <p className="font-body text-[12.5px] text-on-surface-variant">
              {castingKey
                ? "Auto-casting — every look the form didn't provide is being generated…"
                : castBlocked
                  ? "Not enough credits to auto-cast the remaining looks."
                  : allBound
                    ? "Cast locked. References from your form are bound as-is; regenerate any look you want re-rolled."
                    : "Looks from your form show as references; the rest auto-generate here."}
            </p>
            {castBlocked && !castingKey && (
              <button
                type="button"
                onClick={runAutoCast}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-on-primary font-label text-[10px] uppercase tracking-wider hover:opacity-90 transition-all"
              >
                <Zap className="w-2.5 h-2.5" fill="currentColor" /> Retry auto-cast
              </button>
            )}
            <span className="ml-auto shrink-0 font-label text-[10px] uppercase tracking-widest text-primary">
              {boundCount}/{refs.length} cast
            </span>
          </div>

          {(["character", "scene", "prop"] as ProAssetKind[]).map((kind) => {
            const group = refs.filter((r) => r.kind === kind);
            if (group.length === 0) return null;
            const Meta = KIND_META[kind];
            const GroupIcon = Meta.icon;
            return (
              <div key={kind} className="mb-6">
                <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-2.5 flex items-center gap-1.5">
                  <GroupIcon className="w-3.5 h-3.5" /> {Meta.label}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.map((ref) => {
                    const bound = assetOf(ref);
                    const isCasting = castingKey === ref.key;
                    return (
                      <div
                        key={ref.key}
                        className={cn(
                          "rounded-2xl border p-4",
                          bound
                            ? "border-primary/40 bg-primary-container/10"
                            : "border-outline-variant/40 bg-surface-container-lowest/70"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {bound && !isCasting ? (
                            <Image
                              src={bound.imageUrl}
                              alt={ref.name}
                              width={56}
                              height={56}
                              className="w-14 h-14 rounded-xl object-cover shrink-0"
                            />
                          ) : isCasting ? (
                            <span className="relative w-14 h-14 rounded-xl overflow-hidden bg-surface-container shrink-0">
                              <span className="shimmer-overlay absolute inset-0" />
                              <Loader2 className="absolute inset-0 m-auto w-4 h-4 text-primary animate-spin" />
                            </span>
                          ) : (
                            <span className="w-14 h-14 rounded-xl border border-dashed border-outline-variant/50 flex items-center justify-center text-on-surface-variant shrink-0">
                              <GroupIcon className="w-5 h-5" />
                            </span>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-body text-sm text-on-surface flex items-center gap-1.5">
                              {ref.name}
                              {bound && !isCasting && (
                                <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                              )}
                            </p>
                            <p className="font-body text-[11.5px] text-on-surface-variant leading-snug mt-0.5 line-clamp-2">
                              {ref.desc}
                            </p>
                          </div>
                        </div>

                        {/* One action per card: regenerate. Reference-bound
                            looks are labeled so the origin stays visible. */}
                        <div className="flex items-center gap-2 mt-3">
                          {bound && (
                            <span
                              className={cn(
                                "font-label text-[8px] uppercase tracking-widest border px-1.5 py-0.5 rounded-full",
                                ref.source === "reference"
                                  ? "border-secondary/50 text-secondary"
                                  : "border-outline-variant/50 text-on-surface-variant/85"
                              )}
                            >
                              {ref.source === "reference" ? "Reference" : "Generated"}
                            </span>
                          )}
                          {isCasting ? (
                            <span className="font-label text-[10px] uppercase tracking-wider text-on-surface-variant/80">
                              Casting…
                            </span>
                          ) : bound ? (
                            <button
                              type="button"
                              onClick={() => regenerate(ref)}
                              className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-outline-variant/50 font-label text-[10px] uppercase tracking-wider text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors"
                            >
                              <RefreshCw className="w-3 h-3" /> Regenerate
                              <span className="inline-flex items-center gap-0.5 opacity-80">
                                <Zap className="w-2.5 h-2.5" fill="currentColor" />
                                {PRO_COSTS.asset}
                              </span>
                            </button>
                          ) : (
                            <span className="font-label text-[10px] uppercase tracking-wider text-on-surface-variant/60">
                              Queued for auto-cast
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <button
              type="button"
              onClick={() => gotoStage("script")}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-outline-variant/50 font-label text-[10px] uppercase tracking-wider text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-3 h-3" /> Back · Script
            </button>
            <p className="font-body text-[12px] text-on-surface-variant">
              {allBound
                ? "Full cast locked — ready to roll."
                : `${refs.length - boundCount} still uncast — production stays locked until every look is bound.`}
            </p>
            <button
              type="button"
              disabled={!allBound}
              onClick={() => gotoStage("film")}
              className="ml-auto inline-flex items-center gap-2 bg-primary text-on-primary font-label text-label-md uppercase tracking-wider px-6 py-3 rounded-full hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Start production <Clapperboard className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── ③ Production ── */}
      {stage === "film" && (
        <div className="animate-fade-up">
          {run || inReview ? null : (
            <>
              {/* Production plan — one row per scene with its bound looks */}
              <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest/70 divide-y divide-outline-variant/25 mb-5">
                {scenes.map((sc, i) => (
                  <div key={sc.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/75 w-14 shrink-0">
                      {fmtShotNo(i + 1)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm text-on-surface truncate">{sc.heading}</p>
                      <p className="font-body text-[11.5px] text-on-surface-variant truncate">
                        {sc.summary}
                      </p>
                    </div>
                    <RefAvatars keys={sc.refKeys} />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => gotoStage("assets")}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-outline-variant/50 font-label text-[10px] uppercase tracking-wider text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" /> Back · Cast &amp; Assets
                </button>
                <p className="font-body text-[12px] text-on-surface-variant">
                  {scenes.length} scenes · framing ⚡{scenes.length * PRO_COSTS.frame} now, directing
                  ⚡{scenes.length * PRO_COSTS.video} as it runs.
                  {hasCut && " Finishing replaces the current cut."}
                </p>
                <button
                  type="button"
                  onClick={startProduction}
                  className="ml-auto inline-flex items-center gap-2 bg-primary text-on-primary font-label text-label-md uppercase tracking-wider px-6 py-3 rounded-full hover:opacity-90 active:scale-95 transition-all"
                >
                  <Clapperboard className="w-3.5 h-3.5" /> {hasCut ? "Re-shoot" : "Roll cameras"}
                </button>
              </div>
            </>
          )}
          {run && (
            <>
              {/* Run banner */}
              <div className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary-container/15 px-4 py-3 mb-5">
                <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
                <p className="font-body text-sm text-on-surface flex-1">
                  {run.stage === "frame"
                    ? `Framing scenes with your cast — ${run.done}/${run.total}`
                    : `Directing — ${run.done}/${run.total}`}
                </p>
                <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant/85">
                  Powered by Superstar
                </span>
              </div>
              {/* Storyboard tiles */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {run.shots.map((s, i) => (
                  <div
                    key={s.sceneId}
                    className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest/70 overflow-hidden"
                  >
                    <div className="relative aspect-video bg-surface-container">
                      {s.frameUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={s.frameUrl}
                          alt={s.heading}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="shimmer-overlay absolute inset-0" />
                      )}
                      {s.directed && (
                        <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                      <span className="absolute bottom-2 left-2">
                        <RefAvatars keys={s.refKeys} size={18} />
                      </span>
                    </div>
                    <div className="px-3 py-2.5">
                      <p className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant/80">
                        {fmtShotNo(i + 1)}
                      </p>
                      <p className="font-body text-[12px] text-on-surface truncate">{s.heading}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          {inReview && (
            <>
              {/* Take review — every shot previews and re-takes before the
                  cut is assembled. */}
              <div className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary-container/15 px-4 py-3 mb-5 flex-wrap">
                {assembling ? (
                  <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
                ) : (
                  <Clapperboard className="w-4 h-4 text-primary shrink-0" />
                )}
                <p className="font-body text-sm text-on-surface flex-1">
                  {assembling
                    ? "Assembling the cut…"
                    : `All ${projectFrags.length} takes directed — preview each shot, re-take any, then assemble.`}
                </p>
                <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant/85">
                  Powered by Superstar
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {projectFrags.map((f, i) => (
                  <div
                    key={f.id}
                    className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest/70 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setPreviewShotId(f.id)}
                      className="relative block w-full aspect-video bg-surface-container group"
                      aria-label={`preview ${f.title}`}
                    >
                      {regenShotId === f.id ? (
                        <span className="shimmer-overlay absolute inset-0" />
                      ) : (
                        <>
                          {f.frameUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={f.frameUrl}
                              alt={f.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                          <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/35 transition-colors">
                            <span className="w-9 h-9 rounded-full bg-surface/80 backdrop-blur text-on-surface flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play className="w-4 h-4 ml-0.5" />
                            </span>
                          </span>
                        </>
                      )}
                      {scenes[i] && (
                        <span className="absolute bottom-2 left-2">
                          <RefAvatars keys={scenes[i].refKeys} size={18} />
                        </span>
                      )}
                    </button>
                    <div className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <p className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant/80">
                          {f.title}
                        </p>
                        <span className="ml-auto font-label text-[9px] uppercase tracking-widest text-on-surface-variant/60">
                          {f.durationSec}s
                        </span>
                      </div>
                      <p className="font-body text-[12px] text-on-surface truncate mt-0.5">
                        {f.summary}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => setPreviewShotId(f.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-outline-variant/50 font-label text-[9px] uppercase tracking-wider text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors"
                        >
                          <Play className="w-2.5 h-2.5" /> Preview
                        </button>
                        <button
                          type="button"
                          disabled={Boolean(regenShotId) || assembling}
                          onClick={() => regenerateShot(f.id)}
                          className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-outline-variant/50 font-label text-[9px] uppercase tracking-wider text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-45"
                        >
                          <RefreshCw className="w-2.5 h-2.5" /> Re-take
                          <span className="inline-flex items-center gap-0.5 opacity-80">
                            <Zap className="w-2 h-2" fill="currentColor" />
                            {PRO_COSTS.frame + PRO_COSTS.video}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 mt-5 flex-wrap">
                <button
                  type="button"
                  onClick={() => gotoStage("assets")}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-outline-variant/50 font-label text-[10px] uppercase tracking-wider text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" /> Back · Cast &amp; Assets
                </button>
                <p className="font-body text-[12px] text-on-surface-variant">
                  Takes stay put until you assemble — nothing ships without your confirm.
                </p>
                <button
                  type="button"
                  disabled={assembling || Boolean(regenShotId)}
                  onClick={assembleCut}
                  className="ml-auto inline-flex items-center gap-2 bg-primary text-on-primary font-label text-label-md uppercase tracking-wider px-6 py-3 rounded-full hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                >
                  {assembling ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Assembling…
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" /> Confirm &amp; assemble the cut
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Shot preview dialog (review state) */}
      <Dialog open={Boolean(previewFrag)} onOpenChange={(o) => !o && setPreviewShotId(null)}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden" showCloseButton>
          <DialogTitle className="sr-only">Shot preview</DialogTitle>
          {previewFrag && (
            <div>
              <div className="relative aspect-video bg-surface-container">
                {regenShotId === previewFrag.id ? (
                  <span className="shimmer-overlay absolute inset-0" />
                ) : (
                  previewFrag.frameUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewFrag.frameUrl}
                      alt={previewFrag.title}
                      className="w-full h-full object-cover"
                    />
                  )
                )}
                <span className="absolute top-2.5 left-2.5 font-label text-[9px] uppercase tracking-widest bg-surface/80 backdrop-blur px-2 py-0.5 rounded-full text-on-surface">
                  {previewFrag.title} · {previewFrag.durationSec}s
                </span>
              </div>
              <div className="p-5">
                <p className="font-body text-sm text-on-surface leading-snug">
                  {previewFrag.summary}
                </p>
                {previewFrag.dialogue && (
                  <p className="font-body text-[12.5px] italic text-on-surface-variant border-l-2 border-primary/40 pl-2.5 mt-2">
                    “{previewFrag.dialogue}”
                  </p>
                )}
                <div className="flex items-center gap-2.5 mt-4">
                  <button
                    type="button"
                    disabled={Boolean(regenShotId) || assembling}
                    onClick={() => regenerateShot(previewFrag.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-outline-variant/50 font-label text-[10px] uppercase tracking-wider text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-45"
                  >
                    <RefreshCw className="w-3 h-3" /> Re-take this shot
                    <span className="inline-flex items-center gap-0.5 opacity-80">
                      <Zap className="w-2.5 h-2.5" fill="currentColor" />
                      {PRO_COSTS.frame + PRO_COSTS.video}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewShotId(null)}
                    className="ml-auto px-4 py-2 rounded-full bg-primary text-on-primary font-label text-[10px] uppercase tracking-wider hover:opacity-90 transition-all"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Re-parse confirmation — the one immediately destructive back-action */}
      <Dialog open={reparseConfirm} onOpenChange={setReparseConfirm}>
        <DialogContent className="sm:max-w-sm p-6" showCloseButton>
          <DialogTitle className="font-headline text-lg text-on-surface">
            Re-parse the script?
          </DialogTitle>
          <p className="font-body text-sm text-on-surface-variant mt-1">
            This rebuilds all scene cards and the asset manifest from the new brief. Your scene
            edits and current bindings are replaced (saved library assets stay). Costs ⚡
            {PRO_COSTS.script}.
          </p>
          <div className="flex items-center justify-end gap-2.5 mt-4">
            <button
              type="button"
              onClick={() => setReparseConfirm(false)}
              className="px-4 py-2 rounded-full border border-outline-variant/50 font-label text-[10px] uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={reparse}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-on-primary font-label text-[10px] uppercase tracking-wider hover:opacity-90 transition-all"
            >
              <RefreshCw className="w-3 h-3" /> Re-parse
            </button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
