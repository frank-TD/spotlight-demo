"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  X,
  Check,
  Loader2,
  Sparkles,
  Trash2,
  Plus,
  Clapperboard,
  Zap,
  ChevronRight,
  ChevronLeft,
  Upload,
  UsersRound,
  Pencil,
  Pause,
  VolumeX,
  RefreshCcw,
  ArrowRight,
  Package,
  Music2,
  Smartphone,
  Megaphone,
} from "lucide-react";
import { toast } from "sonner";
import MiniSelect from "../MiniSelect";
import { InlineAssetGen } from "./AssetLibrary";
import {
  MAX_SHOTS_CAP,
  MV_TRACKS,
  PRESETS,
  PRO_COSTS,
  SCRIPT_MAX_LEN,
  TITLE_MAX_LEN,
  WORKFLOWS,
  assetImg,
  clearSession,
  fmtShotNo,
  proId,
  readSession,
  splitScript,
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
import { useStore, type ProAssetKind, type ProFragment, type ProWorkflow } from "@/lib/store";
import { cn } from "@/lib/utils";

/* ── Script → Shots stepper ──────────────────────────────────────────────
   The lingjuta-style batch entry: one full episode script in, shot drafts
   out. Four steps — Script intake → Asset details → Shot management →
   Video editing handoff. Drafts stay local until step 3 confirms them into
   the store (so backing out costs nothing but the parse credits). */

// Step one carries the workflow's own intake label; the rest are shared.
const stepTitles = (intake: string) => [intake, "Asset details", "Shot management", "Video editing"];

/* Quick-start intake visuals per workflow (OpenArt-style split panel). */
const INTAKE: Record<
  ProWorkflow,
  {
    heroPre: string;
    heroAccent: string;
    tagline: string;
    accent: string;
    accentDeep: string;
    ctaInk: string;
    cta: string;
    icon: typeof Clapperboard;
    vertical: boolean;
    upload?: { icon: typeof Upload; title: string; sub: string; picked: string };
    character?: string; // section label for the optional cast picker
    extraTagline?: string; // ad-only brand line
  }
> = {
  ugc: {
    heroPre: "Make",
    heroAccent: "UGC Ads",
    tagline: "Real faces. Real hooks. Feed-ready.",
    accent: "#c6ff34",
    accentDeep: "#6fe05a",
    ctaInk: "#141416",
    cta: "Direct my UGC ad",
    icon: Smartphone,
    vertical: true,
    character: "Who's on camera?",
  },
  ad: {
    heroPre: "Make",
    heroAccent: "Product Ads",
    tagline: "No shoot. All polish.",
    accent: "#ffb840",
    accentDeep: "#ff7a3c",
    ctaInk: "#141416",
    cta: "Direct my product ad",
    icon: Megaphone,
    vertical: false,
    upload: {
      icon: Package,
      title: "Upload your product",
      sub: "PNG, JPG · Up to 20MB",
      picked: "product-hero.png",
    },
    extraTagline: "Brand tagline",
  },
  mv: {
    heroPre: "Make",
    heroAccent: "Music Videos",
    tagline: "One song. Any mood. Infinite vibes.",
    accent: "#b08bff",
    accentDeep: "#7c5cff",
    ctaInk: "#ffffff",
    cta: "Direct my music video",
    icon: Music2,
    vertical: true,
    upload: {
      icon: Upload,
      title: "Upload your song",
      sub: "MP3, WAV, M4A · Up to 50MB",
      picked: "demo-track.mp3",
    },
    character: "Who's in your story?",
  },
  film: {
    heroPre: "Make",
    heroAccent: "Micro Films",
    tagline: "One script. Every scene. Zero crew.",
    accent: "#c6ff34",
    accentDeep: "#35d07a",
    ctaInk: "#141416",
    cta: "Direct my film",
    icon: Clapperboard,
    vertical: true,
    character: "Who's in your story?",
  },
};

interface Draft {
  id: string;
  summary: string;
  dialogue?: string;
}

// Session-parked stepper state, restored after the signup-gate round-trip.
export interface StepperDraft {
  open: boolean;
  step: number;
  title: string;
  style: string;
  maxShots: string;
  script: string;
  drafts: Draft[];
  workflow?: ProWorkflow;
  track?: string;
  songPicked?: boolean;
  productPicked?: boolean;
  charMode?: "import" | "describe" | null;
  charName?: string;
  charDesc?: string;
  adTagline?: string;
  fmt?: string;
}

export default function ScriptStepper({
  workflow,
  initialScript,
  onClose,
  onGoEditor,
}: {
  workflow: ProWorkflow;
  // Text handed over from the Create-screen vibe bar.
  initialScript?: string;
  onClose: () => void;
  onGoEditor: () => void;
}) {
  const {
    isLoggedIn,
    openSignupGate,
    spendProCredits,
    newProProject,
    addProFragments,
    proAssets,
  } = useStore();

  const cfg = WORKFLOWS[workflow];

  // Every field initializes from the parked draft so a login round-trip (or
  // reload) resumes exactly where the writer left off — including the parsed
  // shot drafts, which cost credits to regenerate.
  const [saved] = useState(() => readSession<StepperDraft>(SK.stepper));
  const [step, setStep] = useState(() => (saved?.step === 3 ? 0 : (saved?.step ?? 0)));
  const [title, setTitle] = useState(saved?.title ?? "");
  const [style, setStyle] = useState<string>(saved?.style ?? cfg.styles[0]);
  const [maxShots, setMaxShots] = useState(saved?.maxShots ?? "");
  const [script, setScript] = useState(saved?.script ?? initialScript ?? "");
  const [track, setTrack] = useState<string>(saved?.track ?? MV_TRACKS[0]);
  // Quick-start intake extras (all mock-level; wired deeper in the next batch).
  const [songPicked, setSongPicked] = useState(saved?.songPicked ?? false);
  const [productPicked, setProductPicked] = useState(saved?.productPicked ?? false);
  const [charMode, setCharMode] = useState<"import" | "describe" | null>(saved?.charMode ?? null);
  const [charName, setCharName] = useState(saved?.charName ?? "");
  const [charDesc, setCharDesc] = useState(saved?.charDesc ?? "");
  const [adTagline, setAdTagline] = useState(saved?.adTagline ?? "");
  const [fmt, setFmt] = useState<string>(saved?.fmt ?? WORKFLOWS[workflow].aspect);
  const [parsing, setParsing] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>(saved?.drafts ?? []);
  const [createdCount, setCreatedCount] = useState(0);
  const parseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (parseTimer.current) clearTimeout(parseTimer.current);
  }, []);

  // One-time restore notice (toast only — no state changes in effects).
  useEffect(() => {
    if (saved && (saved.title || saved.script || saved.drafts.length > 0)) {
      toast.info("Script draft restored — pick up where you left off");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Park the draft on every change; an empty form clears the parking spot.
  useEffect(() => {
    if (step === 3) {
      // Shots are created — the draft has served its purpose.
      clearSession(SK.stepper);
      return;
    }
    if (title || script || drafts.length > 0) {
      writeSession(SK.stepper, {
        open: true,
        step,
        title,
        style,
        maxShots,
        script,
        drafts,
        workflow,
        track,
        songPicked,
        productPicked,
        charMode,
        charName,
        charDesc,
        adTagline,
        fmt,
      } satisfies StepperDraft);
    } else {
      clearSession(SK.stepper);
    }
  }, [step, title, style, maxShots, script, drafts, workflow, track,
      songPicked, productPicked, charMode, charName, charDesc, adTagline, fmt]);

  const closeKeepingDraft = () => {
    // Explicit close: keep the text but stop auto-reopening the stepper.
    const cur = readSession<StepperDraft>(SK.stepper);
    if (cur) writeSession(SK.stepper, { ...cur, open: false });
    onClose();
  };

  const submitScript = () => {
    if (!isLoggedIn) {
      openSignupGate("/discovery/workspace");
      return;
    }
    if (!script.trim()) {
      toast.error(`${cfg.scriptLabel} is required`);
      return;
    }
    if (!title.trim()) {
      // Auto-name from the first sentence of the intake text.
      const clean = script.trim().replace(/\s+/g, " ");
      const first = clean.split(/(?<=[。！？!?.])/)[0] ?? clean;
      setTitle((first || cfg.label).slice(0, TITLE_MAX_LEN).trim() || cfg.label);
    }
    if (!spendProCredits(PRO_COSTS.script)) {
      toast.error("Not enough credits (mock balance)");
      return;
    }
    setParsing(true);
    parseTimer.current = setTimeout(() => {
      const cap = Math.min(parseInt(maxShots, 10) || cfg.defaultShots, MAX_SHOTS_CAP);
      setDrafts(splitScript(script, cap).map((d) => ({ ...d, id: proId("draft") })));
      setParsing(false);
      setStep(1);
    }, 1800);
  };

  const confirmDrafts = () => {
    const kept = drafts.filter((d) => d.summary.trim());
    if (kept.length === 0) {
      toast.error("Keep at least one shot");
      return;
    }
    const projectId = newProProject(
      title.trim() || cfg.label,
      style,
      workflow,
      cfg.hasTrack ? track : undefined,
      workflow === "film" ? fmt : cfg.aspect
    );
    const now = Date.now();
    addProFragments(
      kept.map((d, i) => ({
        id: proId("frag"),
        projectId,
        title: fmtShotNo(i + 1),
        summary: d.summary,
        dialogue: d.dialogue,
        status: "draft",
        frames: [],
        durationSec: cfg.shotSec,
        createdAt: now + i,
      })) satisfies ProFragment[]
    );
    setCreatedCount(kept.length);
    setStep(3);
    clearSession(SK.stepper);
    toast.success(`${kept.length} shots created in "${title.trim()}"`);
  };

  return (
    <div className="rounded-3xl border border-outline-variant/40 bg-surface-container-lowest/60 overflow-hidden">
      {/* Step header */}
      <div className="flex items-center gap-2 px-4 md:px-6 py-4 border-b border-outline-variant/25 overflow-x-auto">
        <button
          type="button"
          onClick={closeKeepingDraft}
          aria-label="close"
          className="w-8 h-8 rounded-full border border-outline-variant/50 flex items-center justify-center text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors shrink-0 mr-1"
        >
          <X className="w-4 h-4" />
        </button>
        <span className="inline-flex items-center gap-1.5 shrink-0 mr-1">
          <span className="font-label text-[8px] uppercase tracking-widest bg-primary text-on-primary px-1.5 py-0.5 rounded">
            {cfg.badge}
          </span>
          <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant hidden md:inline">
            {cfg.label} · {cfg.aspect}
          </span>
        </span>
        {stepTitles(cfg.scriptLabel).map((label, i) => (
          <span key={label} className="flex items-center gap-2 shrink-0">
            {i > 0 && <span className="w-6 h-px bg-outline-variant/40" aria-hidden="true" />}
            <span
              className={cn(
                "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full font-label text-[10px] uppercase tracking-wider border",
                i === step
                  ? "bg-primary text-on-primary border-primary"
                  : i < step
                    ? "border-primary/45 text-primary"
                    : "border-outline-variant/40 text-on-surface-variant"
              )}
            >
              <span className="inline-flex w-4 h-4 rounded-full border border-current items-center justify-center text-[8px]">
                {i < step ? <Check className="w-2.5 h-2.5" /> : i + 1}
              </span>
              {label}
            </span>
          </span>
        ))}
      </div>

      <div className="px-4 md:px-6 py-6">
        {step === 0 &&
          (parsing ? (
            <div className="max-w-2xl mx-auto">
              <ParsingState />
            </div>
          ) : (
            (() => {
              const iv = INTAKE[workflow];
              const HeroIcon = iv.icon;
              const uploadPicked = workflow === "mv" ? songPicked : productPicked;
              const setUploadPicked = workflow === "mv" ? setSongPicked : setProductPicked;
              const aspectShown = workflow === "film" ? fmt : cfg.aspect;
              return (
                <div className="max-w-[1020px] mx-auto grid lg:grid-cols-[1.08fr_1fr] rounded-2xl overflow-hidden border border-outline-variant/30">
                  {/* ── Left: showcase hero ── */}
                  <div
                    className="relative px-6 py-10 flex flex-col items-center justify-center text-center"
                    style={{
                      background: `radial-gradient(120% 90% at 50% 0%, ${iv.accent}22 0%, transparent 55%), #101013`,
                    }}
                  >
                    <h3 className="font-headline text-[30px] leading-tight text-on-surface" style={{ textWrap: "balance" }}>
                      {iv.heroPre}{" "}
                      <span
                        style={{
                          background: `linear-gradient(90deg, ${iv.accent}, ${iv.accentDeep})`,
                          WebkitBackgroundClip: "text",
                          backgroundClip: "text",
                          color: "transparent",
                        }}
                      >
                        {iv.heroAccent}
                      </span>
                    </h3>
                    <p className="font-body text-sm text-on-surface-variant mt-1.5">{iv.tagline}</p>

                    {/* Example fan */}
                    <div
                      className="relative flex items-center justify-center mt-7"
                      style={{ height: iv.vertical ? 250 : 190, width: "100%" }}
                    >
                      {[-1, 1].map((side) => (
                        <div
                          key={side}
                          aria-hidden="true"
                          className={cn(
                            "absolute rounded-xl border border-white/10 opacity-55",
                            iv.vertical ? "w-[108px] h-[188px]" : "w-[190px] h-[110px]"
                          )}
                          style={{
                            background: `linear-gradient(160deg, #17181c 30%, ${iv.accent}26 100%)`,
                            transform: `translateX(${side * (iv.vertical ? 84 : 128)}px) rotate(${side * 9}deg) scale(0.92)`,
                          }}
                        />
                      ))}
                      <div
                        className={cn(
                          "relative z-10 rounded-2xl border border-white/15 overflow-hidden flex flex-col shadow-[0_18px_50px_rgba(0,0,0,0.55)]",
                          iv.vertical ? "w-[128px] h-[224px]" : "w-[240px] h-[136px]"
                        )}
                        style={{ background: `linear-gradient(165deg, #1a1b20 15%, ${iv.accent}33 100%)` }}
                      >
                        <span className="absolute top-2 left-2 font-label text-[8px] uppercase tracking-widest text-white/85 bg-black/45 px-1.5 py-0.5 rounded-full">
                          Example
                        </span>
                        <span className="flex-1 flex items-center justify-center">
                          <HeroIcon className="w-8 h-8 text-white/80" />
                        </span>
                        <span className="flex items-center gap-1.5 px-2.5 pb-2">
                          <Pause className="w-3 h-3 text-white/90 shrink-0" fill="currentColor" />
                          <span className="flex-1 h-[3px] rounded-full bg-white/25 overflow-hidden">
                            <span className="block h-full w-2/3 rounded-full bg-white/85" />
                          </span>
                          <VolumeX className="w-3 h-3 text-white/70 shrink-0" />
                        </span>
                      </div>
                      <button
                        type="button"
                        aria-label="previous example"
                        onClick={() => toast.info("Example reel — more samples arrive with the next update")}
                        className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 border border-white/15 flex items-center justify-center text-white/80 hover:text-white transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="next example"
                        onClick={() => toast.info("Example reel — more samples arrive with the next update")}
                        className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 border border-white/15 flex items-center justify-center text-white/80 hover:text-white transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="flex items-center gap-1.5 mt-4" aria-hidden="true">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: iv.accent }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-white/25" />
                      <span className="w-1.5 h-1.5 rounded-full bg-white/25" />
                    </span>
                  </div>

                  {/* ── Right: minimal intake form ── */}
                  <div className="bg-surface-container-lowest p-5 md:p-6 flex flex-col gap-5">
                    {/* Upload section (song / product) */}
                    {iv.upload && (
                      <div>
                        <SectionLabel icon={iv.upload.icon} label={iv.upload.title.replace("Upload your ", "Your ")} />
                        {uploadPicked ? (
                          <div className="mt-2 flex items-center gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container px-4 py-3.5">
                            <span
                              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                              style={{ background: `linear-gradient(140deg, ${iv.accent}, ${iv.accentDeep})` }}
                            >
                              <iv.upload.icon className="w-[18px] h-[18px]" style={{ color: iv.ctaInk }} />
                            </span>
                            <span className="flex-1 min-w-0">
                              <span className="block font-body text-sm text-on-surface truncate">{iv.upload.picked}</span>
                              <span className="block font-label text-[9px] uppercase tracking-widest text-primary">Ready</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setUploadPicked(false)}
                              className="inline-flex items-center gap-1 font-label text-[9px] uppercase tracking-wider text-on-surface-variant hover:text-primary transition-colors"
                            >
                              <RefreshCcw className="w-3 h-3" /> Replace
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setUploadPicked(true)}
                            aria-label={iv.upload.title}
                            className="mt-2 w-full flex items-center gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container hover:border-primary/50 px-4 py-3.5 text-left transition-colors"
                          >
                            <span
                              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                              style={{ background: `linear-gradient(140deg, ${iv.accent}, ${iv.accentDeep})` }}
                            >
                              <iv.upload.icon className="w-[18px] h-[18px]" style={{ color: iv.ctaInk }} />
                            </span>
                            <span className="min-w-0">
                              <span className="block font-body text-sm text-on-surface">{iv.upload.title}</span>
                              <span className="block font-body text-xs text-on-surface-variant mt-0.5">{iv.upload.sub}</span>
                            </span>
                          </button>
                        )}
                        {cfg.hasTrack && (
                          <div className="flex items-center gap-2 mt-2 px-1">
                            <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant/75">
                              or pick from library
                            </span>
                            <MiniSelect value={track} options={MV_TRACKS} onChange={setTrack} align="start" />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Main intake textarea */}
                    <div>
                      <SectionLabel icon={Pencil} label={cfg.scriptLabel} required counter={`${script.length} / ${SCRIPT_MAX_LEN}`} />
                      <textarea
                        value={script}
                        onChange={(e) => setScript(e.target.value.slice(0, SCRIPT_MAX_LEN))}
                        placeholder={cfg.scriptHint}
                        rows={workflow === "film" ? 6 : 4}
                        aria-label="script content"
                        className="mt-2 w-full px-4 py-3 rounded-2xl bg-surface-container border border-outline-variant/40 focus:border-primary/60 focus:outline-none font-body text-sm text-on-surface placeholder:text-on-surface-variant/60 resize-y leading-relaxed"
                      />
                    </div>

                    {/* Character section */}
                    {iv.character && (
                      <div>
                        <SectionLabel icon={UsersRound} label={iv.character} optional />
                        <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              className={cn(
                                "rounded-2xl border px-3 py-3 flex flex-col items-center gap-1.5 transition-colors",
                                charMode === "import" && charName
                                  ? "border-primary/60 bg-primary-container/15"
                                  : "border-outline-variant/40 bg-surface-container hover:border-primary/50"
                              )}
                            >
                              <UsersRound className="w-4 h-4 text-on-surface-variant" />
                              <span className="font-body text-xs text-on-surface truncate max-w-full">
                                {charMode === "import" && charName ? charName : "Import character"}
                              </span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-[220px]">
                              <DropdownMenuGroup>
                                <DropdownMenuLabel className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                                  From your Cast
                                </DropdownMenuLabel>
                                {[
                                  ...proAssets.filter((a) => a.kind === "character").map((a) => ({ name: a.name, img: a.imageUrl })),
                                  ...PRESETS.character.slice(0, 4).map((p) => ({ name: p.name, img: assetImg("character", p.seed) })),
                                ].map((m) => (
                                  <DropdownMenuItem
                                    key={m.name}
                                    onClick={() => {
                                      setCharMode("import");
                                      setCharName(m.name);
                                    }}
                                    className="gap-2.5 cursor-pointer"
                                  >
                                    <Image src={m.img} alt="" width={24} height={24} className="w-6 h-6 rounded-md object-cover" />
                                    <span className="flex-1 truncate">{m.name}</span>
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant/70">or</span>
                          <button
                            type="button"
                            onClick={() => setCharMode(charMode === "describe" ? null : "describe")}
                            className={cn(
                              "rounded-2xl border px-3 py-3 flex flex-col items-center gap-1.5 transition-colors",
                              charMode === "describe"
                                ? "border-primary/60 bg-primary-container/15"
                                : "border-outline-variant/40 bg-surface-container hover:border-primary/50"
                            )}
                          >
                            <Pencil className="w-4 h-4 text-on-surface-variant" />
                            <span className="font-body text-xs text-on-surface">Describe character</span>
                          </button>
                        </div>
                        {charMode === "describe" && (
                          <input
                            value={charDesc}
                            onChange={(e) => setCharDesc(e.target.value.slice(0, 120))}
                            placeholder="e.g. mid-20s courier with a lime windbreaker and tired eyes"
                            aria-label="describe character"
                            className="mt-2 w-full px-4 py-2.5 rounded-2xl bg-surface-container border border-outline-variant/40 focus:border-primary/60 focus:outline-none font-body text-xs text-on-surface placeholder:text-on-surface-variant/60"
                          />
                        )}
                      </div>
                    )}

                    {/* Ad brand tagline */}
                    {iv.extraTagline && (
                      <div>
                        <SectionLabel icon={Sparkles} label={iv.extraTagline} optional />
                        <input
                          value={adTagline}
                          onChange={(e) => setAdTagline(e.target.value.slice(0, 60))}
                          placeholder="Closing line on the end card — “Glow, bottled.”"
                          aria-label="brand tagline"
                          className="mt-2 w-full px-4 py-2.5 rounded-2xl bg-surface-container border border-outline-variant/40 focus:border-primary/60 focus:outline-none font-body text-xs text-on-surface placeholder:text-on-surface-variant/60"
                        />
                      </div>
                    )}

                    {/* Film format */}
                    {workflow === "film" && (
                      <div>
                        <SectionLabel icon={Clapperboard} label="Format" />
                        <div className="mt-2 flex items-center gap-2">
                          {[
                            { v: "9:16", label: "Micro Drama · 9:16" },
                            { v: "16:9", label: "Short Film · 16:9" },
                          ].map((f) => (
                            <button
                              key={f.v}
                              type="button"
                              onClick={() => setFmt(f.v)}
                              className={cn(
                                "px-3.5 py-2 rounded-full border font-label text-[10px] uppercase tracking-wider transition-colors",
                                fmt === f.v
                                  ? "border-primary/60 text-primary bg-primary-container/25"
                                  : "border-outline-variant/40 text-on-surface-variant hover:border-primary/40"
                              )}
                            >
                              {f.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Advanced row + CTA */}
                    <div className="mt-auto pt-1">
                      <div className="flex items-center gap-3 flex-wrap font-label text-[10px] uppercase tracking-widest text-on-surface-variant mb-3">
                        <span className="border border-outline-variant/40 rounded px-1.5 py-0.5">{aspectShown}</span>
                        <span className="inline-flex items-center gap-1.5">
                          Style <MiniSelect value={style} options={cfg.styles} onChange={setStyle} />
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          Shots
                          <input
                            value={maxShots}
                            onChange={(e) => setMaxShots(e.target.value.replace(/\D/g, "").slice(0, 2))}
                            placeholder={String(cfg.defaultShots)}
                            inputMode="numeric"
                            aria-label="max shots"
                            className="w-10 bg-transparent border-b border-outline-variant/50 focus:border-primary/60 focus:outline-none text-on-surface text-center font-label text-[11px]"
                          />
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={submitScript}
                        className="w-full inline-flex items-center justify-center gap-2 font-label text-label-md uppercase tracking-wider px-6 py-3.5 rounded-full hover:opacity-90 active:scale-[0.99] transition-all"
                        style={{
                          background: `linear-gradient(90deg, ${iv.accent}, ${iv.accentDeep})`,
                          color: iv.ctaInk,
                        }}
                      >
                        {iv.cta}
                        <ArrowRight className="w-4 h-4" />
                        <span className="inline-flex items-center gap-1 border-l pl-2 ml-1" style={{ borderColor: `${iv.ctaInk}44` }}>
                          <Zap className="w-3 h-3" fill="currentColor" /> {PRO_COSTS.script}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()
          ))}

        {step === 1 && (
          <div className="max-w-3xl mx-auto space-y-6">
            <p className="font-body text-sm text-on-surface-variant">
              The agent suggested this cast, these scenes and props from your script (mock
              extraction). Refine their looks anytime in the Cast / Scenes / Props libraries on the
              left rail.
            </p>
            {(["character", "scene", "prop"] as ProAssetKind[]).map((kind) => (
              <AssetSuggestRow key={kind} kind={kind} mine={proAssets.filter((a) => a.kind === kind).length} />
            ))}
            <div className="flex justify-end gap-2 pt-2">
              <StepGhost onClick={() => setStep(2)}>
                Continue to shots <ChevronRight className="w-3 h-3" />
              </StepGhost>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <p className="font-body text-sm text-on-surface-variant">
                {drafts.length} shot drafts from “{title}” — edit, remove or add before creating.
              </p>
              <button
                type="button"
                onClick={() => setDrafts((d) => [...d, { id: proId("draft"), summary: "" }])}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-outline-variant/50 font-label text-[10px] uppercase tracking-wider text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors"
              >
                <Plus className="w-3 h-3" /> Add shot
              </button>
            </div>
            <div className="space-y-2 max-h-[46vh] overflow-y-auto pr-1">
              {drafts.map((d, i) => (
                <div
                  key={d.id}
                  className="flex items-start gap-3 rounded-xl border border-outline-variant/35 bg-surface-container-low px-3.5 py-3"
                >
                  <span className="font-label text-[10px] uppercase tracking-widest text-primary pt-2 shrink-0 w-14">
                    {fmtShotNo(i + 1)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <textarea
                      value={d.summary}
                      onChange={(e) =>
                        setDrafts((all) =>
                          all.map((x) => (x.id === d.id ? { ...x, summary: e.target.value } : x))
                        )
                      }
                      rows={2}
                      placeholder="Describe this shot..."
                      aria-label={`shot ${i + 1} description`}
                      className="w-full bg-transparent border-none resize-none focus:outline-none font-body text-sm text-on-surface placeholder:text-on-surface-variant/60 leading-relaxed"
                    />
                    {d.dialogue && (
                      <p className="font-body text-xs text-on-surface-variant/80 italic truncate">
                        Line: “{d.dialogue}”
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setDrafts((all) => all.filter((x) => x.id !== d.id))}
                    aria-label="remove shot"
                    className="w-7 h-7 rounded-full border border-outline-variant/50 flex items-center justify-center text-on-surface-variant hover:border-error/60 hover:text-error transition-colors shrink-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={confirmDrafts}
                className="inline-flex items-center gap-2 bg-primary text-on-primary font-label text-label-md uppercase tracking-wider px-6 py-3 rounded-full hover:opacity-90 active:scale-95 transition-all"
              >
                <Clapperboard className="w-3.5 h-3.5" />
                Create {drafts.filter((d) => d.summary.trim()).length} shots
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="max-w-md mx-auto text-center py-8">
            <span className="inline-flex w-12 h-12 rounded-full bg-primary text-on-primary items-center justify-center">
              <Check className="w-6 h-6" />
            </span>
            <h3 className="font-headline text-2xl text-on-surface mt-4">
              {createdCount} shots on the board
            </h3>
            <p className="font-body text-sm text-on-surface-variant mt-2 leading-relaxed">
              “{title}” is ready. Frame and direct each shot from the board, then assemble the
              episode on the timeline.
            </p>
            <div className="flex items-center justify-center gap-2 mt-6">
              <StepGhost onClick={onClose}>Back to board</StepGhost>
              <button
                type="button"
                onClick={onGoEditor}
                className="inline-flex items-center gap-2 bg-primary text-on-primary font-label text-label-md uppercase tracking-wider px-5 py-2.5 rounded-full hover:opacity-90 active:scale-95 transition-all"
              >
                Open Editor
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* Fake parse: a mini pipeline echoing the old Superstar production board. */
function ParsingState() {
  return (
    <div className="py-12 text-center">
      <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto" />
      <p className="font-headline text-xl text-on-surface mt-4">Superstar agent is parsing…</p>
      <div className="inline-flex items-center gap-2 mt-4 flex-wrap justify-center">
        {["Script intake", "Beat detection", "Shot split", "Asset scan"].map((s, i) => (
          <span
            key={s}
            className={cn(
              "inline-flex items-center gap-1.5 font-label text-[9px] uppercase tracking-widest border px-2 py-1 rounded-full",
              i === 0
                ? "border-primary/50 text-primary"
                : "border-outline-variant/50 text-on-surface-variant"
            )}
          >
            {i === 0 ? <Check className="w-2.5 h-2.5" /> : <Loader2 className="w-2.5 h-2.5 animate-spin" />}
            {s}
          </span>
        ))}
      </div>
      <p className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant/70 mt-4">
        Mock mode · API token pending
      </p>
    </div>
  );
}

function AssetSuggestRow({ kind, mine }: { kind: ProAssetKind; mine: number }) {
  const picks = PRESETS[kind].slice(0, kind === "character" ? 3 : 2);
  const label = kind === "character" ? "Cast" : kind === "scene" ? "Scenes" : "Props";
  return (
    <div className="rounded-2xl border border-outline-variant/35 bg-surface-container-low p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
          {label}
        </span>
        <span className="font-label text-[9px] uppercase tracking-widest border border-primary/40 text-primary px-1.5 py-0.5 rounded">
          Detected in script
        </span>
        <span className="ml-auto font-label text-[9px] uppercase tracking-widest text-on-surface-variant/70">
          {mine} saved in your library
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {picks.map((p) => (
          <div key={p.seed} className="w-[150px] shrink-0">
            <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-surface-container">
              <Image
                src={assetImg(kind, p.seed)}
                alt={p.name}
                width={300}
                height={225}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="font-body text-xs text-on-surface mt-1.5 truncate">{p.name}</p>
            <p className="font-body text-[11px] text-on-surface-variant/80 truncate">{p.desc}</p>
          </div>
        ))}
      </div>
      {/* Generate a look without leaving the flow — saves straight into My. */}
      <div className="mt-3 pt-3 border-t border-outline-variant/25">
        <InlineAssetGen kind={kind} />
      </div>
    </div>
  );
}

function SectionLabel({
  icon: Icon,
  label,
  required,
  optional,
  counter,
}: {
  icon: typeof Pencil;
  label: string;
  required?: boolean;
  optional?: boolean;
  counter?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-3.5 h-3.5 text-primary" />
      <span className="font-body text-sm font-semibold text-on-surface">
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </span>
      {optional && (
        <span className="font-label text-[8px] uppercase tracking-widest border border-outline-variant/50 text-on-surface-variant px-1.5 py-0.5 rounded-full">
          Optional
        </span>
      )}
      {counter && (
        <span className="ml-auto font-label text-[9px] uppercase tracking-widest text-on-surface-variant/70">
          {counter}
        </span>
      )}
    </div>
  );
}

function StepGhost({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-outline-variant/50 font-label text-label-md uppercase tracking-wider text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors"
    >
      {children}
    </button>
  );
}
