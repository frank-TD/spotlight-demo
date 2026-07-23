"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Play,
  Check,
  AtSign,
  Zap,
  UsersRound,
  Mountain,
  Box,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import MiniSelect from "../MiniSelect";
import { SuperstarGlyph } from "../SuperstarProvider";
import {
  ANGLES,
  CAMERA_MOVES,
  LIGHTINGS,
  PRESETS,
  PRO_COSTS,
  SHOT_DURATIONS,
  SHOT_TYPES,
  assetImg,
  clearSession,
  frameImg,
  readSession,
  writeSession,
  SK,
} from "./pro-mock";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore, type ProAssetKind } from "@/lib/store";
import { cn } from "@/lib/utils";

/* ── Shot Composer — Framing → Directing (Artlist-style) ─────────────────
   Left panel drives the two-phase flow: Framing generates candidate frames
   (with @-mentions pulling characters / scenes / props into the prompt);
   Directing picks start/end frames and renders the (mock) video clip. The
   right canvas previews frames and the finished clip. */

const KIND_ICON: Record<ProAssetKind, typeof UsersRound> = {
  character: UsersRound,
  scene: Mountain,
  prop: Box,
};

type Phase = "framing" | "directing";

// Session-parked composer fields, restored after the signup-gate round-trip.
interface ComposerDraft {
  prompt: string;
  angle: string;
  shotType: string;
  lighting: string;
  cameraMove: string;
  duration: number;
}

