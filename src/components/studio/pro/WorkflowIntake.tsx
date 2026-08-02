"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  X,
  Check,
  Loader2,
  Sparkles,
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
  nowTs,
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
import { useStore, type ProFragment, type ProWorkflow } from "@/lib/store";
import { cn } from "@/lib/utils";

/* ── Workflow quick-start intake ─────────────────────────────────────────
   The OpenArt-style split panel (marketing hero left, minimal form right),
   one configuration per video type. Single screen: submitting runs the
   parse right on the form and drops the drafted shots straight onto the
   board — the follow-up work (frame, direct, assemble) lives on the board
   and in the editor. Drafts park in sessionStorage across the signup-gate
   round-trip, same as the composer and the agent chat. */

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
    accent: "#7ff7e2",
    accentDeep: "#4fd9bd",
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
    accent: "#7ff7e2",
    accentDeep: "#35d07a",
    ctaInk: "#141416",
    cta: "Direct my film",
    icon: Clapperboard,
    vertical: true,
    character: "Who's in your story?",
  },
};

// Session-parked form state, restored after the signup-gate round-trip.
export interface IntakeDraft {
  open: boolean;
  workflow: ProWorkflow;
  style: string;
  maxShots: string;
  script: string;
  track?: string;
  songPicked?: boolean;
  productPicked?: boolean;
  charMode?: "import" | "describe" | null;
  charName?: string;
  charDesc?: string;
  adTagline?: string;
  fmt?: string;
}

export default function WorkflowIntake({
  workflow,
  initialScript,
  onClose,
  onCreated,
}: {
  workflow: ProWorkflow;
  // Text handed over from the Create-screen vibe bar.
  initialScript?: string;
  onClose: () => void;
  onCreated: (projectId: string) => void;
}) {
  const { isLoggedIn, openSignupGate, spendProCredits, newProProject, addProFragments, proAssets } =
    useStore();

  const cfg = WORKFLOWS[workflow];
  const iv = INTAKE[workflow];
  const HeroIcon = iv.icon;

  // Every field initializes from the parked draft so a login round-trip (or
  // reload) resumes exactly where the writer left off.
  const [saved] = useState(() => readSession<IntakeDraft>(SK.intake));
  const [style, setStyle] = useState<string>(saved?.style ?? cfg.styles[0]);
  const [maxShots, setMaxShots] = useState(saved?.maxShots ?? "");
  const [script, setScript] = useState(saved?.script ?? initialScript ?? "");
  const [track, setTrack] = useState<string>(saved?.track ?? MV_TRACKS[0]);
  const [songPicked, setSongPicked] = useState(saved?.songPicked ?? false);
  const [productPicked, setProductPicked] = useState(saved?.productPicked ?? false);
  const [charMode, setCharMode] = useState<"import" | "describe" | null>(saved?.charMode ?? null);
  const [charName, setCharName] = useState(saved?.charName ?? "");
  const [charDesc, setCharDesc] = useState(saved?.charDesc ?? "");
  const [adTagline, setAdTagline] = useState(saved?.adTagline ?? "");
  const [fmt, setFmt] = useState<string>(saved?.fmt ?? cfg.aspect);
  const [parsing, setParsing] = useState(false);
  const parseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (parseTimer.current) clearTimeout(parseTimer.current);
  }, []);

  // One-time restore notice (toast only — no state changes in effects).
  useEffect(() => {
    if (saved?.script) {
      toast.info("Draft restored — pick up where you left off");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Park the draft on every change; an empty form clears the parking spot.
  useEffect(() => {
    if (script || charName || charDesc || adTagline) {
      writeSession(SK.intake, {
        open: true,
        workflow,
        style,
        maxShots,
        script,
        track,
        songPicked,
        productPicked,
        charMode,
        charName,
        charDesc,
        adTagline,
        fmt,
      } satisfies IntakeDraft);
    } else {
      clearSession(SK.intake);
    }
  }, [workflow, style, maxShots, script, track, songPicked, productPicked,
      charMode, charName, charDesc, adTagline, fmt]);

  const closeKeepingDraft = () => {
    // Explicit close: keep the text but stop auto-reopening the form.
    const cur = readSession<IntakeDraft>(SK.intake);
    if (cur) writeSession(SK.intake, { ...cur, open: false });
    onClose();
  };

  // Parse on the form, then create the board directly — no interim steps.
  const submit = () => {
    if (!isLoggedIn) {
      openSignupGate("/discovery/workspace");
      return;
    }
    if (!script.trim()) {
      toast.error(`${cfg.scriptLabel} is required`);
      return;
    }
    if (!spendProCredits(PRO_COSTS.script)) {
      toast.error("Not enough credits (mock balance)");
      return;
    }
    setParsing(true);
    parseTimer.current = setTimeout(() => {
      const cap = Math.min(parseInt(maxShots, 10) || cfg.defaultShots, MAX_SHOTS_CAP);
      const drafts = splitScript(script, cap);
      if (drafts.length === 0) {
        setParsing(false);
        toast.error("Nothing to split — give the script a little more to work with");
        return;
      }
      const clean = script.trim().replace(/\s+/g, " ");
      const first = clean.split(/(?<=[。！？!?.])/)[0] ?? clean;
      const title = (first || cfg.label).slice(0, TITLE_MAX_LEN).trim() || cfg.label;
      const projectId = newProProject(
        title,
        style,
        workflow,
        cfg.hasTrack ? track : undefined,
        workflow === "film" ? fmt : cfg.aspect
      );
      const now = nowTs();
      addProFragments(
        drafts.map((d, i) => ({
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
      clearSession(SK.intake);
      toast.success(`${drafts.length} shots on the board — frame them when ready`);
      onCreated(projectId);
    }, 1800);
  };

  const uploadPicked = workflow === "mv" ? songPicked : productPicked;
  const setUploadPicked = workflow === "mv" ? setSongPicked : setProductPicked;
  const aspectShown = workflow === "film" ? fmt : cfg.aspect;

  return (
    <div className="rounded-3xl border border-outline-variant/40 bg-surface-container-lowest/60 overflow-hidden">
      {/* Slim header */}
      <div className="flex items-center gap-2 px-4 md:px-6 py-4 border-b border-outline-variant/25">
        <button
          type="button"
          onClick={closeKeepingDraft}
          aria-label="close"
          className="w-8 h-8 rounded-full border border-outline-variant/50 flex items-center justify-center text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors shrink-0 mr-1"
        >
          <X className="w-4 h-4" />
        </button>
        <span className="font-label text-[8px] uppercase tracking-widest bg-primary text-on-primary px-1.5 py-0.5 rounded">
          {cfg.badge}
        </span>
        <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant">
          Quick Start · {cfg.label} · {aspectShown}
        </span>
        <span className="ml-auto inline-flex items-center gap-1 font-label text-[9px] uppercase tracking-widest text-on-surface-variant/70">
          <Sparkles className="w-3 h-3" /> Parse & board in one step
        </span>
      </div>

      <div className="px-4 md:px-6 py-6">
        {parsing ? (
          <div className="max-w-2xl mx-auto">
            <ParsingState />
          </div>
        ) : (
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
                        {/* Base UI requires Label to live inside a Group */}
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
                  onClick={submit}
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
        {["Script intake", "Beat detection", "Shot split", "Board build"].map((s, i) => (
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
