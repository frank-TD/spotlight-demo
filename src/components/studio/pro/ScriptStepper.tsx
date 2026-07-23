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
} from "lucide-react";
import { toast } from "sonner";
import MiniSelect from "../MiniSelect";
import { InlineAssetGen } from "./AssetLibrary";
import {
  DRAMA_STYLES,
  MAX_SHOTS_CAP,
  PRESETS,
  PRO_COSTS,
  SCRIPT_MAX_LEN,
  TITLE_MAX_LEN,
  assetImg,
  clearSession,
  fmtShotNo,
  proId,
  readSession,
  splitScript,
  writeSession,
  SK,
} from "./pro-mock";
import { useStore, type ProAssetKind, type ProFragment } from "@/lib/store";
import { cn } from "@/lib/utils";

/* ── Script → Shots stepper ──────────────────────────────────────────────
   The lingjuta-style batch entry: one full episode script in, shot drafts
   out. Four steps — Script intake → Asset details → Shot management →
   Video editing handoff. Drafts stay local until step 3 confirms them into
   the store (so backing out costs nothing but the parse credits). */

const STEPS = ["Script (full episode)", "Asset details", "Shot management", "Video editing"];

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
}

export default function ScriptStepper({
  onClose,
  onGoEditor,
}: {
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

  // Every field initializes from the parked draft so a login round-trip (or
  // reload) resumes exactly where the writer left off — including the parsed
  // shot drafts, which cost credits to regenerate.
  const [saved] = useState(() => readSession<StepperDraft>(SK.stepper));
  const [step, setStep] = useState(() => (saved?.step === 3 ? 0 : (saved?.step ?? 0)));
  const [title, setTitle] = useState(saved?.title ?? "");
  const [style, setStyle] = useState<string>(saved?.style ?? DRAMA_STYLES[0]);
  const [maxShots, setMaxShots] = useState(saved?.maxShots ?? "");
  const [script, setScript] = useState(saved?.script ?? "");
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
      } satisfies StepperDraft);
    } else {
      clearSession(SK.stepper);
    }
  }, [step, title, style, maxShots, script, drafts]);

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
    if (!title.trim() || !script.trim()) {
      toast.error("Script title and content are required");
      return;
    }
    if (!spendProCredits(PRO_COSTS.script)) {
      toast.error("Not enough credits (mock balance)");
      return;
    }
    setParsing(true);
    parseTimer.current = setTimeout(() => {
      const cap = Math.min(parseInt(maxShots, 10) || 12, MAX_SHOTS_CAP);
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
    const projectId = newProProject(title.trim(), style);
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
        durationSec: 8,
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
        {STEPS.map((label, i) => (
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
        {step === 0 && (
          <div className="max-w-2xl mx-auto">
            {parsing ? (
              <ParsingState />
            ) : (
              <div className="space-y-5">
                <Field label="Script title" required counter={`${title.length} / ${TITLE_MAX_LEN}`}>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX_LEN))}
                    placeholder="Name this episode"
                    aria-label="script title"
                    className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/40 focus:border-primary/60 focus:outline-none font-body text-sm text-on-surface placeholder:text-on-surface-variant/60"
                  />
                </Field>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Art style">
                    <div className="px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/40 flex items-center justify-between">
                      <MiniSelect
                        value={style}
                        options={DRAMA_STYLES}
                        onChange={setStyle}
                        align="start"
                      />
                    </div>
                  </Field>
                  <Field label="Max shots" counter={`cap ${MAX_SHOTS_CAP}`}>
                    <input
                      value={maxShots}
                      onChange={(e) => setMaxShots(e.target.value.replace(/\D/g, "").slice(0, 2))}
                      placeholder="Up to 80 shots (default 12)"
                      inputMode="numeric"
                      aria-label="max shots"
                      className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/40 focus:border-primary/60 focus:outline-none font-body text-sm text-on-surface placeholder:text-on-surface-variant/60"
                    />
                  </Field>
                </div>

                <Field
                  label="Script content"
                  required
                  counter={`${script.length} / ${SCRIPT_MAX_LEN}`}
                >
                  <textarea
                    value={script}
                    onChange={(e) => setScript(e.target.value.slice(0, SCRIPT_MAX_LEN))}
                    placeholder="Paste the complete episode script here — scene directions, dialogue, everything."
                    rows={9}
                    aria-label="script content"
                    className="w-full px-4 py-3 rounded-xl bg-surface-container border border-outline-variant/40 focus:border-primary/60 focus:outline-none font-body text-sm text-on-surface placeholder:text-on-surface-variant/60 resize-y leading-relaxed"
                  />
                </Field>

                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={submitScript}
                    className="inline-flex items-center gap-2 bg-primary text-on-primary font-label text-label-md uppercase tracking-wider px-7 py-3 rounded-full hover:opacity-90 active:scale-95 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Submit to next step
                    <span className="inline-flex items-center gap-1 border-l border-on-primary/30 pl-2 ml-1">
                      <Zap className="w-3 h-3" fill="currentColor" /> {PRO_COSTS.script}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

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

function Field({
  label,
  required,
  counter,
  children,
}: {
  label: string;
  required?: boolean;
  counter?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="font-label text-label-md uppercase tracking-wider text-on-surface">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </span>
        {counter && (
          <span className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant/70">
            {counter}
          </span>
        )}
      </div>
      {children}
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