export default function ShotComposer({
  fragmentId,
  onBack,
  onNavigate,
}: {
  fragmentId: string;
  onBack: () => void;
  // Jump to a sibling shot (parent remounts the composer with its draft).
  onNavigate?: (id: string) => void;
}) {
  const {
    proFragments,
    updateProFragment,
    proAssets,
    spendProCredits,
    isLoggedIn,
    openSignupGate,
  } = useStore();
  const fragment = proFragments.find((f) => f.id === fragmentId);

  const [phase, setPhase] = useState<Phase>("framing");
  // Restore a parked draft (gate round-trip / reload) and fold in a pending
  // @mention handed over from an asset library — all inside initializers so
  // no effect ever has to set state.
  const [saved] = useState(() => readSession<ComposerDraft>(SK.composerDraft(fragmentId)));
  const [pendingMention] = useState(() => readSession<string>(SK.mention));
  const [prompt, setPrompt] = useState(() => {
    const base = saved?.prompt ?? fragment?.summary ?? "";
    if (!pendingMention) return base;
    return base ? `${base.trimEnd()} @${pendingMention} ` : `@${pendingMention} `;
  });
  const [angle, setAngle] = useState<string>(saved?.angle ?? ANGLES[0]);
  const [shotType, setShotType] = useState<string>(saved?.shotType ?? SHOT_TYPES[1]);
  const [lighting, setLighting] = useState<string>(saved?.lighting ?? LIGHTINGS[0]);
  const [cameraMove, setCameraMove] = useState<string>(
    saved?.cameraMove ?? fragment?.cameraMove ?? CAMERA_MOVES[1]
  );
  const [duration, setDuration] = useState<number>(saved?.duration ?? fragment?.durationSec ?? 8);
  const [busy, setBusy] = useState<null | "frame" | "video">(null);
  const [progress, setProgress] = useState(0);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout | typeof setInterval>[]>([]);

  useEffect(() => () => timers.current.forEach((t) => clearTimeout(t as never)), []);

  // Consume the mention / announce the restore once (toast only, no state).
  useEffect(() => {
    if (pendingMention) {
      clearSession(SK.mention);
      toast.success(`@${pendingMention} added to the prompt`);
    } else if (saved?.prompt && saved.prompt !== fragment?.summary) {
      toast.info("Composer draft restored");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Park the draft as it changes.
  useEffect(() => {
    writeSession(SK.composerDraft(fragmentId), {
      prompt,
      angle,
      shotType,
      lighting,
      cameraMove,
      duration,
    } satisfies ComposerDraft);
  }, [fragmentId, prompt, angle, shotType, lighting, cameraMove, duration]);

  if (!fragment) {
    return (
      <div className="rounded-3xl border border-outline-variant/40 px-6 py-12 text-center">
        <p className="font-body text-sm text-on-surface-variant">Shot not found.</p>
        <button
          type="button"
          onClick={onBack}
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-outline-variant/50 font-label text-[10px] uppercase tracking-wider text-on-surface-variant hover:border-primary/50 hover:text-primary"
        >
          <ChevronLeft className="w-3 h-3" /> Back to shots
        </button>
      </div>
    );
  }

  // Assets available for @-mentions: user-generated first, then presets.
  const mentionables = (kind: ProAssetKind) => [
    ...proAssets.filter((a) => a.kind === kind).map((a) => ({ name: a.name, img: a.imageUrl })),
    ...PRESETS[kind].slice(0, 4).map((p) => ({ name: p.name, img: assetImg(kind, p.seed) })),
  ];

  const mentioned = [...proAssets.map((a) => a.name), ...Object.values(PRESETS).flat().map((p) => p.name)]
    .filter((name, i, arr) => arr.indexOf(name) === i)
    .filter((name) => prompt.includes(`@${name}`));

  const insertMention = (name: string) => {
    setPrompt((p) => {
      const base = p.endsWith("@") ? p.slice(0, -1) : p.length && !p.endsWith(" ") ? `${p} ` : p;
      return `${base}@${name} `;
    });
    taRef.current?.focus();
  };

  const gate = () => {
    if (!isLoggedIn) {
      openSignupGate("/discovery/workspace");
      return false;
    }
    return true;
  };

  const run = (kind: "frame" | "video", ms: number, done: () => void) => {
    setBusy(kind);
    setProgress(4);
    const iv = setInterval(
      () => setProgress((p) => (p >= 95 ? 95 : p + Math.ceil((100 - p) / 7))),
      180
    );
    timers.current.push(iv);
    timers.current.push(
      setTimeout(() => {
        clearInterval(iv);
        setProgress(100);
        done();
        setBusy(null);
      }, ms)
    );
  };

  const generateFrames = () => {
    if (!gate()) return;
    if (!prompt.trim()) {
      toast.error("Describe the frame first");
      return;
    }
    if (!spendProCredits(PRO_COSTS.frame)) {
      toast.error("Not enough credits (mock balance)");
      return;
    }
    run("frame", 2000, () => {
      const seedBase = `${fragment.id}-${Date.now()}`;
      const fresh = [frameImg(`${seedBase}-a`), frameImg(`${seedBase}-b`)];
      updateProFragment(fragment.id, {
        frames: [...fragment.frames, ...fresh],
        frameUrl: fragment.frameUrl ?? fresh[0],
        status: fragment.status === "draft" ? "framed" : fragment.status,
        summary: fragment.summary || prompt.trim().slice(0, 180),
      });
    });
  };

  const generateVideo = () => {
    if (!gate()) return;
    if (!fragment.startFrame) {
      toast.error("Pick a start frame first");
      return;
    }
    if (!spendProCredits(PRO_COSTS.video)) {
      toast.error("Not enough credits (mock balance)");
      return;
    }
    run("video", 2400, () => {
      updateProFragment(fragment.id, { status: "directed", cameraMove, durationSec: duration });
      toast.success(`${fragment.title} directed — ready for the timeline`);
    });
  };

  const siblings = proFragments.filter((f) => f.projectId === fragment.projectId);
  const sibIdx = Math.max(
    0,
    siblings.findIndex((f) => f.id === fragmentId)
  );

  const statusPill =
    fragment.status === "directed"
      ? "border-primary/50 text-primary bg-primary-container/30"
      : fragment.status === "framed"
        ? "border-amber-400/60 text-amber-300"
        : "border-outline-variant/50 text-on-surface-variant";

  return (
    <div>
      {/* Back row */}
      <div className="flex items-center gap-2.5 flex-wrap mb-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-outline-variant/50 font-label text-[10px] uppercase tracking-wider text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors"
        >
          <ChevronLeft className="w-3 h-3" /> Shots
        </button>
        <span className="font-label text-label-md uppercase tracking-wider text-on-surface">
          {fragment.title}
        </span>
        <span
          className={cn(
            "font-label text-[9px] uppercase tracking-widest border px-2 py-0.5 rounded-full",
            statusPill
          )}
        >
          {fragment.status}
        </span>
        <span className="font-body text-xs text-on-surface-variant truncate max-w-[46ch]">
          {fragment.summary}
        </span>
        {onNavigate && siblings.length > 1 && (
          <span className="ml-auto inline-flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onNavigate(siblings[(sibIdx - 1 + siblings.length) % siblings.length].id)}
              aria-label="previous shot"
              className="w-7 h-7 rounded-full border border-outline-variant/50 flex items-center justify-center text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
              {sibIdx + 1} / {siblings.length}
            </span>
            <button
              type="button"
              onClick={() => onNavigate(siblings[(sibIdx + 1) % siblings.length].id)}
              aria-label="next shot"
              className="w-7 h-7 rounded-full border border-outline-variant/50 flex items-center justify-center text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </span>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* Composer panel */}
        <div className="w-full lg:w-[400px] shrink-0 rounded-3xl border border-outline-variant/40 bg-surface-container-lowest/70 overflow-hidden">
          {/* Phase tabs */}
          <div className="flex items-center px-2 pt-2">
            {(["framing", "directing"] as Phase[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  if (p === "directing" && fragment.frames.length === 0) {
                    toast.info("Generate a frame first — Directing turns it into video");
                    return;
                  }
                  setPhase(p);
                }}
                className={cn(
                  "flex-1 py-2.5 rounded-2xl font-label text-[11px] uppercase tracking-wider transition-colors",
                  phase === p
                    ? "bg-surface-container text-on-surface"
                    : "text-on-surface-variant hover:text-on-surface",
                  p === "directing" && fragment.frames.length === 0 && "opacity-50"
                )}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Params strip */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-outline-variant/20 flex-wrap">
            <SuperstarGlyph size="sm" />
            <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
              Nano Banana 2 · 2K · 16:9
            </span>
            <span className="ml-auto font-label text-[9px] uppercase tracking-widest border border-outline-variant/40 text-on-surface-variant/80 px-1.5 py-0.5 rounded">
              Mock
            </span>
          </div>

          {phase === "framing" ? (
            <div className="p-4 space-y-3.5">
              {/* Mention chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {(["character", "scene", "prop"] as ProAssetKind[]).map((kind) => {
                  const Icon = KIND_ICON[kind];
                  return (
                    <DropdownMenu key={kind}>
                      <DropdownMenuTrigger className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-outline-variant/40 font-label text-[10px] uppercase tracking-wider text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors">
                        <AtSign className="w-3 h-3" />
                        <Icon className="w-3 h-3" />
                        {kind}
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-[220px]">
                        {/* Base UI requires Label to live inside a Group */}
                        <DropdownMenuGroup>
                          <DropdownMenuLabel className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                            Mention a {kind}
                          </DropdownMenuLabel>
                          {mentionables(kind).map((m) => (
                            <DropdownMenuItem
                              key={m.name}
                              onClick={() => insertMention(m.name)}
                              className="gap-2.5 cursor-pointer"
                            >
                              <Image
                                src={m.img}
                                alt=""
                                width={24}
                                height={24}
                                className="w-6 h-6 rounded-md object-cover"
                              />
                              <span className="flex-1 truncate">{m.name}</span>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                })}
              </div>

              <textarea
                ref={taRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={5}
                aria-label="frame description"
                placeholder={"Describe your frame's composition and mood.\nUse @ to add characters, scenes and props."}
                className="w-full px-3.5 py-3 rounded-xl bg-surface-container border border-outline-variant/40 focus:border-primary/60 focus:outline-none font-body text-sm text-on-surface placeholder:text-on-surface-variant/60 resize-none leading-relaxed"
              />

              {mentioned.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {mentioned.map((name) => (
                    <span
                      key={name}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary-container/40 text-on-primary-container font-body text-[11px]"
                    >
                      <AtSign className="w-2.5 h-2.5" />
                      {name}
                    </span>
                  ))}
                </div>
              )}

              {/* Angle / Shot / Lighting */}
              <div className="rounded-xl border border-outline-variant/35 divide-y divide-outline-variant/25">
                <ComposerRow label="Angle">
                  <MiniSelect value={angle} options={ANGLES} onChange={setAngle} />
                </ComposerRow>
                <ComposerRow label="Shot type">
                  <MiniSelect value={shotType} options={SHOT_TYPES} onChange={setShotType} />
                </ComposerRow>
                <ComposerRow label="Lighting">
                  <MiniSelect value={lighting} options={LIGHTINGS} onChange={setLighting} />
                </ComposerRow>
              </div>

              <GenerateButton
                busy={busy === "frame"}
                progress={progress}
                cost={PRO_COSTS.frame}
                onClick={generateFrames}
              >
                Generate frame
              </GenerateButton>
            </div>
          ) : (
            <div className="p-4 space-y-3.5">
              <FrameSlot
                label="Start frame"
                selected={fragment.startFrame}
                frames={fragment.frames}
                onPick={(url) => updateProFragment(fragment.id, { startFrame: url })}
              />
              <FrameSlot
                label="End frame"
                selected={fragment.endFrame}
                frames={fragment.frames}
                onPick={(url) => updateProFragment(fragment.id, { endFrame: url })}
              />

              <div className="rounded-xl border border-outline-variant/35 divide-y divide-outline-variant/25">
                <ComposerRow label="Camera move">
                  <MiniSelect value={cameraMove} options={CAMERA_MOVES} onChange={setCameraMove} />
                </ComposerRow>
                <ComposerRow label="Duration">
                  <MiniSelect
                    value={duration}
                    options={SHOT_DURATIONS}
                    onChange={setDuration}
                    format={(v) => `${v}s`}
                  />
                </ComposerRow>
              </div>

              <GenerateButton
                busy={busy === "video"}
                progress={progress}
                cost={PRO_COSTS.video}
                onClick={generateVideo}
              >
                Generate video
              </GenerateButton>
            </div>
          )}
        </div>

        {/* Canvas */}
        <div className="flex-1 min-w-0 rounded-3xl border border-outline-variant/40 bg-surface-container-lowest/60 p-5 min-h-[440px]">
          {phase === "framing" ? (
            fragment.frames.length === 0 && busy !== "frame" ? (
              <EmptyCanvas />
            ) : (
              <div>
                <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-3">
                  Frames · click to set the key frame
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {busy === "frame" && (
                    <div className="relative rounded-2xl overflow-hidden bg-surface-container aspect-video flex items-center justify-center">
                      <span className="shimmer-overlay" />
                      <div className="relative z-10 flex flex-col items-center gap-2">
                        <Loader2 className="w-6 h-6 text-primary animate-spin" />
                        <p className="font-body text-xs text-on-surface-variant">
                          Rendering frame ({progress}%)
                        </p>
                      </div>
                    </div>
                  )}
                  {[...fragment.frames].reverse().map((url) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => updateProFragment(fragment.id, { frameUrl: url })}
                      className={cn(
                        "relative rounded-2xl overflow-hidden aspect-video border-2 transition-colors",
                        fragment.frameUrl === url
                          ? "border-primary"
                          : "border-transparent hover:border-outline-variant/60"
                      )}
                    >
                      <Image
                        src={url}
                        alt="generated frame"
                        width={960}
                        height={540}
                        className="w-full h-full object-cover"
                      />
                      {fragment.frameUrl === url && (
                        <span className="absolute top-2 left-2 inline-flex items-center gap-1 font-label text-[9px] uppercase tracking-widest bg-primary text-on-primary px-2 py-0.5 rounded-full">
                          <Check className="w-2.5 h-2.5" /> Key frame
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )
          ) : (
            <DirectingCanvas
              busy={busy === "video"}
              progress={progress}
              directed={fragment.status === "directed"}
              poster={fragment.startFrame ?? fragment.frameUrl}
              duration={duration}
              cameraMove={cameraMove}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ComposerRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-3.5 py-2.5">
      <span className="font-body text-sm text-on-surface-variant">{label}</span>
      {children}
    </div>
  );
}

function GenerateButton({
  busy,
  progress,
  cost,
  onClick,
  children,
}: {
  busy: boolean;
  progress: number;
  cost: number;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="w-full inline-flex items-center justify-center gap-2 bg-primary text-on-primary font-label text-label-md uppercase tracking-wider px-5 py-3 rounded-full hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
    >
      {busy ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> {progress}%
        </>
      ) : (
        <>
          <Sparkles className="w-3.5 h-3.5" />
          {children}
          <span className="inline-flex items-center gap-1 border-l border-on-primary/30 pl-2 ml-1">
            <Zap className="w-3 h-3" fill="currentColor" /> {cost}
          </span>
        </>
      )}
    </button>
  );
}

function FrameSlot({
  label,
  selected,
  frames,
  onPick,
}: {
  label: string;
  selected?: string;
  frames: string[];
  onPick: (url: string) => void;
}) {
  return (
    <div>
      <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-1.5">
        {label}
      </p>
      <div className="flex gap-2">
        <div
          className={cn(
            "w-24 aspect-video rounded-lg overflow-hidden border shrink-0",
            selected ? "border-primary/60" : "border-dashed border-outline-variant/50"
          )}
        >
          {selected ? (
            <Image
              src={selected}
              alt={label}
              width={192}
              height={108}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="w-full h-full flex items-center justify-center font-label text-[8px] uppercase tracking-widest text-on-surface-variant/60">
              Empty
            </span>
          )}
        </div>
        <div className="flex-1 flex gap-1.5 overflow-x-auto">
          {frames.map((url) => (
            <button
              key={url}
              type="button"
              onClick={() => onPick(url)}
              className={cn(
                "h-full aspect-video rounded-md overflow-hidden border-2 shrink-0 transition-colors",
                selected === url ? "border-primary" : "border-transparent hover:border-outline-variant/60"
              )}
            >
              <Image
                src={url}
                alt="frame option"
                width={120}
                height={68}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyCanvas() {
  return (
    <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center">
      {/* Mini triptych nod to the Artlist empty state */}
      <div className="flex items-end gap-2 mb-5" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn(
              "rounded-lg border border-outline-variant/40",
              i === 1 ? "w-24 h-16 bg-surface-container-high" : "w-16 h-12 bg-surface-container"
            )}
            style={{
              background:
                i === 1
                  ? "linear-gradient(135deg, #16181c 0%, rgba(198,255,52,0.14) 100%)"
                  : undefined,
            }}
          />
        ))}
      </div>
      <p className="font-body text-sm text-on-surface-variant max-w-xs leading-relaxed">
        Create your first frame, then turn it into a video with{" "}
        <span className="text-on-surface">“Directing”</span>
      </p>
    </div>
  );
}

function DirectingCanvas({
  busy,
  progress,
  directed,
  poster,
  duration,
  cameraMove,
}: {
  busy: boolean;
  progress: number;
  directed: boolean;
  poster?: string;
  duration: number;
  cameraMove: string;
}) {
  if (busy) {
    return (
      <div className="relative h-full min-h-[400px] rounded-2xl overflow-hidden bg-surface-container flex flex-col items-center justify-center">
        <span className="shimmer-overlay" />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 text-primary animate-spin" />
          <p className="font-body text-sm text-on-surface-variant">
            Rendering via Superstar API… ({progress}%)
          </p>
        </div>
      </div>
    );
  }
  if (directed && poster) {
    return (
      <div className="relative h-full min-h-[400px] rounded-2xl overflow-hidden">
        <Image
          src={poster}
          alt="directed shot"
          width={960}
          height={540}
          className="w-full h-full object-cover"
        />
        <span className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.45))]" />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="w-16 h-16 rounded-full border border-primary/60 bg-surface/50 backdrop-blur flex items-center justify-center text-primary">
            <Play className="w-7 h-7 translate-x-[2px]" fill="currentColor" />
          </span>
        </span>
        <span className="absolute bottom-3 right-3 font-label text-[9px] uppercase tracking-widest text-on-surface-variant/90 border border-outline-variant/40 bg-surface/60 px-2 py-0.5 rounded">
          Mock output · {duration}s · {cameraMove}
        </span>
      </div>
    );
  }
  return (
    <div className="h-full min-h-[400px] flex items-center justify-center text-center">
      <p className="font-body text-sm text-on-surface-variant max-w-xs leading-relaxed">
        Pick a start (and optionally an end) frame on the left, choose a camera move, then{" "}
        <span className="text-on-surface">Generate video</span>.
      </p>
    </div>
  );
}
