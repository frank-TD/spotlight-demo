"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Play,
  Pause,
  Undo2,
  Redo2,
  Scissors,
  Trash2,
  ZoomIn,
  ZoomOut,
  Clapperboard,
  Music2,
  Mic,
  Plus,
  Check,
  Loader2,
  Send,
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";
import Waveform from "../Waveform";
import { nowTs, proId } from "./pro-mock";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  useStore,
  type ProAudioClip,
  type ProClip,
  type ProExport,
  type ProFragment,
  type ProTimeline,
  type StudioAsset,
} from "@/lib/store";
import { cn } from "@/lib/utils";

/* ── Interactive dual-track editor ───────────────────────────────────────
   Magnetic-sequence timeline (Artlist-style): clips sit back to back, so a
   clip's start time is the sum of trimmed lengths before it. Video track
   takes directed shots from the bin; the audio track takes voiceover/music
   generated in Basic mode. Trim handles, split-at-playhead, drag-reorder,
   zoom, scrubbing and a mock export that lands in My Assets. All edits
   commit whole-timeline snapshots to the store; undo/redo replays them. */

const MIN_CLIP_SEC = 0.5;
const PPS_MIN = 16;
const PPS_MAX = 128;

// Pointer capture can throw (NotFoundError) for synthetic or already-lifted
// pointers; capture is an enhancement, never worth crashing a drag over.
function safeCapture(e: React.PointerEvent) {
  try {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  } catch {
    /* noop */
  }
}

const len = (c: { inSec: number; outSec: number }) => c.outSec - c.inSec;
const totalOf = (clips: { inSec: number; outSec: number }[]) =>
  clips.reduce((acc, c) => acc + len(c), 0);

function fmtT(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  const d = Math.floor((sec % 1) * 10);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${d}`;
}

// Which clip covers `t` in a magnetic sequence → { index, offset into clip }.
function clipAt(clips: { inSec: number; outSec: number }[], t: number) {
  let acc = 0;
  for (let i = 0; i < clips.length; i += 1) {
    const L = len(clips[i]);
    if (t < acc + L) return { index: i, offset: t - acc };
    acc += L;
  }
  return null;
}

type Selected = { track: "video" | "audio"; id: string } | null;

export default function EditorPanel({ onGoShots }: { onGoShots: () => void }) {
  const {
    proFragments,
    proProjects,
    currentProProjectId,
    proTimelines,
    setProTimeline,
    studioSessions,
    addProExport,
    isLoggedIn,
    openSignupGate,
  } = useStore();

  const project = proProjects.find((p) => p.id === currentProProjectId) ?? null;
  const fragById = useMemo(
    () => new Map(proFragments.map((f) => [f.id, f])),
    [proFragments]
  );
  const directed = useMemo(
    () => proFragments.filter((f) => f.projectId === currentProProjectId && f.status === "directed"),
    [proFragments, currentProProjectId]
  );
  const audioAssets = useMemo(
    () =>
      studioSessions
        .flatMap((s) => s.assets)
        .filter((a) => a.mode === "voiceover" || a.mode === "music"),
    [studioSessions]
  );

  /* Timeline state: local mirror of the store snapshot; drops orphaned clips
     whose fragment was deleted on the board. */
  const stored = (currentProProjectId && proTimelines[currentProProjectId]) || null;
  const [tl, setTl] = useState<ProTimeline>(() => ({
    video: (stored?.video ?? []).filter((c) => fragById.has(c.fragmentId)),
    audio: stored?.audio ?? [],
  }));
  // Handler-side mirror of `tl` so pointer-drag handlers can read/commit the
  // latest snapshot without impure setState updaters.
  const tlRef = useRef(tl);
  const history = useRef<{ stack: ProTimeline[]; idx: number }>({
    stack: [tl],
    idx: 0,
  });
  // Render-safe mirror of the history cursor (refs must stay out of render).
  const [histPos, setHistPos] = useState({ idx: 0, len: 1 });

  const [selected, setSelected] = useState<Selected>(null);
  const [pps, setPps] = useState(48);
  const [playheadSec, setPlayheadSec] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [dropHint, setDropHint] = useState<{ track: "video" | "audio"; index: number } | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportDone, setExportDone] = useState<ProExport | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const totalV = totalOf(tl.video);
  const totalA = totalOf(tl.audio);
  const total = Math.max(totalV, totalA);
  const laneSec = Math.max(total + 4, 12);
  const laneW = laneSec * pps;

  /* Commit = local + store + history push (truncating any redo branch). */
  const commit = useCallback(
    (next: ProTimeline) => {
      tlRef.current = next;
      setTl(next);
      if (currentProProjectId) setProTimeline(currentProProjectId, next);
      const h = history.current;
      h.stack = [...h.stack.slice(0, h.idx + 1), next].slice(-40);
      h.idx = h.stack.length - 1;
      setHistPos({ idx: h.idx, len: h.stack.length });
    },
    [currentProProjectId, setProTimeline]
  );

  const applyHistory = (dir: -1 | 1) => {
    const h = history.current;
    const idx = h.idx + dir;
    if (idx < 0 || idx >= h.stack.length) return;
    h.idx = idx;
    tlRef.current = h.stack[idx];
    setTl(h.stack[idx]);
    if (currentProProjectId) setProTimeline(currentProProjectId, h.stack[idx]);
    setHistPos({ idx, len: h.stack.length });
    setSelected(null);
  };

  /* ── Playback (rAF) ────────────────────────────────────────────────── */
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setPlayheadSec((p) => {
        const next = p + dt;
        if (next >= total) {
          setPlaying(false);
          return total;
        }
        return next;
      });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing, total]);

  const togglePlay = () => {
    if (tl.video.length === 0) {
      toast.info("Add a shot to the timeline first");
      return;
    }
    if (!playing && playheadSec >= total) setPlayheadSec(0);
    setPlaying((p) => !p);
  };

  /* ── Clip operations ───────────────────────────────────────────────── */
  const addVideo = (frag: ProFragment, index = tl.video.length) => {
    const clip: ProClip = {
      id: proId("clip"),
      fragmentId: frag.id,
      inSec: 0,
      outSec: Math.max(MIN_CLIP_SEC, frag.durationSec),
    };
    const video = [...tl.video];
    video.splice(index, 0, clip);
    commit({ ...tl, video });
    setSelected({ track: "video", id: clip.id });
  };

  const addAudio = (asset: StudioAsset, index = tl.audio.length) => {
    const dur = Math.max(MIN_CLIP_SEC, asset.durationSec ?? 30);
    const clip: ProAudioClip = {
      id: proId("aclip"),
      assetId: asset.id,
      title: asset.settings.voiceName
        ? `${asset.settings.voiceName} · ${asset.prompt.slice(0, 40)}`
        : asset.prompt.slice(0, 48) || "Untitled audio",
      kind: asset.mode === "voiceover" ? "voiceover" : "music",
      durationSec: dur,
      inSec: 0,
      outSec: dur,
      waveformSeed: asset.waveformSeed ?? asset.id,
    };
    const audio = [...tl.audio];
    audio.splice(index, 0, clip);
    commit({ ...tl, audio });
    setSelected({ track: "audio", id: clip.id });
  };

  const deleteSelected = useCallback(() => {
    if (!selected) return;
    const next: ProTimeline =
      selected.track === "video"
        ? { ...tl, video: tl.video.filter((c) => c.id !== selected.id) }
        : { ...tl, audio: tl.audio.filter((c) => c.id !== selected.id) };
    commit(next);
    setSelected(null);
  }, [selected, tl, commit]);

  const splitAtPlayhead = () => {
    const hit = clipAt(tl.video, playheadSec);
    if (!hit || hit.offset < MIN_CLIP_SEC) {
      toast.info("Place the playhead inside a clip to split it");
      return;
    }
    const src = tl.video[hit.index];
    if (len(src) - hit.offset < MIN_CLIP_SEC) {
      toast.info("Too close to the clip edge to split");
      return;
    }
    const first: ProClip = { ...src, outSec: src.inSec + hit.offset };
    const second: ProClip = { ...src, id: proId("clip"), inSec: src.inSec + hit.offset };
    const video = [...tl.video];
    video.splice(hit.index, 1, first, second);
    commit({ ...tl, video });
    setSelected({ track: "video", id: second.id });
  };

  const moveClip = (track: "video" | "audio", id: string, toIndex: number) => {
    if (track === "video") {
      const list = [...tl.video];
      const from = list.findIndex((c) => c.id === id);
      if (from < 0) return;
      const [item] = list.splice(from, 1);
      list.splice(from < toIndex ? toIndex - 1 : toIndex, 0, item);
      commit({ ...tl, video: list });
    } else {
      const list = [...tl.audio];
      const from = list.findIndex((c) => c.id === id);
      if (from < 0) return;
      const [item] = list.splice(from, 1);
      list.splice(from < toIndex ? toIndex - 1 : toIndex, 0, item);
      commit({ ...tl, audio: list });
    }
  };

  /* Trim: live-update local state while dragging, commit on pointer-up. */
  const trimRef = useRef<{
    track: "video" | "audio";
    id: string;
    edge: "in" | "out";
    startX: number;
    origIn: number;
    origOut: number;
  } | null>(null);

  const onTrimDown = (
    e: React.PointerEvent,
    track: "video" | "audio",
    clip: { id: string; inSec: number; outSec: number },
    edge: "in" | "out"
  ) => {
    e.stopPropagation();
    safeCapture(e);
    trimRef.current = {
      track,
      id: clip.id,
      edge,
      startX: e.clientX,
      origIn: clip.inSec,
      origOut: clip.outSec,
    };
  };

  const onTrimMove = (e: React.PointerEvent) => {
    const t = trimRef.current;
    if (!t) return;
    const dSec = (e.clientX - t.startX) / pps;
    const cur = tlRef.current;
    const list = t.track === "video" ? cur.video : cur.audio;
    const next = list.map((c) => {
      if (c.id !== t.id) return c;
      const srcMax =
        t.track === "video"
          ? (fragById.get((c as ProClip).fragmentId)?.durationSec ?? t.origOut)
          : (c as ProAudioClip).durationSec;
      if (t.edge === "in") {
        const inSec = Math.min(Math.max(0, t.origIn + dSec), c.outSec - MIN_CLIP_SEC);
        return { ...c, inSec };
      }
      const outSec = Math.max(Math.min(srcMax, t.origOut + dSec), c.inSec + MIN_CLIP_SEC);
      return { ...c, outSec };
    });
    const nextTl: ProTimeline =
      t.track === "video"
        ? { ...cur, video: next as ProClip[] }
        : { ...cur, audio: next as ProAudioClip[] };
    tlRef.current = nextTl;
    setTl(nextTl);
  };

  const onTrimUp = () => {
    if (!trimRef.current) return;
    trimRef.current = null;
    // The live-trimmed snapshot is already rendered; persist + record it.
    const cur = tlRef.current;
    if (currentProProjectId) setProTimeline(currentProProjectId, cur);
    const h = history.current;
    h.stack = [...h.stack.slice(0, h.idx + 1), cur].slice(-40);
    h.idx = h.stack.length - 1;
    setHistPos({ idx: h.idx, len: h.stack.length });
  };

  /* ── Scrubbing ─────────────────────────────────────────────────────── */
  const laneRef = useRef<HTMLDivElement>(null);
  const scrubRef = useRef(false);

  const seekFromEvent = (e: React.PointerEvent) => {
    const lane = laneRef.current;
    if (!lane) return;
    const rect = lane.getBoundingClientRect();
    const sec = Math.min(Math.max(0, (e.clientX - rect.left) / pps), laneSec);
    setPlayheadSec(Math.min(sec, Math.max(total, 0)));
  };

  /* ── Drag & drop from bins / reorder ───────────────────────────────── */
  const insertIndexFromX = (track: "video" | "audio", clientX: number) => {
    const lane = laneRef.current;
    if (!lane) return 0;
    const x = clientX - lane.getBoundingClientRect().left;
    const clips = track === "video" ? tl.video : tl.audio;
    let acc = 0;
    for (let i = 0; i < clips.length; i += 1) {
      const w = len(clips[i]) * pps;
      if (x < acc + w / 2) return i;
      acc += w;
    }
    return clips.length;
  };

  const handleTrackDragOver = (track: "video" | "audio", e: React.DragEvent) => {
    const kind = e.dataTransfer.types.includes("text/pro-frag")
      ? "video"
      : e.dataTransfer.types.includes("text/pro-audio")
        ? "audio"
        : e.dataTransfer.types.includes(`text/pro-clip-${track}`)
          ? track
          : null;
    if (kind !== track) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropHint({ track, index: insertIndexFromX(track, e.clientX) });
  };

  const handleTrackDrop = (track: "video" | "audio", e: React.DragEvent) => {
    e.preventDefault();
    const index = insertIndexFromX(track, e.clientX);
    setDropHint(null);
    const fragId = e.dataTransfer.getData("text/pro-frag");
    const audioId = e.dataTransfer.getData("text/pro-audio");
    const clipId = e.dataTransfer.getData(`text/pro-clip-${track}`);
    if (track === "video" && fragId) {
      const frag = fragById.get(fragId);
      if (frag) addVideo(frag, index);
      return;
    }
    if (track === "audio" && audioId) {
      const asset = audioAssets.find((a) => a.id === audioId);
      if (asset) addAudio(asset, index);
      return;
    }
    if (clipId) moveClip(track, clipId, index);
  };

  /* ── Export ────────────────────────────────────────────────────────── */
  const runExport = () => {
    if (!isLoggedIn) {
      openSignupGate("/discovery/workspace");
      return;
    }
    if (tl.video.length === 0 || !project) {
      toast.info("Add at least one shot to the timeline first");
      return;
    }
    setExporting(true);
    setExportProgress(4);
    const iv = setInterval(
      () => setExportProgress((p) => (p >= 96 ? 96 : p + Math.ceil((100 - p) / 9))),
      200
    );
    timers.current.push(iv as unknown as ReturnType<typeof setTimeout>);
    timers.current.push(
      setTimeout(() => {
        clearInterval(iv);
        setExportProgress(100);
        const firstFrag = fragById.get(tl.video[0].fragmentId);
        const exp: ProExport = {
          id: proId("export"),
          title: `${project.title} — Final Cut`,
          projectTitle: project.title,
          durationSec: Math.round(totalV * 10) / 10,
          clipCount: tl.video.length,
          coverUrl: firstFrag?.frameUrl ?? firstFrag?.startFrame ?? firstFrag?.frames[0],
          createdAt: nowTs(),
        };
        addProExport(exp);
        setExporting(false);
        setExportDone(exp);
      }, 2600)
    );
  };

  /* ── Keyboard (window-scoped while the editor is mounted) ──────────── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tgt = e.target as HTMLElement | null;
      if (tgt && (tgt.tagName === "INPUT" || tgt.tagName === "TEXTAREA" || tgt.isContentEditable))
        return;
      if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        deleteSelected();
      } else if (e.key === "ArrowLeft") {
        setPlayheadSec((p) => Math.max(0, p - 1));
      } else if (e.key === "ArrowRight") {
        setPlayheadSec((p) => Math.min(Math.max(total, 0), p + 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  /* ── Preview derivations ───────────────────────────────────────────── */
  const vHit = clipAt(tl.video, Math.min(playheadSec, Math.max(totalV - 0.001, 0)));
  const previewFrag = vHit ? fragById.get(tl.video[vHit.index].fragmentId) : null;
  const previewUrl = previewFrag?.frameUrl ?? previewFrag?.startFrame ?? previewFrag?.frames[0];
  const aHit = clipAt(tl.audio, playheadSec);

  /* Ruler ticks (value-keyed). Label density adapts to zoom. */
  const labelEvery = pps >= 40 ? 1 : pps >= 24 ? 2 : 5;
  const ticks = useMemo(
    () => Array.from({ length: Math.ceil(laneSec) + 1 }, (_, i) => i),
    [laneSec]
  );

  if (!project) {
    return (
      <div className="rounded-3xl border border-outline-variant/40 bg-surface-container-lowest/60 px-6 py-16 text-center">
        <Clapperboard className="w-7 h-7 text-on-surface-variant mx-auto" />
        <p className="font-headline text-xl text-on-surface mt-4">No project yet</p>
        <p className="font-body text-sm text-on-surface-variant mt-1.5">
          Create shots first — the editor assembles a project&apos;s directed shots.
        </p>
        <button
          type="button"
          onClick={onGoShots}
          className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-primary/45 text-primary font-label text-[10px] uppercase tracking-wider hover:bg-primary-container/25 transition-colors"
        >
          <Clapperboard className="w-3 h-3" /> Go to Shots
        </button>
      </div>
    );
  }

  return (
    <div className="outline-none">
      <div className="flex flex-col lg:flex-row gap-4 mb-4 items-stretch">
        {/* Bins */}
        <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-4 min-h-0">
          <div className="rounded-3xl border border-outline-variant/40 bg-surface-container-lowest/60 p-4 flex-1 min-h-[180px]">
            <div className="flex items-center gap-2 mb-3">
              <FolderOpen className="w-3.5 h-3.5 text-on-surface-variant" />
              <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                {project.title} · {directed.length} directed
              </span>
            </div>
            {directed.length === 0 ? (
              <div className="text-center py-6">
                <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                  No directed shots yet.
                </p>
                <button
                  type="button"
                  onClick={onGoShots}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/45 text-primary font-label text-[10px] uppercase tracking-wider hover:bg-primary-container/25 transition-colors"
                >
                  Direct shots first
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 max-h-[240px] overflow-y-auto pr-1">
                {directed.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/pro-frag", f.id);
                      e.dataTransfer.effectAllowed = "copy";
                    }}
                    onClick={() => addVideo(f)}
                    aria-label={`add ${f.title} to timeline`}
                    className="group relative rounded-xl overflow-hidden border border-outline-variant/40 hover:border-primary/50 transition-colors cursor-grab active:cursor-grabbing text-left"
                  >
                    <div className="aspect-video bg-surface-container">
                      {(f.frameUrl ?? f.frames[0]) && (
                        <Image
                          src={f.frameUrl ?? f.frames[0]}
                          alt={f.title}
                          width={320}
                          height={180}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <span className="absolute top-1 left-1.5 font-label text-[8px] uppercase tracking-widest text-white/90 drop-shadow">
                      {f.title}
                    </span>
                    <span className="absolute bottom-1 left-1.5 font-label text-[8px] uppercase tracking-widest text-white/80 drop-shadow">
                      {f.durationSec}s
                    </span>
                    <span className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus className="w-3.5 h-3.5" />
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-outline-variant/40 bg-surface-container-lowest/60 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Music2 className="w-3.5 h-3.5 text-on-surface-variant" />
              <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                Audio · from Basic mode
              </span>
            </div>
            {audioAssets.length === 0 ? (
              <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                Generate voiceover or music in Basic mode — it shows up here, ready for the audio
                track.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1">
                {audioAssets.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/pro-audio", a.id);
                      e.dataTransfer.effectAllowed = "copy";
                    }}
                    onClick={() => addAudio(a)}
                    aria-label={`add ${a.mode} to audio track`}
                    className="group w-full flex items-center gap-2 rounded-lg border border-outline-variant/35 px-2.5 py-1.5 hover:border-primary/50 transition-colors cursor-grab active:cursor-grabbing text-left"
                  >
                    {a.mode === "voiceover" ? (
                      <Mic className="w-3 h-3 text-on-surface-variant shrink-0" />
                    ) : (
                      <Music2 className="w-3 h-3 text-on-surface-variant shrink-0" />
                    )}
                    <span className="font-body text-[11px] text-on-surface truncate flex-1">
                      {a.prompt || a.settings.voiceName || "Untitled"}
                    </span>
                    <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant/75 shrink-0">
                      {a.durationSec ?? 30}s
                    </span>
                    <span className="w-5 h-5 rounded-full border border-outline-variant/50 flex items-center justify-center text-on-surface-variant group-hover:border-primary/60 group-hover:text-primary transition-colors shrink-0">
                      <Plus className="w-3 h-3" />
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 min-w-0 rounded-3xl border border-outline-variant/40 bg-black/60 relative overflow-hidden min-h-[280px] lg:min-h-0">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="preview frame"
              width={960}
              height={540}
              className="absolute inset-0 w-full h-full object-contain"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
              <Clapperboard className="w-7 h-7 text-on-surface-variant" />
              <p className="font-body text-sm text-on-surface-variant mt-3 max-w-xs leading-relaxed">
                {tl.video.length === 0
                  ? "Drag a directed shot onto the video track (or click its “+”) to start the cut."
                  : "Scrub the playhead over a clip to preview it."}
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? "pause" : "play"}
            className="absolute inset-0 m-auto w-14 h-14 rounded-full border border-primary/60 bg-surface/50 backdrop-blur flex items-center justify-center text-primary hover:scale-105 transition-transform"
          >
            {playing ? (
              <Pause className="w-6 h-6" fill="currentColor" />
            ) : (
              <Play className="w-6 h-6 translate-x-[2px]" fill="currentColor" />
            )}
          </button>
          <span className="absolute top-3 left-3 font-label text-[9px] uppercase tracking-widest text-on-surface-variant/90 border border-outline-variant/40 bg-surface/60 px-2 py-0.5 rounded">
            {project.title}
          </span>
          <span className="absolute bottom-3 right-3 font-mono text-xs text-on-surface border border-outline-variant/40 bg-surface/60 px-2 py-0.5 rounded">
            {fmtT(playheadSec)} / {fmtT(total)}
          </span>
          {aHit && (
            <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 font-label text-[9px] uppercase tracking-widest text-primary border border-primary/40 bg-surface/60 px-2 py-0.5 rounded">
              {tl.audio[aHit.index].kind === "voiceover" ? (
                <Mic className="w-2.5 h-2.5" />
              ) : (
                <Music2 className="w-2.5 h-2.5" />
              )}
              {tl.audio[aHit.index].title.slice(0, 26)}
            </span>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="rounded-3xl border border-outline-variant/40 bg-surface-container-lowest/80 px-4 py-3">
        {/* Transport */}
        <div className="flex items-center gap-2 pb-3 border-b border-outline-variant/20 flex-wrap">
          <TransportBtn label={playing ? "Pause" : "Play"} onClick={togglePlay} accent>
            {playing ? (
              <Pause className="w-3.5 h-3.5" fill="currentColor" />
            ) : (
              <Play className="w-3.5 h-3.5" fill="currentColor" />
            )}
          </TransportBtn>
          <span className="font-mono text-xs text-on-surface-variant">
            {fmtT(playheadSec)} / {fmtT(total)}
          </span>
          <span className="w-px h-5 bg-outline-variant/40 mx-1" />
          <TransportBtn label="Undo" onClick={() => applyHistory(-1)} disabled={histPos.idx <= 0}>
            <Undo2 className="w-3.5 h-3.5" />
          </TransportBtn>
          <TransportBtn
            label="Redo"
            onClick={() => applyHistory(1)}
            disabled={histPos.idx >= histPos.len - 1}
          >
            <Redo2 className="w-3.5 h-3.5" />
          </TransportBtn>
          <TransportBtn label="Split at playhead" onClick={splitAtPlayhead}>
            <Scissors className="w-3.5 h-3.5" />
          </TransportBtn>
          <TransportBtn label="Delete selected" onClick={deleteSelected} disabled={!selected}>
            <Trash2 className="w-3.5 h-3.5" />
          </TransportBtn>
          <span className="hidden md:inline font-label text-[9px] uppercase tracking-widest text-on-surface-variant/60 ml-1">
            Space play · Del remove · ←→ seek
          </span>
          <span className="ml-auto flex items-center gap-2">
            <TransportBtn label="Zoom out" onClick={() => setPps((p) => Math.max(PPS_MIN, p - 16))}>
              <ZoomOut className="w-3.5 h-3.5" />
            </TransportBtn>
            <input
              type="range"
              min={PPS_MIN}
              max={PPS_MAX}
              step={4}
              value={pps}
              onChange={(e) => setPps(Number(e.target.value))}
              aria-label="timeline zoom"
              className="w-24 accent-[var(--md-primary,#c6ff34)]"
            />
            <TransportBtn label="Zoom in" onClick={() => setPps((p) => Math.min(PPS_MAX, p + 16))}>
              <ZoomIn className="w-3.5 h-3.5" />
            </TransportBtn>
            <button
              type="button"
              onClick={runExport}
              disabled={exporting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-on-primary font-label text-[10px] uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
            >
              {exporting ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" /> {exportProgress}%
                </>
              ) : (
                <>
                  <Send className="w-3 h-3" /> Export
                </>
              )}
            </button>
          </span>
        </div>

        {/* Lanes (shared horizontal scroll keeps ruler + tracks aligned) */}
        <div ref={scrollRef} className="overflow-x-auto pt-3 pb-1">
          <div ref={laneRef} className="relative" style={{ width: laneW }}>
            {/* Ruler — click / drag to scrub */}
            <div
              className="h-8 select-none cursor-ew-resize relative"
              onPointerDown={(e) => {
                safeCapture(e);
                scrubRef.current = true;
                setPlaying(false);
                seekFromEvent(e);
              }}
              onPointerMove={(e) => scrubRef.current && seekFromEvent(e)}
              onPointerUp={() => {
                scrubRef.current = false;
              }}
              role="slider"
              aria-label="playhead position"
              aria-valuemin={0}
              aria-valuemax={Math.round(total)}
              aria-valuenow={Math.round(playheadSec)}
              tabIndex={-1}
            >
              {ticks.map((n) => (
                <span
                  key={n}
                  className="absolute bottom-0 flex flex-col items-start"
                  style={{ left: n * pps }}
                >
                  {n % labelEvery === 0 && (
                    <span className="font-mono text-[9px] text-on-surface-variant/70 -translate-x-1/2 mb-0.5">
                      {n}
                    </span>
                  )}
                  <span
                    className={cn(
                      "w-px bg-outline-variant/60",
                      n % labelEvery === 0 ? "h-2.5" : "h-1.5"
                    )}
                  />
                </span>
              ))}
            </div>

            {/* Video track */}
            <div
              className={cn(
                "relative h-[68px] rounded-xl border mb-2 transition-colors",
                tl.video.length === 0
                  ? "border-dashed border-outline-variant/45"
                  : "border-outline-variant/30 bg-surface-container/40",
                dropHint?.track === "video" && "border-primary/60"
              )}
              role="list"
              aria-label="video track"
              onDragOver={(e) => handleTrackDragOver("video", e)}
              onDragLeave={() => setDropHint(null)}
              onDrop={(e) => handleTrackDrop("video", e)}
            >
              {tl.video.length === 0 && (
                <span className="absolute inset-0 flex items-center justify-center gap-2 text-on-surface-variant pointer-events-none">
                  <Clapperboard className="w-3.5 h-3.5" />
                  <span className="font-body text-xs italic">
                    To start editing, click &ldquo;+&rdquo; on a shot or drag it here
                  </span>
                </span>
              )}
              <div className="absolute inset-y-1 left-0 flex">
                {tl.video.map((c) => {
                  const frag = fragById.get(c.fragmentId);
                  const isSel = selected?.track === "video" && selected.id === c.id;
                  return (
                    <div
                      key={c.id}
                      draggable={!isSel ? true : undefined}
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/pro-clip-video", c.id);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected({ track: "video", id: c.id });
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") setSelected({ track: "video", id: c.id });
                      }}
                      className={cn(
                        "relative h-full rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer bg-surface-container",
                        isSel ? "border-primary" : "border-transparent hover:border-outline-variant/70"
                      )}
                      style={{ width: len(c) * pps }}
                    >
                      {(frag?.frameUrl ?? frag?.frames[0]) && (
                        <Image
                          src={frag!.frameUrl ?? frag!.frames[0]}
                          alt={frag!.title}
                          width={240}
                          height={135}
                          className="absolute inset-0 w-full h-full object-cover opacity-80"
                        />
                      )}
                      <span className="absolute inset-x-0 bottom-0 h-7 bg-gradient-to-t from-black/75 to-transparent" />
                      <span className="absolute bottom-1 left-1.5 font-label text-[8px] uppercase tracking-widest text-white/90">
                        {frag?.title ?? "Shot"} · {len(c).toFixed(1)}s
                      </span>
                      {isSel && (
                        <>
                          <TrimHandle
                            side="left"
                            onPointerDown={(e) => onTrimDown(e, "video", c, "in")}
                            onPointerMove={onTrimMove}
                            onPointerUp={onTrimUp}
                          />
                          <TrimHandle
                            side="right"
                            onPointerDown={(e) => onTrimDown(e, "video", c, "out")}
                            onPointerMove={onTrimMove}
                            onPointerUp={onTrimUp}
                          />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
              {dropHint?.track === "video" && (
                <span
                  className="absolute inset-y-0 w-0.5 bg-primary z-10 pointer-events-none"
                  style={{
                    left: totalOf(tl.video.slice(0, dropHint.index)) * pps,
                  }}
                />
              )}
            </div>

            {/* Audio track */}
            <div
              className={cn(
                "relative h-[46px] rounded-xl border transition-colors",
                tl.audio.length === 0
                  ? "border-dashed border-outline-variant/35"
                  : "border-outline-variant/30 bg-surface-container/40",
                dropHint?.track === "audio" && "border-primary/60"
              )}
              role="list"
              aria-label="audio track"
              onDragOver={(e) => handleTrackDragOver("audio", e)}
              onDragLeave={() => setDropHint(null)}
              onDrop={(e) => handleTrackDrop("audio", e)}
            >
              {tl.audio.length === 0 && (
                <span className="absolute inset-0 flex items-center justify-center gap-2 text-on-surface-variant/80 pointer-events-none">
                  <Music2 className="w-3 h-3" />
                  <span className="font-body text-[11px] italic">
                    Audio track — drag voiceover or music from the bin
                  </span>
                </span>
              )}
              <div className="absolute inset-y-1 left-0 flex">
                {tl.audio.map((c) => {
                  const isSel = selected?.track === "audio" && selected.id === c.id;
                  const active = aHit && tl.audio[aHit.index].id === c.id;
                  return (
                    <div
                      key={c.id}
                      draggable={!isSel ? true : undefined}
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/pro-clip-audio", c.id);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected({ track: "audio", id: c.id });
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") setSelected({ track: "audio", id: c.id });
                      }}
                      className={cn(
                        "relative h-full rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer px-1.5",
                        c.kind === "voiceover" ? "bg-primary-container/25" : "bg-surface-container",
                        isSel ? "border-primary" : "border-transparent hover:border-outline-variant/70"
                      )}
                      style={{ width: len(c) * pps }}
                    >
                      <Waveform
                        seed={c.waveformSeed}
                        bars={Math.max(12, Math.round(len(c) * 3))}
                        progress={
                          active && aHit
                            ? (aHit.offset + 0.0001) / len(c)
                            : undefined
                        }
                        className="opacity-80"
                      />
                      <span className="absolute bottom-0.5 left-1.5 font-label text-[7px] uppercase tracking-widest text-on-surface-variant">
                        {c.kind} · {len(c).toFixed(1)}s
                      </span>
                      {isSel && (
                        <>
                          <TrimHandle
                            side="left"
                            onPointerDown={(e) => onTrimDown(e, "audio", c, "in")}
                            onPointerMove={onTrimMove}
                            onPointerUp={onTrimUp}
                          />
                          <TrimHandle
                            side="right"
                            onPointerDown={(e) => onTrimDown(e, "audio", c, "out")}
                            onPointerMove={onTrimMove}
                            onPointerUp={onTrimUp}
                          />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
              {dropHint?.track === "audio" && (
                <span
                  className="absolute inset-y-0 w-0.5 bg-primary z-10 pointer-events-none"
                  style={{
                    left: totalOf(tl.audio.slice(0, dropHint.index)) * pps,
                  }}
                />
              )}
            </div>

            {/* Playhead */}
            <div
              className="absolute top-0 bottom-0 z-20 pointer-events-none"
              style={{ left: Math.min(playheadSec, laneSec) * pps }}
            >
              <span className="absolute top-4 -translate-x-1/2 w-3 h-3 rounded-full bg-primary border-2 border-surface" />
              <span className="absolute top-6 bottom-0 -translate-x-1/2 w-px bg-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Export success */}
      <Dialog open={exportDone !== null} onOpenChange={(o) => !o && setExportDone(null)}>
        <DialogContent className="sm:max-w-sm p-6 text-center" showCloseButton>
          <DialogTitle className="sr-only">Export complete</DialogTitle>
          <span className="mx-auto inline-flex w-11 h-11 rounded-full bg-primary text-on-primary items-center justify-center">
            <Check className="w-5 h-5" />
          </span>
          <p className="font-headline text-xl text-on-surface mt-3">{exportDone?.title}</p>
          <p className="font-body text-xs text-on-surface-variant mt-1">
            {exportDone && fmtT(exportDone.durationSec)} · {exportDone?.clipCount} clips · Mock
            render saved to My Assets
          </p>
          <div className="flex items-center justify-center gap-2 mt-5">
            <Link
              href="/assets"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-outline-variant/50 font-label text-[10px] uppercase tracking-wider text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors"
            >
              View in My Assets
            </Link>
            <Link
              href={`/assets/${exportDone?.id}/distribute`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-on-primary font-label text-[10px] uppercase tracking-wider hover:opacity-90 transition-all"
            >
              <Send className="w-3 h-3" /> Start Distribution
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TransportBtn({
  label,
  onClick,
  disabled,
  accent,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "w-8 h-8 rounded-full border flex items-center justify-center transition-colors disabled:opacity-40",
        accent
          ? "border-primary/60 text-primary hover:bg-primary-container/25"
          : "border-outline-variant/50 text-on-surface-variant hover:border-primary/50 hover:text-primary"
      )}
    >
      {children}
    </button>
  );
}

function TrimHandle({
  side,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: {
  side: "left" | "right";
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
}) {
  return (
    <span
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      role="separator"
      aria-label={side === "left" ? "trim start" : "trim end"}
      className={cn(
        "absolute inset-y-0 w-2.5 bg-primary/90 cursor-ew-resize z-10 flex items-center justify-center touch-none",
        side === "left" ? "left-0 rounded-l-md" : "right-0 rounded-r-md"
      )}
    >
      <span className="w-0.5 h-3.5 bg-on-primary/80 rounded-full" />
    </span>
  );
}
